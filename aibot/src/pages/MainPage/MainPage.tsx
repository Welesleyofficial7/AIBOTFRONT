import React from 'react';
import styles from './MainPage.module.css';
import SideBar from '../../components/SideBar/SideBar';
import LiquidBubble from "../../components/SideBar/LiquidBubble.tsx";

const MainPage: React.FC<{name: string}> = ({name}) => {
    return (
        <div className={styles.wrapper}>
            
            <SideBar/>
            <LiquidBubble/>
        </div>
    );
}

export default MainPage;