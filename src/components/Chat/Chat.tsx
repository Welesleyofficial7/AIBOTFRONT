import React, { useState } from 'react';
import styles from './Chat.module.css';
import ArrowUp from '../../assets/arrowup.svg';

const Chat: React.FC = () => {
  const [message, setMessage] = useState(''); // Состояние для хранения текста сообщения

  const handleSend = () => {
    if (message.trim()) {
      console.log('Отправлено:', message);
      setMessage(''); // Очищаем поле ввода после отправки
    }
  };

  return (
    <div className={styles.chat}>
      {/* Блок для сообщений */}
      <div className={styles.messages}>
        {/* Здесь будут выводиться сообщения */}
      </div>
      {/* Поле ввода/поиска прижато к низу */}
      <div className={styles.inputBar}>
        <textarea
          className={styles.customInput}
          placeholder="Введите ваше сообщение..."
          value={message}
          onChange={(e) => setMessage(e.target.value)} // Обновляем состояние при вводе
        />
        <button className={styles.sendButton} onClick={handleSend}>
          <img src={ArrowUp} alt="" />
        </button>
      </div>
    </div>
  );
};

export default Chat;