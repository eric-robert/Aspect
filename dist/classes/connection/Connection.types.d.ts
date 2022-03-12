import { Socket } from "socket.io";
export interface ConnectionConstructor {
    socket: Socket;
    options: {
        debug_latancy?: number;
    };
}
export declare type WrappedPayload<Data> = {
    data: Data;
    time: number;
};
export declare type Callback<T> = (data: T) => void;
export interface ListenerRecord<Data> {
    event: string;
    callback: Callback<WrappedPayload<Data>>;
}
