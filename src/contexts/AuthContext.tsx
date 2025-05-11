import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
    isAuthenticated: boolean;
    setAuthenticated: (isAuthenticated: boolean) => void;
    accessToken: string | null;
    setAccessToken: (accessToken: string | null) => void;
    refreshToken: string | null;
    setRefreshToken: (refreshToken: string | null) => void;
}

const AuthContext = createContext<AuthContextType>({
    isAuthenticated: false,
    setAuthenticated: () => {},
    accessToken: null,
    setAccessToken: () => {},
    refreshToken: null,
    setRefreshToken: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isAuthenticated, setAuthenticated] = useState(false);
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [refreshToken, setRefreshToken] = useState<string | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        const refreshTokenFromStorage = localStorage.getItem('refreshToken');

        if (token && refreshTokenFromStorage) {
            setAuthenticated(true);
            setAccessToken(token);
            setRefreshToken(refreshTokenFromStorage);
        }
    }, []);

    return (
        <AuthContext.Provider value={{ isAuthenticated, setAuthenticated, accessToken, setAccessToken, refreshToken, setRefreshToken }}>
    {children}
    </AuthContext.Provider>
);
};

export default AuthContext;