import React, { useState, useEffect, useRef, useCallback } from 'react';
import styles from './Chat.module.css';
import ArrowUp from '../../assets/arrowup.svg';
import Mic from '../../assets/mic.svg';
import ArrowDown from '../../assets/arrowdown.svg';
import SiriWidget from "../Siri/SiriWidget";
import SockJS from "sockjs-client";
import { Client } from '@stomp/stompjs';
import { MessageDTO } from '../../types/MessageDTO';

import { getMessagesByChat } from '../../services/ChatService';

interface ChatProps {
    chatId: number | null;
}

const Chat: React.FC<ChatProps> = ({ chatId }) => {
    const [message, setMessage] = useState('');
    const [isInputExpanded, setIsInputExpanded] = useState(true);
    const [messages, setMessages] = useState<MessageDTO[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const clientRef = useRef<Client | null>(null);

    useEffect(() => {
        if (chatId) {
            loadMessages(chatId);
        } else {
            setMessages([]);
        }
    }, [chatId]);

    const loadMessages = async (chatId: number) => {
        try {
            const data = await getMessagesByChat(chatId);
            setMessages(data);
        } catch (error) {
            console.error(`Ошибка загрузки сообщений для чата ${chatId}:`, error);
        }
    };

    useEffect(() => {
        const socket = new SockJS('http://localhost:8081/ws');
        const stompClient = new Client({
            webSocketFactory: () => socket,
            connectHeaders: {
                Authorization: `Bearer ${localStorage.getItem('accessToken')}`
            },
            debug: (str) => console.log(str),
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,

            onConnect: () => {
                console.log("Connected to WebSocket");

                stompClient.subscribe(`/topic/public`, (msg) => {
                    try {
                        const receivedMessage = JSON.parse(msg.body);
                        if (receivedMessage.chatId === chatId) {
                            const botMessage: MessageDTO = {
                                id: Date.now(),
                                sender: receivedMessage.sender,
                                content: receivedMessage.content || receivedMessage.response,
                                chatId: chatId,
                            };
                            console.log("HERE SHOULD BE " + receivedMessage.sender);
                            setMessages(prev => [...prev, botMessage]);
                        }
                    } catch (error) {
                        console.error("Ошибка при обработке WebSocket сообщения:", error);
                    }
                });

                clientRef.current = stompClient;
            },

            onStompError: (error) => {
                console.error("Ошибка STOMP:", error.headers['message']);
            },

            onWebSocketClose: (event) => {
                console.log("WebSocket закрыт", event);
            }
        });

        stompClient.activate();

        return () => {
            if (clientRef.current) {
                clientRef.current.deactivate();
                clientRef.current = null;
            }
        };
    }, [chatId]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = useCallback(() => {
        if (!message.trim() || !chatId) return;

        if (!clientRef.current || !clientRef.current.connected) {
            console.warn("WebSocket не подключен");
            return;
        }

        const payload = {
            content: message,
            sender: 'USER',
            chatId: chatId
        };

        clientRef.current.publish({
            destination: '/app/chat.sendMessage',
            body: JSON.stringify(payload)
        });

        setMessage('');
    }, [message, chatId]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className={styles.chat}>
            {/* Сообщения */}
            <div className={styles.messages}>
                {chatId ? (
                    <>
                        {messages.length === 0 && <p>Нет сообщений. Напишите что-нибудь!</p>}
                        {messages.map((msg, index) => (
                            <div
                                key={msg.id || index}
                                className={`${styles.message} ${msg.sender === 'USER' ? styles.userMessage : styles.botMessage}`}
                            >
                                <pre>{msg.content}</pre>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </>
                ) : (<div>
                        <div className={styles.welcomeMessage}>
                            <h2>Привет! Я ваш голосовой помощник</h2>
                            <p>Выберите чат или создайте новый</p>
                        </div>
                        <div className={styles.siriContainer}>
                            <SiriWidget />
                        </div>
                    </div>
                )}
            </div>

            {/* Поле ввода */}
            <div className={styles.inputContainer}>
                <button
                    className={`${styles.toggleButton} ${!isInputExpanded ? styles.rotated : ''}`}
                    onClick={() => setIsInputExpanded(!isInputExpanded)}
                >
                    <img src={ArrowDown} alt="Toggle input" />
                </button>
                <div className={`${styles.inputBar} ${isInputExpanded ? styles.expanded : styles.collapsed}`}>
                    <textarea
                        className={styles.customInput}
                        placeholder="Введите ваше сообщение..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                    <button className={styles.voiceButton} onClick={() => console.log("Голосовой ввод")}>
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