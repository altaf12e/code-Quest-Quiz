let userData = null;
let selectedSubject = null;

document.addEventListener('DOMContentLoaded', () => {
    loadUserData();
    attachEventListeners();
});

async function loadUserData() {
    const token = localStorage.getItem('token');
    
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    // Try to load cached user data first
    const cachedUserData = localStorage.getItem('userData');
    if (cachedUserData) {
        try {
            userData = JSON.parse(cachedUserData);
            updateUI();
            animateEntrance();
        } catch (e) {
            console.error('Error parsing cached user data:', e);
        }
    }

    try {
        const data = await api.get('/user/profile');
        
        if (data.success) {
            userData = data.user;
            
            console.log('Fresh user data loaded:', userData);
            localStorage.setItem('userData', JSON.stringify(userData));
            updateUI();
            if (!cachedUserData) animateEntrance();
        } else {
            console.error('Failed to load user data:', data.message);
            // Only redirect if it's an authentication error
            if (data.message && data.message.includes('token')) {
                localStorage.removeItem('token');
                localStorage.removeItem('userData');
                window.location.href = 'login.html';
            }
        }
    } catch (error) {
        console.error('Error loading profile:', error);
        // Only redirect on authentication errors, not network errors
        if (error.message && (error.message.includes('token') || error.message.includes('Unauthorized'))) {
            localStorage.removeItem('token');
            localStorage.removeItem('userData');
            window.location.href = 'login.html';
        }
        // If we have cached data, continue with that
        else if (!userData && !cachedUserData) {
            window.location.href = 'login.html';
        }
    }
}

function updateUI() {
    console.log('Updating UI with user data:', userData);
    
    const avatar = userData.avatar || '🦸';
    const avatarEl = document.getElementById('userAvatar');
    
    if (avatar.startsWith('data:image') || avatar.startsWith('http')) {
        avatarEl.innerHTML = '';
        const img = document.createElement('img');
        img.src = avatar;
        img.style.cssText = 'width: 100%; height: 100%; object-fit: cover; border-radius: 50%;';
        avatarEl.appendChild(img);
    } else {
        avatarEl.innerHTML = '';
        avatarEl.textContent = avatar;
    }

    document.getElementById('userName').textContent = userData.username || 'Unknown User';
    document.getElementById('userLevel').textContent = userData.level || 1;
    document.getElementById('totalXP').textContent = userData.xp || 0;
    document.getElementById('streakCount').textContent = userData.streak || 0;
    document.getElementById('userRank').textContent = userData.rank || 999;
    
    // Show admin panel button for admin users
    const adminBtn = document.getElementById('adminPanelBtn');
    if (adminBtn && (userData.isAdmin || userData.username === 'admin')) {
        adminBtn.style.display = 'block';
    }
    
    console.log('UI updated with:', {
        username: userData.username,
        level: userData.level,
        xp: userData.xp,
        streak: userData.streak,
        rank: userData.rank
    });
    
    updateXPProgress();
    updateDailyQuests();
    updateSubjectProgress();
}

function updateXPProgress() {
    if (userData.levelProgress) {
        const currentLevelXP = userData.levelProgress.currentLevelXP;
        const xpForNextLevel = userData.levelProgress.xpForNextLevel;
        const percentage = Math.min(100, Math.max(0, (currentLevelXP / xpForNextLevel) * 100));
        
        document.getElementById('currentXP').textContent = Math.max(0, currentLevelXP);
        document.getElementById('nextLevelXP').textContent = xpForNextLevel;
        document.getElementById('xpFill').style.width = percentage + '%';
    } else {
        // Calculate proper level progress using the same formula as server
        const level = userData.level || 1;
        const totalXP = userData.xp || 0;
        
        // Calculate total XP used for previous levels
        let totalXPUsed = 0;
        for (let i = 1; i < level; i++) {
            totalXPUsed += i * 150 + (i - 1) * 50;
        }
        
        const currentLevelXP = totalXP - totalXPUsed;
        const xpForNextLevel = level * 150 + (level - 1) * 50;
        const percentage = Math.min(100, Math.max(0, (currentLevelXP / xpForNextLevel) * 100));
        
        document.getElementById('currentXP').textContent = Math.max(0, currentLevelXP);
        document.getElementById('nextLevelXP').textContent = xpForNextLevel;
        document.getElementById('xpFill').style.width = percentage + '%';
    }
}

