import React, { useState } from 'react';
import styles from './Chat.module.css';
import ArrowUp from '../../assets/arrowup.svg';
import Mic from '../../assets/mic.svg';
import SiriWidget from "../Siri/SiriWidget";

const Chat: React.FC = () => {
    const [message, setMessage] = useState('');

    const handleSend = () => {
        if (message.trim()) {
            console.log('Отправлено:', message);
            setMessage('');
        }
    };

    const handleVoice = () => {
        console.log("hi");
    };

    return (
        <div className={styles.chat}>
            {/* Область сообщений */}
            <div className={styles.messages}>
                <div className={styles.siriContainer}>
                    <SiriWidget />
                </div>
            </div>
            {/* Поле ввода */}
            <div className={styles.inputBar}>
        <textarea
            className={styles.customInput}
            placeholder="Введите ваше сообщение..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
        />
                <button className={styles.voiceButton} onClick={handleVoice}>
                    <img src={Mic} alt="" />
                </button>
                <button className={styles.sendButton} onClick={handleSend}>
                    <img src={ArrowUp} alt="" />
                </button>
            </div>
        </div>
    );
};

export default Chat;
