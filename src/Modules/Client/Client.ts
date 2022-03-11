import { Socket } from "socket.io";
import { io } from "socket.io-client";
import { Connection } from "../../Connection/Connection"
import { EngineEvents } from "../../Engine/Engine.types";
import { EngineModule } from "../../Engine/EngineModule";
import { SyncloopConstructor } from "../../Syncloop/SyncLoop.types";

export class ClientModule extends EngineModule {

    private socket : Socket
    private connection : Connection

    start () {

        const ip = this.engine.withSetting('socket.ip', 'localhost:3000')
        this.log(`Connecting to ${ip}`)

        this.socket = (io('ws://' + ip) as unknown) as Socket
        this.connection = new Connection({ socket : this.socket })
        this.socket.on('connect', this.on_server_connection.bind(this))
    }

    // Handlers

    private on_server_connection () {
        this.log('Connected to server')

        const providedHandshake = this.engine.withHandshake()
        providedHandshake.add_stage(this.recieve_sync_loop.bind(this))
        providedHandshake.connection_setup(this.connection)

    }

    private recieve_sync_loop (sent : SyncloopConstructor, done : () => void ) {
        this.engine.startSyncLoop({
            ...sent,
            on_tick : () => {
                this.eventBus.emit(EngineEvents.GameTick)
                this.eventBus.process_all()
            }
        })
        done()
    }

    // Getters and setters

    get_connection () : Connection { return this.connection }

}
