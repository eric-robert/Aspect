import { Connection } from "../Connection/Connection";
import { HandshakeModule } from "./Handshake.module";

export type HandshakeStage<T> = 
    (   data : T, 
        next : (response : any) => void
    ) => Promise<void>

export interface HandshakeConfig {
    logLevel ?: number,
    connection : Connection,
    stages : HandshakeStage<any>[]
}
export interface HandshakeModuleClass {
    new(AspectEngine, number): HandshakeModule 
}
export type next = (response : any) => void