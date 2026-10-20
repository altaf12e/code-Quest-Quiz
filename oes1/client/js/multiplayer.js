// CodeQuest Multiplayer Quiz Engine - Real-Time Synchronized Client
let socket = null;
let currentRoom = null;
let currentQuestionIndex = 0;
let totalQuestionsCount = 10;
let questionTimerInterval = null;
let currentQuestionTime = 30;
let remainingQuestionSeconds = 30;
let hasSubmittedCurrent = false;
let isCreator = false;
let currentUser = null;
let isScreenLocked = false;
let tabSwitchViolations = 0;

// Determine dynamic Socket.IO server URL
function getSocketServerUrl() {
    if (typeof API_BASE_URL !== 'undefined') {
        return API_BASE_URL.replace(/\/api\/?$/, '');
    }
    const host = window.location.hostname || 'localhost';
    return `${window.location.protocol}//${host}:5000`;
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    checkAuthAndSetup();
    initializeSocket();
    handleUrlParams();
    restoreRoomState();
});

function checkAuthAndSetup() {
    const token = localStorage.getItem('token');
    const storedUserData = localStorage.getItem('userData');
    
    if (!token || !storedUserData) {
        window.location.href = 'login.html';
        return;
    }

    try {
        currentUser = JSON.parse(storedUserData);
    } catch (e) {
        currentUser = { username: 'Player', avatar: '🦸' };
    }

    // Set greeting
    const greetingEl = document.getElementById('userGreeting');
    if (greetingEl) {
        greetingEl.textContent = `${currentUser.avatar || '🦸'} ${currentUser.username}`;
    }

    // Safe Logout handler
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to logout?')) {
                clearRoomState();
                localStorage.removeItem('token');
                localStorage.removeItem('userData');
                window.location.href = 'index.html';
            }
        });
    }

    // Clear saved multiplayer state when navigating back to dashboard
    const dashboardBtns = document.querySelectorAll('[onclick*="dashboard.html"]');
    dashboardBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            clearRoomState();
        });
    });
}

function initializeSocket() {
    const serverUrl = getSocketServerUrl();
    console.log(`🔌 Connecting to Socket.IO server at: ${serverUrl}`);

    socket = io(serverUrl, {
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
        console.log(`✅ Connected to multiplayer server (Socket ID: ${socket.id})`);
        // If currentRoom was loaded from localStorage, re-join socket room
        if (currentRoom && currentRoom.roomCode) {
            socket.emit('join-room', {
                roomCode: currentRoom.roomCode,
                user: {
                    id: currentUser.id || currentUser._id,
                    username: currentUser.username,
                    avatar: currentUser.avatar
                }
            });
        }
    });

    socket.on('disconnect', (reason) => {
        console.warn('⚠️ Disconnected from server:', reason);
    });

    // Room update event (waiting room participant list)
    socket.on('room-update', (data) => {
        console.log('👥 Room update:', data);
        updateParticipantsDisplay(data.participants || []);
        updateParticipantCount(data.participantCount || (data.participants ? data.participants.length : 0));
        
        // Update host start button status
        if (isCreator) {
            const startBtn = document.getElementById('startQuizBtn');
            if (startBtn) {
                const count = data.participantCount || (data.participants ? data.participants.length : 1);
                startBtn.disabled = false;
                startBtn.innerHTML = `<span class="btn-icon">🚀</span> Start Quiz Battle (${count} Player${count > 1 ? 's' : ''})`;
            }
        }
    });

    // 3, 2, 1 Countdown overlay
    socket.on('quiz-countdown', (data) => {
        showCountdownOverlay(data.count);
    });

    // Quiz started
    socket.on('quiz-started', () => {
        hideCountdownOverlay();
        if (currentRoom) {
            currentRoom.status = 'active';
            saveRoomState();
        }
        showQuizScreen();
        enableScreenLock();
    });

    // Authoritative question broadcast
    socket.on('question-start', (data) => {
        hideCountdownOverlay();
        showQuizScreen();
        enableScreenLock();
        displayQuestion(data);
    });

    // Private answer feedback for the player
    socket.on('answer-feedback', (data) => {
        handleAnswerFeedback(data);
    });

    // Live leaderboard update as players answer
    socket.on('leaderboard-update', (data) => {
        renderLiveLeaderboard(data.leaderboard || []);
        if (data.answeredCount !== undefined && data.totalParticipants !== undefined) {
            const badge = document.getElementById('answeredBadge');
            if (badge) {
                badge.textContent = `${data.answeredCount} / ${data.totalParticipants} answered`;
            }
        }
    });

    // Question result reveal
    socket.on('question-result', (data) => {
        revealQuestionResult(data);
    });

    // Authoritative timer stopped (all answered)
    socket.on('timer-stopped', () => {
        clearInterval(questionTimerInterval);
        const timerEl = document.getElementById('questionTimer');
        if (timerEl) timerEl.textContent = '✓';
        const timerBox = document.getElementById('timerBox');
        if (timerBox) timerBox.classList.remove('timer-critical');
    });

    // Quiz finished & winners podium
    socket.on('quiz-finished', (data) => {
        disableScreenLock();
        clearRoomState();
        showResults(data.winners || [], data.results || []);
    });

    // Reconnection game sync
    socket.on('game-sync', (data) => {
        console.log('🔄 Reconnection Game Sync:', data);
        if (data.status === 'active' || data.status === 'showing-answer') {
            showQuizScreen();
            enableScreenLock();
            displayQuestion({
                questionIndex: data.questionIndex,
                totalQuestions: data.totalQuestions,
                question: data.question,
                timePerQuestion: data.timePerQuestion,
                leaderboard: data.leaderboard,
                remainingTimeOverride: data.timeRemaining,
                hasAnswered: data.hasAnswered,
                userAnswer: data.userAnswer,
                correctAnswer: data.correctAnswer
            });
        }
    });

    // Quiz stopped by host
    socket.on('quiz-stopped', (data) => {
        disableScreenLock();
        clearRoomState();
        showToast(data.message || 'Quiz stopped by host.', 'info');
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);
    });

    // Room ended by host
    socket.on('room-ended', (data) => {
        disableScreenLock();
        clearRoomState();
        showToast(data.message || 'Room was closed by the host.', 'info');
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);
    });
}

function handleUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const joinCode = urlParams.get('join');
    
    if (joinCode) {
        const input = document.getElementById('roomCode');
        if (input) input.value = joinCode.toUpperCase();
        showJoinForm();
    }
}

// Restore saved room state on page refresh
async function restoreRoomState() {
    const savedRoomStr = localStorage.getItem('currentMultiplayerRoom');
    const savedIsCreator = localStorage.getItem('isMultiplayerCreator');
    
    if (!savedRoomStr) return;

    try {
        const savedRoom = JSON.parse(savedRoomStr);
        isCreator = (savedIsCreator === 'true');
        
        console.log(`Checking existing room state for ${savedRoom.roomCode}...`);
        const response = await api.get(`/quiz-room/${savedRoom.roomCode}`);
        
        if (response.success && response.room) {
            currentRoom = response.room;
            
            if (response.room.status === 'waiting') {
                if (isCreator) {
                    showRoomCreated(response.room);
                } else {
                    showWaitingRoom(response.room);
                }
                if (socket && socket.connected) {
                    socket.emit('join-room', {
                        roomCode: currentRoom.roomCode,
                        user: {
                            id: currentUser.id || currentUser._id,
                            username: currentUser.username,
                            avatar: currentUser.avatar
                        }
                    });
                }
            } else if (response.room.status === 'active') {
                showQuizScreen();
                if (socket && socket.connected) {
                    socket.emit('join-room', {
                        roomCode: currentRoom.roomCode,
                        user: {
                            id: currentUser.id || currentUser._id,
                            username: currentUser.username,
                            avatar: currentUser.avatar
                        }
                    });
                }
            } else {
                clearRoomState();
            }
        } else {
            clearRoomState();
        }
    } catch (error) {
        console.warn('Failed to restore room state:', error);
        clearRoomState();
    }
}

function saveRoomState() {
    if (currentRoom) {
        localStorage.setItem('currentMultiplayerRoom', JSON.stringify(currentRoom));
        localStorage.setItem('isMultiplayerCreator', isCreator.toString());
    }
}

function clearRoomState() {
    disableScreenLock();
    localStorage.removeItem('currentMultiplayerRoom');
    localStorage.removeItem('isMultiplayerCreator');
    currentRoom = null;
    isCreator = false;
    clearInterval(questionTimerInterval);
}

