let currentPage = 1;
let totalQuestions = 0;
const questionsPerPage = 100;

document.addEventListener('DOMContentLoaded', () => {
    checkAdminAccess();
    setupNavigation();
    
    // Load only stats initially, load others on demand
    loadStats();
    
    setTimeout(() => {
        if (document.getElementById('overview').classList.contains('active')) {
            loadUsers();
        }
    }, 100);
    
    document.getElementById('addQuestionBtn').addEventListener('click', () => {
        alert('Add question feature coming soon!');
    });
});

function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.admin-section');
    
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetSection = item.getAttribute('data-section');
            
            // Remove active class from all nav items and sections
            navItems.forEach(nav => nav.classList.remove('active'));
            sections.forEach(section => section.classList.remove('active'));
            
            // Add active class to clicked nav item and corresponding section
            item.classList.add('active');
            document.getElementById(targetSection).classList.add('active');
            
            if (targetSection === 'users') {
                loadUsers();
            } else if (targetSection === 'questions') {
                loadQuestions();
            }
        });
    });
}

function checkAdminAccess() {
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    const token = localStorage.getItem('token');
    
    console.log('Checking admin access...');
    console.log('Token:', token ? 'Present' : 'Missing');
    console.log('User data:', userData);
    
    if (!token) {
        alert('Please login first.');
        window.location.href = 'login.html';
        return;
    }
    
    if (!userData.isAdmin && userData.username !== 'admin') {
        alert('Access denied. Admin privileges required.');
        window.location.href = 'dashboard.html';
        return;
    }
    
    console.log('Admin access granted');
}

async function loadStats() {
    try {
        document.getElementById('totalUsers').textContent = 'Loading...';
        document.getElementById('totalQuestions').textContent = 'Loading...';
        
        const [usersData, questionsData] = await Promise.all([
            api.get('/admin/users'),
            api.get('/admin/questions?page=1&limit=1')
        ]);
        
        document.getElementById('totalUsers').textContent = usersData.users ? usersData.users.length : 0;
        document.getElementById('totalQuestions').textContent = questionsData.total || 0;
        document.getElementById('totalExams').textContent = '0';
    } catch (error) {
        console.error('Error loading stats:', error);
        document.getElementById('totalUsers').textContent = 'Error';
        document.getElementById('totalQuestions').textContent = 'Error';
        document.getElementById('totalExams').textContent = 'Error';
    }
}

