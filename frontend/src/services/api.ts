import axios from 'axios';

const API_URL = 'http://localhost:8000';

const api = axios.create({
    baseURL: API_URL,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const auth = {
    login: () => {
        window.location.href = `${API_URL}/auth/login`;
    },
    handleCallback: async (code: string) => {
        const response = await axios.get(`${API_URL}/auth/callback?code=${code}`);
        return response.data;
    },
};

export const repos = {
    list: async () => {
        const response = await api.get('/api/repos');
        return response.data;
    },
    preview: async (repo: string) => {
        // We need the token here too if the backend requires it in the body, 
        // but ideally the backend should use the Auth header. 
        // My backend implementation of `PreviewRequest` expects `token` in the body.
        // I should update the backend to use `Depends(oauth2_scheme)` or similar,
        // but for now I'll adhere to the current backend contract and send the token in body.
        const token = localStorage.getItem('token');
        const response = await api.post('/api/preview', { token, repo });
        return response.data;
    },
    publish: async (repo: string, content: string) => {
        const token = localStorage.getItem('token');
        const response = await api.post('/api/publish', { token, repo, content });
        return response.data;
    }
};

export default api;
