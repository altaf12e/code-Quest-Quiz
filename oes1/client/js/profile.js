// Profile page functionality
document.addEventListener('DOMContentLoaded', function() {
    if (!checkAuth()) return;
    loadUserProfile();
    setupAvatarEditor();
    setupNameEditor();
});

function checkAuth() {
    const token = localStorage.getItem('token');
    
    if (!token) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

async function loadUserProfile() {
    
    try {
        const result = await api.get('/user/profile');
        if (result.success && result.user) {
            console.log('Fresh user data loaded:', result.user);
            displayUserProfile(result.user);
            localStorage.setItem('userData', JSON.stringify(result.user));
            return;
        }
    } catch (error) {
        console.error('Error loading profile from API:', error);
    }
    
    // Fallback: Load from localStorage if API fails
    const cachedData = localStorage.getItem('userData');
    if (cachedData) {
        try {
            const userData = JSON.parse(cachedData);
            console.log('Loading profile from cache:', userData);
            displayUserProfile(userData);
        } catch (e) {
            console.error('Error parsing cached data:', e);
            window.location.href = 'login.html';
        }
    } else {
        console.error('No cached user data available');
        window.location.href = 'login.html';
    }
}

function updateLevelProgress(user) {
    const currentLevelXPEl = document.getElementById('currentLevelXP');
    const nextLevelXPEl = document.getElementById('nextLevelXP');
    const levelProgressFillEl = document.getElementById('levelProgressFill');
    
    if (!currentLevelXPEl || !nextLevelXPEl || !levelProgressFillEl) {
        console.warn('Level progress elements not found');
        return;
    }
    
    if (user.levelProgress) {
        const currentLevelXP = user.levelProgress.currentLevelXP;
        const xpForNextLevel = user.levelProgress.xpForNextLevel;
        const percentage = Math.min(100, Math.max(0, (currentLevelXP / xpForNextLevel) * 100));
        
        currentLevelXPEl.textContent = Math.max(0, currentLevelXP);
        nextLevelXPEl.textContent = xpForNextLevel;
        levelProgressFillEl.style.width = percentage + '%';
    } else {
        // Calculate proper level progress using the same formula as server
        const level = user.level || 1;
        const totalXP = user.xp || 0;
        
        // Calculate total XP used for previous levels
        let totalXPUsed = 0;
        for (let i = 1; i < level; i++) {
            totalXPUsed += i * 150 + (i - 1) * 50;
        }
        
        const currentLevelXP = totalXP - totalXPUsed;
        const xpForNextLevel = level * 150 + (level - 1) * 50;
        const percentage = Math.min(100, Math.max(0, (currentLevelXP / xpForNextLevel) * 100));
        
        currentLevelXPEl.textContent = Math.max(0, currentLevelXP);
        nextLevelXPEl.textContent = xpForNextLevel;
        levelProgressFillEl.style.width = percentage + '%';
    }
}

function displayUserProfile(user) {
    if (!user) {
        console.error('No user data provided');
        window.location.href = 'login.html';
        return;
    }
    
    console.log('Displaying user profile:', user);
    
    // Ensure user object has all required fields
    user.questHistory = user.questHistory || [];
    user.stats = user.stats || { totalQuestions: 0, correctAnswers: 0, longestStreak: 0 };
    user.achievements = user.achievements || [];
    
    // Basic profile info - use actual data
    const userNameEl = document.getElementById('userName');
    const userEmailEl = document.getElementById('userEmail');
    const userLevelEl = document.getElementById('userLevel');
    const totalXPEl = document.getElementById('totalXP');
    const currentStreakEl = document.getElementById('currentStreak');
    const totalExamsEl = document.getElementById('totalExams');
    const userRankEl = document.getElementById('userRank');
    
    if (userNameEl) userNameEl.textContent = user.username || 'Unknown User';
    if (userEmailEl) userEmailEl.textContent = user.email || 'No email';
    updateAvatarDisplay(user.avatar || '👤');
    if (userLevelEl) userLevelEl.textContent = `Level ${user.level || 1}`;

    // Level progress
    updateLevelProgress(user);

    // Stats - use actual values
    if (totalXPEl) totalXPEl.textContent = user.xp || 0;
    if (currentStreakEl) currentStreakEl.textContent = user.streak || 0;
    if (totalExamsEl) totalExamsEl.textContent = user.questHistory.length;
    if (userRankEl) userRankEl.textContent = `#${user.rank || 999}`;

    // Performance stats - use actual data
    const totalQuestions = user.stats.totalQuestions || 0;
    const correctAnswers = user.stats.correctAnswers || 0;
    const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
    const bestStreak = user.stats.longestStreak || 0;

    const totalQuestionsEl = document.getElementById('totalQuestions');
    const correctAnswersEl = document.getElementById('correctAnswers');
    const accuracyRateEl = document.getElementById('accuracyRate');
    const bestStreakEl = document.getElementById('bestStreak');
    
    if (totalQuestionsEl) totalQuestionsEl.textContent = totalQuestions;
    if (correctAnswersEl) correctAnswersEl.textContent = correctAnswers;
    if (accuracyRateEl) accuracyRateEl.textContent = `${accuracy}%`;
    if (bestStreakEl) bestStreakEl.textContent = bestStreak;
    
    console.log('Updated profile display with:', {
        username: user.username,
        level: user.level,
        xp: user.xp,
        streak: user.streak,
        totalQuestions,
        correctAnswers,
        accuracy,
        bestStreak
    });

    // Subject performance
    displaySubjectStats(user.questHistory);
    
    // Recent activity
    displayRecentActivity(user.questHistory);
    
    // Achievements
    displayAchievements(user);
}

function generateSampleExamData(user) {
    const subjects = ['Java', 'Python', 'JavaScript', 'C++', 'Data Structures', 'Algorithms', 'C#', 'Go', 'Rust', 'PHP', 'Ruby', 'Swift', 'Kotlin', 'TypeScript', 'React', 'Node.js', 'SQL', 'MongoDB'];
    const difficulties = ['Easy', 'Medium', 'Hard'];
    const sampleQuests = [];
    
    // Generate 8-15 sample quests based on user level
    const questCount = Math.min(15, Math.max(8, Math.floor((user.level || 1) * 1.5) + 5));
    
    for (let i = 0; i < questCount; i++) {
        const subject = subjects[Math.floor(Math.random() * subjects.length)];
        const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
        const totalQuestions = 10;
        const correctAnswers = Math.floor(Math.random() * 6) + 4; // 4-9 correct answers
        const accuracy = Math.round((correctAnswers / totalQuestions) * 100);
        const date = new Date();
        date.setDate(date.getDate() - Math.floor(Math.random() * 30)); // Random date within last 30 days
        
        sampleQuests.push({
            subject: subject.toLowerCase().replace(' ', '-'),
            difficulty: difficulty.toLowerCase(),
            totalQuestions: totalQuestions,
            correctAnswers: correctAnswers,
            accuracy: accuracy,
            score: correctAnswers,
            completedAt: date.toISOString(),
            xpEarned: correctAnswers * (difficulty === 'Easy' ? 10 : difficulty === 'Medium' ? 25 : 50)
        });
    }
    
    return sampleQuests.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt)); // Most recent first
}

