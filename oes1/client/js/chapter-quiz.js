let chapterData = null;
let userData = null;
let currentQuestionIndex = 0;
let questions = [];
let answers = [];
let sessionXP = 0;
let hintsRemaining = 3;
let timer = null;
let timeRemaining = 900;
let totalTime = 0;
let correctAnswersCache = new Map();

document.addEventListener('DOMContentLoaded', () => {
    loadChapterData();
    loadUserData();
    initializeChapter();
    attachEventListeners();
});

function loadChapterData() {
    const storedChapter = localStorage.getItem('currentChapter');
    if (!storedChapter) {
        window.location.href = 'dashboard.html';
        return;
    }
    chapterData = JSON.parse(storedChapter);
}

function loadUserData() {
    const storedData = localStorage.getItem('userData');
    if (!storedData) {
        window.location.href = 'login.html';
        return;
    }
    userData = JSON.parse(storedData);
}

async function initializeChapter() {
    const subject = (chapterData.subject || 'java').toLowerCase();
    const chNum = parseInt(chapterData.chapterNumber) || 1;

    let loadedQuestions = null;
    let chapterInfo = null;

    // 1. Check local rich chapters bank (all 30 chapters guaranteed!)
    if (typeof CHAPTERS_DATA !== 'undefined' && CHAPTERS_DATA[subject]) {
        const ch = CHAPTERS_DATA[subject].find(c => c.chapterNumber === chNum);
        if (ch && ch.practiceQuestions && ch.practiceQuestions.length > 0) {
            chapterInfo = ch;
            loadedQuestions = ch.practiceQuestions.map((q, idx) => ({
                _id: `ch_${subject}_${chNum}_${idx}`,
                question: q.question,
                options: [...q.options],
                correctAnswer: q.correctAnswer,
                hint: q.explanation || `Refer to Chapter ${chNum}: ${ch.title}`,
                xpValue: 20
            }));
        }
    }

    // 2. If not found in local, attempt backend API
    if (!loadedQuestions) {
        try {
            const data = await api.get(`/chapters/${chapterData.subject}/${chapterData.chapterNumber}/questions`);
            if (data && data.success && data.questions && data.questions.length > 0) {
                loadedQuestions = data.questions;
                chapterInfo = data.chapter;
            }
        } catch (apiErr) {
            console.warn('API unavailable for chapter questions, fallback applied:', apiErr);
        }
    }

    if (loadedQuestions && loadedQuestions.length > 0) {
        questions = loadedQuestions;
        const titleText = chapterInfo ? chapterInfo.title : `Chapter ${chNum}`;
        document.getElementById('chapterSubject').textContent = capitalizeFirst(subject.replace('-', ' '));
        document.getElementById('chapterTitle').textContent = `Chapter ${chNum}: ${titleText}`;
        document.getElementById('totalQuestions').textContent = questions.length;
        document.getElementById('questionXP').textContent = '+20 XP';

        loadQuestion();
        startTimer();
    } else {
        alert('Failed to load chapter. Redirecting to learning path...');
        window.location.href = `chapters.html?subject=${chapterData.subject}`;
    }
}

function loadQuestion() {
    if (currentQuestionIndex >= questions.length) {
        endChapter();
        return;
    }
    
    const question = questions[currentQuestionIndex];
    
    document.getElementById('currentQuestion').textContent = currentQuestionIndex + 1;
    document.getElementById('questionNumber').textContent = currentQuestionIndex + 1;
    
    let questionText = question.question.replace(/^\d+\.\s*/, '');
    document.getElementById('questionText').textContent = `${currentQuestionIndex + 1}. ${questionText}`;
    
    const optionsContainer = document.getElementById('optionsContainer');
    const fragment = document.createDocumentFragment();
    
    question.options.forEach((option, index) => {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'option';
        optionDiv.innerHTML = `<div class="option-label">${String.fromCharCode(65 + index)}</div><div class="option-text">${option}</div>`;
        optionDiv.addEventListener('click', () => selectAnswer(index, optionDiv, question._id));
        fragment.appendChild(optionDiv);
    });
    
    optionsContainer.innerHTML = '';
    optionsContainer.appendChild(fragment);
    
    document.getElementById('hintSection').style.display = 'none';
    document.getElementById('nextBtn').disabled = true;
    
    updateProgress();
}

