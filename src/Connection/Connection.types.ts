import { Socket } from "socket.io";

export interface ListenerRecord {
    event : string,
    callback : any
}

export interface ConnectionConstructor {
    socket : Socket,
    debug_latancy ?: number,
    logLevel ?: number 
}

export type WrappedPayload = {
    data : any
    time : number
}