import React, { useState } from 'react';
import SideBar from '../components/SideBar/SideBar';
import Chat from '../components/Chat/Chat';
import { FloatButton } from 'antd';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import styles from './MainPage.module.css';

const MainPage: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);

  // Зададим ширины Sidebar и вычислим левый отступ кнопки
  // (чтобы она была, например, на 20px правее границы сайдбара)
  const siderWidth = 15;
  const siderCollapsedWidth = 7;
  const offsetFromSidebar = 20;

  const buttonLeft = collapsed
    ? siderCollapsedWidth + offsetFromSidebar  // когда сайдбар свёрнут
    : siderWidth + offsetFromSidebar;         // когда сайдбар развернут

  return (
    <div className={styles.wrapper}>
      <SideBar collapsed={collapsed} />
      <div className={styles.chatWrapper}>
        <Chat />
        
        <FloatButton
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={() => setCollapsed(!collapsed)}
          style={{
            position: 'absolute',
            top: 20,
            left: buttonLeft,
            transition: 'left 0.3s ease', // плавный переход
          }}
        />
      </div>
    </div>
  );
};

export default MainPage;
