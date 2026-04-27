// Multiplayer Quiz JavaScript
let socket;
let currentRoom = null;
let currentQuestionIndex = 0;
let questionTimer = null;
let timeLeft = 30;
let isCreator = false;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeSocket();
    checkAuthAndSetup();
    handleUrlParams();
    restoreRoomState();
});

function initializeSocket() {
    socket = io('http://localhost:5000');
    
    socket.on('connect', () => {
        console.log('Connected to server');
    });
    
    socket.on('participant-joined', (data) => {
        updateParticipantCount(data.participantCount);
    });
    
    socket.on('quiz-started', () => {
        if (currentRoom) {
            currentRoom.status = 'active';
            saveRoomState();
        }
        showQuizScreen();
        loadQuestion(0); // Load first question when quiz starts
    });
    
    socket.on('question-update', (data) => {
        displayQuestion(data.question, data.questionIndex);
    });
    
    socket.on('participant-answered', (data) => {
        updateLiveLeaderboard(data);
    });
    
    socket.on('quiz-finished', (data) => {
        clearRoomState(); // Clear saved state when quiz finishes
        showResults(data.winners, data.results);
    });
    
    socket.on('quiz-stopped', (data) => {
        clearRoomState();
        showToast(data.message, 'info');
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 2000);
    });
    
    socket.on('room-ended', (data) => {
        clearRoomState();
        showToast(data.message, 'info');
        window.location.href = 'dashboard.html';
    });
}

function checkAuthAndSetup() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }
    
    // Setup logout
    document.getElementById('logoutBtn').addEventListener('click', () => {
        if (confirm('Are you sure you want to logout?')) {
            clearRoomState();
            localStorage.removeItem('token');
            localStorage.removeItem('userData');
            window.location.href = 'index.html';
        }
    });
    
    // Clear room state when navigating to dashboard
    const dashboardBtns = document.querySelectorAll('[onclick*="dashboard.html"]');
    dashboardBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            clearRoomState();
        });
    });
}

function handleUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const joinCode = urlParams.get('join');
    
    if (joinCode) {
        document.getElementById('roomCode').value = joinCode;
        showJoinForm();
    }
}

// Restore room state on page refresh
async function restoreRoomState() {
    const savedRoom = localStorage.getItem('currentMultiplayerRoom');
    const savedIsCreator = localStorage.getItem('isMultiplayerCreator');
    
    if (savedRoom) {
        try {
            currentRoom = JSON.parse(savedRoom);
            isCreator = savedIsCreator === 'true';
            
            // Check if room still exists and get current state
            const response = await api.get(`/quiz-room/${currentRoom.roomCode}`);
            
            if (response.success) {
                currentRoom = response.room;
                
                // Restore appropriate screen based on room status
                if (response.room.status === 'waiting') {
                    if (isCreator) {
                        showRoomCreated(response.room);
                    } else {
                        showWaitingRoom(response.room);
                    }
                    // Rejoin socket room
                    if (socket && socket.connected) {
                        socket.emit('join-room', currentRoom.roomCode);
                    }
                } else if (response.room.status === 'active') {
                    showQuizScreen();
                    loadQuestion(response.room.currentQuestion || 0);
                } else if (response.room.status === 'completed') {
                    // Room completed, clear saved state
                    clearRoomState();
                }
            } else {
                // Room no longer exists, clear saved state
                clearRoomState();
            }
        } catch (error) {
            console.error('Failed to restore room state:', error);
            clearRoomState();
        }
    }
}

// Save room state to localStorage
function saveRoomState() {
    if (currentRoom) {
        localStorage.setItem('currentMultiplayerRoom', JSON.stringify(currentRoom));
        localStorage.setItem('isMultiplayerCreator', isCreator.toString());
    }
}

// Clear room state from localStorage
function clearRoomState() {
    localStorage.removeItem('currentMultiplayerRoom');
    localStorage.removeItem('isMultiplayerCreator');
    currentRoom = null;
    isCreator = false;
}

// Screen Navigation
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
    const screens = ['selectionScreen', 'createScreen', 'joinScreen', 'roomCreatedScreen', 'waitingRoomScreen', 'quizScreen', 'resultsScreen'];
    screens.forEach(screen => {
        document.getElementById(screen).classList.add('hidden');
    });
}

