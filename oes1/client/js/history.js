let userData = null;
let examHistory = [];
let filteredHistory = [];

document.addEventListener('DOMContentLoaded', () => {
    loadUserData();
    loadExamHistory();
    attachEventListeners();
});

function loadUserData() {
    const storedData = localStorage.getItem('userData');
    if (!storedData) {
        window.location.href = 'login.html';
        return;
    }
    userData = JSON.parse(storedData);
}

async function loadExamHistory() {
    try {
        const data = await api.get('/user/exam-history');
        console.log('Raw exam history data:', data.examHistory);
        examHistory = data.examHistory.map(exam => {
            console.log('Processing exam:', exam);
            console.log('correctAnswers:', exam.correctAnswers, 'totalQuestions:', exam.totalQuestions);
            return {
                ...exam,
                date: new Date(exam.date)
            };
        }).sort((a, b) => new Date(b.date) - new Date(a.date));
        
        filteredHistory = [...examHistory];
        
        if (examHistory.length === 0) {
            showEmptyState();
        } else {
            updateHistoryStats();
            displayExamHistory();
        }
    } catch (error) {
        console.error('Error loading exam history:', error);
        examHistory = [];
        showEmptyState();
    }
}



function calculateGrade(accuracy) {
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

function updateHistoryStats() {
    const totalExams = examHistory.length;
    const totalXP = examHistory.reduce((sum, exam) => sum + exam.xpEarned, 0);
    const avgAccuracy = totalExams > 0 ? 
        Math.round(examHistory.reduce((sum, exam) => sum + exam.accuracy, 0) / totalExams) : 0;
    
    document.getElementById('totalExams').textContent = totalExams;
    document.getElementById('avgAccuracy').textContent = avgAccuracy + '%';
    document.getElementById('totalXP').textContent = totalXP.toLocaleString();
}

function displayExamHistory() {
    const examList = document.getElementById('examList');
    const emptyState = document.getElementById('emptyState');
    
    if (filteredHistory.length === 0) {
        examList.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }
    
    examList.style.display = 'grid';
    emptyState.style.display = 'none';
    
    examList.innerHTML = filteredHistory.map(exam => createExamItem(exam)).join('');
    
    // Add click listeners to exam items
    document.querySelectorAll('.exam-item').forEach(item => {
        item.addEventListener('click', () => {
            const examId = item.dataset.examId;
            showExamDetail(examId);
        });
    });
}

function createExamItem(exam) {
    const subjectIcons = {
        java: '☕',
        python: '🐍',
        javascript: '🟨',
        cpp: '⚡',
        'data-structures': '🏗️',
        algorithms: '🧮'
    };
    
    const difficultyColors = {
        easy: '#10b981',
        medium: '#f59e0b',
        hard: '#ef4444'
    };
    
    return `
        <div class="exam-item" data-exam-id="${exam.id}">
            <div class="exam-item-header">
                <div class="exam-item-info">
                    <div class="exam-item-icon">${subjectIcons[exam.subject] || '📝'}</div>
                    <div class="exam-item-details">
                        <h3>${capitalizeFirst(exam.subject.replace('-', ' '))} - ${capitalizeFirst(exam.difficulty)}</h3>
                        <div class="exam-item-meta">
                            ${exam.date.toLocaleDateString()} • ${formatTime(exam.timeSpent)}
                        </div>
                    </div>
                </div>
                <div class="exam-item-grade ${exam.grade.class}">
                    ${exam.grade.letter}
                </div>
            </div>
            <div class="exam-item-stats">
                <div class="exam-stat">
                    <div class="exam-stat-value" style="color: ${exam.accuracy >= 80 ? '#10b981' : exam.accuracy >= 60 ? '#f59e0b' : '#ef4444'}">${exam.accuracy}%</div>
                    <div class="exam-stat-label">Accuracy</div>
                </div>
                <div class="exam-stat">
                    <div class="exam-stat-value">${exam.correctAnswers || exam.score || 0}/${exam.totalQuestions || 10}</div>
                    <div class="exam-stat-label">Correct</div>
                </div>
                <div class="exam-stat">
                    <div class="exam-stat-value" style="color: var(--primary)">${exam.xpEarned}</div>
                    <div class="exam-stat-label">XP Earned</div>
                </div>
                <div class="exam-stat">
                    <div class="exam-stat-value">${formatTime(exam.timeSpent)}</div>
                    <div class="exam-stat-label">Time</div>
                </div>
            </div>
        </div>
    `;
}

function showExamDetail(examId) {
    const exam = examHistory.find(e => e.id === examId);
    if (!exam) return;
    
    document.getElementById('examDetailTitle').textContent = 
        `${capitalizeFirst(exam.subject.replace('-', ' '))} - ${capitalizeFirst(exam.difficulty)}`;
    document.getElementById('examDetailSubtitle').textContent = 
        `Taken on ${exam.date.toLocaleDateString()} • Grade: ${exam.grade.letter}`;
    
    const detailBody = document.getElementById('examDetailBody');
    detailBody.innerHTML = `
        <div class="detail-section">
            <h3>📊 Performance Overview</h3>
            <div class="detail-metrics">
                <div class="detail-metric">
                    <div class="detail-metric-value" style="color: ${exam.accuracy >= 80 ? '#10b981' : exam.accuracy >= 60 ? '#f59e0b' : '#ef4444'}">${exam.accuracy}%</div>
                    <div class="detail-metric-label">Accuracy</div>
                </div>
                <div class="detail-metric">
                    <div class="detail-metric-value">${exam.correctAnswers}</div>
                    <div class="detail-metric-label">Correct Answers</div>
                </div>
                <div class="detail-metric">
                    <div class="detail-metric-value">${exam.totalQuestions}</div>
                    <div class="detail-metric-label">Total Questions</div>
                </div>
                <div class="detail-metric">
                    <div class="detail-metric-value" style="color: var(--primary)">${exam.xpEarned}</div>
                    <div class="detail-metric-label">XP Earned</div>
                </div>
            </div>
        </div>
        
        <div class="detail-section">
            <h3>⏱️ Time Analysis</h3>
            <div class="detail-metrics">
                <div class="detail-metric">
                    <div class="detail-metric-value">${formatTime(exam.timeSpent)}</div>
                    <div class="detail-metric-label">Total Time</div>
                </div>
                <div class="detail-metric">
                    <div class="detail-metric-value">${Math.round(exam.timeSpent / exam.totalQuestions)}s</div>
                    <div class="detail-metric-label">Avg per Question</div>
                </div>
                <div class="detail-metric">
                    <div class="detail-metric-value">${exam.grade.letter}</div>
                    <div class="detail-metric-label">Grade</div>
                </div>
            </div>
        </div>
        
        <div class="detail-section">
            <h3>📚 Section Performance</h3>
            <div class="section-analytics">
                ${exam.sectionPerformance && Object.keys(exam.sectionPerformance).length > 0 ? Object.keys(exam.sectionPerformance).map(section => {
                    const perf = exam.sectionPerformance[section];
                    const accuracy = Math.round((perf.correct / perf.total) * 100);
                    const sectionInfo = {
                        fundamentals: { name: 'Fundamentals', icon: '📝' },
                        intermediate: { name: 'Intermediate', icon: '⚡' },
                        advanced: { name: 'Advanced', icon: '🚀' },
                        practical: { name: 'Practical', icon: '🛠️' }
                    };
                    
                    return `
                        <div class="section-metric">
                            <div class="section-metric-info">
                                <span class="section-metric-icon">${sectionInfo[section].icon}</span>
                                <div class="section-metric-details">
                                    <div class="section-metric-name">${sectionInfo[section].name}</div>
                                    <div class="section-metric-subtitle">${perf.correct}/${perf.total} questions</div>
                                </div>
                            </div>
                            <div class="section-metric-stats">
                                <span class="section-accuracy ${accuracy >= 80 ? 'excellent' : accuracy >= 60 ? 'good' : 'poor'}">${accuracy}%</span>
                            </div>
                        </div>
                    `;
                }).join('') : '<div class="section-metric"><div class="section-metric-info"><span class="section-metric-icon">📊</span><div class="section-metric-details"><div class="section-metric-name">No section data available</div></div></div></div>'}
            </div>
        </div>
    `;
    
    document.getElementById('examDetailModal').classList.add('show');
}

function attachEventListeners() {
    // Filter listeners
    document.getElementById('subjectFilter').addEventListener('change', applyFilters);
    document.getElementById('difficultyFilter').addEventListener('change', applyFilters);
    document.getElementById('sortFilter').addEventListener('change', applyFilters);
    
    // Modal listeners
    document.getElementById('closeDetailModal').addEventListener('click', () => {
        document.getElementById('examDetailModal').classList.remove('show');
    });
    
    // Logout listener
    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('userData');
        window.location.href = 'login.html';
    });
}