// Screen Transitions
function showSelection() {
    hideAllScreens();
    document.getElementById('selectionScreen').classList.remove('hidden');
}

function showCreateForm() {
    hideAllScreens();
    document.getElementById('createScreen').classList.remove('hidden');
}

function showJoinForm() {
    hideAllScreens();
    document.getElementById('joinScreen').classList.remove('hidden');
}

function hideAllScreens() {
    const screens = [
        'selectionScreen',
        'createScreen',
        'joinScreen',
        'roomCreatedScreen',
        'waitingRoomScreen',
        'quizScreen',
        'resultsScreen'
    ];
    screens.forEach(screen => {
        const el = document.getElementById(screen);
        if (el) el.classList.add('hidden');
    });
}

// Create Quiz Form Submit
document.getElementById('createQuizForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitBtn = document.getElementById('createSubmitBtn');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="loading-spinner-inline"></span> Creating Room...';

    const formData = {
        title: document.getElementById('quizTitle').value.trim(),
        subject: document.getElementById('quizSubject').value,
        difficulty: document.getElementById('quizDifficulty').value,
        questionCount: parseInt(document.getElementById('questionCount').value),
        timePerQuestion: parseInt(document.getElementById('timePerQuestion').value),
        hostParticipates: document.getElementById('hostParticipates').checked
    };

    try {
        const response = await api.post('/quiz-room/create', formData);
        
        if (response.success && response.room) {
            currentRoom = response.room;
            isCreator = true;
            saveRoomState();
            showRoomCreated(response.room);
            
            // Connect to socket room
            if (socket) {
                socket.emit('join-room', {
                    roomCode: response.room.roomCode,
                    user: {
                        id: currentUser.id || currentUser._id,
                        username: currentUser.username,
                        avatar: currentUser.avatar
                    }
                });
            }
            showToast('Quiz Room created successfully!', 'success');
        } else {
            showToast(response.message || 'Failed to create room', 'error');
        }
    } catch (error) {
        console.error('Create room error:', error);
        showToast(error.message || 'Failed to create quiz room', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span class="btn-icon">🚀</span> Create Quiz Room';
    }
});

// Join Quiz Form Submit
document.getElementById('joinQuizForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const input = document.getElementById('roomCode');
    const roomCode = input.value.trim().toUpperCase();

    if (roomCode.length !== 6) {
        showToast('Please enter a valid 6-character room code', 'error');
        return;
    }

    const submitBtn = document.getElementById('joinSubmitBtn');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="loading-spinner-inline"></span> Joining Room...';

    try {
        const response = await api.post(`/quiz-room/join/${roomCode}`);
        
        if (response.success && response.room) {
            currentRoom = response.room;
            isCreator = (response.room.creator === (currentUser.id || currentUser._id));
            saveRoomState();
            
            if (isCreator) {
                showRoomCreated(response.room);
            } else {
                showWaitingRoom(response.room);
            }

            if (socket) {
                socket.emit('join-room', {
                    roomCode: response.room.roomCode,
                    user: {
                        id: currentUser.id || currentUser._id,
                        username: currentUser.username,
                        avatar: currentUser.avatar
                    }
                });
            }
            showToast('Joined quiz room!', 'success');
        } else {
            showToast(response.message || 'Room not found', 'error');
        }
    } catch (error) {
        console.error('Join room error:', error);
        showToast(error.message || 'Failed to join room', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span class="btn-icon">🎯</span> Join Quiz Room';
    }
});

function showRoomCreated(room) {
    hideAllScreens();
    document.getElementById('roomCreatedScreen').classList.remove('hidden');
    
    document.getElementById('displayRoomCode').textContent = room.roomCode;
    const qrImg = document.getElementById('qrCodeImage');
    if (qrImg && room.qrCode) qrImg.src = room.qrCode;
    
    loadRoomParticipants(room.roomCode);
}

function showWaitingRoom(room) {
    hideAllScreens();
    document.getElementById('waitingRoomScreen').classList.remove('hidden');
    
    document.getElementById('waitingRoomCode').textContent = room.roomCode;
    document.getElementById('waitingQuizTitle').textContent = room.title;
    
    loadRoomParticipants(room.roomCode);
}

