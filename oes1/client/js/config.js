// Dynamic Base URL Resolution
function getBaseApiUrl() {
    // 1. Check user custom override in localStorage
    const custom = (typeof localStorage !== 'undefined') && (localStorage.getItem('codequest_api_url') || localStorage.getItem('custom_api_url'));
    if (custom && custom.trim()) {
        return custom.trim().replace(/\/+$/, '');
    }
    // 2. Check if local development
    if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
        return 'http://localhost:5000/api';
    }
    // 3. Default deployed Render API
    return 'https://code-quest-quiz.onrender.com/api';
}

const API_BASE_URL = getBaseApiUrl();
const API_FALLBACK_URL = 'https://code-quest-quiz.onrender.com/api';

// Helper to change API URL from browser console or UI
if (typeof window !== 'undefined') {
    window.setCodeQuestApiUrl = function(newUrl) {
        if (!newUrl) {
            localStorage.removeItem('codequest_api_url');
            localStorage.removeItem('custom_api_url');
            console.log('Reset API URL to default:', API_FALLBACK_URL);
        } else {
            let clean = newUrl.trim().replace(/\/+$/, '');
            if (!clean.endsWith('/api')) clean += '/api';
            localStorage.setItem('codequest_api_url', clean);
            console.log('Saved custom API URL:', clean);
        }
        window.location.reload();
    };

    window.getCodeQuestApiUrl = function() {
        return getBaseApiUrl();
    };
}

const api = {
    async request(endpoint, options = {}, retries = 2) {
        const token = (typeof localStorage !== 'undefined') ? localStorage.getItem('token') : null;
        
        const config = {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            }
        };

        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }

        let activeBase = getBaseApiUrl();

        for (let attempt = 1; attempt <= (retries + 1); attempt++) {
            try {
                console.log(`🌐 API Request [Attempt ${attempt}/${retries + 1}]: ${options.method || 'GET'} ${activeBase}${endpoint}`);
                
                // Add a 30-second timeout controller so cold starts don't hang indefinitely
                const controller = (typeof AbortController !== 'undefined') ? new AbortController() : null;
                const timeoutId = controller ? setTimeout(() => controller.abort(), 30000) : null;
                
                let response = null;
                try {
                    response = await fetch(`${activeBase}${endpoint}`, {
                        ...config,
                        signal: controller ? controller.signal : undefined
                    });
                } finally {
                    if (timeoutId) clearTimeout(timeoutId);
                }

                console.log(`📡 Response status: ${response ? response.status : 'null'}`);
                
                if (!response || !response.ok) {
                    let errText = `HTTP ${response ? response.status : 500}`;
                    try {
                        const errData = await response.json();
                        if (errData && errData.message) errText = errData.message;
                    } catch (_) {}

                    // If 502 or 503 on Render, it usually means cold start / waking up
                    if (response && (response.status === 502 || response.status === 503) && attempt <= retries) {
                        console.warn(`Render server returned ${response.status} (Waking up). Retrying in 3.5s...`);
                        if (typeof window !== 'undefined') {
                            window.dispatchEvent(new CustomEvent('render:waking', {
                                detail: { attempt, total: retries + 1, message: 'Server is starting up...' }
                            }));
                        }
                        await new Promise(r => setTimeout(r, 3500));
                        continue;
                    }

                    throw new Error(errText);
                }

                let data;
                try {
                    data = await response.json();
                } catch (parseError) {
                    console.warn('Failed to parse response as JSON:', parseError);
                    return { success: false, message: 'Invalid server response' };
                }

                return data;
            } catch (error) {
                const isNetworkError = error.name === 'AbortError' || 
                                       (error.message && (
                                           error.message.includes('Failed to fetch') || 
                                           error.message.includes('NetworkError') || 
                                           error.message.includes('abort') ||
                                           error.message.includes('offline')
                                       ));
                
                if (isNetworkError && attempt <= retries) {
                    console.warn(`⏳ Network error on attempt ${attempt}. Server might be waking up from sleep. Waiting 3.5s...`);
                    if (typeof window !== 'undefined') {
                        window.dispatchEvent(new CustomEvent('render:waking', {
                            detail: { attempt, total: retries + 1, message: 'Cloud server is waking up from sleep mode...' }
                        }));
                    }
                    await new Promise(r => setTimeout(r, 3500));
                    continue;
                }

                if (isNetworkError) {
                    throw new Error('Cloud server is waking up from sleep mode (~40-50s on Render Free Tier). Please wait a few seconds and try again!');
                }

                console.warn('🚨 API Notice:', error.message);
                throw error;
            }
        }
    },

    get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    },

    post(endpoint, body) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(body)
        });
    },

    put(endpoint, body) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(body)
        });
    },

    delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }
};
