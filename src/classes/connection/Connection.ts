import { Socket } from "socket.io";
import {Logger} from "winston"
import * as T from './Connection.types'
import { Metrics } from "./metrics/metrics";

export class Connection {

    private static _id = 0
    private id : number

    private logger : Logger
    private metrics : Metrics
    private socket : Socket

    private debug_latancy : number = 0
    private connectionListeners : Map<number, T.ListenerRecord<any>> = new Map()
   
    constructor ( config : T.ConnectionConstructor, root_logger : Logger ) {

        this.id = ++Connection._id;
        this.logger = root_logger.child({module : `Connection ${this.id}`})

        // Allowed to artificially set latancy
        this.debug_latancy = config.options.debug_latancy || 0

        // Save instanses
        this.socket = config.socket
        this.metrics = new Metrics()

    }

    // Private

    private get_wrapped ( data : any ) {
        return {data, time: Date.now()}
    }

    private get_unwrapped<Data> ( data : T.WrappedPayload<Data> ): Data {
        this.metrics.update_latancy(data.time)
        return data.data
    }

    // Public

    public send<Data> (event : string, data : Data) {
        this.logger.log('debug', `Sending event: '${event}'`)
        const wrapped = this.get_wrapped(data)
        const send = () => this.socket.emit(event, wrapped) 
        setTimeout(send, this.debug_latancy)
    }

    public listen<Data> (event : string, callback : T.Callback<Data>) {
        this.logger.log('debug', `Listening for event: '${event}'`)
        
        const id = ++Connection._id

        const listener = (response : T.WrappedPayload<Data>) => {
            setTimeout( () => {
                callback(this.get_unwrapped(response))
            }, this.debug_latancy )
        }

        const record : T.ListenerRecord<Data> = {event, callback: listener}

        this.socket.on(event, listener)
        this.connectionListeners.set(id, record)

        return id
    }

    public listen_singular (event : string, callback : (data : any) => void) {
        const id = this.listen(event, data => {
            callback(data)
            this.remove_listener(id)
        })
    }
    
    public remove_listener (id : number) {
        const {event,callback} = this.connectionListeners.get(id)
        this.logger.log('debug', `Removing listener for event: '${event}'`)
        this.connectionListeners.delete(id)
        this.socket.off(event, callback)
    }

    // Getters

    public get_latancy () : number { return this.metrics.get_latancy() }
    public get_id () : number { return this.id }


}