async function loadUsers() {
    try {
        console.log('Loading users...');
        const data = await api.get('/admin/users');
        console.log('Raw API response:', JSON.stringify(data, null, 2));
        const tbody = document.getElementById('usersTable');
        
        if (!data.success || !data.users) {
            console.log('No users found or API error');
            tbody.innerHTML = '<tr><td colspan="6" class="error-cell">No users found</td></tr>';
            return;
        }
        
        tbody.innerHTML = data.users.map(user => {
            console.log('Processing user:', user);
            
            // Safely extract and truncate fields
            const username = String(user.username || 'Unknown User').substring(0, 50);
            const email = String(user.email || 'No email').substring(0, 100);
            
            // Handle avatar - use emoji only, filter out data URLs
            let avatar = user.avatar || '👤';
            if (String(avatar).startsWith('data:')) {
                avatar = '👤'; // Default emoji if it's a data URL
            } else {
                avatar = String(avatar).substring(0, 10);
            }
            
            const level = Number(user.level) || 1;
            const xp = Number(user.xp) || 0;
            const isAdmin = Boolean(user.isAdmin);
            const userId = String(user._id || user.id || '').substring(0, 50);
            
            return `
                <tr>
                    <td><div class="user-avatar">${avatar}</div></td>
                    <td><strong>${username}</strong> ${isAdmin ? '<span class="admin-badge">👑 Admin</span>' : ''}</td>
                    <td>${email}</td>
                    <td><span class="level-badge">Lv ${level}</span></td>
                    <td><span class="xp-badge">${xp} XP</span></td>
                    <td>
                        <button class="btn btn-small ${isAdmin ? 'btn-warning' : 'btn-success'}" onclick="toggleAdmin('${userId}', ${isAdmin})">
                            <span>${isAdmin ? '👤' : '👑'}</span> ${isAdmin ? 'Remove Admin' : 'Make Admin'}
                        </button>
                        <button class="btn btn-small btn-danger" onclick="deleteUser('${userId}')">
                            <span>🗑️</span> Delete
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
        
        console.log(`Loaded ${data.users.length} users`);
    } catch (error) {
        console.error('Error loading users:', error);
        document.getElementById('usersTable').innerHTML = '<tr><td colspan="6" class="error-cell">Error loading users: ' + error.message + '</td></tr>';
    }
}

async function loadQuestions(page = 1) {
    try {
        console.log(`Loading questions page ${page}...`);
        currentPage = page;
        
        const tbody = document.getElementById('questionsTable');
        tbody.innerHTML = '<tr><td colspan="5" class="loading-cell">Loading questions...</td></tr>';
        
        const data = await api.get(`/admin/questions?page=${page}&limit=${questionsPerPage}`);
        console.log('Questions response:', data);
        
        if (!data.success || !data.questions || data.questions.length === 0) {
            console.log('No questions found or API error');
            tbody.innerHTML = '<tr><td colspan="5" class="error-cell">No questions found</td></tr>';
            return;
        }
        
        totalQuestions = data.total || data.questions.length;
        
        tbody.innerHTML = data.questions.map(q => `
            <tr>
                <td><span class="subject-badge ${q.subject}">${q.subject}</span></td>
                <td><span class="difficulty-badge ${q.difficulty}">${q.difficulty} ${q.subLevel || ''}</span></td>
                <td class="question-text">${q.question.substring(0, 80)}...</td>
                <td><span class="xp-value">${q.xpValue || 10} XP</span></td>
                <td>
                    <button class="btn btn-small btn-danger" onclick="deleteQuestion('${q._id}')">
                        <span>🗑️</span> Delete
                    </button>
                </td>
            </tr>
        `).join('');
        
        updatePagination();
        console.log(`Loaded ${data.questions.length} questions (Page ${page})`);
    } catch (error) {
        console.error('Error loading questions:', error);
        document.getElementById('questionsTable').innerHTML = '<tr><td colspan="5" class="error-cell">Error loading questions: ' + error.message + '</td></tr>';
    }
}

function updatePagination() {
    const totalPages = Math.ceil(totalQuestions / questionsPerPage);
    const startItem = (currentPage - 1) * questionsPerPage + 1;
    const endItem = Math.min(currentPage * questionsPerPage, totalQuestions);
    
    let paginationHTML = `
        <div class="pagination-info">
            <span>Showing ${startItem}-${endItem} of ${totalQuestions} questions</span>
        </div>
        <div class="pagination-controls">
    `;
    
    if (currentPage > 1) {
        paginationHTML += `
            <button class="btn btn-small" onclick="loadQuestions(${currentPage - 1})">
                ← Previous
            </button>
        `;
    }
    
    if (currentPage < totalPages) {
        paginationHTML += `
            <button class="btn btn-small" onclick="loadQuestions(${currentPage + 1})">
                Next →
            </button>
        `;
    }
    
    paginationHTML += `
        </div>
        <div class="page-info">
            <span>Page ${currentPage} of ${totalPages}</span>
        </div>
    `;
    
    let paginationDiv = document.getElementById('questionsPagination');
    if (!paginationDiv) {
        paginationDiv = document.createElement('div');
        paginationDiv.id = 'questionsPagination';
        paginationDiv.className = 'pagination-container';
        document.querySelector('#questions .admin-table-container').appendChild(paginationDiv);
    }
    
    paginationDiv.innerHTML = paginationHTML;
}

async function deleteUser(userId) {
    if (confirm('Delete this user?')) {
        try {
            await api.delete(`/admin/user/${userId}`);
            loadUsers();
            loadStats();
        } catch (error) {
            alert('Error deleting user');
        }
    }
}

async function deleteQuestion(questionId) {
    if (confirm('Delete this question?')) {
        try {
            await api.delete(`/admin/question/${questionId}`);
            loadQuestions(currentPage);
            loadStats();
        } catch (error) {
            alert('Error deleting question');
        }
    }
}

async function toggleAdmin(userId, isCurrentlyAdmin) {
    const action = isCurrentlyAdmin ? 'remove admin privileges from' : 'make admin';
    if (confirm(`Are you sure you want to ${action} this user?`)) {
        try {
            const data = await api.put(`/admin/user/${userId}/admin`);
            alert(data.message);
            loadUsers();
        } catch (error) {
            alert('Error updating admin status');
        }
    }
}