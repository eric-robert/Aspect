export declare type FailCallback = (error: string) => void;
export declare type SuccessCallback = (data?: any) => void;
export interface HandshakeStage<Sent, Recieved> {
    name: string;
    initiate?(id: number): Sent;
    recieve(id: number, data: Recieved, success: SuccessCallback, fail: FailCallback): void;
}
export declare type Open = (event: string, listen: (data: any) => void) => void;
export declare type Close = () => void;
export declare type Send = (data: any) => void;
export interface HandshakeConstructor {
    id: number;
    on_finish: () => void;
    on_failure: () => void;
    on_open: Open;
    on_close: Close;
    on_send: Send;
}
