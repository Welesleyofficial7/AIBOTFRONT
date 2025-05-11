declare module 'sockjs-client' {
    import { EventEmitter } from 'events';

    class SockJS extends EventEmitter {
        constructor(url?: string, protocols?: string | string[], options?: any);
        send(data: string): void;
        close(code?: number, reason?: string): void;
        static CONNECTING: number;
        static OPEN: number;
        static CLOSING: number;
        static CLOSED: number;
        readonly readyState: number;
    }

    export default SockJS;
}