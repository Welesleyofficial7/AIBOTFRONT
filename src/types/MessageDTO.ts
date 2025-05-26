export interface MessageDTO {
    id?: number;
    chatId: number | any;
    content: string;
    sender: 'USER' | 'BOT';
    audioData: string;
    audioMessage: boolean;
}