import React from 'react';
import { Layout, Menu } from 'antd';
import { UserOutlined, VideoCameraOutlined, UploadOutlined } from '@ant-design/icons';
import styles from './SideBar.module.css';
import logo from '../../assets/logo.svg';

const { Sider } = Layout;

interface SideBarProps {
  collapsed: boolean;
}

const SideBar: React.FC<SideBarProps> = ({ collapsed }) => {
  return (
    <Sider trigger={null} collapsible collapsed={collapsed} theme='light'>
      <div className={styles.header}>
        <div className={styles.logo}>
          <img src={logo} alt="Logo" className={styles.logoImage} />
        </div>
        {/* {!collapsed && <h2 className={styles.title}>RUTberto</h2>} */}
      </div>
      <Menu
        theme="light"
        mode="inline"
        defaultSelectedKeys={['1']}
        items={[
          { key: '1', icon: <UserOutlined />, label: 'nav 1' },
          { key: '2', icon: <VideoCameraOutlined />, label: 'nav 2' },
          { key: '3', icon: <UploadOutlined />, label: 'nav 3' },
        ]}
        style={{backgroundColor: "FFFFFF"}}
      />
    </Sider>
  );
};

export default SideBar;