// Create Quiz Form
document.getElementById('createQuizForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        title: document.getElementById('quizTitle').value,
        subject: document.getElementById('quizSubject').value,
        difficulty: document.getElementById('quizDifficulty').value,
        questionCount: parseInt(document.getElementById('questionCount').value),
        timePerQuestion: parseInt(document.getElementById('timePerQuestion').value),
        hostParticipates: document.getElementById('hostParticipates').checked
    };
    
    try {
        console.log('Creating room with data:', formData);
        const response = await api.post('/quiz-room/create', formData);
        console.log('Create room response:', response);
        
        if (response.success) {
            currentRoom = response.room;
            isCreator = true;
            saveRoomState();
            showRoomCreated(response.room);
            if (socket && socket.connected) {
                socket.emit('join-room', response.room.roomCode);
            }
        } else {
            showToast(response.message || 'Failed to create room', 'error');
        }
    } catch (error) {
        console.error('Create room error:', error);
        showToast(error.message || 'Failed to create quiz room', 'error');
    }
});

// Join Quiz Form
document.getElementById('joinQuizForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const roomCode = document.getElementById('roomCode').value.toUpperCase();
    
    try {
        const response = await api.post(`/quiz-room/join/${roomCode}`);
        
        if (response.success) {
            currentRoom = response.room;
            isCreator = false;
            saveRoomState();
            showWaitingRoom(response.room);
            socket.emit('join-room', roomCode);
        } else {
            showToast(response.message, 'error');
        }
    } catch (error) {
        console.error('Join room error:', error);
        showToast('Failed to join quiz room', 'error');
    }
});

function showRoomCreated(room) {
    hideAllScreens();
    document.getElementById('roomCreatedScreen').classList.remove('hidden');
    
    document.getElementById('displayRoomCode').textContent = room.roomCode;
    document.getElementById('qrCodeImage').src = room.qrCode;
    
    // Load participants
    loadRoomParticipants(room.roomCode);
}

function showWaitingRoom(room) {
    hideAllScreens();
    document.getElementById('waitingRoomScreen').classList.remove('hidden');
    
    document.getElementById('waitingRoomCode').textContent = room.roomCode;
    document.getElementById('waitingQuizTitle').textContent = room.title;
    
    // Load participants
    loadRoomParticipants(room.roomCode);
}

async function loadRoomParticipants(roomCode) {
    try {
        const response = await api.get(`/quiz-room/${roomCode}`);
        
        if (response.success) {
            updateParticipantsDisplay(response.room.participants);
            updateParticipantCount(response.room.participants.length);
            
            // Update start button if creator
            if (isCreator) {
                const startBtn = document.getElementById('startQuizBtn');
                const minParticipants = response.room.settings.hostParticipates ? 2 : 1;
                const needMoreText = response.room.settings.hostParticipates 
                    ? 'Need 2+ players' 
                    : 'Need 1+ player';
                
                if (response.room.participants.length >= minParticipants) {
                    startBtn.disabled = false;
                    startBtn.innerHTML = '<span class="btn-icon">🚀</span>Start Quiz';
                } else {
                    startBtn.disabled = true;
                    startBtn.innerHTML = `<span class="btn-icon">🚀</span>Start Quiz (${needMoreText})`;
                }
            }
        }
    } catch (error) {
        console.error('Load participants error:', error);
    }
}

function updateParticipantsDisplay(participants) {
    const creatorList = document.getElementById('participantsList');
    const waitingList = document.getElementById('waitingParticipantsList');
    
    const currentUser = JSON.parse(localStorage.getItem('userData'));
    
    const participantHTML = participants.map((p, index) => {
        // Check if this participant is the actual creator based on room creator ID
        const isRoomCreator = currentRoom && currentRoom.creator && 
                             (currentRoom.creator === p.user || currentRoom.creator._id === p.user);
        
        return `
            <div class="participant-card ${isRoomCreator ? 'creator' : ''}">
                <div class="participant-avatar">${p.avatar}</div>
                <div class="participant-name">${p.username}</div>
                <div class="participant-score">${isRoomCreator ? '👑 Host' : 'Player'}</div>
            </div>
        `;
    }).join('');
    
    if (creatorList) creatorList.innerHTML = participantHTML;
    if (waitingList) waitingList.innerHTML = participantHTML;
}

function updateParticipantCount(count) {
    const counters = ['participantCount', 'waitingParticipantCount'];
    counters.forEach(id => {
        const element = document.getElementById(id);
        if (element) element.textContent = count;
    });
}

