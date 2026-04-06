import axios from 'axios';

const BASE_URL = 'http://127.0.0.1:8000/api/';

// --- 1. PUBLIC API (No Interceptors) ---
// Use this for Register, Login, and OTP Verify
export const publicApi = axios.create({
    baseURL: BASE_URL,
});

// --- 2. PRIVATE API (With Token Interceptor) ---
// Use this for Interests, Placement Test, and Dashboard
const privateApi = axios.create({
    baseURL: BASE_URL,
});

privateApi.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    // Only attach if token actually exists
    if (token && token !== "undefined" && token !== "null") {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default privateApi;