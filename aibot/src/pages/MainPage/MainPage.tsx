import React from 'react';
import styles from './MainPage.module.css';
import SideBar from '../../components/SideBar/SideBar';

const MainPage: React.FC<{name: string}> = ({name}) => {
    return (
        <div className={styles.wrapper}>
            
            <SideBar/>
        </div>
    );
}

export default MainPage;