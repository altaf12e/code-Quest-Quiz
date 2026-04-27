let examData = null;
let userData = null;
let currentQuestionIndex = 0;
let questions = [];
let answers = [];
let sessionXP = 0;
let streak = 0;
let hintsRemaining = 3;
let timer = null;
let timeRemaining = 30;
let totalTime = 0;
let examStartTime = null;
let autoSubmitWarningShown = false;
let warningTimer = null;
let questionOrder = [];
let sections = {};
let currentSection = 'fundamentals';
let sectionQuestionIndex = 0;
let userAnswers = {};
let currentFilter = 'all';
let questionTimes = {}; // Track time spent on each question
let examAnalytics = {}; // Store comprehensive analytics

document.addEventListener('DOMContentLoaded', () => {
    loadExamData();
    loadUserData();
    initializeExam();
    attachEventListeners();
});

function loadExamData() {
    const storedExam = localStorage.getItem('currentExam');
    if (!storedExam) {
        window.location.href = 'dashboard.html';
        return;
    }
    examData = JSON.parse(storedExam);
}

function loadUserData() {
    const storedData = localStorage.getItem('userData');
    if (!storedData) {
        window.location.href = 'login.html';
        return;
    }
    userData = JSON.parse(storedData);
}

async function initializeExam() {
    const proctoringStarted = await startProctoring();
    if (!proctoringStarted) {
        alert('Exam requires camera access and fullscreen mode.');
        window.location.href = 'dashboard.html';
        return;
    }
    
    document.getElementById('examSubject').textContent = capitalizeFirst(examData.subject.replace('-', ' '));
    const difficultyText = examData.subLevel ? 
        `${capitalizeFirst(examData.difficulty)} ${examData.subLevel}` : 
        capitalizeFirst(examData.difficulty);
    document.getElementById('examDifficulty').textContent = difficultyText;
    
    try {
        const questionLimit = examData.difficulty === 'marathon' ? 30 : 10;
        const subLevelParam = examData.subLevel ? `&subLevel=${examData.subLevel}` : '';
        const data = await api.get(`/exam/questions?subject=${examData.subject}&difficulty=${examData.difficulty}${subLevelParam}&limit=${questionLimit}`);
        questions = data.questions;
        sections = data.sections || {};
        
        console.log('Loaded exam questions:', questions.map(q => ({ id: q._id, correctAnswer: q.correctAnswer })));
        
        questionOrder = questions.map((q, index) => ({ originalId: q._id, currentIndex: index }));
        
        document.getElementById('totalQuestions').textContent = questions.length;
        document.getElementById('totalAnswered').textContent = questions.length;
        
        const xpValues = { easy: 10, medium: 25, hard: 50, marathon: 100 };
        const xpPerQuestion = xpValues[examData.difficulty] || 10;
        document.getElementById('questionXP').textContent = `+${xpPerQuestion} XP`;
        
        examStartTime = Date.now();
        initializeSections();
        updateProgressBar();
        showRandomizationEffect();
        loadQuestion();
        startTimer();
        attachAutoSubmitListeners();
    } catch (error) {
        console.error('Error loading questions:', error);
        alert('Failed to load questions. Redirecting to dashboard...');
        window.location.href = 'dashboard.html';
    }
}

function loadQuestion() {
    if (currentQuestionIndex >= questions.length) {
        showReviewButton();
        return;
    }
    
    questionTimes[currentQuestionIndex] = { startTime: Date.now() };
    
    const question = questions[currentQuestionIndex];
    
    document.getElementById('currentQuestion').textContent = currentQuestionIndex + 1;
    document.getElementById('questionNumber').textContent = currentQuestionIndex + 1;
    
    let questionText = question.question.replace(/^\d+\.\s*/, '');
    questionText = `${currentQuestionIndex + 1}. ${questionText}`;
    
    document.getElementById('questionText').textContent = questionText;
    
    const optionsContainer = document.getElementById('optionsContainer');
    optionsContainer.innerHTML = '';
    
    const fragment = document.createDocumentFragment();
    question.options.forEach((option, index) => {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'option';
        const labelDiv = document.createElement('div');
        labelDiv.className = 'option-label';
        labelDiv.textContent = String.fromCharCode(65 + index);
        
        const textDiv = document.createElement('div');
        textDiv.className = 'option-text';
        textDiv.textContent = option;
        
        optionDiv.appendChild(labelDiv);
        optionDiv.appendChild(textDiv);
        optionDiv.addEventListener('click', () => selectAnswer(index, optionDiv, question._id, question.correctAnswerIndex));
        fragment.appendChild(optionDiv);
    });
    optionsContainer.appendChild(fragment);
    
    document.getElementById('hintSection').style.display = 'none';
    document.getElementById('nextBtn').disabled = true;
    
    if (currentQuestionIndex === questions.length - 1) {
        showReviewButton();
    }
    
    updateAllProgress();
    updateProgressBar();
    resetTimer();
}

function selectAnswer(index, optionElement, questionId, correctAnswerIndex) {
    const allOptions = document.querySelectorAll('.option');
    if (allOptions[0].classList.contains('disabled')) return;
    
    if (questionTimes[currentQuestionIndex]) {
        questionTimes[currentQuestionIndex].timeSpent = Date.now() - questionTimes[currentQuestionIndex].startTime;
    }
    
    allOptions.forEach(opt => {
        opt.classList.remove('selected');
        opt.classList.add('disabled');
    });
    
    optionElement.classList.add('selected');
    
    const question = questions[currentQuestionIndex];
    console.log('Full question object:', question);
    const correctAnswer = question.correctAnswer !== undefined ? question.correctAnswer : 0;
    const isCorrect = index === correctAnswer;
    const xpEarned = isCorrect ? (question.xpValue || 10) : 0;
    
    console.log('Selected:', index, 'Correct:', correctAnswer, 'Type:', typeof correctAnswer, 'Is Correct:', isCorrect);
    
    userAnswers[currentQuestionIndex] = {
        selectedIndex: index,
        questionId: questionId,
        correctAnswerIndex: correctAnswer,
        isCorrect: isCorrect,
        correctIndex: correctAnswer,
        timeSpent: questionTimes[currentQuestionIndex]?.timeSpent || 0
    };
    
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
    
    document.getElementById('nextBtn').disabled = false;
    stopTimer();
}

