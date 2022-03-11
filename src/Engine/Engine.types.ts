import { HandshakeModule } from "../Handshake/Handshake.module"
import { HandshakeModuleClass } from "../Handshake/Handshake.types"
import { EngineModule } from "./EngineModule"

export interface EngineType {}

export interface ModuleClass {
    new(AspectEngine, number): EngineModule 
}

export interface EngineConstructor {
    logLevel ?: number,
    settings : EngineSettings

    modules : ModuleClass[],
    handshake : HandshakeModuleClass
}
export type ValidSettings = string | number
export interface EngineSettings {
    [key: string]: ValidSettings
}

export const EngineEvents = {
    GameTick : "GameTick"
}