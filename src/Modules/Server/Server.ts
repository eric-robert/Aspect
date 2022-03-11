import { Server, Socket } from "socket.io";
import { Connection } from "../../Connection/Connection";
import { EngineEvents } from "../../Engine/Engine.types";
import { EngineModule } from "../../Engine/EngineModule";
import { SyncloopConstructor } from "../../Syncloop/SyncLoop.types";
import { SyncSubscriber } from "../../SyncSubscriber/SyncSubscriber";
import { ServerSettings } from "./Server.types";

export class ServerModule extends EngineModule {

    private connections : SyncSubscriber = new SyncSubscriber()

    private port : number
    private server : Server

    init () {
        this.port = this.engine.withSetting( ServerSettings.PORT, 3000) as number
    }

    start () {
        this.log(`Starting server on port ${this.port}`)
        this.server = new Server( this.port, { serveClient: false, cors: {origin: '*'}})
        this.server.on('connection', this.on_websocket_connection.bind(this))

        this.engine.startSyncLoop({
            tick_speed : this.engine.withSetting(ServerSettings.MS_PER_TICK, 20) as number,
            sync_speed : this.engine.withSetting(ServerSettings.TICKS_PER_SYNC, 5) as number,
            on_tick : () => {
                this.eventBus.emit(EngineEvents.GameTick)
                this.eventBus.process_all()
            }
        })
    }

    private on_websocket_connection ( socket : Socket ) {
        const connection = new Connection({ socket })
        this.log(`New connection from ${connection.get_id()}`)
        this.connections.join_groups(connection, [ 'all' ])
        
        const handshake = this.engine.withHandshake()
        handshake.add_stage(this.send_sync_loop.bind(this))
        handshake.connection_setup(connection)
    }

    private send_sync_loop ( _ : any, send : (_:SyncloopConstructor) => void ) {
        send(this.engine.getSyncLoop())
    }

}