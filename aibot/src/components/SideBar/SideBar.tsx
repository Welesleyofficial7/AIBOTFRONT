import React, { useState } from 'react';
import { AsideHeader, MenuItem } from '@gravity-ui/navigation';
import styles from './SideBar.module.css';

// Пример данных для menuItems
const items: MenuItem[] = [
    {
        id: "1",
        title: 'Item 1',
        icon: 'icon-name',
        onItemClick: () => console.log('Item 1 clicked'),
    },
    {
        id: "2",
        title: 'Item 2',
        icon: 'icon-name',
        onItemClick: () => console.log('Item 2 clicked')
    },
];

function openSideBar(compact: boolean) {
    console.log("Navigation compact state changed:", compact);
}

const SideBar: React.FC = () => {
    const [isCompact, setIsCompact] = useState(true);

    const toggleCompact = () => {
        setIsCompact(!isCompact);
        console.log("Navigation compact state changed:", isCompact);
    };

    return (
        <div>
            <AsideHeader 
                compact={isCompact} // Используем состояние компонента для управления свойством compact
                collapseTitle='Свернуть' 
                expandTitle='Развернуть'
                onChangeCompact={toggleCompact}
                menuItems={items}
                customBackgroundClassName={styles.sidebarwrapper}
            />
        </div>
    );
}

export default SideBar;