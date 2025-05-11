// src/services/gateway.service.ts

import axios from 'axios';

const GATEWAY_API_URL = 'http://localhost:8081/api/v1/secure';

const apiClient = axios.create({
    baseURL: GATEWAY_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

apiClient.interceptors.request.use(config => {
    const token = localStorage.getItem('accessToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, error => {
    return Promise.reject(error);
});

export default apiClient;