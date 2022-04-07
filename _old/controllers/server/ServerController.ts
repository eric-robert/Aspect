import { Logger } from "simpler-logs"
import { Server, Socket } from "socket.io"
import { createServer as createHttpsServer} from "https"
import { createServer as createHttpServer } from "http"
import { Connection } from "../../connection/Connection"
import { MultiMap } from "cubic-array"
import { SyncLoop } from "../../syncloop/SyncLoop"
import { AspectEngine } from "../../engine/AspectEngine"
import { Events, Requests } from "../../engine/events"
import { EventBus } from "../../classes/eventBus/EventBus"
import * as T from './Server.types'
import { SyncController } from "../sync/SyncController"
import { EventsRecorded } from "../action/Actions.types"

export class ServerController {

    // Pull from settings
    private port : number
    private ms_per_tick : number
    private ticks_per_sync : number

    // The actual socket.io server instance
    private server : Server

    // A class to manage the syncloop
    private syncloop : SyncLoop

    // A fancy lookup table that maps connections to world chunks
    private multiMap : MultiMap<string, Connection>

    // For logging
    private logger : Logger

    // Reference to global event bus
    private eventBus : EventBus

    // Reference to sync controllers 
    private syncControllers : SyncController<any,any>[]

    // Events list
    private waitingEvents : Map<Connection, EventsRecorded[]> = new Map()

    constructor (private engine : AspectEngine, private onConnect : Function, private onDisconnect : Function, private onActions : Function) {

        // Create instances
        this.logger = new Logger('Server', 'info')
        this.multiMap = new MultiMap()
        this.eventBus = this.engine.withEventBus()
        this.syncControllers = this.engine.withSyncControllers()

        // Grab settings
        this.port = this.engine.withSetting( T.ServerSettings.PORT, 3000) as number
        this.ms_per_tick = this.engine.withSetting( T.ServerSettings.MS_PER_TICK, 1000) as number
        this.ticks_per_sync = this.engine.withSetting( T.ServerSettings.TICKS_PER_SYNC, 1) as number        

        // Create server if https is enabled
       

        // Start server
        this.logger.log('info', `Starting server on port ${this.port}`)
        this.server = new Server( server, { serveClient: false, cors: {origin: '*'}})
        this.server.on('connection', this.on_websocket_connection.bind(this))
        this.server.on('disconnect', this.on_websocket_disconnect.bind(this))
        server.listen(this.port)

        // Start sync loop
        this.syncloop = new SyncLoop({
            ms_per_tick : this.ms_per_tick,
            ticks_per_sync : this.ticks_per_sync,
            on_tick : this.on_tick.bind(this),
            on_sync : this.on_sync.bind(this)
        })
    }

    // Run the sync loop

    private async on_websocket_connection ( socket : Socket ) {

        const connection = new Connection({ socket, options : {} })
        this.logger.log('debug', `New connection from ${connection.id}`)

        // Add disconnect listener
        socket.on('disconnect', () => this.on_websocket_disconnect(connection))

        // Pepair to receieve data later
        let wantsSync = false
        let wantsConnectionData = false
        connection.listen(Requests.REQUEST_SYNC_LOOP, () => wantsSync = true)
        connection.listen(Requests.REQUEST_CONNECTION_INFO, () => wantsConnectionData = true)
        connection.listen(Requests.ACTION_PUSH_EVENT, data => this.on_clientEvent(connection.id, data))

        // Setup event records
        this.waitingEvents.set(connection, [])

        // Wait for connection data request
        while (!wantsConnectionData) {
            await new Promise(resolve => setTimeout(resolve, 100))
        }
        connection.send(Requests.RECIEVE_CONNECTION_INFO, { id : connection.id })

        // Run whatever
        await this.onConnect( connection )

        // Wait untill they want the sync data
        while (!wantsSync) {
            await new Promise(resolve => setTimeout(resolve, 100))
        }
        connection.send(Requests.RECIEVE_SYNC_LOOP, this.syncloop.get_state())
    }

    private async on_websocket_disconnect ( connection : Connection ) {
        await this.onDisconnect( connection )
    }

    private on_tick () {

        // Process all the events
        const events = {}
        this.waitingEvents.forEach( (v,k) => {
            this.waitingEvents.set(k,[])
            events[k.id] = v
        })
        this.onActions(events)

        //
        this.eventBus.emit(Events.GAME_TICK)
        this.eventBus.do_processAll()
    }

    // Syncing

    private on_sync () {

        const data = this.syncControllers.map(s => ({name : s.name, data : s.get_full_sync()}))
        const connections = this.multiMap.get_allValues()
        const gameTick = this.syncloop.get_tick()

        connections.forEach( connection => {

            const keys = this.multiMap.get_keysByValue(connection)
            const syncs : any = {}

            keys.forEach( key => {
                data.filter( d => d.data[key])
                    .forEach( d => syncs[d.name] = d.data[key])
            })

            connection.send(Requests.GAME_SYNC_EVENT, {syncs, gameTick})
        
        })

    }

    private on_clientEvent ( id : number, data : any ) {

        const connection = this.multiMap.get_byID(id)
        if (!connection) return

        const events = this.waitingEvents.get(connection)
        
        if (!events) this.waitingEvents.set(connection, [data])
        else events.push(data)

    }

    public join_syncgroup ( connection : Connection, group : string ) {
        this.multiMap.add(group, connection)
    }

    public getConnection ( id : number ) {
        return this.multiMap.get_byID(id)
    }

}