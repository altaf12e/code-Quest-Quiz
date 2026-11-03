document.addEventListener('DOMContentLoaded', () => {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const tabIndicator = document.querySelector('.tab-indicator');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');

    // Auto pre-fill remembered username
    const savedUser = localStorage.getItem('codequest_remembered_user');
    const usernameInput = document.getElementById('loginUsername');
    const rememberCheckbox = document.getElementById('rememberMe');
    if (savedUser && usernameInput) {
        usernameInput.value = savedUser;
        if (rememberCheckbox) rememberCheckbox.checked = true;
    }

    tabBtns.forEach((btn, index) => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            btn.classList.add('active');
            const tabName = btn.getAttribute('data-tab');
            document.getElementById(`${tabName}-tab`).classList.add('active');
            
            tabIndicator.style.transform = `translateX(${index * 100}%)`;
        });
    });

    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }

    const forgotForm = document.getElementById('forgotForm');
    if (forgotForm) {
        forgotForm.addEventListener('submit', handleForgotPassword);
    }

    const forgotPasswordLink = document.getElementById('forgotPasswordLink');
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', (e) => {
            e.preventDefault();
            showForgotPasswordForm();
        });
    }

    const backToLoginLink = document.getElementById('backToLoginLink');
    if (backToLoginLink) {
        backToLoginLink.addEventListener('click', (e) => {
            e.preventDefault();
            showLoginForm();
        });
    }

    // Backend API Server settings button
    const apiConfigBtn = document.getElementById('apiConfigBtn');
    if (apiConfigBtn) {
        apiConfigBtn.addEventListener('click', handleApiConfigPrompt);
    }

    addInputValidation();
    updateServerStatusDisplay();
});

// Listen to Render cold start wake-up events from config.js
window.addEventListener('render:waking', (e) => {
    const { attempt, total } = e.detail || {};
    const loadingDiv = document.getElementById('loading-overlay');
    if (loadingDiv) {
        loadingDiv.innerHTML = `
            <div style="text-align: center; max-width: 420px; padding: 28px 24px; background: rgba(18, 18, 30, 0.95); border: 1px solid rgba(168, 85, 247, 0.4); border-radius: 16px; box-shadow: 0 12px 40px rgba(0,0,0,0.7); font-family: inherit;">
                <div style="font-size: 2.6rem; margin-bottom: 12px; animation: pulse 1.5s infinite;">⏳</div>
                <div style="font-size: 1.25rem; font-weight: 700; color: #c084fc; margin-bottom: 8px;">Waking Up Render Cloud Server...</div>
                <div style="font-size: 0.88rem; color: #cbd5e1; line-height: 1.5; margin-bottom: 16px;">
                    Render Free Tier sleeps after 15 mins of inactivity.<br>
                    Please wait while the server spins up (~30-50s).<br>
                    <strong style="color: #38bdf8;">Retrying attempt ${attempt} of ${total}...</strong>
                </div>
                <div style="width: 100%; height: 6px; background: rgba(255,255,255,0.1); border-radius: 999px; overflow: hidden;">
                    <div style="width: ${Math.round((attempt / total) * 100)}%; height: 100%; background: linear-gradient(90deg, #6366f1, #ec4899); transition: width 0.4s ease;"></div>
                </div>
            </div>
        `;
    }
});

function updateServerStatusDisplay() {
    const statusText = document.getElementById('serverStatusText');
    if (!statusText) return;
    const currentUrl = (typeof window.getCodeQuestApiUrl === 'function') 
        ? window.getCodeQuestApiUrl() 
        : 'https://code-quest-quiz.onrender.com/api';
    
    let displayHost = 'Cloud API (Render)';
    try {
        const u = new URL(currentUrl);
        displayHost = u.hostname;
    } catch (_) {}
    
    statusText.textContent = `API: ${displayHost}`;
}

function handleApiConfigPrompt() {
    const currentUrl = (typeof window.getCodeQuestApiUrl === 'function') 
        ? window.getCodeQuestApiUrl() 
        : 'https://code-quest-quiz.onrender.com/api';

    const input = prompt(
        "Enter your CodeQuest Backend API URL:\n(Leave blank to reset to default https://code-quest-quiz.onrender.com/api)",
        currentUrl
    );

    if (input !== null) {
        if (typeof window.setCodeQuestApiUrl === 'function') {
            window.setCodeQuestApiUrl(input.trim());
        } else {
            if (input.trim()) {
                localStorage.setItem('codequest_api_url', input.trim());
            } else {
                localStorage.removeItem('codequest_api_url');
            }
            window.location.reload();
        }
    }
}

