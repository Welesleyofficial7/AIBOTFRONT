import axios from 'axios';

const API_URL = 'http://localhost:8082/api/v1'; // Замените на порт вашего бэкенда

interface AuthRequest {
    username: string;
    password: string;
}

interface UserResponse {
    userId: number;
    username: string;
    email: string;
}

interface RefreshRequest {
    refreshToken: string;
}

interface RegisterRequest {
    email: string;
    password: string;
}

interface TokenResponse {
    access_token: string;
    refresh_token: string;
    token_type: string;
    expires_in: number;
    refresh_expires_in: number;
    scope: string;
}

const login = async (credentials: AuthRequest): Promise<TokenResponse> => {
    try {
        const response = await axios.post<TokenResponse>(`${API_URL}/token`, credentials);
        return response.data;
    } catch (error) {
        console.error('Error logging in:', error);
        throw error;
    }
};

const refreshToken = async (refreshToken: string): Promise<TokenResponse> => {
    try {
        const response = await axios.post<TokenResponse>(`${API_URL}/token/refresh`, { refreshToken });
        return response.data;
    } catch (error) {
        console.error('Error refreshing token:', error);
        throw error;
    }
};

const register = async (userData: RegisterRequest): Promise<void> => {
    try {
        await axios.post(`${API_URL}/register`, userData);
    } catch (error) {
        console.error('Error registering user:', error);
        throw error;
    }
};

const getUserByEmail = async (email: string): Promise<UserResponse> => {
    const token = localStorage.getItem('accessToken');
    const response = await axios.get<UserResponse>(
        `http://localhost:8083/api/users/email/${email}`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );
    return response.data;
};

export { login, refreshToken, register, getUserByEmail };