import { Socket } from "socket.io"
import { io } from "socket.io-client"
import { Connection } from "../connection/Connection"
import { SyncLoop } from "../syncloop/SyncLoop"
import { SyncLoopSyncData } from "../Syncloop/SyncLoop.types"
import { AspectEngine } from "../engine/Engine"
import { Events, Requests } from "../events"
import * as T from './Client.types'
import { Logger } from "simpler-logs"
import { EventBus } from "../eventbus/EventBus"

export class ClientController  {

    // Pull from settings
    private serverIP : string
 
    // Instances
    private socket : Socket
    private connection : Connection
    private syncloop : SyncLoop
    private logger : Logger
    private eventBus : EventBus

    constructor (private engine : AspectEngine, private onConnect : Function) {
        
        // Grab settings
        this.serverIP = this.engine.withSetting( T.ClientSettings.SERVER_IP, 'localhost:3000') as string

        // Grab instances
        this.eventBus = this.engine.withEventBus()

        // Connect to server
        this.logger = new Logger('Client', 'info')
        this.logger.log('info', `Connecting to ${this.serverIP}`)
        this.socket = (io('ws://' + this.serverIP) as unknown) as Socket
        this.connection = new Connection({ socket : this.socket, options : {} })
        this.socket.on('connect', this.on_server_connection.bind(this))

    }
    
    // Event callbacks

    private async on_server_connection () {

        let syncLoopData = undefined as SyncLoopSyncData

        // Start listeneing for sync loop data
        this.connection.listen(Requests.RECIEVE_SYNC_LOOP, (data : SyncLoopSyncData) => syncLoopData = data)

        // Let client do whatever they want
        await this.on_connect(this.connection)

        // Wait untill we get the data
        this.connection.send(Requests.REQUEST_SYNC_LOOP, {})
        while (!syncLoopData) {
            await new Promise(resolve => setTimeout(resolve, 100))
        }

        // Setup sync loop
        this.syncloop = new SyncLoop({
            ...syncLoopData,
            on_tick : this.on_tick.bind(this)
        })

    }

    private on_tick () {
        this.eventBus.emit(Events.GAME_TICK)
        this.eventBus.do_processAll()
    }

    // Public
    
    public async on_connect ( connection : Connection ) {}
}