async function loadRoomParticipants(roomCode) {
    try {
        const response = await api.get(`/quiz-room/${roomCode}`);
        if (response.success && response.room) {
            updateParticipantsDisplay(response.room.participants || []);
            updateParticipantCount(response.room.participants ? response.room.participants.length : 0);
        }
    } catch (error) {
        console.error('Load participants error:', error);
    }
}

function updateParticipantsDisplay(participants) {
    const creatorList = document.getElementById('participantsList');
    const waitingList = document.getElementById('waitingParticipantsList');
    
    const participantHTML = participants.map((p) => {
        const isCurrent = currentUser && (p.username === currentUser.username || (p.userId && p.userId === (currentUser.id || currentUser._id)));
        const isHost = currentRoom && (p.userId === currentRoom.creator || (currentRoom.creator && currentRoom.creator._id === p.userId));
        
        return `
            <div class="participant-card ${isHost ? 'creator' : ''} ${isCurrent ? 'is-self' : ''}">
                <div class="participant-avatar">${p.avatar || '🦸'}</div>
                <div class="participant-name">${p.username} ${isCurrent ? '<span class="you-badge">(You)</span>' : ''}</div>
                <div class="participant-score">${isHost ? '👑 Host' : '⚔️ Challenger'}</div>
            </div>
        `;
    }).join('');
    
    if (creatorList) creatorList.innerHTML = participantHTML || '<div class="no-participants">Waiting for players to join...</div>';
    if (waitingList) waitingList.innerHTML = participantHTML || '<div class="no-participants">Waiting for players to join...</div>';
}

function updateParticipantCount(count) {
    ['participantCount', 'waitingParticipantCount'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = count;
    });
}

function copyRoomCode() {
    const code = document.getElementById('displayRoomCode').textContent;
    navigator.clipboard.writeText(code).then(() => {
        showToast(`Room code ${code} copied to clipboard!`, 'success');
    }).catch(() => {
        showToast(`Room code: ${code}`, 'info');
    });
}

// Countdown overlay animation (3, 2, 1)
function showCountdownOverlay(number) {
    const overlay = document.getElementById('countdownOverlay');
    const numEl = document.getElementById('countdownNumber');
    if (overlay && numEl) {
        overlay.classList.remove('hidden');
        numEl.textContent = number;
        numEl.classList.remove('pulse-num');
        void numEl.offsetWidth; // Trigger reflow for animation
        numEl.classList.add('pulse-num');
    }
}

function hideCountdownOverlay() {
    const overlay = document.getElementById('countdownOverlay');
    if (overlay) overlay.classList.add('hidden');
}

// Host starts the quiz
function startQuiz() {
    if (!currentRoom || !isCreator) return;
    
    // Request fullscreen immediately on host click (user gesture)
    enterFullscreen();

    const startBtn = document.getElementById('startQuizBtn');
    if (startBtn) {
        startBtn.disabled = true;
        startBtn.innerHTML = '<span class="loading-spinner-inline"></span> Initiating Battle...';
    }

    if (socket) {
        socket.emit('start-quiz', { roomCode: currentRoom.roomCode });
    }
}

// Show active Quiz screen
function showQuizScreen() {
    hideAllScreens();
    const quizScreen = document.getElementById('quizScreen');
    if (quizScreen) quizScreen.classList.remove('hidden');
    
    const stopBtn = document.getElementById('stopQuizBtn');
    if (stopBtn) {
        stopBtn.style.display = isCreator ? 'inline-flex' : 'none';
    }
}

