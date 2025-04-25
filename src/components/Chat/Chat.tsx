import React, { useState } from 'react';
import styles from './Chat.module.css';
import ArrowUp from '../../assets/arrowup.svg';
import Mic from '../../assets/mic.svg';
import ArrowDown from '../../assets/arrowdown.svg'; // Нужно добавить эту иконку
import SiriWidget from "../Siri/SiriWidget";

const Chat: React.FC = () => {
    const [message, setMessage] = useState('');
    const [isInputExpanded, setIsInputExpanded] = useState(true);

    const handleSend = () => {
        if (message.trim()) {
            console.log('Отправлено:', message);
            setMessage('');
        }
    };

    const handleVoice = () => {
        console.log("hi");
    };

    const toggleInput = () => {
        setIsInputExpanded(!isInputExpanded);
    };

    return (
        <div className={styles.chat}>
            {/* Область сообщений */}
            <div className={styles.messages}>
                {/* Приветственное сообщение */}
                <div className={styles.welcomeMessage}>
                    <h2>Привет! Я ваш голосовой помощник</h2>
                    <p>Задавайте вопросы или нажмите на микрофон, чтобы начать голосовой ввод</p>
                </div>

                <div className={styles.siriContainer}>
                    <SiriWidget/>
                </div>
            </div>
            {/* Поле ввода */}
            <div className={styles.inputContainer}>
                <button
                    className={`${styles.toggleButton} ${!isInputExpanded ? styles.rotated : ''}`}
                    onClick={toggleInput}
                >
                    <img src={ArrowDown} alt="Toggle input"/>
                </button>
                <div className={`${styles.inputBar} ${isInputExpanded ? styles.expanded : styles.collapsed}`}>
                    <textarea
                        className={styles.customInput}
                        placeholder="Введите ваше сообщение..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                    />
                    <button className={styles.voiceButton} onClick={handleVoice}>
                        <img src={Mic} alt="Voice input" />
                    </button>
                    <button className={styles.sendButton} onClick={handleSend}>
                        <img src={ArrowUp} alt="Send message" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Chat;