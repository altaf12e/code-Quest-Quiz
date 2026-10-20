// ==========================================
// 🔒 CodeQuest Strict Exam Screen Lock & Proctoring Engine
// ==========================================

let videoStream = null;
let isScreenLocked = true;
let isExamActive = false;

async function startProctoring() {
    // 1. Initialize Camera (Non-blocking so exam never crashes if cam blocked)
    try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            videoStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
            const videoElement = document.getElementById('proctoringVideo');
            if (videoElement) {
                videoElement.srcObject = videoStream;
            }
        }
    } catch (camError) {
        console.warn('📷 Webcam not accessible or denied:', camError);
        const camWidget = document.getElementById('cameraWidget');
        if (camWidget) {
            camWidget.innerHTML = `
                <div style="width:160px;height:120px;border-radius:12px;border:2px dashed #f59e0b;background:rgba(15,23,42,0.95);display:flex;flex-direction:column;align-items:center;justify-content:center;color:#f59e0b;font-size:11px;padding:8px;text-align:center;">
                    <span style="font-size:24px;margin-bottom:4px;">📷</span>
                    <span>Camera Offline</span>
                </div>
            `;
        }
    }

    // 2. Activate Screen Lock Protection
    enableScreenLock();

    return true;
}

// Request true Fullscreen mode
function enterFullscreen() {
    const elem = document.documentElement;
    const isFull = !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);
    
    if (!isFull) {
        const req = elem.requestFullscreen || elem.webkitRequestFullscreen || elem.mozRequestFullScreen || elem.msRequestFullscreen;
        if (req) {
            return req.call(elem).then(() => {
                isExamActive = true;
                hideScreenLockModal();
                lockKeyboard();
            }).catch(err => {
                console.warn('Fullscreen request blocked or requires user click:', err);
                showScreenLockModal('Click below to lock screen and resume exam.');
            });
        }
    } else {
        isExamActive = true;
        hideScreenLockModal();
        lockKeyboard();
    }
}

// Chrome Keyboard Lock API (Locks Escape, Alt, Tab, Ctrl inside fullscreen)
async function lockKeyboard() {
    if (navigator.keyboard && navigator.keyboard.lock) {
        try {
            await navigator.keyboard.lock(['Escape', 'KeyW', 'KeyN', 'KeyT', 'Tab', 'AltLeft', 'AltRight']);
            console.log('🔒 Keyboard locked to prevent exiting fullscreen or switching tabs');
        } catch (err) {
            console.warn('Keyboard lock optional warning:', err);
        }
    }
}

function unlockKeyboard() {
    if (navigator.keyboard && navigator.keyboard.unlock) {
        try {
            navigator.keyboard.unlock();
        } catch (e) {}
    }
}

function exitFullscreen() {
    unlockKeyboard();
    const isFullscreen = !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);
    if (isFullscreen) {
        const exit = document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen || document.msExitFullscreen;
        if (exit) {
            exit.call(document).catch(err => console.warn('Exit fullscreen error:', err));
        }
    }
}

function enableScreenLock() {
    isScreenLocked = true;

    // Apply strict locked class to body and navbar
    document.body.classList.add('quiz-locked');
    const navbar = document.querySelector('.exam-navbar');
    if (navbar) {
        navbar.classList.add('exam-locked');
    }

    // Attach security event listeners
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);

    // Prevent right-click, dev tools, and key shortcuts
    document.addEventListener('contextmenu', blockContextMenu);
    document.addEventListener('keydown', blockSecurityKeys, true);
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Check if already in fullscreen; if not, force display of lock modal
    const isFull = !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);
    if (!isFull) {
        showScreenLockModal('Click below to lock screen into Fullscreen Exam Mode.');
    } else {
        hideScreenLockModal();
        lockKeyboard();
    }
}

function disableScreenLock() {
    isScreenLocked = false;
    isExamActive = false;

    // Remove lock classes
    document.body.classList.remove('quiz-locked');
    const navbar = document.querySelector('.exam-navbar');
    if (navbar) {
        navbar.classList.remove('exam-locked');
    }

    // Remove event listeners
    document.removeEventListener('fullscreenchange', handleFullscreenChange);
    document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
    document.removeEventListener('MSFullscreenChange', handleFullscreenChange);

    document.removeEventListener('visibilitychange', handleVisibilityChange);
    window.removeEventListener('blur', handleWindowBlur);

    document.removeEventListener('contextmenu', blockContextMenu);
    document.removeEventListener('keydown', blockSecurityKeys, true);
    window.removeEventListener('beforeunload', handleBeforeUnload);

    // Stop video camera stream
    if (videoStream) {
        try {
            videoStream.getTracks().forEach(track => track.stop());
        } catch (e) {}
        videoStream = null;
    }

    // Hide screen lock modal
    hideScreenLockModal();

    // Exit fullscreen
    exitFullscreen();
}

function stopProctoring() {
    disableScreenLock();
}

function reEnterFullscreen() {
    enterFullscreen();
}

