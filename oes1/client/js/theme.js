// Theme Management System
class ThemeManager {
    constructor() {
        this.currentTheme = this.getStoredTheme() || 'dark';
        this.init();
    }

    init() {
        this.applyTheme(this.currentTheme);
        this.attachEventListeners();
        this.updateToggleState();
    }

    getStoredTheme() {
        return localStorage.getItem('codequest-theme');
    }

    setStoredTheme(theme) {
        localStorage.setItem('codequest-theme', theme);
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        this.currentTheme = theme;
        this.setStoredTheme(theme);
        
        // Update meta theme-color for mobile browsers
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
            metaThemeColor.setAttribute('content', theme === 'dark' ? '#0f172a' : '#f8fafc');
        } else {
            const meta = document.createElement('meta');
            meta.name = 'theme-color';
            meta.content = theme === 'dark' ? '#0f172a' : '#f8fafc';
            document.getElementsByTagName('head')[0].appendChild(meta);
        }
    }

    toggleTheme() {
        const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.applyTheme(newTheme);
        this.updateToggleState();
        this.playToggleAnimation();
    }

    updateToggleState() {
        const toggles = document.querySelectorAll('#themeToggle');
        toggles.forEach(toggle => {
            if (toggle) {
                toggle.setAttribute('data-theme', this.currentTheme);
            }
        });
    }

    playToggleAnimation() {
        const slider = document.querySelector('.theme-toggle-slider');
        if (slider) {
            slider.style.transform = 'scale(0.8)';
            setTimeout(() => {
                slider.style.transform = '';
            }, 150);
        }
    }

    attachEventListeners() {
        // Handle theme toggle clicks
        document.addEventListener('click', (e) => {
            if (e.target.closest('#themeToggle')) {
                this.toggleTheme();
            }
        });

        // Handle system theme changes
        if (window.matchMedia) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            mediaQuery.addListener((e) => {
                if (!this.getStoredTheme()) {
                    this.applyTheme(e.matches ? 'dark' : 'light');
                    this.updateToggleState();
                }
            });
        }

        // Handle keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'T') {
                e.preventDefault();
                this.toggleTheme();
            }
        });
    }

    // Auto-detect system preference if no stored theme
    detectSystemTheme() {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    }
}

// Initialize theme manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.themeManager = new ThemeManager();
});

// Responsive utilities
class ResponsiveManager {
    constructor() {
        this.breakpoints = {
            mobile: 480,
            tablet: 768,
            laptop: 1024,
            desktop: 1200
        };
        this.init();
    }

    init() {
        this.handleResize();
        window.addEventListener('resize', this.debounce(this.handleResize.bind(this), 250));
    }

    getCurrentBreakpoint() {
        const width = window.innerWidth;
        if (width <= this.breakpoints.mobile) return 'mobile';
        if (width <= this.breakpoints.tablet) return 'tablet';
        if (width <= this.breakpoints.laptop) return 'laptop';
        return 'desktop';
    }

    handleResize() {
        const breakpoint = this.getCurrentBreakpoint();
        document.body.setAttribute('data-breakpoint', breakpoint);
        
        // Emit custom event for other components to listen
        window.dispatchEvent(new CustomEvent('breakpointChange', {
            detail: { breakpoint, width: window.innerWidth }
        }));
        
        this.adjustForMobile();
    }

    adjustForMobile() {
        const isMobile = this.getCurrentBreakpoint() === 'mobile';
        
        // Adjust navigation for mobile
        const navbar = document.querySelector('.navbar');
        if (navbar && isMobile) {
            navbar.style.padding = '0.8rem 1rem';
        }
        
        // Adjust modals for mobile
        const modals = document.querySelectorAll('.review-modal, .analytics-modal, .exam-detail-modal');
        modals.forEach(modal => {
            if (isMobile) {
                modal.style.padding = '1rem';
            }
        });
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

// Initialize responsive manager
document.addEventListener('DOMContentLoaded', () => {
    window.responsiveManager = new ResponsiveManager();
});

// Touch and gesture support for mobile
class TouchManager {
    constructor() {
        this.init();
    }

    init() {
        this.addTouchSupport();
        this.addSwipeGestures();
    }

    addTouchSupport() {
        // Add touch-friendly hover effects
        document.addEventListener('touchstart', (e) => {
            const target = e.target.closest('.subject-card, .daily-quest-card, .exam-item');
            if (target) {
                target.classList.add('touch-active');
            }
        });

        document.addEventListener('touchend', (e) => {
            setTimeout(() => {
                document.querySelectorAll('.touch-active').forEach(el => {
                    el.classList.remove('touch-active');
                });
            }, 150);
        });
    }

    addSwipeGestures() {
        let startX, startY, startTime;

        document.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            startTime = Date.now();
        });

        document.addEventListener('touchend', (e) => {
            if (!startX || !startY) return;

            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            const endTime = Date.now();

            const diffX = startX - endX;
            const diffY = startY - endY;
            const diffTime = endTime - startTime;

            // Only process quick swipes
            if (diffTime > 300) return;

            // Horizontal swipe
            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
                if (diffX > 0) {
                    // Swipe left
                    this.handleSwipeLeft();
                } else {
                    // Swipe right
                    this.handleSwipeRight();
                }
            }

            startX = startY = null;
        });
    }

    handleSwipeLeft() {
        // Navigate to next question in exam
        const nextBtn = document.getElementById('nextBtn');
        if (nextBtn && !nextBtn.disabled) {
            nextBtn.click();
        }
    }

    handleSwipeRight() {
        // Navigate to previous question or back
        const prevBtn = document.getElementById('prevBtn');
        if (prevBtn && !prevBtn.classList.contains('disabled')) {
            prevBtn.click();
        }
    }
}

// Initialize touch manager for mobile devices
if ('ontouchstart' in window) {
    document.addEventListener('DOMContentLoaded', () => {
        window.touchManager = new TouchManager();
    });
}

// Add CSS class for touch devices
if ('ontouchstart' in window) {
    document.documentElement.classList.add('touch-device');
} else {
    document.documentElement.classList.add('no-touch');
}