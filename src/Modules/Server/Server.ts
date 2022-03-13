import { Server, Socket } from "socket.io"
import { Connection } from "../../classes/connection/Connection"
import { SyncableGroup } from "../../classes/syncableGroup/SyncableGroup"
import { SyncLoop } from "../../classes/syncloop/SyncLoop"
import { HandshakeModule } from "../../engine/modules/Handshake.module"
import { EngineModule } from "../../Engine/modules/Module"
import { Events } from "../../events"
import * as T from './Server.types'

export class ServerModule extends EngineModule {

    // Pull from settings
    private port : number
    private ms_per_tick : number
    private ticks_per_sync : number

    private server : Server
    private syncloop : SyncLoop
    private syncGroup : SyncableGroup<Connection>

    // Modules
    private _handshake_module : HandshakeModule
    
    init () {

        // Grab modules
        this._handshake_module = this.engine.withHandshakeModule()

        // Create instances
        this.syncGroup = new SyncableGroup<Connection>()

        // Grab settings
        this.port = this.engine.withSetting( T.ServerSettings.PORT, 3000) as number
        this.ms_per_tick = this.engine.withSetting( T.ServerSettings.MS_PER_TICK, 1000) as number
        this.ticks_per_sync = this.engine.withSetting( T.ServerSettings.TICKS_PER_SYNC, 10) as number

        // Add SyncLoop to handshake
        this._handshake_module.add_stage({
            name : 'syncloop',
            initiate : () => this.syncloop.get_state(),
            recieve : (id : number, _ : boolean, success : () => void) => success()
        })

    }

    start () {

        // Start server
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

    add_to_syncgroup ( connection_id : number, groups : string[] ) {
        this.syncGroup.join_groups( this.syncGroup.get_by_id(connection_id), groups )
    }

    private on_websocket_connection ( socket : Socket ) {
        const connection = new Connection({ socket, options : {} })
        this.logger.log('info', `New connection from ${connection.get_id()}`)

        // Add to sync group
        this.syncGroup.add_entity( connection.get_id(), connection )

        // Run the handshake itself
        this._handshake_module.run_handshake( connection )
            .then( () => { })
            .catch( (err) => { })
    }

    private on_tick () {
        this.event_bus.emit(Events.GAME_TICK)
        this.event_bus.do_processAll()
    }

    private on_sync () {}

}