// Display Question received from Server
function displayQuestion(data) {
    currentQuestionIndex = data.questionIndex;
    totalQuestionsCount = data.totalQuestions || 10;
    currentQuestionTime = data.timePerQuestion || 30;
    hasSubmittedCurrent = !!data.hasAnswered;

    // Header info
    const currentNumEl = document.getElementById('currentQuestionNum');
    const totalEl = document.getElementById('totalQuestions');
    if (currentNumEl) currentNumEl.textContent = currentQuestionIndex + 1;
    if (totalEl) totalEl.textContent = totalQuestionsCount;

    // Question title
    const qText = document.getElementById('questionText');
    if (qText) qText.textContent = data.question.question;

    // Hide status pill
    const statusPill = document.getElementById('answerStatusPill');
    if (statusPill) {
        statusPill.classList.add('hidden');
        statusPill.className = 'answer-status-pill hidden';
        statusPill.textContent = '';
    }

    // Render options
    const optionsContainer = document.getElementById('optionsContainer');
    optionsContainer.innerHTML = '';

    data.question.options.forEach((optText, index) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.innerHTML = `<span class="option-letter">${String.fromCharCode(65 + index)}</span><span class="option-content">${optText}</span>`;
        btn.dataset.index = index;

        if (hasSubmittedCurrent) {
            btn.disabled = true;
            if (data.userAnswer && data.userAnswer.selectedAnswer === index) {
                btn.classList.add('selected');
            }
        } else {
            btn.onclick = () => selectOption(index);
        }

        optionsContainer.appendChild(btn);
    });

    // If reconnected and already in reveal phase
    if (data.correctAnswer !== undefined) {
        revealOptionColors(data.correctAnswer);
    }

    // Render live leaderboard
    if (data.leaderboard) {
        renderLiveLeaderboard(data.leaderboard);
    }

    // Start synchronized timer
    const remainingTime = (data.remainingTimeOverride !== undefined) ? data.remainingTimeOverride : currentQuestionTime;
    startSynchronizedTimer(remainingTime, currentQuestionTime);
}

// Option selection
function selectOption(selectedIndex) {
    if (hasSubmittedCurrent) return;
    hasSubmittedCurrent = true;

    // 1. Immediately stop the countdown timer on the user's screen!
    clearInterval(questionTimerInterval);
    const timerEl = document.getElementById('questionTimer');
    if (timerEl) timerEl.textContent = '✓';
    const timerBox = document.getElementById('timerBox');
    if (timerBox) {
        timerBox.classList.remove('timer-critical');
        timerBox.style.opacity = '0.7';
    }
    const barFill = document.getElementById('timerBarFill');
    if (barFill) {
        barFill.style.transition = 'none';
        barFill.style.width = '100%';
    }

    // 2. Disable all options and highlight chosen
    const optionBtns = document.querySelectorAll('.option-btn');
    optionBtns.forEach((btn, idx) => {
        btn.disabled = true;
        if (idx === selectedIndex) {
            btn.classList.add('selected');
        }
    });

    const timeSpent = currentQuestionTime - remainingQuestionSeconds;

    // 3. Submit answer to authoritative server via Socket.IO
    if (socket && currentRoom) {
        socket.emit('submit-answer', {
            roomCode: currentRoom.roomCode,
            questionIndex: currentQuestionIndex,
            selectedAnswer: selectedIndex,
            timeSpent: Math.max(0, timeSpent)
        });
    }

    // 4. Show immediate status pill
    const statusPill = document.getElementById('answerStatusPill');
    if (statusPill) {
        statusPill.classList.remove('hidden');
        statusPill.className = 'answer-status-pill pending';
        statusPill.innerHTML = '⏳ Answer submitted! Preparing next question...';
    }
}

// Feedback received from server
function handleAnswerFeedback(data) {
    const statusPill = document.getElementById('answerStatusPill');
    if (statusPill) {
        statusPill.classList.remove('hidden');
        if (data.isCorrect) {
            statusPill.className = 'answer-status-pill correct';
            let bonusText = '';
            if (data.speedBonus > 0) bonusText += ` +${data.speedBonus} speed`;
            if (data.streak > 1) bonusText += ` 🔥 ${data.streak}x Streak!`;
            statusPill.innerHTML = `✅ Correct! +${data.points} pts${bonusText}`;
        } else {
            statusPill.className = 'answer-status-pill incorrect';
            statusPill.innerHTML = `❌ Incorrect!`;
        }
    }

    // Immediately reveal answer colors so player sees if option was right or wrong!
    if (data.correctAnswer !== undefined) {
        revealOptionColors(data.correctAnswer);
    }
}

// Question result revealed (end of timer / all answered)
function revealQuestionResult(data) {
    clearInterval(questionTimerInterval);

    // Stop timer bar
    const bar = document.getElementById('timerBarFill');
    if (bar) bar.style.width = '0%';

    const timerEl = document.getElementById('questionTimer');
    if (timerEl) timerEl.textContent = '0';

    revealOptionColors(data.correctAnswer);

    if (data.leaderboard) {
        renderLiveLeaderboard(data.leaderboard);
    }
}