function updateDailyQuests() {
    const container = document.getElementById('dailyQuestsContainer');
    
    console.log('Daily quests data:', userData.dailyQuests);
    
    if (!userData.dailyQuests || userData.dailyQuests.length === 0) {
        // Generate fallback quests for display
        const fallbackQuests = [
            { id: '1', description: 'Answer 5 questions correctly', type: 'questions', target: 5, completed: 0, reward: 100, isCompleted: false },
            { id: '2', description: 'Achieve 80% accuracy in any exam', type: 'accuracy', target: 80, completed: 0, reward: 150, isCompleted: false },
            { id: '3', description: 'Complete 3 Java questions', type: 'subject', target: 3, completed: 0, reward: 120, isCompleted: false },
            { id: '4', description: 'Complete 1 full exam', type: 'exam', target: 1, completed: 0, reward: 200, isCompleted: false }
        ];
        
        container.innerHTML = '';
        fallbackQuests.forEach(quest => {
            const percentage = Math.min(100, (quest.completed / quest.target) * 100);
            const questCard = createQuestCard(quest, percentage);
            container.appendChild(questCard);
        });
        
        // Try to refresh user data in background
        setTimeout(() => {
            loadUserData();
        }, 2000);
        return;
    }
    
    container.innerHTML = '';
    userData.dailyQuests.forEach(quest => {
        const percentage = Math.min(100, (quest.completed / quest.target) * 100);
        const questCard = createQuestCard(quest, percentage);
        if (quest.isCompleted) {
            questCard.classList.add('completed');
        }
        container.appendChild(questCard);
    });
}

function createQuestCard(quest, percentage) {
    const questCard = document.createElement('div');
    questCard.className = 'daily-quest-card';
    
    const questHeader = document.createElement('div');
    questHeader.className = 'quest-header';
    
    const questType = document.createElement('div');
    questType.className = 'quest-type';
    questType.textContent = quest.type;
    
    const questReward = document.createElement('div');
    questReward.className = 'quest-reward';
    questReward.textContent = `+${quest.reward} XP`;
    
    questHeader.appendChild(questType);
    questHeader.appendChild(questReward);
    
    const questDesc = document.createElement('div');
    questDesc.className = 'quest-description';
    questDesc.textContent = quest.description;
    
    const questProgress = document.createElement('div');
    questProgress.className = 'quest-progress';
    
    const progressBar = document.createElement('div');
    progressBar.className = 'quest-progress-bar';
    
    const progressFill = document.createElement('div');
    progressFill.className = 'quest-progress-fill';
    progressFill.style.width = `${percentage}%`;
    
    const progressText = document.createElement('div');
    progressText.className = 'quest-progress-text';
    progressText.textContent = `${quest.completed}/${quest.target}`;
    
    progressBar.appendChild(progressFill);
    questProgress.appendChild(progressBar);
    questProgress.appendChild(progressText);
    
    questCard.appendChild(questHeader);
    questCard.appendChild(questDesc);
    questCard.appendChild(questProgress);
    
    return questCard;
}

