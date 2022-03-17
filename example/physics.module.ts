import { Events } from '../src/events'
import {AspectEngine, SyncController, Connection, SyncableEntity, EngineModule} from '../src/index'

interface SyncData {
    id: number
    position : number,
    velocity : number
    acceleration : number
}

export class SimpleObject implements SyncableEntity<SyncData> {
    
    private _id = 0
    private _position : number = 0
    private _velocity : number = 0
    private _acceleration : number = 0

    constructor ( sync : SyncData ) {
        this._id = sync.id
        this.receive_sync_data(sync)
    }

    get_id () : number {
        return this._id
    }

    get_group () : string {
        return Math.floor(this._id / 10) + ""
    }

    public get_sync_data(): SyncData {
        return {
            id: this._id,
            position: this._position,
            velocity: this._velocity,
            acceleration: this._acceleration
        }
    }

    public receive_sync_data ( data : SyncData ) {
        this._position = data.position
        this._velocity = data.velocity
        this._acceleration = data.acceleration
    }

    public step_interpolation() {
        this._position += this._velocity
        this._velocity += this._acceleration
    }

}

export class SimplePhysics extends EngineModule {

    private _syncController : SyncController<SyncData, SimpleObject>

    init(): void {
        
        this._syncController = new SyncController<SyncData, SimpleObject>(SimpleObject, 'physics')
        this.engine.register_sync_controller(this._syncController)

        this.event_bus.subscribe(Events.GAME_TICK, this.on_game_tick.bind(this))
    }

    private on_game_tick () {
        // TIck everything forward
        this._syncController.tick_forwards()
        
        // Debug logging
        const debug = this._syncController.get_all_items()[0]
        if (debug) {
            this.logger.log('info', `PHYSICS: @ ${debug.get_sync_data().position}`)
        }
        else {
            this.logger.log('info', `PHYSICS: no items`)
        }
    }

    public get_sync () {
        return this._syncController.get_full_sync()
    }

    public add_entity ( entity : SimpleObject ) {
        this._syncController.add_entity(entity)
    }

}