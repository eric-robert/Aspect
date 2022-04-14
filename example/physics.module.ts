import {AspectEngine, SyncController, Connection, SyncableEntity, EngineModule} from '../src/index.shared'

interface SyncData {
    id: number
    position : number,
    velocity : number
    acceleration : number
}

export class SimpleObject implements SyncableEntity<SyncData> {
    
    public id = 0
    private _position : number = 0
    private _velocity : number = 0
    private _acceleration : number = 0

    constructor ( sync : SyncData ) {
        this.id = sync.id
        this.receive_sync_data(sync)
    }

    get_group () : string {
        return Math.floor(this._position / 10) + ""
    }

    public get_sync_data(): SyncData {
        return {
            id: this.id,
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

    public tick_forward() {
        this._position += this._velocity
        this._velocity += this._acceleration
    }
}

export class SimplePhysics extends EngineModule {

    private _syncController : SyncController<SyncData, SimpleObject>

    init() {
        this._syncController = new SyncController<SyncData, SimpleObject>(SimpleObject, 'physics')
        this.engine.register_sync_controller(this._syncController)
    }

    add_entity ( entity : SimpleObject ) {
        this._syncController.begin_syncing_entity(entity)
    }

    remove_entity ( id : number ) {
        this._syncController.stop_syncing_entity(id)
    }

}