function handleCorrectAnswer(xpGained) {
    sessionXP += xpGained;
    streak++;
    
    answers[currentQuestionIndex] = { question: currentQuestionIndex, correct: true };
    
    document.getElementById('sessionXP').textContent = sessionXP;
    document.getElementById('examStreak').textContent = streak;
    document.getElementById('correctAnswers').textContent = Object.values(answers).filter(a => a && a.correct).length;
    document.getElementById('totalAnswered').textContent = Object.keys(answers).length;
    
    updateAllProgress();
    showFeedback('correct', xpGained);
    playSound('correct');
}

function handleWrongAnswer() {
    streak = 0;
    
    answers[currentQuestionIndex] = { question: currentQuestionIndex, correct: false };
    
    document.getElementById('examStreak').textContent = streak;
    document.getElementById('correctAnswers').textContent = Object.values(answers).filter(a => a && a.correct).length;
    document.getElementById('totalAnswered').textContent = Object.keys(answers).length;
    
    updateAllProgress();
    showFeedback('wrong', 0);
    playSound('error');
}

function showFeedback(type, xp) {
    const overlay = document.getElementById('feedbackOverlay');
    const icon = document.getElementById('feedbackIcon');
    const title = document.getElementById('feedbackTitle');
    const xpText = document.getElementById('feedbackXP');
    
    overlay.className = 'feedback-overlay'; // Reset classes

    if (type === 'correct') {
        overlay.style.borderColor = '#10b981';
        icon.textContent = '✅';
        title.textContent = 'Correct!';
        xpText.textContent = `+${xp} XP`;
        xpText.style.color = '#10b981';
        setTimeout(() => overlay.classList.remove('show'), 800);
    } else if (type === 'wrong') {
        overlay.style.borderColor = '#ef4444';
        icon.textContent = '❌';
        title.textContent = 'Wrong!';
        xpText.textContent = 'Better luck next time';
        xpText.style.color = '#ef4444';
        setTimeout(() => overlay.classList.remove('show'), 800);
    } else if (type === 'timeout') {
        overlay.style.borderColor = '#f59e0b';
        icon.textContent = '⏰';
        title.textContent = 'Time\'s Up!';
        xpText.innerHTML = `
            <div style="margin-top: 1rem;">
                <button class="btn btn-primary btn-small timeout-retry" style="pointer-events: auto; cursor: pointer;">Try Again</button>
                <button class="btn btn-secondary btn-small timeout-dashboard" style="pointer-events: auto; cursor: pointer;">Dashboard</button>
            </div>
        `;
        xpText.style.color = '#f59e0b';
        xpText.style.pointerEvents = 'auto';
    } else if (type === 'autosubmit') {
        overlay.style.borderColor = '#8b5cf6';
        icon.textContent = '⚡';
        title.textContent = 'Auto-Submitted!';
        xpText.textContent = 'Exam completed automatically';
        xpText.style.color = '#8b5cf6';
        setTimeout(() => overlay.classList.remove('show'), 2000);
    }
    
    overlay.classList.add('show');
}

function retryCurrentQuestion() {
    // Remove the current question's answer from history
    delete answers[currentQuestionIndex];
    delete userAnswers[currentQuestionIndex];
    
    // Reset question state
    const allOptions = document.querySelectorAll('.option');
    allOptions.forEach(opt => {
        opt.classList.remove('selected', 'disabled', 'correct', 'wrong');
    });
    
    // Reset timer and enable interactions
    resetTimer();
    document.getElementById('nextBtn').disabled = true;
}

function startTimer() {
    if (examData.difficulty === 'marathon') {
        timeRemaining = 45 * 60; // 45 minutes in seconds
    } else {
        timeRemaining = 30; // 30 seconds per question
    }
    updateTimerDisplay();
    
    if (timer) clearInterval(timer);

    timer = setInterval(() => {
        timeRemaining--;
        totalTime++;
        updateTimerDisplay();
        
        if (timeRemaining <= 0) {
            stopTimer();
            if (examData.difficulty === 'marathon') {
                endExam(); // End marathon when time runs out
            } else {
                handleTimesUp();
            }
        }
    }, 1000);
}

function handleTimesUp() {
    const allOptions = document.querySelectorAll('.option');
    allOptions.forEach(opt => opt.classList.add('disabled'));
    
    const question = questions[currentQuestionIndex];
    const correctIndex = question.correctAnswerIndex !== undefined ? question.correctAnswerIndex : question.correctAnswer;
    if (question && allOptions[correctIndex]) {
        allOptions[correctIndex].classList.add('correct');
    }

    streak = 0;
    answers[currentQuestionIndex] = { question: currentQuestionIndex, correct: false };
    
    // Store timeout as unanswered for review
    userAnswers[currentQuestionIndex] = {
        selectedIndex: -1, // -1 indicates timeout/unanswered
        questionId: question._id,
        correctAnswerIndex: question.correctAnswerIndex,
        isCorrect: false,
        correctIndex: correctIndex,
        timeout: true
    };
    
    document.getElementById('examStreak').textContent = streak;
    document.getElementById('correctAnswers').textContent = Object.values(answers).filter(a => a && a.correct).length;
    document.getElementById('totalAnswered').textContent = Object.keys(answers).length;
    
    updateAllProgress();
    showFeedback('timeout', 0);
    playSound('error');
    
    document.getElementById('nextBtn').disabled = false;
}

