import React, {useEffect, useState} from 'react';
import SideBar from '../components/SideBar/SideBar';
import Chat from '../components/Chat/Chat';
import { FloatButton } from 'antd';
import { MenuFoldOutlined, MenuUnfoldOutlined, LogoutOutlined } from '@ant-design/icons';
import styles from './MainPage.module.css';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from 'antd';
import {createChat} from "../services/ChatService";

const MainPage: React.FC = () => {
    const [collapsed, setCollapsed] = useState(false);
    const navigate = useNavigate();
    const { isAuthenticated, setAuthenticated, setAccessToken, setRefreshToken } = useAuth();
    const userId = parseInt(localStorage.getItem('userId') || '0');
    const [refreshChats, setRefreshChats] = useState(false);
    const [currentChatId, setCurrentChatId] = useState<number | null>(null);

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userId');
        setAuthenticated(false);
        setAccessToken(null);
        setRefreshToken(null);
        window.location.href = '/auth';
    };

    const handleCreateChat = async (userId: number | undefined) => {
        try {
            const newChat = await createChat({ userId });
            setCurrentChatId(newChat.chatId ?? 0);
            setRefreshChats(prev => !prev);
            return newChat.chatId;
        } catch (error) {
            console.error('Ошибка создания чата:', error);
            throw error;
        }
    };

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/auth');
        }
    }, [isAuthenticated, navigate]);

    const siderWidth = 18;
    const siderCollapsedWidth = 10;
    const offsetFromSidebar = 8;
    const buttonLeft = collapsed ? siderCollapsedWidth + offsetFromSidebar : siderWidth + offsetFromSidebar;

    return (
        <div className={styles.wrapper}>
            <SideBar
                collapsed={collapsed}
                userId={userId}
                selectedChatId={currentChatId}
                setSelectedChatId={setCurrentChatId}
                onChatSelect={(id) => {
                    setCurrentChatId(id);
                    setRefreshChats(prev => !prev);
                }}
                refreshChats={refreshChats}
                setRefreshedChats={setRefreshChats}
            />
            <div className={styles.chatWrapper}>
                <Chat chatId={currentChatId} onCreateChat={handleCreateChat} userId={userId} setSelectedChatId={setCurrentChatId}/>

                <FloatButton
                    icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                    onClick={() => setCollapsed(!collapsed)}
                    style={{
                        position: 'absolute',
                        top: 20,
                        left: buttonLeft,
                        transition: 'left 0.3s ease',
                    }}
                />
            </div>
        </div>
    );
};

export default MainPage;