function copyRoomCode() {
    const roomCode = document.getElementById('displayRoomCode').textContent;
    navigator.clipboard.writeText(roomCode).then(() => {
        showToast('Room code copied!', 'success');
    });
}

async function startQuiz() {
    if (!currentRoom || !isCreator) return;
    
    try {
        const response = await api.post(`/quiz-room/${currentRoom.roomCode}/start`);
        
        if (response.success) {
            currentRoom.status = 'active';
            saveRoomState();
            socket.emit('start-quiz', currentRoom.roomCode);
            // Don't show quiz screen here - wait for socket event
        } else {
            showToast(response.message, 'error');
        }
    } catch (error) {
        console.error('Start quiz error:', error);
        showToast('Failed to start quiz', 'error');
    }
}

function showQuizScreen() {
    hideAllScreens();
    document.getElementById('quizScreen').classList.remove('hidden');
    
    // Show stop button for host
    if (isCreator) {
        document.getElementById('stopQuizBtn').style.display = 'flex';
    }
    
    // Don't auto-load question here - it will be loaded by the caller
}

async function loadQuestion(questionIndex) {
    try {
        const response = await api.get(`/quiz-room/${currentRoom.roomCode}`);
        
        if (response.success && response.room.questions && response.room.questions.length > 0) {
            const question = response.room.questions[questionIndex];
            if (question) {
                displayQuestion(question, questionIndex);
                
                document.getElementById('currentQuestionNum').textContent = questionIndex + 1;
                document.getElementById('totalQuestions').textContent = response.room.questions.length;
            } else {
                console.error('Question not found at index:', questionIndex);
                document.getElementById('questionText').textContent = 'Question not available';
            }
        } else {
            console.error('No questions available in room');
            document.getElementById('questionText').textContent = 'No questions available';
        }
    } catch (error) {
        console.error('Load question error:', error);
        document.getElementById('questionText').textContent = 'Error loading question';
    }
}

function displayQuestion(question, questionIndex) {
    currentQuestionIndex = questionIndex;
    
    document.getElementById('questionText').textContent = question.question;
    
    const optionsContainer = document.getElementById('optionsContainer');
    optionsContainer.innerHTML = '';
    
    question.options.forEach((option, index) => {
        const button = document.createElement('button');
        button.className = 'option-btn';
        button.textContent = `${String.fromCharCode(65 + index)}. ${option}`;
        button.onclick = () => selectAnswer(index);
        optionsContainer.appendChild(button);
    });
    
    // Reset and start timer
    timeLeft = currentRoom.settings.timePerQuestion;
    startQuestionTimer();
}

function selectAnswer(selectedIndex) {
    // Disable all options
    const options = document.querySelectorAll('.option-btn');
    options.forEach((btn, index) => {
        btn.disabled = true;
        if (index === selectedIndex) {
            btn.classList.add('selected');
        }
    });
    
    // Submit answer
    submitAnswer(selectedIndex);
}

async function submitAnswer(selectedAnswer) {
    const timeSpent = currentRoom.settings.timePerQuestion - timeLeft;
    
    try {
        const response = await api.post(`/quiz-room/${currentRoom.roomCode}/answer`, {
            questionIndex: currentQuestionIndex,
            selectedAnswer,
            timeSpent
        });
        
        if (response.success) {
            // Show correct answer
            const options = document.querySelectorAll('.option-btn');
            options.forEach((btn, index) => {
                if (index === response.correctAnswer) {
                    btn.classList.add('correct');
                } else if (index === selectedAnswer && !response.isCorrect) {
                    btn.classList.add('incorrect');
                }
            });
            
            // Emit answer submitted event
            socket.emit('answer-submitted', {
                roomCode: currentRoom.roomCode,
                username: JSON.parse(localStorage.getItem('userData')).username,
                score: response.points
            });
            
            // Wait 3 seconds then next question
            setTimeout(() => {
                nextQuestion();
            }, 3000);
        }
    } catch (error) {
        console.error('Submit answer error:', error);
    }
}

function startQuestionTimer() {
    clearInterval(questionTimer);
    
    questionTimer = setInterval(() => {
        timeLeft--;
        document.getElementById('questionTimer').textContent = timeLeft;
        
        if (timeLeft <= 0) {
            clearInterval(questionTimer);
            // Auto-submit with no answer
            submitAnswer(-1);
        }
    }, 1000);
}

