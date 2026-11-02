const API_BASE_URL = (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'))
    ? 'http://localhost:5000/api'
    : 'https://code-quest-quiz.onrender.com/api';
const API_FALLBACK_URL = 'https://code-quest-quiz.onrender.com/api';

const api = {
    async request(endpoint, options = {}) {
        const token = localStorage.getItem('token');
        
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

        let activeBase = API_BASE_URL;

        try {
            console.log(`🌐 API Request: ${options.method || 'GET'} ${activeBase}${endpoint}`);
            let response = null;
            try {
                response = await fetch(`${activeBase}${endpoint}`, config);
            } catch (netErr) {
                // If local server failed to connect, try fallback remote URL
                if (activeBase !== API_FALLBACK_URL) {
                    console.warn(`Local API at ${activeBase} unreachable, retrying with fallback ${API_FALLBACK_URL}`);
                    activeBase = API_FALLBACK_URL;
                    response = await fetch(`${activeBase}${endpoint}`, config);
                } else {
                    throw netErr;
                }
            }
            
            console.log(`📡 Response status: ${response ? response.status : 'null'}`);
            
            if (!response || !response.ok) {
                let errText = `HTTP ${response ? response.status : 500}`;
                try {
                    const errData = await response.json();
                    if (errData && errData.message) errText = errData.message;
                } catch (_) {}
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
            console.warn('🚨 API Notice:', error.message);
            throw error;
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