function displaySubjectStats(questHistory) {
    const container = document.getElementById('subjectStats');
    
    if (!questHistory || questHistory.length === 0) {
        container.innerHTML = '<div class="no-data">No quest data found. <a href="dashboard.html">Start your first quest!</a></div>';
        return;
    }
    
    const subjectStats = {};
    
    questHistory.forEach(quest => {
        const subject = quest.subject || 'unknown';
        if (!subjectStats[subject]) {
            subjectStats[subject] = { total: 0, correct: 0, quests: 0 };
        }
        const totalQuestions = quest.totalQuestions || 10;
        const correctAnswers = quest.correctAnswers || quest.score || 0;
        
        subjectStats[subject].total += totalQuestions;
        subjectStats[subject].correct += correctAnswers;
        subjectStats[subject].quests += 1;
    });

    if (Object.keys(subjectStats).length === 0) {
        container.innerHTML = '<div class="no-data">No quest data available</div>';
        return;
    }

    console.log('Subject stats calculated:', subjectStats);
    
    container.innerHTML = '';
    Object.entries(subjectStats).forEach(([subject, stats]) => {
        const accuracy = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
        const subjectName = subject.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        
        const statItem = document.createElement('div');
        statItem.className = 'subject-stat-item';
        
        const nameDiv = document.createElement('div');
        nameDiv.className = 'subject-name';
        nameDiv.textContent = subjectName;
        
        const detailsDiv = document.createElement('div');
        detailsDiv.className = 'subject-details';
        
        const questsSpan = document.createElement('span');
        questsSpan.textContent = `Quests: ${stats.quests}`;
        
        const accuracySpan = document.createElement('span');
        accuracySpan.textContent = `Accuracy: ${accuracy}%`;
        
        detailsDiv.appendChild(questsSpan);
        detailsDiv.appendChild(accuracySpan);
        statItem.appendChild(nameDiv);
        statItem.appendChild(detailsDiv);
        container.appendChild(statItem);
    });
}

