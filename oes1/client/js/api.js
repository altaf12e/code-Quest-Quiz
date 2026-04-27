const api = {
    async get(url) {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api${url}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return await response.json();
    },
    
    async post(url, data) {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api${url}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        return await response.json();
    },
    
    async put(url, data) {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api${url}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        return await response.json();
    },
    
    async delete(url) {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api${url}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return await response.json();
    }
};