async function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    const rememberCheckbox = document.getElementById('rememberMe');
    
    clearErrors();
    
    if (!validateUsername(username)) {
        showError('loginUsernameError', 'Username must be at least 3 characters');
        return;
    }
    
    if (!validatePassword(password)) {
        showError('loginPasswordError', 'Password must be at least 6 characters');
        return;
    }

    // Save or clear remembered username
    if (rememberCheckbox && rememberCheckbox.checked) {
        localStorage.setItem('codequest_remembered_user', username);
    } else {
        localStorage.removeItem('codequest_remembered_user');
    }

    try {
        showLoading('Connecting to server...');
        
        const data = await api.post('/auth/login', {
            username,
            password
        });

        localStorage.setItem('token', data.token);
        localStorage.setItem('userData', JSON.stringify(data.user));
        
        playSuccessSound();
        showSuccessMessage('Login successful! Redirecting...');
        
        setTimeout(() => {
            if (username === 'admin') {
                window.location.href = 'admin.html';
            } else {
                window.location.href = 'dashboard.html';
            }
        }, 800);
    } catch (error) {
        hideLoading();
        console.error('Login error details:', error);
        
        const rawMsg = (error && error.message) ? error.message : String(error);
        let errorMessage = 'Login failed. Please try again.';
        
        if (rawMsg.includes('Database is offline') || rawMsg.includes('MongoDB Atlas')) {
            errorMessage = '⚠️ MongoDB Database is offline: Atlas cluster may be paused. Please unpause in MongoDB Atlas.';
        } else if (rawMsg.includes('Failed to fetch') || rawMsg.includes('waking up') || rawMsg.includes('sleep mode') || rawMsg.includes('NetworkError') || rawMsg.includes('offline') || rawMsg.includes('AbortError')) {
            errorMessage = '⏳ Cloud server is waking up from sleep mode (~40-50s on Render Free Tier). Please wait 10-20 seconds and click Login again!';
            showWakeupNotice();
        } else if (rawMsg.includes('Invalid') || rawMsg.includes('401') || rawMsg.includes('password') || rawMsg.includes('user')) {
            errorMessage = rawMsg;
        } else {
            errorMessage = rawMsg;
        }
        
        showError('loginPasswordError', errorMessage);
        playErrorSound();
    }
}

function showWakeupNotice() {
    let notice = document.getElementById('serverWakeupNotice');
    if (!notice) {
        notice = document.createElement('div');
        notice.id = 'serverWakeupNotice';
        notice.style.cssText = `
            margin: 14px 0;
            padding: 12px 14px;
            background: rgba(245, 158, 11, 0.12);
            border: 1px solid rgba(245, 158, 11, 0.4);
            border-radius: 10px;
            color: #fbbf24;
            font-size: 0.82rem;
            line-height: 1.45;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
        `;
        const form = document.getElementById('loginForm');
        if (form) {
            form.insertBefore(notice, form.querySelector('button[type="submit"]'));
        }
    }
    notice.innerHTML = `
        <div>
            <strong>ℹ️ Render Free Server Note:</strong><br>
            Server goes to sleep after 15 mins of inactivity. The first wake-up request takes ~40-50 seconds.
        </div>
        <button type="button" onclick="document.getElementById('loginForm').dispatchEvent(new Event('submit', {cancelable: true, bubbles: true}))" style="background: #f59e0b; color: #111; border: none; padding: 6px 12px; border-radius: 6px; font-weight: 700; cursor: pointer; white-space: nowrap; font-size: 0.78rem;">
            🔄 Retry
        </button>
    `;
}

async function handleSignup(e) {
    e.preventDefault();
    
    const username = document.getElementById('signupUsername').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const avatar = document.querySelector('input[name="avatar"]:checked').value;
    
    clearErrors();
    
    if (!validateUsername(username)) {
        showError('signupUsernameError', 'Username must be at least 3 characters');
        return;
    }
    
    if (!validateEmail(email)) {
        showError('signupEmailError', 'Please enter a valid email');
        return;
    }
    
    if (!validatePassword(password)) {
        showError('signupPasswordError', 'Password must be at least 6 characters');
        return;
    }
    
    if (password !== confirmPassword) {
        showError('confirmPasswordError', 'Passwords do not match');
        return;
    }

    try {
        showLoading('Creating your account...');
        
        const data = await api.post('/auth/signup', {
            username,
            email,
            password,
            avatar
        });

        localStorage.setItem('token', data.token);
        localStorage.setItem('userData', JSON.stringify(data.user));
        
        playSuccessSound();
        showSuccessMessage('Account created! Welcome to CodeQuest!');
        
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1000);
    } catch (error) {
        hideLoading();
        console.error('Signup error:', error);
        
        const rawMsg = (error && error.message) ? error.message : String(error);
        let errorMessage = rawMsg || 'Signup failed. Please try again.';

        if (rawMsg.includes('Database is offline') || rawMsg.includes('MongoDB Atlas')) {
            errorMessage = '⚠️ MongoDB Database is offline: Atlas cluster may be paused. Please unpause in MongoDB Atlas.';
        } else if (rawMsg.includes('Failed to fetch') || rawMsg.includes('waking up') || rawMsg.includes('NetworkError') || rawMsg.includes('AbortError')) {
            errorMessage = '⏳ Cloud server is waking up (~40-50s on Render Free Tier). Please wait 10-20 seconds and click Sign Up again!';
        }
        
        if (errorMessage.toLowerCase().includes('username')) {
            showError('signupUsernameError', errorMessage);
        } else if (errorMessage.toLowerCase().includes('email')) {
            showError('signupEmailError', errorMessage);
        } else {
            showError('signupPasswordError', errorMessage);
        }
        playErrorSound();
    }
}

