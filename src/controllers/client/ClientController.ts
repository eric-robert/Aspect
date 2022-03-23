import { Socket } from "socket.io"
import { io } from "socket.io-client"
import { Connection } from "../../classes/connection/Connection"
import { SyncLoop } from "../../classes/syncloop/SyncLoop"
import { SyncLoopSyncData } from "../../classes/syncloop/SyncLoop.types"
import { AspectEngine } from "../../engine/Engine"
import { Events, Requests } from "../../events"
import * as T from './Client.types'
import { Logger } from "simpler-logs"
import { EventBus } from "../../classes/eventbus/EventBus"
import { SyncController } from "../sync/SyncController"
import { ConnectionNetworkedData } from "../../classes/connection/Connection.types"
import { EventsRecorded } from "../action/Actions.types"
import { Point3D } from "cubic-array"
import { SyncableEntity } from "../sync/SyncableEntity"

export class ClientController  {

    // Pull from settings
    private serverIP : string
 
    // Instances
    private socket : Socket
    private connection : Connection
    private syncloop : SyncLoop
    private logger : Logger
    private eventBus : EventBus
    private syncControllers : SyncController<any,SyncableEntity<any>>[]

    // For smoothing
    private smooth_start : Map<string, Point3D> | undefined

    constructor (private engine : AspectEngine, private onConnect : Function, private onDisconnect : Function, private onProcessActions : Function) {
        
        // Grab settings
        this.serverIP = this.engine.withSetting( T.ClientSettings.SERVER_IP, 'localhost:3000') as string

        // Grab instances
        this.eventBus = this.engine.withEventBus()
        this.syncControllers = this.engine.withSyncControllers()

        // Connect to server
        this.logger = new Logger('Client', 'info')
        this.logger.log('info', `Connecting to ${this.serverIP}`)
        this.socket = (io('ws://' + this.serverIP) as unknown) as Socket
        this.connection = new Connection({ socket : this.socket, options : {} })
        this.socket.on('connect', this.on_server_connection.bind(this))
        this.socket.on('disconnect', this.on_server_disconnect.bind(this))

    }
    
    // Event callbacks

    private async on_server_connection () {

        let syncLoopData = undefined as (SyncLoopSyncData | undefined)
        let connectionData = undefined as (ConnectionNetworkedData | undefined)

        // Start listeneing for sync loop data
        this.connection.listen(Requests.RECIEVE_CONNECTION_INFO, (data : ConnectionNetworkedData) => connectionData = data)
        this.connection.listen(Requests.RECIEVE_SYNC_LOOP, (data : SyncLoopSyncData) => syncLoopData = data)
        this.connection.listen(Requests.GAME_SYNC_EVENT, this.on_syncEvent.bind(this))

        // Make sure client and server are on the same ID
        this.connection.send(Requests.REQUEST_CONNECTION_INFO, {})
        while (!connectionData) {
            await new Promise(resolve => setTimeout(resolve, 100))
        }
        this.connection.id = connectionData.id

        // Let client do whatever they want
        await this.onConnect(this.connection)

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

    private async on_server_disconnect () {
        await this.onDisconnect()
    }

    private on_tick ( tick : number, catchup : boolean ) {

        // If we need to do any smoothing to the data, apply it here
        

        // Calculate how far to delay windows
        const latency = this.connection.get_latancy()
        const to_act = Math.floor(tick + (latency / this.syncloop.get_state().ms_per_tick))
        const actionControllers = this.engine.withActionControllers()

        // Get actions that happened if
        if (!catchup) {
            let send_actions = {}
            actionControllers.forEach( a => {
                Object.assign(send_actions, a.do_window_step(to_act))
            })

            // Send actions to server
            // These will be sent ASAP
            if (Object.keys(send_actions).length > 0) 
                this.connection.send(Requests.ACTION_PUSH_EVENT, send_actions)
        }

        // Processing historic actions
        let do_actions = {}
        actionControllers.forEach( a => {
            Object.assign(do_actions, a.get_window(tick))
        })

        // Get the events that need to happen on the client to process
        // These will be delayed by the latency
        this.onProcessActions(do_actions)

        // Request game tick
        this.eventBus.emit(Events.GAME_TICK)
        this.eventBus.do_processAll()

        // Final smoothing step
        if (this.smooth_start && !catchup) {
            this.smooth_start.forEach((smoothing, id) => {
                const [cid, eid] = id.split('_')
                const controller = this.syncControllers[+cid]
                const entity = controller.multiMap.get_byID(+eid)
                if (entity && entity.apply_smoothing) entity.apply_smoothing(smoothing)
            })
            this.smooth_start = undefined
        }

        if (!catchup){
            this.syncControllers.forEach((controller,cid) => {
                controller.multiMap.get_allValues().forEach(entity => {
                    if (entity.on_tick)
                        entity.on_tick()
                })
            })
        }


        // Request render tick
        if (!catchup) {
            this.eventBus.emit(Events.RENDER_REQUESTED)
            this.eventBus.do_processAll()
        }


    }   

    private on_syncEvent ( data : T.OnSyncEventData) {
        if (!this.syncloop) return

        let { gameTick, syncs } = data
        this.syncloop.set_currentTick(gameTick)

        // Do smoothing across sync 
        this.smooth_start = new Map()
        this.syncControllers.forEach((controller,cid) => {
            controller.multiMap.get_allValues().forEach(entity => {
                if (entity.apply_smoothing && entity.get_smoothing)
                    this.smooth_start.set(`${cid}_${entity.id}`, entity.get_smoothing() )
            })
        })

        for ( let key in this.syncControllers ) {
            const controller = this.syncControllers[key]
            const data = syncs[controller.name]
            if (!data) controller.recieve_sync([])
            else controller.recieve_sync(data)
        }
        
    }
    
}