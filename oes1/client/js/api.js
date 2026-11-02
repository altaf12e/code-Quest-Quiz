const API_CONFIG = {
    localUrl: 'http://localhost:5000/api',
    remoteUrl: 'https://code-quest-quiz.onrender.com/api',
    getBaseUrl() {
        if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
            return this.localUrl;
        }
        return this.remoteUrl;
    }
};

const api = {
    async request(url, options = {}) {
        const token = localStorage.getItem('token');
        const headers = {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
            ...options.headers
        };

        const primaryBase = API_CONFIG.getBaseUrl();
        const fallbackBase = primaryBase === API_CONFIG.localUrl ? API_CONFIG.remoteUrl : API_CONFIG.localUrl;

        let response = null;
        try {
            response = await fetch(`${primaryBase}${url}`, { ...options, headers });
        } catch (err) {
            try {
                response = await fetch(`${fallbackBase}${url}`, { ...options, headers });
            } catch (fallbackErr) {
                console.warn('API fetch failed on both endpoints:', url);
                return { success: false, message: 'Server currently offline' };
            }
        }

        if (!response || !response.ok) {
            let errMessage = `HTTP ${response ? response.status : 500}`;
            try {
                const errData = await response.json();
                if (errData && errData.message) errMessage = errData.message;
            } catch (_) {}
            return { success: false, message: errMessage };
        }

        try {
            return await response.json();
        } catch (jsonErr) {
            return { success: false, message: 'Invalid server response' };
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

};