function stopTimer() {
    if (timer) {
        clearInterval(timer);
        timer = null;
    }
}

function resetTimer() {
    if (examData.difficulty !== 'marathon') {
        stopTimer();
        startTimer();
    }
}

function updateTimerDisplay() {
    const displayTime = Math.max(0, timeRemaining);
    const minutes = Math.floor(displayTime / 60);
    const seconds = displayTime % 60;
    const timerContainer = document.getElementById('timerContainer');
    
    document.getElementById('timer').textContent = 
        `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    
    // Update timer visual state
    timerContainer.className = 'timer-container';
    
    if (examData.difficulty === 'marathon') {
        // Marathon mode: 45 minutes total
        if (displayTime <= 300) { // Last 5 minutes
            timerContainer.classList.add('critical');
            if (displayTime <= 60 && !autoSubmitWarningShown) {
                showAutoSubmitWarning();
            }
        } else if (displayTime <= 600) { // Last 10 minutes
            timerContainer.classList.add('warning');
        }
    } else {
        // Regular mode: 30 seconds per question
        if (displayTime <= 5) {
            timerContainer.classList.add('critical');
        } else if (displayTime <= 10) {
            timerContainer.classList.add('warning');
        }
    }
}

function autoSubmitAnswer() {
    const allOptions = document.querySelectorAll('.option');
    allOptions.forEach(opt => opt.classList.add('disabled'));
    
    handleWrongAnswer();
    answers.push({ question: currentQuestionIndex, correct: false });
    document.getElementById('nextBtn').disabled = false;
}

function attachEventListeners() {
    const nextBtn = document.getElementById('nextBtn');
    nextBtn.addEventListener('click', () => {
        currentQuestionIndex++;
        loadQuestion();
    });
    
    const hintBtn = document.getElementById('hintBtn');
    hintBtn.addEventListener('click', useHint);
    
    const reviewBtn = document.getElementById('reviewBtn');
    reviewBtn.addEventListener('click', showReviewModal);
    
    const continueExamBtn = document.getElementById('continueExamBtn');
    continueExamBtn.addEventListener('click', () => {
        document.getElementById('reviewModal').classList.remove('show');
        startTimer(); // Resume timer
    });
    
    const finalSubmitBtn = document.getElementById('finalSubmitBtn');
    finalSubmitBtn.addEventListener('click', () => {
        document.getElementById('reviewModal').classList.remove('show');
        endExam();
    });
    
    const closeAnalyticsBtn = document.getElementById('closeAnalytics');
    closeAnalyticsBtn.addEventListener('click', () => {
        document.getElementById('analyticsModal').classList.remove('show');
    });
    
    const quitBtn = document.getElementById('quitExam');
    quitBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to quit? Progress will be lost.')) {
            window.location.href = 'dashboard.html';
        }
    });
    
    // Event delegation for timeout buttons
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('timeout-retry')) {
            document.getElementById('feedbackOverlay').classList.remove('show');
            retryCurrentQuestion();
        } else if (e.target.classList.contains('timeout-dashboard')) {
            window.location.href = 'dashboard.html';
        }
    });
}

async function useHint() {
    if (hintsRemaining <= 0) {
        alert('No hints remaining!');
        return;
    }
    
    try {
        const questionId = questions[currentQuestionIndex]._id;
        const cleanQuestionId = typeof questionId === 'string' ? questionId : questionId.toString();
        
        const data = await api.get(`/exam/hint/${cleanQuestionId}`);
        
        document.getElementById('hintText').textContent = data.hint;
        document.getElementById('hintSection').style.display = 'block';
        
        hintsRemaining--;
        document.getElementById('hintsRemaining').textContent = hintsRemaining;
        
        playSound('select');
    } catch (error) {
        console.error('Error fetching hint:', error);
        alert('Could not fetch hint. Please try again.');
    }
}

async function endExam() {
    stopTimer();
    stopProctoring();
    
    const answeredQuestions = Object.values(answers).filter(a => a);
    const correctCount = answeredQuestions.filter(a => a.correct).length;
    const totalAnswered = answeredQuestions.length;
    const accuracy = totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0;
    const minutes = Math.floor(totalTime / 60);
    const seconds = totalTime % 60;
    
    // Generate comprehensive analytics
    generateExamAnalytics();
    
    // Exam results are saved via the quest-complete API call below
    
    document.getElementById('finalXP').textContent = sessionXP;
    document.getElementById('accuracy').textContent = accuracy + '%';
    document.getElementById('timeTaken').textContent = `${minutes}:${String(seconds).padStart(2, '0')}`;
    
    try {
        const data = await api.post('/user/quest-complete', {
            subject: examData.subject,
            difficulty: examData.difficulty,
            subLevel: examData.subLevel,
            score: correctCount,
            xpEarned: sessionXP,
            accuracy: accuracy,
            totalQuestions: questions.length,
            correctAnswers: correctCount,
            timeSpent: totalTime,
            sectionPerformance: calculateSectionPerformance()
        });
        
        if (data.leveledUp) {
            showLevelUp(data.newLevel - 1, data.newLevel);
        }
        
        // Check for unlocks
        if (accuracy >= 70) {
            checkForUnlocks(data.user.unlockedLevels);
        }
        
        userData = data.user;
        localStorage.setItem('userData', JSON.stringify(userData));
    } catch (error) {
        console.error('Error saving exam results:', error);
    }
    
    const modal = document.getElementById('examCompleteModal');
    modal.classList.add('active');
    
    playSound('success');
    
    document.getElementById('retryExam').onclick = () => {
        window.location.reload();
    };
    
    document.getElementById('viewAnalytics').onclick = () => {
        modal.classList.remove('active');
        showAnalyticsModal();
    };
}

function showLevelUp(oldLevel, newLevel) {
    const modal = document.getElementById('levelUpModal');
    document.getElementById('oldLevel').textContent = oldLevel;
    document.getElementById('newLevel').textContent = newLevel;
    modal.classList.add('active');
    
    playSound('levelup');
    
    document.getElementById('levelUpClose').onclick = () => {
        modal.classList.remove('active');
    };
}

function updateProgressBar() {
    const progress = (currentQuestionIndex / questions.length) * 100;
    document.getElementById('examProgressFill').style.width = `${Math.min(progress, 100)}%`;
}

function showAutoSubmitWarning() {
    if (autoSubmitWarningShown) return;
    autoSubmitWarningShown = true;
    
    const warningModal = document.getElementById('autoSubmitWarning');
    warningModal.classList.add('show');
    
    let countdown = 10;
    document.getElementById('warningCountdown').textContent = countdown;
    
    warningTimer = setInterval(() => {
        countdown--;
        document.getElementById('warningCountdown').textContent = countdown;
        
        if (countdown <= 0) {
            clearInterval(warningTimer);
            warningModal.classList.remove('show');
            autoSubmitExam();
        }
    }, 1000);
}

function autoSubmitExam() {
    stopTimer();
    if (warningTimer) clearInterval(warningTimer);
    
    // Auto-submit current question as wrong if not answered
    const allOptions = document.querySelectorAll('.option');
    if (!Array.from(allOptions).some(opt => opt.classList.contains('selected'))) {
        handleWrongAnswer();
    }
    
    // Show feedback that exam was auto-submitted
    showFeedback('autosubmit', 0);
    
    setTimeout(() => {
        endExam();
    }, 2000);
}

function initializeSections() {
    const sectionTabs = document.getElementById('sectionTabs');
    const questionNavigator = document.getElementById('questionNavigator');
    
    const sectionInfo = {
        fundamentals: { name: 'Fundamentals', icon: '📝', color: '#6366f1' },
        intermediate: { name: 'Intermediate', icon: '⚡', color: '#8b5cf6' },
        advanced: { name: 'Advanced', icon: '🚀', color: '#ec4899' },
        practical: { name: 'Practical', icon: '🛠️', color: '#10b981' }
    };
    
    // Create section tabs
    Object.keys(sectionInfo).forEach(sectionKey => {
        const sectionQuestions = sections[sectionKey] || [];
        if (sectionQuestions.length === 0) return;
        
        const tab = document.createElement('div');
        tab.className = 'section-tab';
        tab.dataset.section = sectionKey;
        tab.innerHTML = `${sectionInfo[sectionKey].icon} ${sectionInfo[sectionKey].name} (${sectionQuestions.length})`;
        tab.addEventListener('click', () => switchToSection(sectionKey));
        sectionTabs.appendChild(tab);
    });
    
    // Create question navigator
    questions.forEach((q, index) => {
        const btn = document.createElement('div');
        btn.className = 'question-nav-btn';
        btn.textContent = index + 1;
        btn.dataset.questionIndex = index;
        btn.dataset.section = q.section;
        btn.addEventListener('click', () => jumpToQuestion(index));
        questionNavigator.appendChild(btn);
    });
    
    initializeProgressBars();
    attachNavigatorListeners();
    updateAllProgress();
}

function switchToSection(sectionKey) {
    const sectionQuestions = sections[sectionKey] || [];
    if (sectionQuestions.length === 0) return;
    
    // Find first question of this section
    const firstQuestionIndex = questions.findIndex(q => q.section === sectionKey);
    if (firstQuestionIndex !== -1) {
        currentQuestionIndex = firstQuestionIndex;
        currentSection = sectionKey;
        loadQuestion();
    }
}

function jumpToQuestion(index) {
    if (index >= 0 && index < questions.length) {
        currentQuestionIndex = index;
        const question = questions[index];
        currentSection = question.section;
        loadQuestion();
    }
}

function initializeProgressBars() {
    const sectionProgressBars = document.getElementById('sectionProgressBars');
    const sectionInfo = {
        fundamentals: { name: 'Fundamentals', icon: '📝' },
        intermediate: { name: 'Intermediate', icon: '⚡' },
        advanced: { name: 'Advanced', icon: '🚀' },
        practical: { name: 'Practical', icon: '🛠️' }
    };
    
    Object.keys(sectionInfo).forEach(sectionKey => {
        const sectionQuestions = sections[sectionKey] || [];
        if (sectionQuestions.length === 0) return;
        
        const progressItem = document.createElement('div');
        progressItem.className = 'section-progress-item';
        progressItem.innerHTML = `
            <div class="section-progress-info">
                <span class="section-progress-icon">${sectionInfo[sectionKey].icon}</span>
                <span>${sectionInfo[sectionKey].name}</span>
            </div>
            <div class="section-progress-bar">
                <div class="section-progress-fill ${sectionKey}" id="progress-${sectionKey}"></div>
            </div>
            <div class="section-progress-text" id="progressText-${sectionKey}">0/${sectionQuestions.length}</div>
        `;
        sectionProgressBars.appendChild(progressItem);
    });
}

function updateAllProgress() {
    updateOverallProgress();
    updateSectionProgress();
    updateQuestionNavigator();
    updateSectionDisplay();
}

function updateOverallProgress() {
    const answeredCount = Object.keys(userAnswers).length;
    const totalQuestions = questions.length;
    const progressPercent = (answeredCount / totalQuestions) * 100;
    
    document.getElementById('overallProgressFill').style.width = `${progressPercent}%`;
    document.getElementById('overallProgressText').textContent = `${Math.round(progressPercent)}%`;
    document.getElementById('progressAnswered').textContent = answeredCount;
    document.getElementById('progressRemaining').textContent = totalQuestions - answeredCount;
}

function updateSectionProgress() {
    const sectionInfo = {
        fundamentals: { name: 'Fundamentals' },
        intermediate: { name: 'Intermediate' },
        advanced: { name: 'Advanced' },
        practical: { name: 'Practical' }
    };
    
    Object.keys(sectionInfo).forEach(sectionKey => {
        const sectionQuestions = sections[sectionKey] || [];
        if (sectionQuestions.length === 0) return;
        
        const answeredInSection = sectionQuestions.filter(q => {
            const questionIndex = questions.findIndex(quest => quest._id === q._id);
            return userAnswers[questionIndex];
        }).length;
        
        const progressPercent = (answeredInSection / sectionQuestions.length) * 100;
        const progressFill = document.getElementById(`progress-${sectionKey}`);
        const progressText = document.getElementById(`progressText-${sectionKey}`);
        
        if (progressFill) progressFill.style.width = `${progressPercent}%`;
        if (progressText) progressText.textContent = `${answeredInSection}/${sectionQuestions.length}`;
    });
}

function updateQuestionNavigator() {
    document.querySelectorAll('.question-nav-btn').forEach((btn, index) => {
        btn.classList.remove('current', 'answered');
        
        if (index === currentQuestionIndex) {
            btn.classList.add('current');
        }
        
        if (userAnswers[index]) {
            btn.classList.add('answered');
        }
        
        // Apply filter
        const shouldShow = shouldShowQuestion(index);
        btn.style.display = shouldShow ? 'flex' : 'none';
    });
}

function shouldShowQuestion(index) {
    if (currentFilter === 'all') return true;
    if (currentFilter === 'answered') return userAnswers[index];
    if (currentFilter === 'unanswered') return !userAnswers[index];
    return true;
}

function attachNavigatorListeners() {
    // Filter buttons
    document.querySelectorAll('.navigator-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.navigator-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            updateQuestionNavigator();
        });
    });
    
    // Quick navigation buttons
    document.getElementById('prevBtn').addEventListener('click', () => {
        if (currentQuestionIndex > 0) {
            jumpToQuestion(currentQuestionIndex - 1);
        }
    });
    
    document.getElementById('nextQuickBtn').addEventListener('click', () => {
        if (currentQuestionIndex < questions.length - 1) {
            jumpToQuestion(currentQuestionIndex + 1);
        }
    });
    
    document.getElementById('firstUnanswered').addEventListener('click', () => {
        const firstUnanswered = questions.findIndex((q, index) => !userAnswers[index]);
        if (firstUnanswered !== -1) {
            jumpToQuestion(firstUnanswered);
        }
    });
}

function updateSectionDisplay() {
    const question = questions[currentQuestionIndex];
    if (!question) return;
    
    currentSection = question.section;
    
    const sectionInfo = {
        fundamentals: { name: 'Fundamentals', icon: '📝', subtitle: 'Basic concepts and theory' },
        intermediate: { name: 'Intermediate', icon: '⚡', subtitle: 'Core programming skills' },
        advanced: { name: 'Advanced', icon: '🚀', subtitle: 'Complex problem solving' },
        practical: { name: 'Practical', icon: '🛠️', subtitle: 'Real-world applications' }
    };
    
    const info = sectionInfo[currentSection] || sectionInfo.fundamentals;
    
    document.getElementById('sectionIcon').textContent = info.icon;
    document.getElementById('sectionTitle').textContent = `Section: ${info.name}`;
    document.getElementById('sectionSubtitle').textContent = info.subtitle;
    
    // Update section progress
    const sectionQuestions = sections[currentSection] || [];
    const currentSectionIndex = sectionQuestions.findIndex(q => q._id === question._id);
    document.getElementById('sectionQuestionNum').textContent = currentSectionIndex + 1;
    document.getElementById('sectionTotal').textContent = sectionQuestions.length;
    
    // Update section tabs
    document.querySelectorAll('.section-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.dataset.section === currentSection) {
            tab.classList.add('active');
        }
    });
    
    // Update quick nav button states
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextQuickBtn');
    const firstUnansweredBtn = document.getElementById('firstUnanswered');
    
    prevBtn.classList.toggle('disabled', currentQuestionIndex === 0);
    nextBtn.classList.toggle('disabled', currentQuestionIndex === questions.length - 1);
    
    const hasUnanswered = questions.some((q, index) => !userAnswers[index]);
    firstUnansweredBtn.classList.toggle('disabled', !hasUnanswered);
}

function showRandomizationEffect() {
    const badge = document.getElementById('randomBadge');
    if (badge) {
        badge.style.opacity = '1';
        setTimeout(() => {
            badge.style.opacity = '0.7';
        }, 3000);
    }
}

function showReviewButton() {
    document.getElementById('reviewBtn').style.display = 'inline-flex';
    document.getElementById('nextBtn').textContent = 'Finish Exam';
    document.getElementById('nextBtn').onclick = () => showReviewModal();
}

function showReviewModal() {
    generateReviewContent();
    document.getElementById('reviewModal').classList.add('show');
    stopTimer();
}

function generateReviewContent() {
    const reviewBody = document.getElementById('reviewBody');
    const answeredCount = Object.keys(userAnswers).length;
    const unansweredCount = questions.length - answeredCount;
    
    // Update stats
    document.getElementById('reviewAnswered').textContent = answeredCount;
    document.getElementById('reviewUnanswered').textContent = unansweredCount;
    document.getElementById('reviewTotal').textContent = questions.length;
    
    // Show warning if unanswered questions
    const warningEl = document.getElementById('reviewWarning');
    if (unansweredCount > 0) {
        warningEl.style.display = 'flex';
    } else {
        warningEl.style.display = 'none';
    }
    
    // Group questions by section
    const sectionInfo = {
        fundamentals: { name: 'Fundamentals', icon: '📝' },
        intermediate: { name: 'Intermediate', icon: '⚡' },
        advanced: { name: 'Advanced', icon: '🚀' },
        practical: { name: 'Practical', icon: '🛠️' }
    };
    
    reviewBody.innerHTML = '';
    
    Object.keys(sectionInfo).forEach(sectionKey => {
        const sectionQuestions = questions.filter(q => q.section === sectionKey);
        if (sectionQuestions.length === 0) return;
        
        const sectionDiv = document.createElement('div');
        sectionDiv.className = 'review-section';
        
        const sectionHeader = document.createElement('div');
        sectionHeader.className = 'review-section-header';
        sectionHeader.innerHTML = `
            <span class="review-section-icon">${sectionInfo[sectionKey].icon}</span>
            <span class="review-section-title">${sectionInfo[sectionKey].name}</span>
        `;
        
        const questionsDiv = document.createElement('div');
        questionsDiv.className = 'review-questions';
        
        sectionQuestions.forEach((question, sectionIndex) => {
            const questionIndex = questions.findIndex(q => q._id === question._id);
            const userAnswer = userAnswers[questionIndex];
            
            const questionDiv = document.createElement('div');
            questionDiv.className = 'review-question';
            
            if (userAnswer) {
                questionDiv.classList.add(userAnswer.isCorrect ? 'correct' : 'wrong');
            } else {
                questionDiv.classList.add('unanswered');
            }
            
            questionDiv.innerHTML = `
                <div class="review-question-header">
                    <span class="review-question-number">Question ${questionIndex + 1}</span>
                    <span class="review-question-status ${userAnswer ? (userAnswer.isCorrect ? 'correct' : 'wrong') : 'unanswered'}">
                        ${userAnswer ? (userAnswer.isCorrect ? '✓ Correct' : '✗ Wrong') : '⚠ Unanswered'}
                    </span>
                </div>
                <div class="review-question-text">${question.question.replace(/^\d+\.\s*/, '')}</div>
                <div class="review-options">
                    ${question.options.map((option, optIndex) => {
                        let optionClass = 'review-option';
                        if (userAnswer && userAnswer.selectedIndex === optIndex) {
                            optionClass += ' selected';
                        }
                        if (userAnswer && userAnswer.correctIndex === optIndex) {
                            optionClass += ' correct';
                        }
                        if (userAnswer && userAnswer.selectedIndex === optIndex && !userAnswer.isCorrect) {
                            optionClass += ' wrong';
                        }
                        
                        return `
                            <div class="${optionClass}">
                                <span class="review-option-label">${String.fromCharCode(65 + optIndex)}</span>
                                <span>${option}</span>
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
            
            // Add click handler to jump to question
            questionDiv.addEventListener('click', () => {
                document.getElementById('reviewModal').classList.remove('show');
                jumpToQuestion(questionIndex);
            });
            
            questionsDiv.appendChild(questionDiv);
        });
        
        sectionDiv.appendChild(sectionHeader);
        sectionDiv.appendChild(questionsDiv);
        reviewBody.appendChild(sectionDiv);
    });
}

function attachAutoSubmitListeners() {
    document.getElementById('continueExam').addEventListener('click', () => {
        if (warningTimer) clearInterval(warningTimer);
        document.getElementById('autoSubmitWarning').classList.remove('show');
        autoSubmitWarningShown = false;
    });
    
    document.getElementById('submitNow').addEventListener('click', () => {
        if (warningTimer) clearInterval(warningTimer);
        document.getElementById('autoSubmitWarning').classList.remove('show');
        endExam();
    });
}

function generateExamAnalytics() {
    const answeredQuestions = Object.values(answers).filter(a => a);
    const correctCount = answeredQuestions.filter(a => a.correct).length;
    const totalAnswered = answeredQuestions.length;
    const accuracy = totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0;
    
    // Calculate section performance
    const sectionPerformance = {};
    Object.keys(sections).forEach(sectionKey => {
        const sectionQuestions = sections[sectionKey] || [];
        const sectionAnswers = sectionQuestions.map(q => {
            const questionIndex = questions.findIndex(quest => quest._id === q._id);
            return userAnswers[questionIndex];
        }).filter(a => a);
        
        const sectionCorrect = sectionAnswers.filter(a => a.isCorrect).length;
        const sectionAccuracy = sectionAnswers.length > 0 ? Math.round((sectionCorrect / sectionAnswers.length) * 100) : 0;
        
        sectionPerformance[sectionKey] = {
            total: sectionQuestions.length,
            answered: sectionAnswers.length,
            correct: sectionCorrect,
            accuracy: sectionAccuracy
        };
    });
    
    // Calculate time metrics
    const questionTimesArray = Object.values(questionTimes).map(qt => qt.timeSpent || 0).filter(t => t > 0);
    const avgTimePerQuestion = questionTimesArray.length > 0 ? 
        Math.round(questionTimesArray.reduce((a, b) => a + b, 0) / questionTimesArray.length / 1000) : 0;
    const fastestTime = questionTimesArray.length > 0 ? Math.round(Math.min(...questionTimesArray) / 1000) : 0;
    const slowestTime = questionTimesArray.length > 0 ? Math.round(Math.max(...questionTimesArray) / 1000) : 0;
    
    examAnalytics = {
        overall: {
            totalQuestions: questions.length,
            answered: totalAnswered,
            correct: correctCount,
            accuracy: accuracy,
            xpEarned: sessionXP,
            totalTime: totalTime,
            grade: calculateGrade(accuracy)
        },
        sections: sectionPerformance,
        timing: {
            totalTime: totalTime,
            avgTimePerQuestion: avgTimePerQuestion,
            fastestTime: fastestTime,
            slowestTime: slowestTime
        },
        recommendations: generateRecommendations(accuracy, sectionPerformance)
    };
}

function calculateGrade(accuracy) {
    if (accuracy >= 95) return { letter: 'A+', description: 'Outstanding Performance!', class: 'excellent' };
    if (accuracy >= 90) return { letter: 'A', description: 'Excellent Performance!', class: 'excellent' };
    if (accuracy >= 85) return { letter: 'A-', description: 'Very Good Performance!', class: 'excellent' };
    if (accuracy >= 80) return { letter: 'B+', description: 'Good Performance!', class: 'good' };
    if (accuracy >= 75) return { letter: 'B', description: 'Above Average Performance!', class: 'good' };
    if (accuracy >= 70) return { letter: 'B-', description: 'Satisfactory Performance!', class: 'good' };
    if (accuracy >= 65) return { letter: 'C+', description: 'Fair Performance!', class: 'average' };
    if (accuracy >= 60) return { letter: 'C', description: 'Needs Improvement!', class: 'average' };
    return { letter: 'F', description: 'Requires Significant Study!', class: 'poor' };
}

function generateRecommendations(accuracy, sectionPerformance) {
    const recommendations = [];
    
    if (accuracy < 70) {
        recommendations.push({
            icon: '📚',
            text: 'Focus on fundamental concepts. Consider reviewing basic materials before attempting advanced topics.'
        });
    }
    
    // Section-specific recommendations
    Object.keys(sectionPerformance).forEach(section => {
        const perf = sectionPerformance[section];
        if (perf.accuracy < 60 && perf.answered > 0) {
            const sectionNames = {
                fundamentals: 'Fundamentals',
                intermediate: 'Intermediate',
                advanced: 'Advanced',
                practical: 'Practical'
            };
            recommendations.push({
                icon: '⚠️',
                text: `Strengthen your ${sectionNames[section]} knowledge. Consider additional practice in this area.`
            });
        }
    });
    
    if (examAnalytics.timing?.avgTimePerQuestion > 25) {
        recommendations.push({
            icon: '⏱️',
            text: 'Work on time management. Practice solving questions more quickly to improve efficiency.'
        });
    }
    
    if (accuracy >= 85) {
        recommendations.push({
            icon: '🎆',
            text: 'Excellent work! Consider challenging yourself with harder difficulty levels.'
        });
    }
    
    return recommendations;
}

function showAnalyticsModal() {
    populateAnalyticsModal();
    document.getElementById('analyticsModal').classList.add('show');
}

function populateAnalyticsModal() {
    const analytics = examAnalytics;
    
    // Grade display
    document.getElementById('gradeLetter').textContent = analytics.overall.grade.letter;
    document.getElementById('gradeLetter').className = `grade-letter ${analytics.overall.grade.class}`;
    document.getElementById('gradeDescription').textContent = analytics.overall.grade.description;
    
    // Results summary
    const resultsSummary = document.getElementById('resultsSummary');
    resultsSummary.innerHTML = `
        <div class="result-stat">
            <div class="result-stat-icon">🎯</div>
            <div class="result-stat-value ${analytics.overall.grade.class}">${analytics.overall.accuracy}%</div>
            <div class="result-stat-label">Accuracy</div>
        </div>
        <div class="result-stat">
            <div class="result-stat-icon">✅</div>
            <div class="result-stat-value">${analytics.overall.correct}</div>
            <div class="result-stat-label">Correct</div>
        </div>
        <div class="result-stat">
            <div class="result-stat-icon">⚡</div>
            <div class="result-stat-value">${analytics.overall.xpEarned}</div>
            <div class="result-stat-label">XP Earned</div>
        </div>
        <div class="result-stat">
            <div class="result-stat-icon">⏱️</div>
            <div class="result-stat-value">${Math.floor(analytics.timing.totalTime / 60)}:${String(analytics.timing.totalTime % 60).padStart(2, '0')}</div>
            <div class="result-stat-label">Time Taken</div>
        </div>
    `;
    
    // Performance metrics
    const performanceMetrics = document.getElementById('performanceMetrics');
    performanceMetrics.innerHTML = `
        <div class="metric-item">
            <div class="metric-value ${analytics.overall.grade.class}">${analytics.overall.accuracy}%</div>
            <div class="metric-label">Overall Accuracy</div>
        </div>
        <div class="metric-item">
            <div class="metric-value">${analytics.timing.avgTimePerQuestion}s</div>
            <div class="metric-label">Avg Time/Question</div>
        </div>
        <div class="metric-item">
            <div class="metric-value">${analytics.overall.answered}/${analytics.overall.totalQuestions}</div>
            <div class="metric-label">Questions Answered</div>
        </div>
    `;
    
    // Time analytics
    const timeAnalytics = document.getElementById('timeAnalytics');
    timeAnalytics.innerHTML = `
        <div class="time-metric">
            <span class="time-metric-label">Total Time</span>
            <span class="time-metric-value">${Math.floor(analytics.timing.totalTime / 60)}:${String(analytics.timing.totalTime % 60).padStart(2, '0')}</span>
        </div>
        <div class="time-metric">
            <span class="time-metric-label">Average per Question</span>
            <span class="time-metric-value">${analytics.timing.avgTimePerQuestion}s</span>
        </div>
        <div class="time-metric">
            <span class="time-metric-label">Fastest Question</span>
            <span class="time-metric-value">${analytics.timing.fastestTime}s</span>
        </div>
        <div class="time-metric">
            <span class="time-metric-label">Slowest Question</span>
            <span class="time-metric-value">${analytics.timing.slowestTime}s</span>
        </div>
    `;
    
    // Section analytics
    const sectionAnalytics = document.getElementById('sectionAnalytics');
    const sectionInfo = {
        fundamentals: { name: 'Fundamentals', icon: '📝' },
        intermediate: { name: 'Intermediate', icon: '⚡' },
        advanced: { name: 'Advanced', icon: '🚀' },
        practical: { name: 'Practical', icon: '🛠️' }
    };
    
    sectionAnalytics.innerHTML = Object.keys(analytics.sections).map(sectionKey => {
        const section = analytics.sections[sectionKey];
        const info = sectionInfo[sectionKey];
        const accuracyClass = section.accuracy >= 80 ? 'excellent' : section.accuracy >= 60 ? 'good' : 'poor';
        
        return `
            <div class="section-metric">
                <div class="section-metric-info">
                    <span class="section-metric-icon">${info.icon}</span>
                    <div class="section-metric-details">
                        <div class="section-metric-name">${info.name}</div>
                        <div class="section-metric-subtitle">${section.answered}/${section.total} questions</div>
                    </div>
                </div>
                <div class="section-metric-stats">
                    <span class="section-accuracy ${accuracyClass}">${section.accuracy}%</span>
                    <span class="section-questions">${section.correct}/${section.answered}</span>
                </div>
            </div>
        `;
    }).join('');
    
    // Recommendations
    const recommendationsList = document.getElementById('recommendationsList');
    recommendationsList.innerHTML = analytics.recommendations.map(rec => `
        <div class="recommendation-item">
            <span class="recommendation-icon">${rec.icon}</span>
            <span class="recommendation-text">${rec.text}</span>
        </div>
    `).join('');
    
    // Add exam completion info
    const examInfo = document.getElementById('examCompletionInfo');
    if (examInfo) {
        examInfo.textContent = `Exam completed on ${new Date().toLocaleDateString()}`;
    }
}



function calculateSectionPerformance() {
    const sectionPerf = {
        fundamentals: { correct: 0, total: 0 },
        intermediate: { correct: 0, total: 0 },
        advanced: { correct: 0, total: 0 },
        practical: { correct: 0, total: 0 }
    };
    
    questions.forEach((question, index) => {
        const section = question.section || 'fundamentals';
        if (sectionPerf[section]) {
            sectionPerf[section].total++;
            if (userAnswers[index] && userAnswers[index].isCorrect) {
                sectionPerf[section].correct++;
            }
        }
    });
    
    return sectionPerf;
}

function calculateExamGrade(accuracy) {
    if (accuracy >= 95) return { letter: 'A+', class: 'excellent' };
    if (accuracy >= 90) return { letter: 'A', class: 'excellent' };
    if (accuracy >= 85) return { letter: 'A-', class: 'excellent' };
    if (accuracy >= 80) return { letter: 'B+', class: 'good' };
    if (accuracy >= 75) return { letter: 'B', class: 'good' };
    if (accuracy >= 70) return { letter: 'B-', class: 'good' };
    if (accuracy >= 65) return { letter: 'C+', class: 'average' };
    if (accuracy >= 60) return { letter: 'C', class: 'average' };
    return { letter: 'F', class: 'poor' };
}

function checkForUnlocks(unlockedLevels) {
    const currentDifficulty = examData.difficulty;
    const currentSubLevel = examData.subLevel;
    const unlocked = unlockedLevels[currentDifficulty] || [];
    
    let newUnlocks = [];
    
    // Check if next sub-level was unlocked
    if (currentSubLevel === 'I' && unlocked.includes('II')) {
        newUnlocks.push(`${capitalizeFirst(currentDifficulty)} II`);
    } else if (currentSubLevel === 'II' && unlocked.includes('III')) {
        newUnlocks.push(`${capitalizeFirst(currentDifficulty)} III`);
    }
    
    // Check if next difficulty was unlocked
    if (currentSubLevel === 'III') {
        const nextDifficulty = getNextDifficulty(currentDifficulty);
        if (nextDifficulty && unlockedLevels[nextDifficulty] && unlockedLevels[nextDifficulty].includes('I')) {
            newUnlocks.push(`${capitalizeFirst(nextDifficulty)} I`);
        }
    }
    
    if (newUnlocks.length > 0) {
        showUnlockNotification(newUnlocks);
    }
}

function getNextDifficulty(current) {
    const order = ['easy', 'medium', 'hard', 'marathon'];
    const index = order.indexOf(current);
    return index < order.length - 1 ? order[index + 1] : null;
}

function showUnlockNotification(unlocks) {
    const notification = document.createElement('div');
    notification.className = 'unlock-notification';
    notification.innerHTML = `
        <div class="unlock-content">
            <div class="unlock-icon">🔓</div>
            <div class="unlock-title">New Levels Unlocked!</div>
            <div class="unlock-list">
                ${unlocks.map(unlock => `<div class="unlock-item">✨ ${unlock}</div>`).join('')}
            </div>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(15, 23, 42, 0.98);
        border: 2px solid #10b981;
        border-radius: 20px;
        padding: 2rem;
        z-index: 9999;
        text-align: center;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8);
        animation: unlockPulse 0.5s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => document.body.removeChild(notification), 300);
    }, 3000);
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
