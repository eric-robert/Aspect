import { Server, Socket } from "socket.io"
import { io } from "socket.io-client"
import { Connection } from "../../classes/connection/Connection"
import { SyncLoop } from "../../classes/syncloop/SyncLoop"
import { SyncLoopSyncData } from "../../classes/Syncloop/SyncLoop.types"
import { HandshakeModule } from "../../engine/modules/Handshake.module"
import { EngineModule } from "../../Engine/modules/Module"
import { Events } from "../../events"
import * as T from './Client.types'

export class ClientModule extends EngineModule {

    // Pull from settings
    private serverIP

    // Instances
    private socket : Socket
    private connection : Connection
    private syncloop : SyncLoop

    // Modules
    private _handshake_module : HandshakeModule

    init () {

        // Grab modules
        this._handshake_module = this.engine.withHandshakeModule()

        // Grab settings
        this.serverIP = this.engine.withSetting( T.ClientSettings.SERVER_IP, 'localhost:3000') as string

        // Add SyncLoop to handshake
        this._handshake_module.add_stage({
            name : 'syncloop',
            recieve : (id : number, _ : SyncLoopSyncData, success : () => void) => {
                this.on_sync_loop_sync(_)
                success()
            }
        })
    }

    start () {
        // Connect to server
        this.logger.log('info', `Connecting to ${this.serverIP}`)
        this.socket = (io('ws://' + this.serverIP) as unknown) as Socket
        this.connection = new Connection({ socket : this.socket, options : {} }, this.logger)
        this.socket.on('connect', this.on_server_connection.bind(this))
    }

    // Event callbacks

    private on_server_connection () {
        this.logger.log('debug', 'Connected to server')
        this._handshake_module.run_handshake( this.connection )
    }

    private on_sync_loop_sync (data : SyncLoopSyncData) {
        this.syncloop = new SyncLoop({
            ...data,
            on_tick : this.on_tick.bind(this)
        }, this.logger)
    }

    private on_tick () {
        this.event_bus.emit(Events.GAME_TICK)
        this.event_bus.do_processAll()
    }

    get_connection () : Connection { return this.connection }

}