function displayRecentActivity(questHistory) {
    const container = document.getElementById('recentActivity');
    
    if (!questHistory || questHistory.length === 0) {
        container.innerHTML = '<div class="no-data">No quest history found. <a href="dashboard.html">Take your first quest!</a></div>';
        return;
    }
    
    const recentQuests = questHistory.slice(-5).reverse();
    
    console.log('Recent quests:', recentQuests);
    
    container.innerHTML = '';
    recentQuests.forEach(quest => {
        const date = quest.completedAt ? new Date(quest.completedAt).toLocaleDateString() : 'Recent';
        const score = quest.correctAnswers || quest.score || 0;
        const totalQuestions = quest.totalQuestions || 10;
        const accuracy = quest.accuracy || (totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0);
        const subject = (quest.subject || 'unknown').replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        const difficulty = (quest.difficulty || 'unknown').charAt(0).toUpperCase() + (quest.difficulty || 'unknown').slice(1);
        
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item';
        
        const infoDiv = document.createElement('div');
        infoDiv.className = 'activity-info';
        
        const subjectSpan = document.createElement('span');
        subjectSpan.className = 'activity-subject';
        subjectSpan.textContent = subject;
        
        const difficultySpan = document.createElement('span');
        difficultySpan.className = 'activity-difficulty';
        difficultySpan.textContent = difficulty;
        
        infoDiv.appendChild(subjectSpan);
        infoDiv.appendChild(difficultySpan);
        
        const statsDiv = document.createElement('div');
        statsDiv.className = 'activity-stats';
        
        const scoreSpan = document.createElement('span');
        scoreSpan.textContent = `${score}/${totalQuestions} (${accuracy}%)`;
        
        const dateSpan = document.createElement('span');
        dateSpan.className = 'activity-date';
        dateSpan.textContent = date;
        
        statsDiv.appendChild(scoreSpan);
        statsDiv.appendChild(dateSpan);
        activityItem.appendChild(infoDiv);
        activityItem.appendChild(statsDiv);
        container.appendChild(activityItem);
    });
}

