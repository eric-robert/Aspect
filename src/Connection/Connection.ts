import { Socket } from "socket.io";
import { Logger } from "../Logging/Logging";
import { LogLevel } from "../Logging/Logging.types";
import { ListenerRecord, ConnectionConstructor, WrappedPayload } from "./Connection.types";
import { ConnectionMetrics } from "./ConnectionMetrics";

export class Connection {

    private static _id = 0
    private id : number

    private logger : Logger
    private metrics : ConnectionMetrics

    private socket : Socket
    private debug_latancy : number = 0
    private connectionListeners : Map<number, ListenerRecord> = new Map()
   
    /**
     * A connection is a wrapper around a socket.io socket.
     * This wrapper logs requests and records latancy across the network
     * Useful for debugging and testing
     * @param config 
     */
    constructor ( config : ConnectionConstructor ) {

        // Allowed to artificially set latancy
        config.debug_latancy = config.debug_latancy || 0
        config.logLevel = config.logLevel || LogLevel.INFO

        // Save values
        this.debug_latancy = config.debug_latancy
        this.id = ++Connection._id;
        this.logger = new Logger(`Connection ${this.id}`, config.logLevel)
        this.socket = config.socket
        this.metrics = new ConnectionMetrics()

    }

    /**
     * Send a given payload across the connection.
     * The other end must have a listener set up for this event to recieve
     * @param event String for socket.io event
     * @param data Stringifyable data to send
     */
    send (event : string, data : any) {
        this.logger.log(`Sending event: '${event}'`)
        const time = Date.now()
        const payload : WrappedPayload= {data, time}
        const send = () => this.socket.emit(event, payload) 
        setTimeout(send, this.debug_latancy)
    }

    /**
     * Set up a listener for a given event.
     * @param event String for socket.io event
     * @param callback Function to call when event is recieved
     * @returns ID of listener
     */
    listen (event : string, callback : (data : any) => void) {
        this.logger.log(`New Listener for event: '${event}'`)
        const id = ++Connection._id

        const listener = (response : WrappedPayload) => {
            const process = () => {
                this.metrics.update_latancy(response.time)
                callback ( response.data )
            }
            setTimeout( process, this.debug_latancy )
        }

        const record : ListenerRecord = {event, callback: listener}

        this.socket.on(event, listener)
        this.connectionListeners.set(id, record)

        return id
    }

    /**
     * Listen for a single event once.
     * After an event is recieved, the listener is removed.
     * @param event String for socket.io event
     * @param callback Function to call when event is recieved
     */
    listen_singular (event : string, callback : (data : any) => void) {
        const id = this.listen(event, data => {
            callback(data)
            this.remove_listener(id)
        })
    }
    
    /**
     * Remove a listener for a given event.
     * @param id ID of listener to remove
     */
    remove_listener (id : number) {
        const {event,callback} = this.connectionListeners.get(id)
        this.logger.log(`Removing Listener for event: '${event}'`)
        this.connectionListeners.delete(id)
        this.socket.off(event, callback)
    }

    // Getters

    /**
     * @returns Latancy of connection in ms
     */
    get_latancy () : number { return this.metrics.get_latancy() }

    /**
     * @returns Unique ID of connection, magnitude has no meaning in this context
     */
    get_id () : number { return this.id }


}