function nextQuestion() {
    currentQuestionIndex++;
    
    // Check if quiz is complete
    if (currentQuestionIndex >= currentRoom.settings.questionCount) {
        completeQuiz();
    } else {
        loadQuestion(currentQuestionIndex);
    }
}

async function completeQuiz() {
    try {
        const response = await api.post(`/quiz-room/${currentRoom.roomCode}/complete`);
        
        if (response.success) {
            socket.emit('quiz-completed', {
                roomCode: currentRoom.roomCode,
                winners: response.winners,
                results: response.finalResults
            });
            
            showResults(response.winners, response.finalResults);
        }
    } catch (error) {
        console.error('Complete quiz error:', error);
    }
}

function showResults(winners, results) {
    clearRoomState(); // Clear saved state when quiz completes
    hideAllScreens();
    document.getElementById('resultsScreen').classList.remove('hidden');
    
    // Display winners podium
    const podium = document.getElementById('winnersPodium');
    podium.innerHTML = '';
    
    winners.slice(0, 3).forEach((winner, index) => {
        const place = document.createElement('div');
        place.className = `podium-place ${['first', 'second', 'third'][index]}`;
        place.innerHTML = `
            <div class="place-number">${winner.position}</div>
            <div class="place-avatar">${winner.avatar || '🏆'}</div>
            <div class="place-name">${winner.username}</div>
            <div class="place-score">${winner.score} points</div>
            <div class="place-reward">+${winner.xpReward} XP</div>
        `;
        podium.appendChild(place);
    });
    
    // Display final results table
    const resultsTable = document.getElementById('finalResultsTable');
    resultsTable.innerHTML = '';
    
    results.forEach((result, index) => {
        const row = document.createElement('div');
        row.className = `result-row ${index < 3 ? 'winner' : ''}`;
        row.innerHTML = `
            <div class="result-position">#${index + 1}</div>
            <div class="result-player">
                <span class="result-avatar">${result.avatar || '👤'}</span>
                <span class="result-name">${result.username}</span>
            </div>
            <div class="result-score">${result.score}</div>
            <div class="result-correct">${result.correctAnswers}/${currentRoom.settings.questionCount}</div>
        `;
        resultsTable.appendChild(row);
    });
}

function updateLiveLeaderboard(data) {
    // Update live leaderboard during quiz
    const leaderboard = document.getElementById('liveLeaderboard');
    if (leaderboard) {
        // This would be updated with real-time participant scores
        console.log('Participant answered:', data);
    }
}

async function stopQuiz() {
    if (!isCreator || !currentRoom) return;
    
    if (confirm('Are you sure you want to stop the quiz? This will end it for all participants.')) {
        try {
            clearInterval(questionTimer);
            
            socket.emit('quiz-stopped', {
                roomCode: currentRoom.roomCode,
                message: 'Quiz stopped by host'
            });
            
            showToast('Quiz stopped successfully', 'info');
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 2000);
        } catch (error) {
            console.error('Stop quiz error:', error);
            showToast('Failed to stop quiz', 'error');
        }
    }
}

function endRoom() {
    if (!isCreator || !currentRoom) return;
    
    if (confirm('Are you sure you want to end this room? All participants will be disconnected.')) {
        try {
            socket.emit('end-room', {
                roomCode: currentRoom.roomCode,
                message: 'Room ended by host'
            });
            
            clearRoomState();
            showToast('Room ended successfully', 'info');
            window.location.href = 'dashboard.html';
        } catch (error) {
            console.error('End room error:', error);
            showToast('Failed to end room', 'error');
        }
    }
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    const style = {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '1rem 1.5rem',
        borderRadius: '10px',
        color: 'white',
        fontWeight: '600',
        zIndex: '9999',
        animation: 'slideIn 0.3s ease',
        maxWidth: '300px'
    };
    
    const colors = {
        success: 'linear-gradient(135deg, #10b981, #059669)',
        error: 'linear-gradient(135deg, #ef4444, #dc2626)',
        info: 'linear-gradient(135deg, #6366f1, #4f46e5)'
    };
    
    Object.assign(toast.style, style);
    toast.style.background = colors[type] || colors.info;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => document.body.removeChild(toast), 300);
    }, 3000);
}