let currentSubject = null;
let chapters = [];
let selectedChapter = null;

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    currentSubject = urlParams.get('subject');
    
    if (!currentSubject) {
        window.location.href = 'dashboard.html';
        return;
    }

    loadChapters();
    attachEventListeners();
});

async function loadChapters() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = 'login.html';
            return;
        }

        const data = await api.get(`/chapters/${currentSubject}`);

        if (data.success) {
            chapters = data.chapters;
            updateUI();
            renderChapters();
        }
    } catch (error) {
        console.error('Error loading chapters:', error);
        showToast('Failed to load chapters', 'error');
    }
}

function updateUI() {
    const subjectName = currentSubject.charAt(0).toUpperCase() + currentSubject.slice(1).replace('-', ' ');
    document.getElementById('subjectTitle').textContent = `${subjectName} Learning Path`;
    
    if (chapters.length === 0) {
        document.getElementById('progressText').textContent = '0% Complete (0/0)';
        document.getElementById('overallProgress').style.width = '0%';
        return;
    }
    
    const completedChapters = chapters.filter(ch => ch.isCompleted).length;
    const progressPercentage = Math.round((completedChapters / chapters.length) * 100);
    
    document.getElementById('progressText').textContent = `${progressPercentage}% Complete (${completedChapters}/${chapters.length})`;
    document.getElementById('overallProgress').style.width = `${progressPercentage}%`;
}

function renderChapters() {
    const grid = document.getElementById('chaptersGrid');
    grid.innerHTML = '';

    chapters.forEach((chapter, index) => {
        const chapterCard = createChapterCard(chapter, index);
        grid.appendChild(chapterCard);
    });
}

function createChapterCard(chapter, index) {
    const card = document.createElement('div');
    card.className = `chapter-card ${getChapterStatus(chapter)}`;
    
    const difficultyColors = {
        beginner: '#10b981',
        intermediate: '#f59e0b', 
        advanced: '#ef4444'
    };

    // Chapter number
    const numDiv = document.createElement('div');
    numDiv.className = 'chapter-number';
    numDiv.textContent = chapter.chapterNumber;
    card.appendChild(numDiv);
    
    // Chapter content
    const contentDiv = document.createElement('div');
    contentDiv.className = 'chapter-content';
    
    const title = document.createElement('h3');
    title.className = 'chapter-title';
    title.textContent = chapter.title;
    contentDiv.appendChild(title);
    
    const desc = document.createElement('p');
    desc.className = 'chapter-description';
    desc.textContent = chapter.description;
    contentDiv.appendChild(desc);
    
    const meta = document.createElement('div');
    meta.className = 'chapter-meta';
    
    const timeSpan = document.createElement('span');
    timeSpan.className = 'chapter-time';
    timeSpan.textContent = `⏱️ ${chapter.estimatedTime} min`;
    meta.appendChild(timeSpan);
    
    const diffSpan = document.createElement('span');
    diffSpan.className = 'chapter-difficulty';
    diffSpan.style.color = difficultyColors[chapter.difficulty];
    diffSpan.textContent = `📊 ${chapter.difficulty}`;
    meta.appendChild(diffSpan);
    
    contentDiv.appendChild(meta);
    
    if (chapter.isCompleted) {
        const scoreDiv = document.createElement('div');
        scoreDiv.className = 'chapter-score';
        scoreDiv.textContent = `⭐ ${chapter.score}%`;
        contentDiv.appendChild(scoreDiv);
    }
    
    card.appendChild(contentDiv);
    
    // Chapter status
    const statusDiv = document.createElement('div');
    statusDiv.className = 'chapter-status';
    statusDiv.textContent = getStatusIcon(chapter);
    card.appendChild(statusDiv);
    
    // Lock icon if needed
    if (!chapter.isUnlocked) {
        const lockDiv = document.createElement('div');
        lockDiv.className = 'chapter-lock';
        lockDiv.textContent = '🔒';
        card.appendChild(lockDiv);
    }

    if (chapter.isUnlocked) {
        card.addEventListener('click', () => showChapterModal(chapter));
        card.style.cursor = 'pointer';
    }

    return card;
}

function getChapterStatus(chapter) {
    if (!chapter.isUnlocked) return 'locked';
    if (chapter.isCompleted) return 'completed';
    return 'available';
}

function getStatusIcon(chapter) {
    if (!chapter.isUnlocked) return '🔒';
    if (chapter.isCompleted) return '✅';
    return '▶️';
}

function showChapterModal(chapter) {
    selectedChapter = chapter;
    
    document.getElementById('modalChapterTitle').textContent = `Chapter ${chapter.chapterNumber}: ${chapter.title}`;
    document.getElementById('modalChapterDescription').textContent = chapter.description;
    document.getElementById('modalEstimatedTime').textContent = `${chapter.estimatedTime} min`;
    document.getElementById('modalDifficulty').textContent = chapter.difficulty;
    document.getElementById('modalQuestionCount').textContent = `${chapter.totalQuestions} questions`;
    
    if (chapter.isCompleted) {
        document.getElementById('modalScoreStat').style.display = 'block';
        document.getElementById('modalScore').textContent = `${chapter.score}%`;
        document.getElementById('modalStart').textContent = 'Retake Chapter';
    } else {
        document.getElementById('modalScoreStat').style.display = 'none';
        document.getElementById('modalStart').textContent = 'Start Chapter';
    }

    if (chapter.prerequisites && chapter.prerequisites.length > 0) {
        document.getElementById('modalPrerequisites').style.display = 'block';
        const list = document.getElementById('prerequisitesList');
        list.innerHTML = '';
        chapter.prerequisites.forEach(prereq => {
            const li = document.createElement('li');
            li.textContent = `Chapter ${prereq}`;
            list.appendChild(li);
        });
    } else {
        document.getElementById('modalPrerequisites').style.display = 'none';
    }

    document.getElementById('chapterModal').classList.add('active');
    playSound('select');
}

function startChapter() {
    if (!selectedChapter) return;

    localStorage.setItem('currentChapter', JSON.stringify({
        subject: currentSubject,
        chapterNumber: selectedChapter.chapterNumber,
        startTime: Date.now()
    }));

    playSound('success');
    window.location.href = 'chapter-quiz.html';
}

function attachEventListeners() {
    document.getElementById('logoutBtn').addEventListener('click', () => {
        if (confirm('Are you sure you want to logout?')) {
            localStorage.removeItem('token');
            localStorage.removeItem('userData');
            window.location.href = 'index.html';
        }
    });

    document.getElementById('modalClose').addEventListener('click', () => {
        document.getElementById('chapterModal').classList.remove('active');
    });

    document.getElementById('modalCancel').addEventListener('click', () => {
        document.getElementById('chapterModal').classList.remove('active');
    });

    document.getElementById('modalStart').addEventListener('click', startChapter);
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