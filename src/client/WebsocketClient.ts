import { Socket } from "socket.io"
import { io } from "socket.io-client"
import { Logger } from "simpler-logs"
import { Connection } from "../index.shared"

interface Config {
    serverIP        ?: string
    onConnect       ?: Function
    onDisconnect    ?: Function
}

export class WebsocketClient {

    private logger : Logger
    private socket : Socket
    private connection : Connection

    private onConnect : Function
    private onDisconnect : Function

    constructor ( config ?: Config ) {

        config = config || {}
        config.serverIP = config.serverIP || 'localhost:3000'
        const {serverIP} = config

        this.onConnect = config.onConnect || (() => {})
        this.onDisconnect = config.onDisconnect || (() => {})

        this.logger = new Logger('WebsocketServer')
        this.logger.log(`Starting Websocket Client to ip ${serverIP}`)
        
        this.socket = (io('ws://' + serverIP) as unknown) as Socket
        this.connection = new Connection({ socket : this.socket, they_provide_time : true })
        this.socket.on('connect', this.on_connection.bind(this))
        this.socket.on('disconnect', this.on_disconnect.bind(this))

    }

    private on_connection () {
        this.onConnect(this.connection)
    }

    private on_disconnect () {
        this.onDisconnect(this.connection)
    }

    public get_latency () {
        return this.connection.get_latancy()
    }
    public send ( event : string, data ?: any ) {
        this.connection.send(event, data)
    }
    public getId () {
        return this.connection.id
    }

    public get_offset () {
        return this.connection.get_offset()
    }

    public get_trueTime () {
        return this.connection.get_time()
    }

}