// src/services/chat.service.ts

import { ChatDTO } from '../types/ChatDto';
import apiClient from './GatewayService';
import {MessageDTO} from "../types/MessageDTO";

export const getChatsByUser = async (userId: number): Promise<ChatDTO[]> => {
    try {
        const response = await apiClient.get<ChatDTO[]>('/chats', {
            params: { userId },
        });
        return response.data;
    } catch (error) {
        console.error('Ошибка получения чатов:', error);
        throw error;
    }
};

export const createChat = async (chatData: Partial<ChatDTO>): Promise<ChatDTO> => {
    try {
        const response = await apiClient.post<ChatDTO>('/chats', chatData);
        return response.data;
    } catch (error) {
        console.error('Ошибка создания чата:', error);
        throw error;
    }
};

export const getMessagesByChat = async (chatId: number): Promise<MessageDTO[]> => {
    try {
        const response = await apiClient.get<MessageDTO[]>(`/messages/${chatId}`);
        return response.data;
    } catch (error) {
        console.error(`Ошибка загрузки сообщений для чата ${chatId}:`, error);
        throw error;
    }
};

export const sendMessage = async (
    message: Omit<MessageDTO, 'id' | 'timestamp'>
): Promise<MessageDTO> => {
    try {
        const response = await apiClient.post<MessageDTO>('/messages', message);
        return response.data;
    } catch (error) {
        console.error('Ошибка отправки сообщения:', error);
        throw error;
    }
};