const API_CONFIG = {
    localUrl: 'http://localhost:5000/api',
    remoteUrl: 'https://code-quest-quiz.onrender.com/api',
    getBaseUrl() {
        const custom = (typeof localStorage !== 'undefined') && (localStorage.getItem('codequest_api_url') || localStorage.getItem('custom_api_url'));
        if (custom && custom.trim()) {
            return custom.trim().replace(/\/+$/, '');
        }
        if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
            return this.localUrl;
        }
        return this.remoteUrl;
    }
};

const api = {
    async request(url, options = {}, retries = 2) {
        const token = (typeof localStorage !== 'undefined') ? localStorage.getItem('token') : null;
        const headers = {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            ...options.headers
        };

        const baseUrl = API_CONFIG.getBaseUrl();

        for (let attempt = 1; attempt <= (retries + 1); attempt++) {
            try {
                const response = await fetch(`${baseUrl}${url}`, { ...options, headers });
                
                if (!response || !response.ok) {
                    let errMessage = `HTTP ${response ? response.status : 500}`;
                    try {
                        const errData = await response.json();
                        if (errData && errData.message) errMessage = errData.message;
                    } catch (_) {}

                    if (response && (response.status === 502 || response.status === 503) && attempt <= retries) {
                        await new Promise(r => setTimeout(r, 3500));
                        continue;
                    }

                    return { success: false, message: errMessage };
                }

                try {
                    return await response.json();
                } catch (jsonErr) {
                    return { success: false, message: 'Invalid server response' };
                }
            } catch (err) {
                if (attempt <= retries) {
                    await new Promise(r => setTimeout(r, 3500));
                    continue;
                }
                console.warn('API fetch failed:', url);
                return { success: false, message: 'Cloud server is waking up from sleep mode. Please try again in 15 seconds.' };
            }
        }
    },

    get(url) {
        return this.request(url, { method: 'GET' });
    },
    
    post(url, data) {
        return this.request(url, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },
    
    put(url, data) {
        return this.request(url, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },
    
    delete(url) {
        return this.request(url, { method: 'DELETE' });
    }
};
