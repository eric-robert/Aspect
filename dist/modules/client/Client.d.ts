import { Connection } from "../../classes/connection/Connection";
import { EngineModule } from "../../Engine/modules/Module";
export declare class ClientModule extends EngineModule {
    private serverIP;
    private socket;
    private connection;
    private syncloop;
    private _handshake_module;
    init(): void;
    start(): void;
    private on_server_connection;
    private on_sync_loop_sync;
    private on_tick;
    get_connection(): Connection;
}
