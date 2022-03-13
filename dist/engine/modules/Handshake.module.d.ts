import { Connection } from "../../classes/connection/Connection";
import { HandshakeStage } from "../../classes/handshake/Handshake.types";
import { EngineModule } from "./Module";
export declare class HandshakeModule extends EngineModule {
    private stages;
    add_stage(stage: HandshakeStage): void;
    run_handshake(connection: Connection): Promise<unknown>;
}