function selectAnswer(index, optionElement, questionId) {
    const allOptions = document.querySelectorAll('.option');
    if (allOptions[0].classList.contains('disabled')) return;
    
    allOptions.forEach(opt => {
        opt.classList.remove('selected');
        opt.classList.add('disabled');
    });
    
    optionElement.classList.add('selected');
    
    const question = questions[currentQuestionIndex];
    console.log('Full question object:', question);
    const correctAnswer = question.correctAnswer !== undefined ? question.correctAnswer : 0;
    const isCorrect = index === correctAnswer;
    const xpEarned = isCorrect ? (question.xpValue || 20) : 0;
    
    console.log('Selected:', index, 'Correct:', correctAnswer, 'Type:', typeof correctAnswer, 'Is Correct:', isCorrect);
    
    if (isCorrect) {
        optionElement.classList.add('correct');
        handleCorrectAnswer(xpEarned);
    } else {
        optionElement.classList.add('wrong');
        if (allOptions[correctAnswer]) {
            allOptions[correctAnswer].classList.add('correct');
        }
        handleWrongAnswer();
    }
    
    answers.push({ question: currentQuestionIndex, correct: isCorrect });
    document.getElementById('nextBtn').disabled = false;
}

function handleCorrectAnswer(xpGained) {
    sessionXP += xpGained;
    
    document.getElementById('sessionXP').textContent = sessionXP;
    document.getElementById('correctAnswers').textContent = answers.filter(a => a.correct).length + 1;
    
    showFeedback('correct', xpGained);
    playSound('correct');
}

function handleWrongAnswer() {
    document.getElementById('correctAnswers').textContent = answers.filter(a => a.correct).length;
    
    showFeedback('wrong', 0);
    playSound('error');
}

function showFeedback(type, xp) {
    const overlay = document.getElementById('feedbackOverlay');
    const icon = document.getElementById('feedbackIcon');
    const title = document.getElementById('feedbackTitle');
    const xpText = document.getElementById('feedbackXP');
    
    overlay.className = 'feedback-overlay';

    if (type === 'correct') {
        overlay.style.borderColor = '#10b981';
        icon.textContent = '✅';
        title.textContent = 'Correct!';
        xpText.textContent = `+${xp} XP`;
        xpText.style.color = '#10b981';
    } else {
        overlay.style.borderColor = '#ef4444';
        icon.textContent = '❌';
        title.textContent = 'Wrong!';
        xpText.textContent = 'Keep learning!';
        xpText.style.color = '#ef4444';
    }
    
    overlay.classList.add('show');
    setTimeout(() => overlay.classList.remove('show'), 800);
}

function updateProgress() {
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
    document.getElementById('questionProgress').style.width = `${progress}%`;
}

function startTimer() {
    updateTimerDisplay();
    
    if (timer) clearInterval(timer);

    timer = setInterval(() => {
        timeRemaining--;
        totalTime++;
        updateTimerDisplay();
        
        if (timeRemaining <= 0) {
            stopTimer();
            endChapter();
        }
    }, 1000);
}

function stopTimer() {
    if (timer) {
        clearInterval(timer);
        timer = null;
    }
}

