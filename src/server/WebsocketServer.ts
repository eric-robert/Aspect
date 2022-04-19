import { createServer as createHttpsServer} from "https"
import { createServer as createHttpServer } from "http"
import { Logger } from "simpler-logs"
import { Server, Socket } from "socket.io"
import { Connection } from "../index.shared"
import { MultiMap } from "cubic-array"

interface Config {
    port            ?: number
    https_key       ?: string
    https_cert      ?: string
    onConnect       ?: Function
    onDisconnect    ?: Function
}

export class WebsocketServer {

    private logger : Logger
    private server : Server

    private onConnect : Function
    private onDisconnect : Function

    private clients : MultiMap<string, Connection>

    constructor ( config ?: Config ) {

        config = config || {}
        config.port = config.port || 3000
        config.https_key = config.https_key || ''
        config.https_cert = config.https_cert || ''
        const {port} = config

        this.onConnect = config.onConnect || (() => {})
        this.onDisconnect = config.onDisconnect || (() => {})

        this.logger = new Logger('WebsocketServer')
        this.logger.log(`Starting Websocket Server on port ${port}`)
        this.clients = new MultiMap()

        this.server = new Server( port, { 
            serveClient: false, 
            cors: {
                origin: '*', 
                methods : ['GET', 'POST', 'PUT', 'DELETE']
            }
        })
        this.server.on('connection', this.on_connection.bind(this))

    }

    private on_connection ( socket : Socket ) {

        const connection = new Connection({ socket, you_provide_time: true  })
        socket.on('disconnect', () => this.on_disconnect( connection ))
        this.onConnect(connection)

    }

    private on_disconnect ( connection : Connection ) {

        this.clients.deleteValue(connection)
        this.clients.deleteID(connection.id)
        this.onDisconnect(connection)
    
    }

    // Access

    public joinGroup ( group : string, connection : Connection ) {
        this.clients.add(group, connection)
    }

    public leaveGroup ( group : string, connection : Connection ) {
        this.clients.removePair(group, connection)
    }

    public getAll () : Connection[] {
        return this.clients.get_allValues()
    }

    public getGroups ( connection : Connection) : string[] {
        return [...this.clients.get_keysByValue(connection)]
    }

    public getConnections ( group : string ) : Connection[] {
        return [...this.clients.get_valuesByKey(group)]
    }

}