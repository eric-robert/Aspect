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

    private you_provide_time : boolean = false
    private they_provide_time : boolean = false
   
    constructor ( config : T.ConnectionConstructor ) {

        this.id = ++Connection._id;
        this.socket = config.socket
        this.debug_latancy = config.debug_latancy || 0

        this.you_provide_time = config.you_provide_time
        this.they_provide_time = config.they_provide_time

        this.logger = new Logger(`Connection ${this.id}`)

        // For metrics
        this.listen('latancy_ping', this.recieve_latancy_ping)
        this.listen('finish-latancy-ping', this.finish_latancy_ping)
        this.metrics = new Metrics()
        setInterval( () => { this.send_latancy_ping()}, 50)

    }

    send_latancy_ping () {
        this.send('latancy_ping', {
            local_0: Date.now()
        })
    }

    recieve_latancy_ping (data) {
        this.send('finish-latancy-ping', {
            ...data,
            remote_1: Date.now()
        })
    }

    finish_latancy_ping (data) {
        const {local_0, remote_1} = data
        this.metrics.update_latancy({
            Local_0: local_0,
            Remote_1: remote_1,
            Local_2: Date.now()
        })
    }


    // Public

    send<Data> (event : string, data : Data) {
        const send = () => { 
            this.socket.emit(event, data) 
        }
        setTimeout(send, this.debug_latancy)
    }

    listen<Data> (event : string, callback : T.Callback<Data>) {
        const id = ++Connection._id
        const listener = (data : Data) => {
            setTimeout( () => {
                const response = callback(data)
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

    get_latancy () : number { 
        return this.metrics.get_latancy() 
    }
    get_time () {
        if (this.you_provide_time) {
            return Date.now()
        }
        if (this.they_provide_time) {
            return this.metrics.get_offset() + Date.now()
        }
    }
    set_id (id : number) { 
        this.id = id 
        this.logger = new Logger(`Connection ${this.id}`)
    }


}