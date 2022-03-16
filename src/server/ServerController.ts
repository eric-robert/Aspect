import { Logger } from "simpler-logs"
import { Server, Socket } from "socket.io"
import { Connection } from "../connection/Connection"
import { SyncableGroup } from "../syncableGroup/SyncableGroup"
import { SyncLoop } from "../syncloop/SyncLoop"
import { AspectEngine } from "../engine/Engine"
import { Events, Requests } from "../events"
import { EventBus } from "../eventbus/EventBus"
import * as T from './Server.types'

export class ServerController {

    // Pull from settings
    private port : number
    private ms_per_tick : number
    private ticks_per_sync : number

    private server : Server
    private syncloop : SyncLoop
    private syncGroup : SyncableGroup<Connection>

    private logger : Logger
    private eventBus : EventBus

    constructor (private engine : AspectEngine, private onConnect : Function) {

        // Create instances
        this.syncGroup = new SyncableGroup<Connection>()
        this.eventBus = this.engine.withEventBus()

        // Grab settings
        this.port = this.engine.withSetting( T.ServerSettings.PORT, 3000) as number
        this.ms_per_tick = this.engine.withSetting( T.ServerSettings.MS_PER_TICK, 1000) as number
        this.ticks_per_sync = this.engine.withSetting( T.ServerSettings.TICKS_PER_SYNC, 10) as number        

        // Start server
        this.logger = new Logger('Server', 'info')
        this.logger.log('info', `Starting server on port ${this.port}`)
        this.server = new Server( this.port, { serveClient: false, cors: {origin: '*'}})
        this.server.on('connection', this.on_websocket_connection.bind(this))

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
        this.logger.log('info', `New connection from ${connection.get_id()}`)

        // Add to sync group
        this.syncGroup.add_entity( connection.get_id(), connection )

        let wantsSync = false
        connection.listen(Requests.REQUEST_SYNC_LOOP, () => wantsSync = true)

        // Run whatever
        await this.onConnect( connection )

        // Wait untill they want the data
        while (!wantsSync) {
            await new Promise(resolve => setTimeout(resolve, 100))
        }

        // Send sync loop data
        connection.send(Requests.RECIEVE_SYNC_LOOP, this.syncloop.get_state())
    }

    private on_tick () {
        this.eventBus.emit(Events.GAME_TICK)
        this.eventBus.do_processAll()
    }

    // Syncing

    private on_sync () {}

    // Adding connections to different groups

    public add_to_syncgroup ( connection_id : number, groups : string[] ) {
        this.syncGroup.join_groups( this.syncGroup.get_by_id(connection_id), groups )
    }


}