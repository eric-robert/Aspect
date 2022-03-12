export type FailCallback = (error : string) => void
export type SuccessCallback = (data ?: any) => void

export interface HandshakeStage<Sent, Recieved> { 
    name : string
    initiate ? () : Sent
    recieve (data : Recieved, success : SuccessCallback, fail : FailCallback) : void
}

export type Open = (event : string, listen : (data : any) => void ) => void
export type Close = () => void
export type Send = (data : any) => void

export interface HandshakeConstructor {
    on_finish : () => void
    on_failure : () => void
    on_open : Open
    on_close : Close
    on_send : Send
}