function revealOptionColors(correctAnswerIndex) {
    const optionBtns = document.querySelectorAll('.option-btn');
    optionBtns.forEach((btn, idx) => {
        btn.disabled = true;
        if (idx === correctAnswerIndex) {
            btn.classList.add('correct');
        } else if (btn.classList.contains('selected') && idx !== correctAnswerIndex) {
            btn.classList.add('incorrect');
        }
    });
}

// Authoritative synchronized timer bar and countdown
function startSynchronizedTimer(remainingSeconds, totalDuration) {
    clearInterval(questionTimerInterval);

    remainingQuestionSeconds = remainingSeconds;
    const timerEl = document.getElementById('questionTimer');
    const timerBox = document.getElementById('timerBox');
    const barFill = document.getElementById('timerBarFill');

    if (timerBox) {
        timerBox.style.opacity = '1';
        timerBox.classList.remove('timer-critical');
    }
    if (barFill) {
        barFill.style.transition = 'width 0.2s linear, background 0.5s ease';
    }

    const updateUI = () => {
        if (timerEl) timerEl.textContent = Math.max(0, Math.ceil(remainingQuestionSeconds));

        // Update progress bar width
        if (barFill) {
            const pct = Math.max(0, (remainingQuestionSeconds / totalDuration) * 100);
            barFill.style.width = `${pct}%`;

            if (pct > 50) {
                barFill.style.background = 'linear-gradient(90deg, #10b981, #06b6d4)';
            } else if (pct > 20) {
                barFill.style.background = 'linear-gradient(90deg, #f59e0b, #ef4444)';
            } else {
                barFill.style.background = 'linear-gradient(90deg, #ef4444, #dc2626)';
            }
        }

        // Pulse timer when <= 5 seconds
        if (timerBox) {
            if (remainingQuestionSeconds <= 5 && remainingQuestionSeconds > 0) {
                timerBox.classList.add('timer-critical');
            } else {
                timerBox.classList.remove('timer-critical');
            }
        }
    };

    updateUI();

    const intervalStepMs = 200;
    questionTimerInterval = setInterval(() => {
        remainingQuestionSeconds -= (intervalStepMs / 1000);
        if (remainingQuestionSeconds <= 0) {
            remainingQuestionSeconds = 0;
            updateUI();
            clearInterval(questionTimerInterval);

            // If user hasn't submitted yet, submit timeout
            if (!hasSubmittedCurrent) {
                selectOption(-1);
            }
        } else {
            updateUI();
        }
    }, intervalStepMs);
}

