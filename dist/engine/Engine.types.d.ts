import { AspectEngine } from "./Engine";
import { Logger } from "winston";
import { EngineModule } from "./modules/Module";
import { HandshakeModule } from "./modules/Handshake.module";
export interface AspectEngineConstuctor {
    modules: ModuleBuilder<EngineModule>[];
    handshakeModule: ModuleBuilder<HandshakeModule>;
    settings: EngineSettings;
}
export interface ModuleBuilder<T> {
    new (engine: AspectEngine, root_logger: Logger): T;
}
export declare type ValidSettings = string | number;
export interface EngineSettings {
    [key: string]: ValidSettings;
}
