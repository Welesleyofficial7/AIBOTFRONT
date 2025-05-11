export type SenderType = 'USER' | 'BOT';

export interface Message {
    id: number;
    chatId: number;
    content: string;
    sender: SenderType;
    timestamp: Date;
}

export interface Chat {
    id: number;
    userId: number;
    title: string;
    createdAt: Date;
}