function validateUsername(username) {
    return username && username.length >= 3;
}

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePassword(password) {
    return password && password.length >= 6;
}

function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.color = '#ef4444';
    }
}

function clearErrors() {
    const errorElements = document.querySelectorAll('.error-msg');
    errorElements.forEach(el => el.textContent = '');
}

function showSuccessMessage(message) {
    const successDiv = document.createElement('div');
    successDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #10b981, #059669);
        color: white;
        padding: 1rem 2rem;
        border-radius: 10px;
        box-shadow: 0 10px 30px rgba(16, 185, 129, 0.4);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    successDiv.textContent = message;
    document.body.appendChild(successDiv);
    
    setTimeout(() => {
        successDiv.remove();
    }, 3000);
}

function showLoading(message) {
    let loadingDiv = document.getElementById('loading-overlay');
    if (!loadingDiv) {
        loadingDiv = document.createElement('div');
        loadingDiv.id = 'loading-overlay';
        loadingDiv.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.85);
            backdrop-filter: blur(4px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            color: white;
            font-size: 1.15rem;
        `;
        document.body.appendChild(loadingDiv);
    }
    loadingDiv.innerHTML = `
        <div style="text-align: center;">
            <div style="display: inline-block; width: 40px; height: 40px; border: 4px solid rgba(168, 85, 247, 0.25); border-top-color: #a855f7; border-radius: 50%; animation: spin 0.8s linear infinite; margin-bottom: 12px;"></div>
            <div>${message}</div>
        </div>
    `;
}

function hideLoading() {
    const loadingDiv = document.getElementById('loading-overlay');
    if (loadingDiv) {
        loadingDiv.remove();
    }
}

function addInputValidation() {
    const inputs = document.querySelectorAll('input[type="text"], input[type="email"], input[type="password"]');
    
    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            input.style.borderColor = '#6366f1';
        });
        
        input.addEventListener('blur', () => {
            input.style.borderColor = 'rgba(255, 255, 255, 0.1)';
        });
    });
}

function playSuccessSound() {
    // Sound disabled
}

function playErrorSound() {
    // Sound disabled
}

async function handleForgotPassword(e) {
    e.preventDefault();
    
    const email = document.getElementById('forgotEmail').value.trim();
    
    clearErrors();
    
    if (!validateEmail(email)) {
        showError('forgotEmailError', 'Please enter a valid email address');
        return;
    }

    try {
        showLoading('Checking email address...');
        
        const data = await api.post('/auth/forgot-password', { email });
        
        hideLoading();
        playSuccessSound();
        showSuccessMessage(data.message || 'Password reset instructions sent to your email!');
        
        setTimeout(() => {
            showLoginForm();
        }, 2000);
    } catch (error) {
        hideLoading();
        showError('forgotEmailError', error.message || 'Failed to send reset instructions. Please try again.');
        playErrorSound();
    }
}

function showForgotPasswordForm() {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector('.tab-container').style.display = 'none';
    document.getElementById('forgot-tab').classList.add('active');
    document.querySelector('.auth-header h2').innerHTML = 'Reset Your <span class="highlight">Password</span>';
}

function showLoginForm() {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelector('.tab-container').style.display = 'flex';
    document.getElementById('login-tab').classList.add('active');
    document.querySelector('.tab-btn[data-tab="login"]').classList.add('active');
    document.querySelector('.auth-header h2').innerHTML = 'Welcome to <span class="highlight">CodeQuest</span>';
    document.querySelector('.tab-indicator').style.transform = 'translateX(0%)';
    document.getElementById('forgotEmail').value = '';
    clearErrors();
}
