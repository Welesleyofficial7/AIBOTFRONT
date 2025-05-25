import React, { useState, useEffect, useRef, useCallback } from 'react';
import styles from './Chat.module.css';
import ArrowUp from '../../assets/arrowup.svg';
import Mic from '../../assets/mic.svg';
import ArrowDown from '../../assets/arrowdown.svg';
import SiriWidget from "../Siri/SiriWidget";
import SockJS from "sockjs-client";
import { Client } from '@stomp/stompjs';
import { MessageDTO } from '../../types/MessageDTO';
import { getMessagesByChat, createChat } from '../../services/ChatService';

interface ChatProps {
    chatId: number | null;
    userId: number;
    onCreateChat: (userId: number | undefined) => Promise<number | undefined>;
    setSelectedChatId: (chatId: number| null) => void;
    setHasInteracted: (chatId: boolean) => void;
    hasInteracted: boolean;
}

const Chat: React.FC<ChatProps> = ({ chatId , onCreateChat, userId, setSelectedChatId, setHasInteracted, hasInteracted}) => {
    const [message, setMessage] = useState('');
    const [isInputExpanded, setIsInputExpanded] = useState(false);
    const [messages, setMessages] = useState<MessageDTO[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const clientRef = useRef<Client | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isWidgetMinimized, setIsWidgetMinimized] = useState(false);
    const [isRecording, setIsRecording] = useState(false);

    const handleWidgetMinimize = () => {
        setIsWidgetMinimized(true);
        setHasInteracted(true);
    };

    const handleWidgetInteraction = (listening: boolean) => {
        setIsRecording(listening);
    };

    const LoadingIndicator = () => (
        <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <span className={styles.loadingText}>Ответ на подходе...</span>
        </div>
    );

    const base64ToBlob = (base64: string, contentType: string) => {
        const byteCharacters = atob(base64);
        const byteArrays = [];
        for (let offset = 0; offset < byteCharacters.length; offset += 512) {
            const slice = byteCharacters.slice(offset, offset + 512);
            const byteNumbers = new Array(slice.length);
            for (let i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
        }
        return new Blob(byteArrays, { type: contentType });
    };

    const playAudio = useCallback((base64Data: string) => {
        try {
            // Останавливаем предыдущее аудио
            if (audioRef.current) {
                audioRef.current.pause();
                URL.revokeObjectURL(audioRef.current.src);
            }

            console.log(base64Data);

            const audioBlob = base64ToBlob(base64Data, 'audio/mpeg');
            const audioUrl = URL.createObjectURL(audioBlob);
            const newAudio = new Audio(audioUrl);

            // Очистка при окончании воспроизведения
            newAudio.onended = () => {
                URL.revokeObjectURL(audioUrl);
                audioRef.current = null;
            };

            // Сохраняем ссылку и запускаем
            audioRef.current = newAudio;
            newAudio.play().catch(error => {
                console.error('Автовоспроизведение заблокировано:', error);
            });
        } catch (error) {
            console.error('Ошибка воспроизведения аудио:', error);
        }
    }, []);

    useEffect(() => {
        return () => {
            // Очистка при размонтировании компонента
            if (audioRef.current) {
                audioRef.current.pause();
                URL.revokeObjectURL(audioRef.current.src);
                audioRef.current = null;
            }
        };
    }, []);

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
        setHasInteracted(true);
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
                                audioData: receivedMessage.audioData
                            };
                            console.log("HERE SHOULD BE " + receivedMessage.sender);
                            setMessages(prev => [...prev, botMessage]);
                            // Автовоспроизведение при получении аудио
                            if (receivedMessage.sender === 'BOT') {
                                playAudio(receivedMessage.audioData);
                                setIsLoading(false);
                            }

                        }
                    } catch (error) {
                        setIsLoading(false);
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
    }, [chatId, playAudio]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = useCallback(async () => {
        if (!message.trim()) return;

        setIsLoading(true);
        console.log('OUT');
        try {
            let effectiveChatId = chatId;

            // Создаем новый чат, если не выбран
            if (!effectiveChatId) {
                const newChatId = await onCreateChat(userId);
                if (!newChatId) {
                    throw new Error("Не удалось создать чат");
                }
                effectiveChatId = newChatId;
                setSelectedChatId(newChatId);
                console.log('IN');
            }

            // Отправляем сообщение
            if (clientRef.current?.connected) {
                const payload = {
                    content: message,
                    sender: 'USER',
                    chatId: effectiveChatId
                };

                clientRef.current.publish({
                    destination: '/app/chat.sendMessage',
                    body: JSON.stringify(payload)
                });
            }

            setMessage('');
        } catch (error) {
            console.error("Ошибка отправки сообщения:", error);
        } finally {
            setIsLoading(false);
        }
    }, [message, chatId, onCreateChat, userId]);

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
                        {isLoading && <LoadingIndicator />}
                        <div ref={messagesEndRef} />
                    </>
                ) : (<div>
                        <div className={styles.welcomeMessage}>
                            <h2>Привет! Я ваш голосовой помощник</h2>
                            <p>Выберите чат или создайте новый</p>
                        </div>
                        {!hasInteracted && !chatId && (
                            <div className={styles.siriContainer}>
                                <SiriWidget
                                    onMinimize={handleWidgetMinimize}
                                    onListeningChange={handleWidgetInteraction}
                                />
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Поле ввода */}
            {/* Поле ввода */}
            <div className={styles.inputRow}>
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

                {(hasInteracted && chatId) && (
                    <div className={`${styles.widgetContainer} ${isRecording ? styles.recording : ''}`}>
                        <SiriWidget
                            onMinimize={handleWidgetMinimize}
                            onListeningChange={handleWidgetInteraction}
                            minimized={true}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default Chat;