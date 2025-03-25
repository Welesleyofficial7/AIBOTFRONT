import React from 'react';
import { Input } from 'antd';
import styles from './Chat.module.css';

const { Search } = Input;

const Chat: React.FC = () => {
  return (
    <div className={styles.chat}>
      {/* Блок для сообщений */}
      <div className={styles.messages}>
        {/* Здесь будут выводиться сообщения */}
      </div>
      {/* Поле ввода/поиска прижато к низу */}
      <div className={styles.inputBar}>
        <Search
          placeholder="input search loading with enterButton"
          loading
          enterButton
        />
      </div>
    </div>
  );
};

export default Chat;