function applyFilters() {
    const subjectFilter = document.getElementById('subjectFilter').value;
    const difficultyFilter = document.getElementById('difficultyFilter').value;
    const sortFilter = document.getElementById('sortFilter').value;
    
    // Apply filters
    filteredHistory = examHistory.filter(exam => {
        const subjectMatch = subjectFilter === 'all' || exam.subject === subjectFilter;
        const difficultyMatch = difficultyFilter === 'all' || exam.difficulty === difficultyFilter;
        return subjectMatch && difficultyMatch;
    });
    
    // Apply sorting
    filteredHistory.sort((a, b) => {
        switch (sortFilter) {
            case 'date':
                return new Date(b.date) - new Date(a.date);
            case 'accuracy':
                return b.accuracy - a.accuracy;
            case 'xp':
                return b.xpEarned - a.xpEarned;
            case 'time':
                return a.timeSpent - b.timeSpent;
            default:
                return 0;
        }
    });
    
    displayExamHistory();
}

function showEmptyState() {
    const examList = document.getElementById('examList');
    const emptyState = document.getElementById('emptyState');
    
    if (examList) examList.style.display = 'none';
    if (emptyState) emptyState.style.display = 'block';
}

function formatTime(seconds) {
    if (!seconds || seconds === 0) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${String(remainingSeconds).padStart(2, '0')}`;
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}