function displayAchievements(user) {
    const container = document.getElementById('userAchievements');
    const questHistory = user.questHistory || [];
    
    const totalQuestions = user.stats?.totalQuestions || 0;
    const correctAnswers = user.stats?.correctAnswers || 0;
    const perfectScores = questHistory.filter(quest => (quest.accuracy || 0) === 100).length;
    const javaQuests = questHistory.filter(quest => quest.subject === 'java').length;
    
    const allAchievements = [
        { id: 'first_quest', icon: '🎯', name: 'First Quest', desc: 'Complete your first quest', unlocked: questHistory.length > 0 },
        { id: 'rising_star', icon: '🌟', name: 'Rising Star', desc: 'Reach Level 5', unlocked: user.level >= 5 },
        { id: 'code_warrior', icon: '⚔️', name: 'Code Warrior', desc: 'Reach Level 10', unlocked: user.level >= 10 },
        { id: 'code_master', icon: '👑', name: 'Code Master', desc: 'Reach Level 20', unlocked: user.level >= 20 },
        { id: 'hot_streak', icon: '🔥', name: 'Hot Streak', desc: 'Maintain 5+ day streak', unlocked: user.streak >= 5 },
        { id: 'streak_legend', icon: '🌋', name: 'Streak Legend', desc: 'Maintain 15+ day streak', unlocked: user.streak >= 15 },
        { id: 'xp_collector', icon: '💎', name: 'XP Collector', desc: 'Earn 1000+ XP', unlocked: user.xp >= 1000 },
        { id: 'xp_master', icon: '💰', name: 'XP Master', desc: 'Earn 5000+ XP', unlocked: user.xp >= 5000 },
        { id: 'perfectionist', icon: '💯', name: 'Perfectionist', desc: 'Get 100% on any exam', unlocked: perfectScores > 0 },
        { id: 'perfect_trio', icon: '🎖️', name: 'Perfect Trio', desc: 'Get 100% on 3 exams', unlocked: perfectScores >= 3 },
        { id: 'java_enthusiast', icon: '☕', name: 'Java Enthusiast', desc: 'Complete 5 Java quests', unlocked: javaQuests >= 5 },
        { id: 'java_master', icon: '🏆', name: 'Java Master', desc: 'Complete 15 Java quests', unlocked: javaQuests >= 15 },
        { id: 'question_hunter', icon: '🎪', name: 'Question Hunter', desc: 'Answer 100+ questions', unlocked: totalQuestions >= 100 },
        { id: 'answer_machine', icon: '🤖', name: 'Answer Machine', desc: 'Answer 500+ questions', unlocked: totalQuestions >= 500 },
        { id: 'accuracy_ace', icon: '🎯', name: 'Accuracy Ace', desc: 'Get 50+ correct answers', unlocked: correctAnswers >= 50 },
        { id: 'quest_veteran', icon: '🎓', name: 'Quest Veteran', desc: 'Complete 25+ quests', unlocked: questHistory.length >= 25 },
        { id: 'dedication', icon: '📚', name: 'Dedicated Learner', desc: 'Complete 10+ quests', unlocked: questHistory.length >= 10 },
        { id: 'multi_subject', icon: '🌈', name: 'Multi-Subject Pro', desc: 'Complete quests in 4+ subjects', unlocked: getUniqueSubjects(questHistory).length >= 4 },
        { id: 'speed_demon', icon: '⚡', name: 'Speed Demon', desc: 'Complete 5 quests in one day', unlocked: checkDailyQuests(questHistory) },
        { id: 'consistency', icon: '📅', name: 'Consistency King', desc: 'Complete quests 7 days in a row', unlocked: checkConsecutiveDays(questHistory) }
    ];
    
    const unlockedAchievements = allAchievements.filter(achievement => achievement.unlocked);
    const lockedAchievements = allAchievements.filter(achievement => !achievement.unlocked);
    
    if (unlockedAchievements.length === 0) {
        container.innerHTML = '<div class="no-data">No achievements yet. Keep coding to unlock them!</div>';
        return;
    }
    
    container.innerHTML = '';
    
    const unlockedSection = document.createElement('div');
    unlockedSection.className = 'achievements-section';
    
    const unlockedTitle = document.createElement('h4');
    unlockedTitle.className = 'achievement-section-title';
    unlockedTitle.textContent = `🏆 Unlocked (${unlockedAchievements.length})`;
    
    const unlockedList = document.createElement('div');
    unlockedList.className = 'achievements-list';
    
    unlockedAchievements.forEach(achievement => {
        const item = createAchievementItem(achievement, true);
        unlockedList.appendChild(item);
    });
    
    unlockedSection.appendChild(unlockedTitle);
    unlockedSection.appendChild(unlockedList);
    
    const lockedSection = document.createElement('div');
    lockedSection.className = 'achievements-section';
    
    const lockedTitle = document.createElement('h4');
    lockedTitle.className = 'achievement-section-title';
    lockedTitle.textContent = `🔒 Locked (${lockedAchievements.length})`;
    
    const lockedList = document.createElement('div');
    lockedList.className = 'achievements-list';
    
    lockedAchievements.slice(0, 6).forEach(achievement => {
        const item = createAchievementItem(achievement, false);
        lockedList.appendChild(item);
    });
    
    lockedSection.appendChild(lockedTitle);
    lockedSection.appendChild(lockedList);
    
    container.appendChild(unlockedSection);
    container.appendChild(lockedSection);
}

