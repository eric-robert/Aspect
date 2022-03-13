import * as T from './Handshake.types';
export declare class Handshake {
    private stages;
    private current;
    private has_sent;
    private id;
    private do_open;
    private do_close;
    private do_send;
    private success_callback;
    private failure_callback;
    private logger;
    constructor();
    init(config: T.HandshakeConstructor): void;
    add_stage<Send, Recieved>(stage: T.HandshakeStage): void;
    start(): void;
    private get_name;
    private progress_stage;
    private on_recieve;
}
