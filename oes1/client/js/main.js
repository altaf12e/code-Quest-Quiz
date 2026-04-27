
document.addEventListener('DOMContentLoaded', () => {
    checkLoginStatus();
    loadLeaderboard();
    animateFeatures();
});

function handleQuestStart() {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('userData');
    
    if (token && userData) {
        const user = JSON.parse(userData);
        if (user.username === 'admin') {
            location.href = 'admin.html';
        } else {
            location.href = 'dashboard.html';
        }
    } else {
        location.href = 'login.html';
    }
}

function updateButtonTexts() {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('userData');
    
    const buttons = document.querySelectorAll('button[onclick="handleQuestStart()"]');
    
    if (token && userData) {
        const user = JSON.parse(userData);
        const isAdmin = user.username === 'admin';
        
        buttons.forEach(btn => {
            const textSpan = btn.querySelector('span:not(.btn-icon)');
            if (textSpan) {
                textSpan.textContent = isAdmin ? 'Go to Admin Panel' : 'Continue Your Quest';
            } else {
                const text = btn.textContent.replace('🚀', '').trim();
                btn.innerHTML = `<span class="btn-icon">🚀</span>${isAdmin ? 'Go to Admin Panel' : 'Continue Your Quest'}`;
            }
        });
    }
}

function checkLoginStatus() {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('userData');

    if (token && userData) {
        const user = JSON.parse(userData);
        updateHomepageForLoggedInUser(user);
    }
    updateButtonTexts();
}

function updateHomepageForLoggedInUser(user) {
    // Show admin link only for admin user
    if (user.username === 'admin') {
        document.getElementById('adminLink').style.display = 'block';
    }
    
    // Update CTA buttons
    const ctaContainer = document.querySelector('.cta-buttons');
    if (ctaContainer) {
        let dashboardUrl = user.username === 'admin' ? 'admin.html' : 'dashboard.html';
        
        ctaContainer.innerHTML = `
            <button class="btn btn-primary pulse" onclick="location.href='${dashboardUrl}'">
                <span class="btn-icon">🚀</span>
                Go to ${user.username === 'admin' ? 'Admin Panel' : 'Dashboard'}
            </button>
            <button class="btn btn-secondary" onclick="location.href='profile.html'">
                <span class="btn-icon">👤</span>
                View Profile
            </button>
            <button class="btn btn-secondary" id="logoutHomeBtn">
                <span class="btn-icon">🚪</span>
                Logout
            </button>
        `;
        
        document.getElementById('logoutHomeBtn').addEventListener('click', handleHomeLogout);
    }

    // Update Header or Add User Badge
    const heroSection = document.querySelector('.hero-section');
    const userBadge = document.createElement('div');
    userBadge.className = 'home-user-badge';
    
    const avatarContent = (user.avatar && (user.avatar.startsWith('data:image') || user.avatar.startsWith('http'))) 
            ? `<img src="${user.avatar}" alt="User Avatar">` 
            : (user.avatar || '🦸');

    userBadge.innerHTML = `
        <div class="home-avatar">${avatarContent}</div>
        <div class="home-user-info">
            <span class="home-welcome">Welcome back,</span>
            <span class="home-username">${user.username}</span>
        </div>
    `;
    
    userBadge.addEventListener('click', () => {
        window.location.href = 'profile.html';
    });
    heroSection.insertBefore(userBadge, heroSection.firstChild);
}

function handleHomeLogout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
        document.getElementById('adminLink').style.display = 'none';
        window.location.reload();
    }
}

async function loadLeaderboard() {
    try {
        const data = await api.get('/user/leaderboard');

        if (data.success && data.leaderboard) {
            renderLeaderboard(data.leaderboard);
        } else {
            throw new Error(data.message || 'Failed to load leaderboard data');
        }
    } catch (error) {
        console.error('Error loading leaderboard:', error);
        const container = document.querySelector('.leaderboard-list');
        if (container) {
            container.innerHTML = '<div class="error-text">Unable to load leaderboard</div>';
        }
    }
}

function renderLeaderboard(users) {
    const container = document.querySelector('.leaderboard-list');
    if (!container) return;

    container.innerHTML = users.map((user, index) => {
        const rankClass = index < 3 ? `rank-${index + 1}` : '';
        const avatarContent = (user.avatar && (user.avatar.startsWith('data:image') || user.avatar.startsWith('http'))) 
                ? `<img src="${user.avatar}" alt="User Avatar">` 
                : (user.avatar || '👤');

        return `
            <div class="leader-item ${rankClass}">
                <span class="rank">${index + 1}</span>
                <div class="leader-avatar">${avatarContent}</div>
                <div class="leader-info">
                    <div class="leader-name">${user.username}</div>
                    <div class="leader-xp">${user.xp || 0} XP</div>
                </div>
                <div class="leader-level">Lv ${user.level || 1}</div>
            </div>
        `;
    }).join('');

    animateLeaderboard();
}

function animateLeaderboard() {
    const leaderItems = document.querySelectorAll('.leader-item');
    if (!leaderItems.length) return;
    
    leaderItems.forEach((item, index) => {
        if (!item) return;
        
        setTimeout(() => {
            item.style.opacity = '0';
            item.style.transform = 'translateX(-50px)';
            setTimeout(() => {
                item.style.transition = 'all 0.5s ease';
                item.style.opacity = '1';
                item.style.transform = 'translateX(0)';
            }, 50);
        }, index * 100);
    });
}

function animateFeatures() {
    const features = document.querySelectorAll('.features-list li');
    features.forEach((feature, index) => {
        setTimeout(() => {
            feature.style.opacity = '0';
            feature.style.transform = 'translateX(-30px)';
            setTimeout(() => {
                feature.style.transition = 'all 0.5s ease';
                feature.style.opacity = '1';
                feature.style.transform = 'translateX(0)';
            }, 50);
        }, index * 80);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    addHoverEffects();
});

function addHoverEffects() {
    // Add subtle glow to buttons on hover
    document.querySelectorAll('.btn-primary').forEach(btn => {
        btn.addEventListener('mouseenter', function() {
            this.style.boxShadow = '0 15px 40px rgba(99, 102, 241, 0.4)';
        });
        btn.addEventListener('mouseleave', function() {
            this.style.boxShadow = '0 10px 30px rgba(99, 102, 241, 0.4)';
        });
    });
    
    // Add gentle scale to cards
    document.querySelectorAll('.subject-badge').forEach(badge => {
        badge.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-3px) scale(1.02)';
        });
        badge.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
}
