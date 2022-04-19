import { Logger } from "simpler-logs";
import * as T from './AspectServer.types'
import { AspectEngine, SyncLoop, SyncLoopTypes, Events, Connection, Requests, ActionEvent, WindowedActions } from "../index.shared";
import { WebsocketServer } from "./WebsocketServer";
import { SyncEventData, TickEventBody } from "../engine/AspectEngine.types";

export class AspectServer {

    static instance: AspectServer

    public engine: AspectEngine
    private logger: Logger 
    private syncloop : SyncLoop
    private server : WebsocketServer
    
    private actionRecords : Map<number, WindowedActions>
    private consumedActions : Map<number, Set<number>>

    constructor ( config ?: T.Config) {

        AspectServer.instance = this
        config = config || {}
    
        // Create logger
        this.logger = new Logger('AspectServer')
        console.clear()
        this.logger.log('Starting Aspect Server')

        // Create engine
        this.engine = new AspectEngine({
            modules : config.modules || []
        })
        this.server = new WebsocketServer({
            onConnect : this.onClientConnect.bind(this),
            onDisconnect : this.onClientDisconnect.bind(this)
        })        

        // Create syncloop
        this.syncloop = new SyncLoop({
            on_sync : this.onSync.bind(this),
            on_tick : this.onTick.bind(this),
            time_provider : () => Date.now()
        })
        this.syncloop.start({
            ms_per_tick : 20,
            ticks_per_sync : 10
        })

        // Create action records
        this.actionRecords = new Map()
        this.consumedActions = new Map()
        
    }

    // Sync Loop Callbacks

    private onTick ( data : SyncLoopTypes.TickInfo) {
        const syncControllers = this.engine.withSyncControllers()
        const pubsub = this.engine.withPubSub()

        // Grab all the actions from all clients scheduled for this tick
        const tickEventBody = this.computeConsumedActions(data.tick)

        // Do processing
        pubsub.emit(Events.INTERP_TICK, tickEventBody )
        pubsub.do_processAll()
        pubsub.emit(Events.GAME_TICK, tickEventBody )
        pubsub.do_processAll()

        // Tick forward syncable objects
        syncControllers.forEach( s => s.tick_forwards( this.engine, true ))
        
    }

    private computeConsumedActions ( tick : number ) {

        const actionsForTick = {}

        for ( let clientID of this.actionRecords.keys() ) {

            const id = +clientID
            const window = this.actionRecords.get(id).get_window(tick)
            const consumed = this.consumedActions.get(id)
            const result = {}

            for ( let action in window ) {
                result[window[action].label] = window[action].data
                consumed.add(+action)
            }

            actionsForTick[clientID] = result
        }

        return { tick : tick, actions : actionsForTick } as TickEventBody
    }

    private onSync ( data : SyncLoopTypes.SyncInfo) {

        const syncControllers = this.engine.withSyncControllers()
        const syncData = syncControllers.map(s => s.get_sync())
        const clients = this.server.getAll()

        for ( let client of clients ) {

            const groups = this.server.getGroups( client )
            const actions = this.consumedActions.get(client.id) || []
            const emitData : SyncEventData = {
                tick : data.tick,
                included_actions : [...actions],
                states : {}
            }
            
            // Collect relivant grouping data

            for ( let data of syncData ) {
                const collection = []
                for ( let group of groups )
                    if (data.results[group])
                        collection.push(...data.results[group])
                emitData.states[data.name] = collection
            }

            client.send(Requests.GAME_SYNC_EVENT, emitData)
            this.consumedActions.set(client.id, new Set())
        }
    }

    private async onClientConnect ( connection : Connection ) {
        this.logger.log(`Client connected given ID ${connection.id}`, 'important')

        // Get controllers
        const pubsub = this.engine.withPubSub()

        // Setup actions
        this.actionRecords.set(connection.id, new WindowedActions())
        this.consumedActions.set(connection.id, new Set())

        // Setup listeners
        connection.listen(Requests.REQUEST_SYNC_LOOP, _ => this.syncloop.get_state())
        connection.listen(Requests.REQUEST_CONNECTION_INFO, _ => connection.id )
        connection.listen(Requests.CLIENT_SEND_ACTION, (_ : ActionEvent) => this.clientSendsAction(connection, _))

        // Wait for client to be ready
        await new Promise( resolve => setTimeout(resolve, 50) )

        // Send event
        pubsub.emit(Events.CLIENT_JOIN, connection)

    }

    private async clientSendsAction ( connection : Connection, action : ActionEvent ) {
        const targetWindow = this.actionRecords.get(connection.id)
        if (!targetWindow) return

        const nextTick = this.syncloop.get_next_tick()
        const targetTick = action.target_tick < nextTick ? nextTick : action.target_tick
        action.target_tick = targetTick
        targetWindow.record_action(action)
    }

    private async onClientDisconnect ( connection : Connection ) {
        this.logger.log(`Client ${connection.id} disconnected`, 'important')

        // Get controllers
        const pubsub = this.engine.withPubSub()

        // Remove the action listeners
        this.actionRecords.delete(connection.id)
        this.consumedActions.delete(connection.id)

        // Send event
        pubsub.emit(Events.CLIENT_LEAVE, connection)
    }

    // Public Methods

    public joinGroup ( group : string, connection : Connection ) {
        this.server.joinGroup(group, connection)
    }
    public leaveGroup ( group : string, connection : Connection ) {
        this.server.leaveGroup(group, connection)
    }

    public sendToGroup (group : string, request : string, data : any) {
        const connections = this.server.getConnections(group)
        connections.forEach( c => c.send(request, data) )
    }

}