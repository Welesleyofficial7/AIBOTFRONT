export interface ChatDTO {
    chatId?: number;
    title: string;
    userId: number;
    messageIds?: number[];
    createdAt?: string;
    modifiedAt?: string;
}