function createAchievementItem(achievement, unlocked) {
    const item = document.createElement('div');
    item.className = `achievement-item ${unlocked ? 'unlocked' : 'locked'}`;
    
    const icon = document.createElement('div');
    icon.className = 'achievement-icon';
    icon.textContent = unlocked ? achievement.icon : '🔒';
    
    const info = document.createElement('div');
    info.className = 'achievement-info';
    
    const name = document.createElement('div');
    name.className = 'achievement-name';
    name.textContent = achievement.name;
    
    const desc = document.createElement('div');
    desc.className = 'achievement-desc';
    desc.textContent = achievement.desc;
    
    info.appendChild(name);
    info.appendChild(desc);
    
    const status = document.createElement('div');
    status.className = 'achievement-status';
    status.textContent = unlocked ? '✅' : '❌';
    
    item.appendChild(icon);
    item.appendChild(info);
    item.appendChild(status);
    
    return item;
}

function getUniqueSubjects(questHistory) {
    return [...new Set(questHistory.map(quest => quest.subject))];
}

function checkDailyQuests(questHistory) {
    const today = new Date().toDateString();
    return questHistory.filter(quest => new Date(quest.completedAt).toDateString() === today).length >= 5;
}

function checkConsecutiveDays(questHistory) {
    if (questHistory.length < 7) return false;
    const dates = questHistory.map(quest => new Date(quest.completedAt).toDateString());
    const uniqueDates = [...new Set(dates)].sort();
    
    let consecutive = 1;
    for (let i = 1; i < uniqueDates.length; i++) {
        const prevDate = new Date(uniqueDates[i-1]);
        const currDate = new Date(uniqueDates[i]);
        const diffTime = Math.abs(currDate - prevDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
            consecutive++;
            if (consecutive >= 7) return true;
        } else {
            consecutive = 1;
        }
    }
    return false;
}

// Avatar editing functionality
let selectedAvatar = null;

document.addEventListener('DOMContentLoaded', function() {
    setupAvatarEditor();
});

function setupAvatarEditor() {
    const editBtn = document.getElementById('editAvatarBtn');
    const modal = document.getElementById('avatarModal');
    const closeBtn = document.getElementById('closeAvatarModal');
    const cancelBtn = document.getElementById('cancelAvatarBtn');
    const saveBtn = document.getElementById('saveAvatarBtn');
    const imageInput = document.getElementById('avatarImageInput');
    
    editBtn.addEventListener('click', () => {
        modal.style.display = 'flex';
        selectedAvatar = null;
    });
    
    closeBtn.addEventListener('click', () => modal.style.display = 'none');
    cancelBtn.addEventListener('click', () => modal.style.display = 'none');
    
    // Emoji selection
    document.querySelectorAll('.emoji-option').forEach(option => {
        option.addEventListener('click', () => {
            document.querySelectorAll('.emoji-option').forEach(o => o.classList.remove('selected'));
            option.classList.add('selected');
            selectedAvatar = option.dataset.avatar;
            document.getElementById('imagePreview').innerHTML = '';
        });
    });
    
    // Image upload
    imageInput.addEventListener('change', handleImageUpload);
    
    saveBtn.addEventListener('click', saveAvatar);
}

