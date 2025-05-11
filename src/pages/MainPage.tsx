import React, { useState } from 'react';
import SideBar from '../components/SideBar/SideBar';
import Chat from '../components/Chat/Chat';
import { FloatButton } from 'antd';
import { MenuFoldOutlined, MenuUnfoldOutlined, LogoutOutlined } from '@ant-design/icons';
import styles from './MainPage.module.css';
import { useAuth } from '../contexts/AuthContext';
import { Button } from 'antd';

const MainPage: React.FC = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [currentChatId, setCurrentChatId] = useState<number | null>(null);

    const { isAuthenticated, setAuthenticated, setAccessToken, setRefreshToken } = useAuth();
    const userId = parseInt(localStorage.getItem('userId') || '0');

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userId');
        setAuthenticated(false);
        setAccessToken(null);
        setRefreshToken(null);
        window.location.href = '/auth';
    };

    const siderWidth = 200;
    const siderCollapsedWidth = 80;
    const offsetFromSidebar = 20;
    const buttonLeft = collapsed ? siderCollapsedWidth + offsetFromSidebar : siderWidth + offsetFromSidebar;

    return (
        <div className={styles.wrapper}>
            <SideBar
                collapsed={collapsed}
                userId={userId}
                currentChatId={currentChatId}
                onChatSelect={setCurrentChatId}
            />
            <div className={styles.chatWrapper}>
                <Chat chatId={currentChatId} />

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

                <Button
                    type="primary"
                    danger
                    icon={<LogoutOutlined />}
                    onClick={handleLogout}
                    style={{
                        position: 'absolute',
                        top: 20,
                        right: 20,
                    }}
                >
                    Выйти
                </Button>
            </div>
        </div>
    );
};

export default MainPage;