function showScreenLockModal(customMessage) {
    const overlay = document.getElementById('screenLockOverlay');
    const alertText = document.getElementById('lockAlertText');
    const title = document.getElementById('lockModalTitle');
    const btn = document.getElementById('lockModalBtn');

    if (alertText && customMessage) {
        alertText.textContent = customMessage;
    }
    if (title) {
        title.textContent = 'EXAM SCREEN LOCKED';
    }
    if (btn) {
        btn.innerHTML = '<span class="unlock-btn-icon">🔒</span> Lock Screen & Continue Exam';
    }
    if (overlay) {
        overlay.classList.remove('hidden');
        overlay.style.display = 'flex';
    }
}

function hideScreenLockModal() {
    const overlay = document.getElementById('screenLockOverlay');
    if (overlay) {
        overlay.classList.add('hidden');
        overlay.style.display = 'none';
    }
}

// When user tries to exit fullscreen (e.g. holds Esc or exits)
function handleFullscreenChange() {
    if (!isScreenLocked) return;

    const isFull = !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);
    if (!isFull) {
        showScreenLockModal('⚠️ Fullscreen was exited! Return to fullscreen immediately to continue your exam.');
        showToast('🔒 Screen Locked: Fullscreen required!', 'error');
    } else {
        hideScreenLockModal();
        lockKeyboard();
    }
}

// When user switches tabs or minimizes window
function handleVisibilityChange() {
    if (!isScreenLocked) return;

    if (document.hidden) {
        showScreenLockModal('⚠️ You attempted to switch tabs! Opening other tabs or windows is strictly prohibited.');
        showToast('🔒 Screen Locked: Tab switching is strictly prohibited!', 'error');
    }
}

// When window loses focus (e.g. clicked outside or taskbar)
function handleWindowBlur() {
    if (!isScreenLocked) return;
    const isFull = !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);
    if (!isFull) {
        showScreenLockModal('⚠️ Window focus lost! Click below to return and lock your exam screen.');
    }
}

// Block right-click context menu
function blockContextMenu(e) {
    if (isScreenLocked) {
        e.preventDefault();
        showToast('⚠️ Right-click is disabled during exam!', 'error');
        return false;
    }
}

// Block all tab-opening, dev tools, and navigation shortcuts
function blockSecurityKeys(e) {
    if (!isScreenLocked) return;

    // Block Ctrl+T (New tab), Ctrl+N (New window), Ctrl+Shift+N (Incognito)
    if (e.ctrlKey && (e.key === 't' || e.key === 'T' || e.key === 'n' || e.key === 'N')) {
        e.preventDefault();
        e.stopPropagation();
        showToast('⚠️ Opening new tabs is strictly blocked!', 'error');
        return false;
    }

    // Block Ctrl+W (Close tab)
    if (e.ctrlKey && (e.key === 'w' || e.key === 'W')) {
        e.preventDefault();
        e.stopPropagation();
        return false;
    }

    // Block Alt+Tab, Alt+Left, Alt+Right
    if (e.altKey) {
        e.preventDefault();
        e.stopPropagation();
        return false;
    }

    // Block F11 (Fullscreen toggle) & F5 (Refresh) & Ctrl+R
    if (e.key === 'F11' || e.key === 'F5' || (e.ctrlKey && (e.key === 'r' || e.key === 'R'))) {
        e.preventDefault();
        e.stopPropagation();
        return false;
    }

    // Block F12 (Developer tools)
    if (e.key === 'F12' || e.keyCode === 123) {
        e.preventDefault();
        e.stopPropagation();
        showToast('⚠️ Developer tools are disabled!', 'error');
        return false;
    }

    // Block Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C (Inspect elements)
    if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c')) {
        e.preventDefault();
        e.stopPropagation();
        showToast('⚠️ Inspect elements is blocked!', 'error');
        return false;
    }

    // Block Ctrl+U (View source)
    if (e.ctrlKey && (e.key === 'u' || e.key === 'U')) {
        e.preventDefault();
        e.stopPropagation();
        return false;
    }

    // Block Ctrl+C, Ctrl+V, Ctrl+A (Copy/Paste/Select All)
    if (e.ctrlKey && (e.key === 'c' || e.key === 'C' || e.key === 'v' || e.key === 'V' || e.key === 'a' || e.key === 'A')) {
        const targetTag = e.target.tagName ? e.target.tagName.toLowerCase() : '';
        if (targetTag !== 'input' && targetTag !== 'textarea') {
            e.preventDefault();
            e.stopPropagation();
            showToast('⚠️ Copy/Paste is disabled during exam!', 'error');
            return false;
        }
    }
}

function handleBeforeUnload(e) {
    if (isScreenLocked) {
        e.preventDefault();
        e.returnValue = 'Exam is in progress. Leaving will forfeit your score.';
        return e.returnValue;
    }
}

// Toast notification helper
function showToast(message, type = 'info') {
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = `custom-toast toast-${type}`;
    toast.innerHTML = `<span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('toast-show');
    }, 10);

    setTimeout(() => {
        toast.classList.remove('toast-show');
        setTimeout(() => {
            if (toast.parentNode) toast.parentNode.removeChild(toast);
        }, 300);
    }, 3500);
}

// Global exposure
window.reEnterFullscreen = reEnterFullscreen;
window.startProctoring = startProctoring;
window.stopProctoring = stopProctoring;
window.enableScreenLock = enableScreenLock;
window.disableScreenLock = disableScreenLock;