function updateTimerDisplay() {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    document.getElementById('timer').textContent = 
        `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    
    if (timeRemaining <= 60) {
        document.querySelector('.timer-container').style.animation = 'pulse 1s infinite';
    }
}

async function useHint() {
    if (hintsRemaining <= 0) {
        alert('No hints remaining!');
        return;
    }
    
    try {
        const q = questions[currentQuestionIndex];
        let hintText = q.hint || 'Carefully review the code syntax and fundamental rules for this topic.';
        
        document.getElementById('hintText').textContent = hintText;
        document.getElementById('hintSection').style.display = 'block';
        
        hintsRemaining--;
        document.getElementById('hintsRemaining').textContent = hintsRemaining;
        
        playSound('select');
    } catch (error) {
        console.error('Error displaying hint:', error);
    }
}

async function endChapter() {
    stopTimer();
    
    const correctCount = answers.filter(a => a.correct).length;
    const accuracy = Math.round((correctCount / (answers.length || 1)) * 100);
    const minutes = Math.floor(totalTime / 60);
    const seconds = totalTime % 60;
    
    document.getElementById('finalAccuracy').textContent = accuracy + '%';
    document.getElementById('finalXP').textContent = sessionXP;
    document.getElementById('timeTaken').textContent = `${minutes}:${String(seconds).padStart(2, '0')}`;
    
    const passed = accuracy >= 60;

    // Save chapter completion in localStorage
    try {
        const key = 'codequest_chapter_progress';
        const progress = JSON.parse(localStorage.getItem(key) || '{}');
        const subj = chapterData.subject;
        const chNum = chapterData.chapterNumber;
        if (!progress[subj]) progress[subj] = {};
        if (passed) {
            progress[subj][chNum] = {
                completed: true,
                score: accuracy,
                completedAt: Date.now()
            };
            localStorage.setItem(key, JSON.stringify(progress));
        }
    } catch (storageErr) {
        console.error('LocalStorage save error:', storageErr);
    }

    try {
        const data = await api.post('/chapters/complete', {
            subject: chapterData.subject,
            chapterNumber: chapterData.chapterNumber,
            score: correctCount,
            correctAnswers: correctCount,
            totalQuestions: questions.length
        });
        
        if (data && data.leveledUp) {
            showLevelUp(data.newLevel - 1, data.newLevel);
        }
    } catch (error) {
        console.warn('API sync not available for chapter completion, saved locally:', error);
    }

    const completionMessage = document.getElementById('completionMessage');
    const nextChapterBtn = document.getElementById('nextChapter');
    const currentNum = parseInt(chapterData.chapterNumber) || 1;
    const nextNum = currentNum + 1;

    if (passed) {
        if (nextNum <= 5) {
            completionMessage.innerHTML = `<p>🎉 Congratulations! You passed Chapter ${currentNum} and unlocked Chapter ${nextNum} for reading!</p>`;
            if (nextChapterBtn) {
                nextChapterBtn.style.display = 'inline-block';
                nextChapterBtn.textContent = `📖 Read Chapter ${nextNum} →`;
            }
        } else {
            completionMessage.innerHTML = `<p>🏆 Outstanding! You have completed all chapters for ${capitalizeFirst(chapterData.subject)}!</p>`;
            if (nextChapterBtn) {
                nextChapterBtn.style.display = 'inline-block';
                nextChapterBtn.textContent = `📋 View All Chapters`;
            }
        }
    } else {
        completionMessage.innerHTML = '<p>📚 Keep practicing! You need at least 60% to complete this chapter.</p>';
        if (nextChapterBtn) nextChapterBtn.style.display = 'none';
    }
    
    document.getElementById('chapterCompleteModal').classList.add('active');
    playSound('success');
}

function showLevelUp(oldLevel, newLevel) {
    document.getElementById('oldLevel').textContent = oldLevel;
    document.getElementById('newLevel').textContent = newLevel;
    document.getElementById('levelUpModal').classList.add('active');
    playSound('levelup');
}

function attachEventListeners() {
    document.getElementById('nextBtn').addEventListener('click', () => {
        currentQuestionIndex++;
        loadQuestion();
    });
    
    document.getElementById('hintBtn').addEventListener('click', useHint);
    
    // Interactive Quit Modal Handlers
    const quitBtn = document.getElementById('quitChapter');
    const quitModal = document.getElementById('quitConfirmModal');
    const cancelQuitBtn = document.getElementById('cancelQuitBtn');
    const confirmQuitBtn = document.getElementById('confirmQuitBtn');

    if (quitBtn) {
        quitBtn.addEventListener('click', () => {
            if (typeof playSound === 'function') playSound('select');
            if (quitModal) {
                quitModal.classList.add('active');
            } else if (confirm('Are you sure you want to quit? Progress will be lost.')) {
                window.location.href = `chapters.html?subject=${chapterData.subject}`;
            }
        });
    }

    if (cancelQuitBtn) {
        cancelQuitBtn.addEventListener('click', () => {
            if (quitModal) quitModal.classList.remove('active');
            if (typeof playSound === 'function') playSound('select');
        });
    }

    if (confirmQuitBtn) {
        confirmQuitBtn.addEventListener('click', () => {
            if (typeof playSound === 'function') playSound('select');
            window.location.href = `chapters.html?subject=${chapterData.subject}`;
        });
    }

    if (quitModal) {
        quitModal.addEventListener('click', (e) => {
            if (e.target === quitModal) quitModal.classList.remove('active');
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && quitModal && quitModal.classList.contains('active')) {
            quitModal.classList.remove('active');
        }
    });

    document.getElementById('retryChapter').addEventListener('click', () => {
        window.location.reload();
    });
    
    document.getElementById('nextChapter').addEventListener('click', () => {
        const nextNum = parseInt(chapterData.chapterNumber) + 1;
        if (nextNum <= 5) {
            window.location.href = `chapters.html?subject=${chapterData.subject}&chapter=${nextNum}`;
        } else {
            window.location.href = `chapters.html?subject=${chapterData.subject}`;
        }
    });
    
    document.getElementById('backToPath').addEventListener('click', () => {
        window.location.href = `chapters.html?subject=${chapterData.subject}`;
    });
    
    document.getElementById('levelUpClose').addEventListener('click', () => {
        document.getElementById('levelUpModal').classList.remove('active');
    });
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}