function updateSubjectProgress() {
    if (!userData.questHistory || userData.questHistory.length === 0) {
        return;
    }

    const subjects = ['java', 'cpp', 'python', 'javascript', 'data-structures', 'algorithms', 'react', 'nodejs', 'sql'];
    
    subjects.forEach(subject => {
        const subjectCard = document.querySelector(`[data-subject="${subject}"]`);
        if (!subjectCard) return;

        const subjectExams = userData.questHistory.filter(exam => exam.subject === subject);
        const attemptCount = subjectExams.length;
        
        let averageAccuracy = 0;
        if (attemptCount > 0) {
            const totalAccuracy = subjectExams.reduce((sum, exam) => sum + (exam.accuracy || 0), 0);
            averageAccuracy = Math.round(totalAccuracy / attemptCount);
        }

        const attemptsEl = subjectCard.querySelector('.subject-attempts');
        const progressEl = subjectCard.querySelector('.subject-progress');
        
        if (attemptsEl) {
            attemptsEl.textContent = `📝 ${attemptCount} Attempt${attemptCount !== 1 ? 's' : ''}`;
        }
        
        if (progressEl) {
            progressEl.textContent = `⭐ ${averageAccuracy}% Mastery`;
        }
    });
}

function attachEventListeners() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
    
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) themeToggle.addEventListener('click', toggleTheme);
    
    console.log('Attaching subject card listeners...');
    const subjectCards = document.querySelectorAll('.subject-card');
    console.log('Found subject cards:', subjectCards.length);
    
    subjectCards.forEach((card, index) => {
        console.log(`Adding listener to card ${index}:`, card.getAttribute('data-subject'));
        card.addEventListener('click', (e) => {
            console.log('Subject card clicked:', card.getAttribute('data-subject'));
            selectedSubject = card.getAttribute('data-subject');
            
            // Check if learning path button was clicked
            if (e.target.classList.contains('learning-path-btn')) {
                e.stopPropagation();
                window.location.href = `chapters.html?subject=${selectedSubject}`;
                return;
            }
            
            showDifficultyModal(card.querySelector('h3').textContent);
        });
    });
    
    const modalClose = document.getElementById('modalClose');
    if (modalClose) modalClose.addEventListener('click', closeDifficultyModal);
    
    // Main difficulty buttons
    const difficultyBtns = document.querySelectorAll('#difficultyModal .difficulty-btn');
    difficultyBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const difficulty = btn.getAttribute('data-difficulty');
            showSubLevelModal(difficulty);
        });
    });
    

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

function capitalizeFirst(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
        // Sound disabled
        window.location.href = 'index.html';
    }
}

function toggleTheme() {
    const body = document.body;
    const themeBtn = document.getElementById('themeToggle');
    const isDark = body.classList.toggle('light-theme');
    themeBtn.textContent = isDark ? '☀️' : '🌙';
}

function showDifficultyModal(subjectName) {
    const modal = document.getElementById('difficultyModal');
    const modalContent = modal.querySelector('.difficulty-content');
    
    // Add transition if modal is already active (back navigation)
    if (modal.classList.contains('active')) {
        modalContent.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        modalContent.style.opacity = '0';
        modalContent.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            updateDifficultyContent(modalContent, subjectName);
            modalContent.style.opacity = '1';
            modalContent.style.transform = 'translateY(0)';
        }, 200);
    } else {
        updateDifficultyContent(modalContent, subjectName);
        modal.classList.add('active');
    }
}

function updateDifficultyContent(modalContent, subjectName) {
    // Restore original modal content
    modalContent.innerHTML = `
        <button class="modal-close" id="modalClose">×</button>
        <h2>Choose Difficulty Level</h2>
        <p class="selected-subject-name" id="selectedSubjectName">Subject: ${subjectName}</p>
        
        <div class="difficulty-buttons">
            <button class="difficulty-btn easy" data-difficulty="easy">
                <div class="diff-icon">🟢</div>
                <div class="diff-name">Easy</div>
                <div class="diff-reward">+10 XP per question</div>
            </button>
            <button class="difficulty-btn medium" data-difficulty="medium">
                <div class="diff-icon">🟡</div>
                <div class="diff-name">Medium</div>
                <div class="diff-reward">+25 XP per question</div>
            </button>
            <button class="difficulty-btn hard" data-difficulty="hard">
                <div class="diff-icon">🔴</div>
                <div class="diff-name">Hard</div>
                <div class="diff-reward">+50 XP per question</div>
            </button>
            <button class="difficulty-btn marathon" data-difficulty="marathon">
                <div class="diff-icon">🏆</div>
                <div class="diff-name">Marathon Quest</div>
                <div class="diff-reward">45 min • 30 questions • +100 XP per question</div>
            </button>
        </div>
    `;
    
    // Re-attach event listeners
    document.getElementById('modalClose').addEventListener('click', closeDifficultyModal);
    
    const difficultyBtns = modalContent.querySelectorAll('.difficulty-btn');
    difficultyBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const difficulty = btn.getAttribute('data-difficulty');
            showSubLevelModal(difficulty);
        });
    });
}

