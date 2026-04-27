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
    try {
        const data = await api.get(`/chapters/${chapterData.subject}/${chapterData.chapterNumber}/questions`);

        if (data.success) {
            questions = data.questions;
            const chapter = data.chapter;
            
            console.log('Loaded questions:', questions);
            
            document.getElementById('chapterSubject').textContent = capitalizeFirst(chapterData.subject.replace('-', ' '));
            document.getElementById('chapterTitle').textContent = `Chapter ${chapter.chapterNumber}: ${chapter.title}`;
            document.getElementById('totalQuestions').textContent = questions.length;
            
            const xpValues = { beginner: 20, intermediate: 35, advanced: 50 };
            const xpPerQuestion = xpValues[chapter.difficulty] || 20;
            document.getElementById('questionXP').textContent = `+${xpPerQuestion} XP`;
            
            loadQuestion();
            startTimer();
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('Error loading chapter:', error);
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
        const questionId = questions[currentQuestionIndex]._id;
        
        const data = await api.get(`/exam/hint/${questionId}`);
        
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

async function endChapter() {
    stopTimer();
    
    const correctCount = answers.filter(a => a.correct).length;
    const accuracy = Math.round((correctCount / answers.length) * 100);
    const minutes = Math.floor(totalTime / 60);
    const seconds = totalTime % 60;
    
    document.getElementById('finalAccuracy').textContent = accuracy + '%';
    document.getElementById('finalXP').textContent = sessionXP;
    document.getElementById('timeTaken').textContent = `${minutes}:${String(seconds).padStart(2, '0')}`;
    
    try {
        const data = await api.post('/chapters/complete', {
            subject: chapterData.subject,
            chapterNumber: chapterData.chapterNumber,
            score: correctCount,
            correctAnswers: correctCount,
            totalQuestions: questions.length
        });
        
        if (data.leveledUp) {
            showLevelUp(data.newLevel - 1, data.newLevel);
        }
        
        const completionMessage = document.getElementById('completionMessage');
        if (data.passed) {
            completionMessage.innerHTML = '<p>🎉 Congratulations! You passed this chapter and unlocked the next one!</p>';
            document.getElementById('nextChapter').style.display = 'inline-block';
        } else {
            completionMessage.innerHTML = '<p>📚 Keep practicing! You need 70% to pass this chapter.</p>';
            document.getElementById('nextChapter').style.display = 'none';
        }
        
    } catch (error) {
        console.error('Error completing chapter:', error);
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
    
    document.getElementById('quitChapter').addEventListener('click', () => {
        if (confirm('Are you sure you want to quit? Progress will be lost.')) {
            window.location.href = `chapters.html?subject=${chapterData.subject}`;
        }
    });
    
    document.getElementById('retryChapter').addEventListener('click', () => {
        window.location.reload();
    });
    
    document.getElementById('nextChapter').addEventListener('click', () => {
        window.location.href = `chapters.html?subject=${chapterData.subject}`;
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