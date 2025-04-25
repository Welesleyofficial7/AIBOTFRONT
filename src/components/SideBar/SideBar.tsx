import React, { useState } from 'react';
import { Layout, Menu, Button, Divider } from 'antd';
import {
    UserOutlined,
    VideoCameraOutlined,
    UploadOutlined,
    PlusOutlined,
    MessageOutlined
} from '@ant-design/icons';
import styles from './SideBar.module.css';
import logo from '../../assets/logo.svg';

const { Sider } = Layout;

interface SideBarProps {
    collapsed: boolean;
}

interface Chat {
    id: string;
    title: string;
}

const SideBar: React.FC<SideBarProps> = ({ collapsed }) => {
    const [chats, setChats] = useState<Chat[]>([
        { id: '1', title: 'Чат 1' },
        { id: '2', title: 'Чат 2' },
    ]);

    // Заглушка для создания нового чата
    const createNewChat = () => {
        const newChatId = Date.now().toString();
        const newChat = {
            id: newChatId,
            title: `Чат ${chats.length + 1}`
        };
        setChats([...chats, newChat]);
        // Здесь будет вызов API для создания нового чата
        console.log('Создан новый чат:', newChat);
    };

    // Заглушка для выбора чата
    const selectChat = (chatId: string) => {
        // Здесь будет вызов API для загрузки выбранного чата
        console.log('Выбран чат:', chatId);
    };

    return (
        <Sider trigger={null} collapsible collapsed={collapsed} theme='light' className={styles.sidebar}>
            <div className={styles.header}>
                <div className={styles.logo}>
                    <img src={logo} alt="Logo" className={styles.logoImage} />
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
                    defaultSelectedKeys={['1']}
                    onClick={({ key }) => selectChat(key)}
                >
                    {chats.map(chat => (
                        <Menu.Item key={chat.id} icon={<MessageOutlined />}>
                            {!collapsed && chat.title}
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
                    { key: 'help', icon: <VideoCameraOutlined />, label: !collapsed && 'Помощь' },
                    { key: 'about', icon: <UploadOutlined />, label: !collapsed && 'О проекте' },
                ]}
                style={{ backgroundColor: "#FFFFFF" }}
            />
        </Sider>
    );
};

export default SideBar;