function closeDifficultyModal() {
    const modal = document.getElementById('difficultyModal');
    modal.classList.remove('active');
}

function showSubLevelModal(difficulty) {
    const modal = document.getElementById('difficultyModal');
    const modalContent = modal.querySelector('.difficulty-content');
    
    // Add fade out transition
    modalContent.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    modalContent.style.opacity = '0';
    modalContent.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
        const difficultyNames = {
            easy: { name: 'Easy Level', icon: '🟢', xp: 10 },
            medium: { name: 'Medium Level', icon: '🟡', xp: 25 },
            hard: { name: 'Hard Level', icon: '🔴', xp: 50 },
            marathon: { name: 'Marathon Level', icon: '🏆', xp: 100 }
        };
        
        const diffInfo = difficultyNames[difficulty];
        
        // Update content with sub-levels
        modalContent.innerHTML = `
            <button class="modal-close" id="modalClose">×</button>
            <div class="modal-header-info">
                <button class="back-btn" onclick="showDifficultyModal('${selectedSubject}')">← Back</button>
                <div>
                    <h2>Choose Sub-Level</h2>
                    <p class="selected-difficulty-name">${diffInfo.icon} ${diffInfo.name}</p>
                </div>
            </div>
            
            <div class="difficulty-buttons" id="subLevelButtons">
                <!-- Sub-levels will be populated here -->
            </div>
        `;
        
        // Re-attach close listener
        document.getElementById('modalClose').addEventListener('click', closeDifficultyModal);
        
        // Generate sub-level buttons
        const subLevelContainer = document.getElementById('subLevelButtons');
        const subLevels = ['I', 'II', 'III'];
        const questionsCount = difficulty === 'marathon' ? 30 : 10;
        
        subLevels.forEach(subLevel => {
            const btn = document.createElement('button');
            const isUnlocked = isSubLevelUnlocked(difficulty, subLevel);
            
            btn.className = `difficulty-btn ${difficulty} ${!isUnlocked ? 'locked' : ''}`;
            btn.setAttribute('data-difficulty', difficulty);
            btn.setAttribute('data-sublevel', subLevel);
            btn.disabled = !isUnlocked;
            
            btn.innerHTML = `
                <div class="diff-name">${diffInfo.name} ${subLevel} ${!isUnlocked ? '🔒' : ''}</div>
                <div class="diff-reward">${questionsCount} questions • +${diffInfo.xp} XP each</div>
                ${!isUnlocked ? '<div class="unlock-req">Complete previous level with 70%+</div>' : ''}
            `;
            
            if (isUnlocked) {
                btn.addEventListener('click', () => {
                    startExam(selectedSubject, difficulty, subLevel);
                });
            }
            
            subLevelContainer.appendChild(btn);
        });
        
        // Fade in transition
        modalContent.style.opacity = '1';
        modalContent.style.transform = 'translateY(0)';
    }, 200);
}



function startExam(subject, difficulty, subLevel) {
    localStorage.setItem('currentExam', JSON.stringify({
        subject: subject,
        difficulty: difficulty,
        subLevel: subLevel,
        startTime: Date.now()
    }));
    
    // Sound disabled
    window.location.href = 'exam.html';
}

function isSubLevelUnlocked(difficulty, subLevel) {
    if (!userData || !userData.unlockedLevels) return subLevel === 'I' && difficulty === 'easy';
    
    const unlockedLevels = userData.unlockedLevels[difficulty] || [];
    return unlockedLevels.includes(subLevel);
}

function animateEntrance() {
    // Animation removed
}
