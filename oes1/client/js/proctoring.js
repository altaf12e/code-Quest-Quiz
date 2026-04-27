let videoStream = null;
let fullscreenActive = false;
let tabSwitchCount = 0;

async function startProctoring() {
    try {
        videoStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        const videoElement = document.getElementById('proctoringVideo');
        if (videoElement) {
            videoElement.srcObject = videoStream;
        }
        
        await enterFullscreen();
        setupTabSwitchDetection();
        
        return true;
    } catch (error) {
        console.error('Proctoring error:', error);
        alert('Camera access required for exam. Please allow camera permission.');
        return false;
    }
}

async function enterFullscreen() {
    try {
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
            await elem.requestFullscreen();
        } else if (elem.webkitRequestFullscreen) {
            await elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) {
            await elem.msRequestFullscreen();
        }
        fullscreenActive = true;
    } catch (error) {
        console.error('Fullscreen error:', error);
    }
}

function setupTabSwitchDetection() {
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            tabSwitchCount++;
            alert(`Warning: Tab switching detected! Count: ${tabSwitchCount}`);
        }
    });
    
    document.addEventListener('fullscreenchange', () => {
        if (!document.fullscreenElement && fullscreenActive) {
            alert('Warning: Fullscreen exited! Re-entering fullscreen...');
            enterFullscreen();
        }
    });
}

function stopProctoring() {
    if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
        videoStream = null;
    }
    
    if (document.fullscreenElement) {
        document.exitFullscreen();
    }
    
    fullscreenActive = false;
}

function getTabSwitchCount() {
    return tabSwitchCount;
}
