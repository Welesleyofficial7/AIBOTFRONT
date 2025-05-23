// src/services/gateway.service.ts
import axios from 'axios';
import { refreshToken } from './AuthService';

const GATEWAY_API_URL = 'http://localhost:8081/api/v1/secure';

const apiClient = axios.create({
    baseURL: GATEWAY_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

let isRefreshing = false;
let failedRequestsQueue: Array<{
    resolve: (value?: any) => void;
    reject: (reason?: any) => void;
}> = [];

apiClient.interceptors.request.use(config => {
    const token = localStorage.getItem('accessToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, error => {
    return Promise.reject(error);
});

apiClient.interceptors.response.use(
    response => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedRequestsQueue.push({ resolve, reject });
                }).then(token => {
                    originalRequest.headers['Authorization'] = `Bearer ${token}`;
                    return axios(originalRequest);
                }).catch(err => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const refreshTokenValue = localStorage.getItem('refreshToken');

                if (!refreshTokenValue) {
                    throw new Error('Refresh token отсутствует');
                }

                const newTokens = await refreshToken(refreshTokenValue);

                localStorage.setItem('accessToken', newTokens.access_token);
                localStorage.setItem('refreshToken', newTokens.refresh_token);

                originalRequest.headers['Authorization'] = `Bearer ${newTokens.access_token}`;

                failedRequestsQueue.forEach(({ resolve }) => resolve(newTokens.access_token));
                failedRequestsQueue = [];

                return axios(originalRequest);
            } catch (err) {
                failedRequestsQueue.forEach(({ reject }) => reject(err));
                failedRequestsQueue = [];

                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('userId');

                window.location.href = '/auth';
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default apiClient;