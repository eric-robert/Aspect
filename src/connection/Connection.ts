import { Socket } from "socket.io";
import * as T from './Connection.types'
import { Metrics } from "./metrics/metrics";
import {Logger} from 'simpler-logs'

export class Connection {

    // Give each connection an id
    private static _id = 0
    public id : number

    private logger : Logger
    private metrics : Metrics
    private socket : Socket

    private debug_latancy : number = 0
    private connectionListeners : Map<number, T.ListenerRecord<any>> = new Map()
   
    constructor ( config : T.ConnectionConstructor ) {

        this.id = ++Connection._id;
        this.socket = config.socket
        this.debug_latancy = config.debug_latancy || 0

        this.logger = new Logger(`Connection ${this.id}`)
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

    send<Data> (event : string, data : Data) {
        const wrapped = this.get_wrapped(data)
        const send = () => { 
            this.socket.emit(event, wrapped) 
            //this.logger.log(`Sending event: '${event}'`)
        }
        setTimeout(send, this.debug_latancy)
    }

    listen<Data> (event : string, callback : T.Callback<Data>) {
        const id = ++Connection._id
        const listener = (wrapped_data : T.WrappedPayload<Data>) => {
            setTimeout( () => {
                const unwrapped = this.get_unwrapped(wrapped_data)
                const response = callback(unwrapped)
                //this.logger.log(`Recieving event: '${event}'`)
                if (event.includes('request')) {
                    this.send(event.replace('request', 'response'), response)
                }
            }, this.debug_latancy )
        }

        const record : T.ListenerRecord<Data> = {event, callback: listener}

        this.socket.on(event, listener)
        this.connectionListeners.set(id, record)

        return id
    }
    
    async wait_for (event : string) {
        return new Promise((resolve, reject) => {
            const id = this.listen(event, data => {
                resolve(data)
                this.remove_listener(id)
            })
        })
        
    }
    
    remove_listener (id : number) {
        const listener = this.connectionListeners.get(id)
        if (!listener) return
        const {event,callback} = listener 
        //this.logger.log(`Removing listener for event: '${event}'`)
        this.connectionListeners.delete(id)
        this.socket.off(event, callback)
    }

    async request (event : string, data ?: any) {
        const response_event = event.replace('request', 'response')
        this.send(event, data)
        const response = await this.wait_for(response_event)
        return response as any
    }

    // Getters

    get_latancy () : number { return this.metrics.get_latancy() }
    set_id (id : number) { 
        this.id = id 
        this.logger = new Logger(`Connection ${this.id}`)
    }


}