function setupNameEditor() {
    const editNameBtn = document.getElementById('editNameBtn');
    const editForm = document.getElementById('editNameForm');
    const nameDisplay = document.getElementById('userName');
    const saveNameBtn = document.getElementById('saveNameBtn');
    const cancelNameBtn = document.getElementById('cancelNameBtn');
    const nameInput = document.getElementById('newUsernameInput');
    const nameError = document.getElementById('nameError');
    
    editNameBtn.addEventListener('click', () => {
        nameDisplay.style.display = 'none';
        editNameBtn.style.display = 'none';
        editForm.style.display = 'block';
        nameInput.value = nameDisplay.textContent;
        nameInput.focus();
        nameError.textContent = '';
    });
    
    cancelNameBtn.addEventListener('click', () => {
        nameDisplay.style.display = 'block';
        editNameBtn.style.display = 'inline-block';
        editForm.style.display = 'none';
        nameError.textContent = '';
    });
    
    saveNameBtn.addEventListener('click', saveUsername);
    
    nameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') saveUsername();
        if (e.key === 'Escape') cancelNameBtn.click();
    });
}

async function saveUsername() {
    const nameInput = document.getElementById('newUsernameInput');
    const nameError = document.getElementById('nameError');
    const newUsername = nameInput.value.trim();
    
    if (!newUsername) {
        nameError.textContent = 'Username cannot be empty';
        return;
    }
    
    if (newUsername.length < 3) {
        nameError.textContent = 'Username must be at least 3 characters';
        return;
    }
    
    if (!/^[a-zA-Z0-9_]+$/.test(newUsername)) {
        nameError.textContent = 'Username can only contain letters, numbers, and underscores';
        return;
    }
    
    try {
        const token = localStorage.getItem('token');

        
        if (token) {
            const data = await api.put('/user/update-profile', { username: newUsername });
            
            if (data.success) {
                localStorage.setItem('userData', JSON.stringify(data.user));
                updateUsernameDisplay(newUsername);
                nameError.textContent = '';
            } else {
                nameError.textContent = data.message || 'Username already taken';
            }
        }
    } catch (error) {
        console.error('Error updating username:', error);
        nameError.textContent = error.message || 'Error updating username';
    }
}

function updateUsernameDisplay(username) {
    const nameDisplay = document.getElementById('userName');
    const editNameBtn = document.getElementById('editNameBtn');
    const editForm = document.getElementById('editNameForm');
    
    nameDisplay.textContent = username;
    nameDisplay.style.display = 'block';
    editNameBtn.style.display = 'inline-block';
    editForm.style.display = 'none';
}

function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (file.size > 2 * 1024 * 1024) {
        alert('Image size should be less than 2MB');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        selectedAvatar = e.target.result;
        document.getElementById('imagePreview').innerHTML = `
            <img src="${e.target.result}" alt="Preview" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover;">
        `;
        document.querySelectorAll('.emoji-option').forEach(o => o.classList.remove('selected'));
    };
    reader.readAsDataURL(file);
}

async function saveAvatar() {
    if (!selectedAvatar) {
        alert('Please select an avatar');
        return;
    }
    
    try {
        const token = localStorage.getItem('token');

        
        if (token) {
            const data = await api.put('/user/update-profile', { avatar: selectedAvatar });
            
            if (data.success) {
                localStorage.setItem('userData', JSON.stringify(data.user));
                updateAvatarDisplay(selectedAvatar);
                document.getElementById('avatarModal').style.display = 'none';
                alert('Avatar updated successfully!');
            } else {
                alert(data.message || 'Failed to update avatar');
            }
        }
    } catch (error) {
        console.error('Error updating avatar:', error);
        alert(error.message || 'Error updating avatar');
    }
}

function updateAvatarDisplay(avatar) {
    const avatarElement = document.getElementById('userAvatar');
    if (!avatar) {
        avatarElement.textContent = '👤';
        return;
    }
    
    // Clear existing content
    avatarElement.innerHTML = '';
    
    if (avatar.startsWith('data:image') || avatar.startsWith('http')) {
        // Create image element with proper constraints
        const img = document.createElement('img');
        img.src = avatar;
        img.alt = 'User Avatar';
        // Remove inline styles - let CSS handle it
        avatarElement.appendChild(img);
    } else {
        // Emoji or text avatar
        avatarElement.textContent = avatar;
        avatarElement.style.fontSize = '5rem';
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    window.location.href = 'login.html';
}