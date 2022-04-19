import { Socket } from "socket.io";

export interface ConnectionNetworkedData {
    id: number;
}

export interface ConnectionConstructor {
    socket : Socket,
    debug_latancy ?: number
    you_provide_time ?: boolean
    they_provide_time ?: boolean
}

export type WrappedPayload<Data> = {
    data : Data
    time : number
}

export type Callback<T> = (data : T) => void

export interface ListenerRecord<Data> {
    event : string,
    callback : Callback<Data>
}
