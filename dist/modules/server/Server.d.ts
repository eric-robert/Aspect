import { EngineModule } from "../../Engine/modules/Module";
export declare class ServerModule extends EngineModule {
    private port;
    private ms_per_tick;
    private ticks_per_sync;
    private server;
    private syncloop;
    private syncGroup;
    private _handshake_module;
    init(): void;
    start(): void;
    add_to_syncgroup(connection_id: number, groups: string[]): void;
    private on_websocket_connection;
    private on_tick;
    private on_sync;
}
