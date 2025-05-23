import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, Divider, message } from 'antd';
import {
    UserOutlined,
    PlusOutlined,
    MessageOutlined,
    LogoutOutlined,
} from '@ant-design/icons';
import styles from './SideBar.module.css';
import logo from '../../assets/logo.svg';
import logo_cut from '../../assets/logo_cut.svg';
import { createChat, getChatsByUser } from '../../services/ChatService';
import { ChatDTO } from '../../types/ChatDto';

const { Sider } = Layout;

interface SideBarProps {
    collapsed: boolean;
    userId: number;
    currentChatId: number | null;
    onChatSelect: (chatId: number | null) => void;
}

const SideBar: React.FC<SideBarProps> = ({ collapsed, userId, currentChatId, onChatSelect }) => {
    const [chats, setChats] = useState<ChatDTO[]>([]);
    const [selectedChatId, setSelectedChatId] = useState<number | null>(null);

    useEffect(() => {
        const fetchChats = async () => {
            try {
                const fetchedChats = await getChatsByUser(userId);
                setChats(fetchedChats);
                if (fetchedChats.length > 0 && !selectedChatId) {
                    const lastChat = fetchedChats[fetchedChats.length - 1];
                    setSelectedChatId(lastChat.chatId || null);
                }
            } catch (error) {
                message.error('Не удалось загрузить чаты');
            }
        };

        fetchChats();
    }, [userId]);

    const createNewChat = async () => {
        try {
            const newChat: Partial<ChatDTO> = { userId };
            const createdChat = await createChat(newChat);
            setChats(prev => [...prev, createdChat]);
            setSelectedChatId(createdChat.chatId || null);
            message.success('Чат создан успешно');
        } catch (error) {
            message.error('Не удалось создать чат');
        }
    };

    const selectChat = (chatId: string) => {
        const id = parseInt(chatId);
        setSelectedChatId(id);
        onChatSelect(id);
    };

    const handleLogoClick = () => {
        setSelectedChatId(null);
        onChatSelect(null);
    };

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userId');
        window.location.href = '/auth';
    };

    return (
        <Sider trigger={null} collapsible collapsed={collapsed} theme='light' className={styles.sidebar}>
            <div className={styles.header}>
                <div className={styles.logo} onClick={() => handleLogoClick()}>
                    <img src={!collapsed ? logo : logo_cut} alt="Logo" className={styles.logoImage} />
                </div>
            </div>

            <div className={styles.newChatButton}>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={createNewChat}
                    block
                >
                    {!collapsed && 'Новый чат'}
                </Button>
            </div>

            <Divider style={{ margin: '12px 0' }} />

            <div className={styles.chatHistory}>
                <Menu
                    theme="light"
                    mode="inline"
                    defaultSelectedKeys={[String(selectedChatId)]}
                    onClick={({ key }) => selectChat(key)}
                >
                    {chats.map(chat => (
                        <Menu.Item key={chat.chatId?.toString() || ''} icon={<MessageOutlined />}>
                            {!collapsed && chat.title || `Чат #${chat.chatId}`}
                        </Menu.Item>
                    ))}
                </Menu>
            </div>

            <Divider style={{ margin: '12px 0' }} />

            <Menu
                theme="light"
                mode="inline"
                items={[
                    { key: 'settings', icon: <UserOutlined />, label: !collapsed && 'Настройки' },
                ]}
                style={{ backgroundColor: "#FFFFFF" }}
            />

            {/* Кнопка Выйти */}
            <div className={styles.logoutButton}>
                <Button
                    type="text"
                    danger
                    icon={<LogoutOutlined />}
                    onClick={handleLogout}
                    block
                    style={{
                        width: '100%',
                        justifyContent: 'flex-start',
                        paddingLeft: 16,
                    }}
                >
                    {!collapsed && 'Выйти'}
                </Button>
            </div>
        </Sider>
    );
};

export default SideBar;