// Live Leaderboard Rendering
function renderLiveLeaderboard(leaderboard) {
    const list = document.getElementById('liveLeaderboard');
    if (!list) return;

    if (!leaderboard || leaderboard.length === 0) {
        list.innerHTML = '<div class="leaderboard-empty">No scores recorded yet</div>';
        return;
    }

    list.innerHTML = leaderboard.map((player, index) => {
        const isSelf = currentUser && (player.username === currentUser.username || (player.userId && player.userId === (currentUser.id || currentUser._id)));
        const rankMedal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`;
        const streakPill = (player.streak && player.streak > 1) ? `<span class="streak-pill">🔥 ${player.streak}</span>` : '';
        const answeredIcon = player.hasAnswered ? '<span class="status-icon answered" title="Answered">✓</span>' : '<span class="status-icon thinking" title="Thinking...">⏳</span>';

        return `
            <div class="leaderboard-row ${isSelf ? 'is-self' : ''} ${index < 3 ? `top-${index + 1}` : ''}">
                <div class="rank-col">${rankMedal}</div>
                <div class="user-col">
                    <span class="user-avatar">${player.avatar || '🦸'}</span>
                    <span class="user-name">${player.username} ${isSelf ? '<small>(You)</small>' : ''}</span>
                    ${streakPill}
                </div>
                <div class="status-col">${answeredIcon}</div>
                <div class="score-col">${player.score || 0} pts</div>
            </div>
        `;
    }).join('');
}

// Results Screen & Winners Podium
function showResults(winners, results) {
    clearRoomState();
    hideAllScreens();
    
    const resultsScreen = document.getElementById('resultsScreen');
    if (resultsScreen) resultsScreen.classList.remove('hidden');

    // Winners Podium (1st, 2nd, 3rd)
    const podium = document.getElementById('winnersPodium');
    if (podium) {
        podium.innerHTML = '';
        const places = ['first', 'second', 'third'];
        const medals = ['👑 1st Place', '🥈 2nd Place', '🥉 3rd Place'];

        winners.slice(0, 3).forEach((winner, idx) => {
            const placeDiv = document.createElement('div');
            placeDiv.className = `podium-place ${places[idx] || 'runner-up'}`;
            placeDiv.innerHTML = `
                <div class="podium-rank">${medals[idx]}</div>
                <div class="place-avatar">${winner.avatar || '🏆'}</div>
                <div class="place-name">${winner.username}</div>
                <div class="place-score">${winner.score} pts</div>
                <div class="place-reward">+${winner.xpReward || 50} XP</div>
            `;
            podium.appendChild(placeDiv);
        });
    }

    // Full results table
    const table = document.getElementById('finalResultsTable');
    if (table) {
        table.innerHTML = '';
        results.forEach((res, index) => {
            const row = document.createElement('div');
            row.className = `result-row ${index < 3 ? 'winner' : ''}`;
            row.innerHTML = `
                <div class="result-position">#${index + 1}</div>
                <div class="result-player">
                    <span class="result-avatar">${res.avatar || '👤'}</span>
                    <span class="result-name">${res.username}</span>
                </div>
                <div class="result-score"><strong>${res.score}</strong> pts</div>
                <div class="result-correct">${res.correctAnswers || 0} / ${res.totalQuestions || totalQuestionsCount} correct</div>
            `;
            table.appendChild(row);
        });
    }
}

// Host stops quiz
function stopQuiz() {
    if (!isCreator || !currentRoom) return;

    if (confirm('Are you sure you want to stop the quiz battle? This will end it for all participants.')) {
        disableScreenLock();
        clearInterval(questionTimerInterval);
        if (socket) {
            socket.emit('stop-quiz', { roomCode: currentRoom.roomCode });
        }
    }
}

// Host ends waiting room
function endRoom() {
    if (!isCreator || !currentRoom) return;

    if (confirm('Are you sure you want to close this room? Joined players will be disconnected.')) {
        if (socket) {
            socket.emit('end-room', { roomCode: currentRoom.roomCode });
        }
    }
}

// Toast Notifications
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer') || document.body;
    const toast = document.createElement('div');
    toast.className = `custom-toast toast-${type}`;
    toast.innerHTML = `<span>${message}</span>`;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('toast-show');
    }, 10);
    
    setTimeout(() => {
        toast.classList.remove('toast-show');
        setTimeout(() => {
            if (toast.parentNode) toast.parentNode.removeChild(toast);
        }, 300);
    }, 3500);
}

// ==========================================
// 🔒 Screen Lock & Anti-Cheat Enforcement System
// ==========================================

function enterFullscreen() {
    const elem = document.documentElement;
    const isAlreadyFullscreen = !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);
    
    if (!isAlreadyFullscreen) {
        const req = elem.requestFullscreen || elem.webkitRequestFullscreen || elem.mozRequestFullScreen || elem.msRequestFullscreen;
        if (req) {
            req.call(elem).then(() => {
                hideScreenLockModal();
            }).catch(err => {
                console.warn('Fullscreen request blocked or requires user click:', err);
                if (isScreenLocked) {
                    showScreenLockModal('Click below to enter required Fullscreen Battle Mode.');
                }
            });
        }
    } else {
        hideScreenLockModal();
    }
}

function exitFullscreen() {
    const isFullscreen = !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);
    if (isFullscreen) {
        const exit = document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen || document.msExitFullscreen;
        if (exit) {
            exit.call(document).catch(err => console.warn('Exit fullscreen error:', err));
        }
    }
}

function enableScreenLock() {
    if (isScreenLocked) return;
    isScreenLocked = true;
    tabSwitchViolations = 0;

    // Add visual lock styling to body and navigation
    document.body.classList.add('quiz-locked');
    const navLinks = document.querySelector('.nav-links') || document.querySelector('.navbar');
    if (navLinks) {
        navLinks.classList.add('nav-locked');
    }

    // Try entering fullscreen immediately
    enterFullscreen();

    // Attach fullscreen and visibility listeners
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);

    // Prevent context menu (right-click) & inspection / shortcut keys
    document.addEventListener('contextmenu', blockContextMenu);
    document.addEventListener('keydown', blockSecurityKeys);
    window.addEventListener('beforeunload', handleBeforeUnload);

    showToast('🔒 Fullscreen Lock Mode Activated', 'info');
}

function disableScreenLock() {
    if (!isScreenLocked) return;
    isScreenLocked = false;

    // Remove lock styling from body and navigation
    document.body.classList.remove('quiz-locked');
    const navLinks = document.querySelector('.nav-links') || document.querySelector('.navbar');
    if (navLinks) {
        navLinks.classList.remove('nav-locked');
    }

    // Clean up event listeners
    document.removeEventListener('fullscreenchange', handleFullscreenChange);
    document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
    document.removeEventListener('MSFullscreenChange', handleFullscreenChange);

    document.removeEventListener('visibilitychange', handleVisibilityChange);
    window.removeEventListener('blur', handleWindowBlur);

    document.removeEventListener('contextmenu', blockContextMenu);
    document.removeEventListener('keydown', blockSecurityKeys);
    window.removeEventListener('beforeunload', handleBeforeUnload);

    // Hide lock overlay modal if displayed
    hideScreenLockModal();

    // Exit fullscreen cleanly
    exitFullscreen();
}

function reEnterFullscreen() {
    enterFullscreen();
}

function showScreenLockModal(customMessage) {
    const overlay = document.getElementById('screenLockOverlay');
    const alertText = document.getElementById('lockAlertText');
    if (alertText && customMessage) {
        alertText.textContent = customMessage;
    }
    if (overlay) {
        overlay.classList.remove('hidden');
    }
}

function hideScreenLockModal() {
    const overlay = document.getElementById('screenLockOverlay');
    if (overlay) {
        overlay.classList.add('hidden');
    }
}

function handleFullscreenChange() {
    if (!isScreenLocked) return;

    const isFull = !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);
    if (!isFull) {
        showScreenLockModal('⚠️ Fullscreen exited! Return to fullscreen to continue answering.');
        showToast('⚠️ Fullscreen exited! Screen locked.', 'error');
    } else {
        hideScreenLockModal();
    }
}

function handleVisibilityChange() {
    if (!isScreenLocked) return;

    if (document.hidden) {
        tabSwitchViolations++;
        showScreenLockModal(`⚠️ Tab switch detected (${tabSwitchViolations} warning${tabSwitchViolations > 1 ? 's' : ''})! Return immediately.`);
        showToast(`⚠️ Tab switching is blocked during Battle Quiz! (${tabSwitchViolations})`, 'error');
    }
}

function handleWindowBlur() {
    if (!isScreenLocked) return;
    showScreenLockModal('⚠️ Focus lost! Return to fullscreen to continue answering.');
}

function blockContextMenu(e) {
    if (isScreenLocked) {
        e.preventDefault();
        showToast('⚠️ Right-click is disabled during Battle Quiz!', 'error');
        return false;
    }
}

function blockSecurityKeys(e) {
    if (!isScreenLocked) return;

    // F12 (Developer tools)
    if (e.key === 'F12' || e.keyCode === 123) {
        e.preventDefault();
        showToast('⚠️ DevTools shortcut disabled!', 'error');
        return false;
    }

    // Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C (Inspect elements)
    if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c')) {
        e.preventDefault();
        showToast('⚠️ Developer inspect tools are blocked!', 'error');
        return false;
    }

    // Ctrl+U (View source)
    if (e.ctrlKey && (e.key === 'u' || e.key === 'U')) {
        e.preventDefault();
        showToast('⚠️ View Source is blocked!', 'error');
        return false;
    }

    // Ctrl+C, Ctrl+V (Anti-cheat copy/paste)
    if (e.ctrlKey && (e.key === 'c' || e.key === 'C' || e.key === 'v' || e.key === 'V')) {
        const targetTag = e.target.tagName ? e.target.tagName.toLowerCase() : '';
        if (targetTag !== 'input' && targetTag !== 'textarea') {
            e.preventDefault();
            showToast('⚠️ Copy/Paste is disabled during quiz!', 'error');
            return false;
        }
    }
}

function handleBeforeUnload(e) {
    if (isScreenLocked) {
        e.preventDefault();
        e.returnValue = 'Battle Quiz is in progress. Leaving will forfeit your score.';
        return e.returnValue;
    }
}

// Global exposure for HTML inline attributes
window.reEnterFullscreen = reEnterFullscreen;