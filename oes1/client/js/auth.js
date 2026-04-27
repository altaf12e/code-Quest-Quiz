document.addEventListener('DOMContentLoaded', () => {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const tabIndicator = document.querySelector('.tab-indicator');
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');

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

    addInputValidation();
});

async function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    
    clearErrors();
    
    if (!validateUsername(username)) {
        showError('loginUsernameError', 'Username must be at least 3 characters');
        return;
    }
    
    if (!validatePassword(password)) {
        showError('loginPasswordError', 'Password must be at least 6 characters');
        return;
    }

    try {
        showLoading('Logging in...');
        
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
        }, 1000);
    } catch (error) {
        hideLoading();
        console.error('Login error details:', error);
        
        let errorMessage = 'Login failed. Please try again.';
        if (error.message) {
            errorMessage = error.message;
        } else if (error.toString().includes('fetch')) {
            errorMessage = 'Cannot connect to server. Please check if the server is running.';
        }
        
        showError('loginPasswordError', errorMessage);
        playErrorSound();
    }
}

async function handleSignup(e) {
    e.preventDefault();
    
    const username = document.getElementById('signupUsername').value;
    const email = document.getElementById('signupEmail').value;
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
        showLoading('Creating account...');
        
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
        
        const errorMessage = error.message || 'Signup failed. Please try again.';
        
        if (errorMessage.toLowerCase().includes('username')) {
            showError('signupUsernameError', errorMessage);
        } else if (errorMessage.toLowerCase().includes('email')) {
            showError('signupEmailError', errorMessage);
        } else if (errorMessage.toLowerCase().includes('password')) {
            showError('signupPasswordError', errorMessage);
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
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'loading-overlay';
    loadingDiv.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        color: white;
        font-size: 1.2rem;
    `;
    loadingDiv.textContent = message;
    document.body.appendChild(loadingDiv);
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
    // Sound disabled for simplicity
}

function playErrorSound() {
    // Sound disabled for simplicity
}

async function handleForgotPassword(e) {
    e.preventDefault();
    
    const email = document.getElementById('forgotEmail').value;
    
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
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    
    // Hide tab container
    document.querySelector('.tab-container').style.display = 'none';
    
    // Show forgot password form
    document.getElementById('forgot-tab').classList.add('active');
    
    // Update header
    document.querySelector('.auth-header h2').innerHTML = 'Reset Your <span class="highlight">Password</span>';
}

function showLoginForm() {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    
    // Show tab container
    document.querySelector('.tab-container').style.display = 'flex';
    
    // Show login tab
    document.getElementById('login-tab').classList.add('active');
    document.querySelector('.tab-btn[data-tab="login"]').classList.add('active');
    
    // Reset header
    document.querySelector('.auth-header h2').innerHTML = 'Welcome to <span class="highlight">CodeQuest</span>';
    
    // Reset tab indicator
    document.querySelector('.tab-indicator').style.transform = 'translateX(0%)';
    
    // Clear form
    document.getElementById('forgotEmail').value = '';
    clearErrors();
}
