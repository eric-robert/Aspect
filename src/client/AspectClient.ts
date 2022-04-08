import { Logger } from "simpler-logs";
import * as T from './AspectClient.types'
import { AspectEngine, SyncLoop, SyncLoopTypes, Events, Connection, Requests, WindowedActions, ActionEvent } from "../index.shared";
import { WebsocketClient } from "./WebsocketClient";
import { SyncEventData, TickEventBody } from "../engine/AspectEngine.types";

export class AspectClient {

    static instance: AspectClient

    public engine: AspectEngine
    private logger: Logger 
    private syncloop : SyncLoop
    private connection : WebsocketClient
    private windowedActions : WindowedActions
    private conntected = false

    constructor ( config ?: T.Config ) {

        AspectClient.instance = this
        config = config || {}
    
        // Create logger
        console.clear()
        this.logger = new Logger('AspectClient')
        this.logger.log('Starting Aspect Client!')

        // Create engine
        this.engine = new AspectEngine({
            modules : config.modules || []
        })
        this.connection = new WebsocketClient({
            onConnect : this.onSelfConnected.bind(this),
            onDisconnect : this.onSelfDisconnected.bind(this)
        })

        // Create syncloop
        this.syncloop = new SyncLoop({
            on_tick : this.onTick.bind(this)
        })

        // Create Actions
        this.windowedActions = new WindowedActions()
        
    }

    // Sync Loop Callbacks

    private onTick ( data : SyncLoopTypes.TickInfo) {
        const syncControllers = this.engine.withSyncControllers()
        const pubsub = this.engine.withPubSub()

        const eventBody : TickEventBody = {
            tick : data.tick,
            actions : this.getClientActions(data.tick)
        }
        
        pubsub.emit(Events.INTERP_TICK, eventBody)
        pubsub.do_processAll()
        syncControllers.forEach( s => s.tick_forwards( this.engine ))
        if (data.is_catchup) return
        pubsub.emit(Events.GAME_TICK, eventBody)
        pubsub.do_processAll()
        pubsub.emit(Events.RENDERABLE)
        pubsub.do_processAll()


    }

    private getClientActions ( tick : number ) {
        const result = {}
        const window = this.windowedActions.get_window(tick)
        for ( let id in window ) {
            result[window[id].label] = window[id].data
        }
        return {
            [this.connection.getId()] : result
        }
    }

    private async onSelfConnected ( connection : Connection ) {
        this.logger.log('Connected to server', 'important')   
        this.conntected = true

        // Get Controllers
        const pubsub = this.engine.withPubSub()

        // Setup listeners
        connection.listen(Requests.GAME_SYNC_EVENT, this.onRecieveSync.bind(this))

        // Wait for server to be ready
        await new Promise(resolve => setTimeout(resolve, 50))
     
        // Request info
        const syncloop_data = await connection.request(Requests.REQUEST_SYNC_LOOP)
        const connection_data = await connection.request(Requests.REQUEST_CONNECTION_INFO)

        // Set info
        connection.set_id(connection_data)
        this.syncloop.recieve_sync(syncloop_data)
        
        // Emit events
        pubsub.emit(Events.CLIENT_JOIN, connection)

    }

    public recordAction ( action : ActionEvent ) {
        if ( !this.conntected ) return
        const latency = this.connection.get_latency()
        const target_tick = this.syncloop.get_tick_in_ms( latency )

        action.target_tick = target_tick
        action.id = this.windowedActions.record_action(action)
        
        this.connection.send(Requests.CLIENT_SEND_ACTION, action)
    }


    private onRecieveSync ( data : SyncEventData ) {
        
        // Handle purged actions
        this.windowedActions.purge_old_windows( data.tick )
        this.windowedActions.purge_events(data.included_actions)

        // Handle sync
        const syncControllers = this.engine.withSyncControllers()
        for ( let controller of syncControllers ) {
            const states = data.states[controller.name]
            if (! states) continue
            controller.recieve_sync(states)
        }

    }

    private async onSelfDisconnected ( connection : Connection ) {
        this.logger.log('Disconnected from server', 'important') 
        
        // Emit events
        const pubsub = this.engine.withPubSub()
        pubsub.emit(Events.CLIENT_LEAVE, connection)

    }

}