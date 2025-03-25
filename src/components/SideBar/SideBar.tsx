import React from 'react';
import { Layout, Menu } from 'antd';
import { UserOutlined, VideoCameraOutlined, UploadOutlined } from '@ant-design/icons';
import styles from './SideBar.module.css';

const { Sider } = Layout;

interface SideBarProps {
  collapsed: boolean;
}

const SideBar: React.FC<SideBarProps> = ({ collapsed }) => {
  return (
    <Sider trigger={null} collapsible collapsed={collapsed}>
      <div className={styles.logo} />
      <Menu
        theme="dark"
        mode="inline"
        defaultSelectedKeys={['1']}
        items={[
          { key: '1', icon: <UserOutlined />, label: 'nav 1' },
          { key: '2', icon: <VideoCameraOutlined />, label: 'nav 2' },
          { key: '3', icon: <UploadOutlined />, label: 'nav 3' },
        ]}
      />
    </Sider>
  );
};

export default SideBar;
