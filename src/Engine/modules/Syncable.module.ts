import { SyncableGroup } from "../../syncableGroup/SyncableGroup"
import {SyncableEntity} from '../../syncableGroup/SyncableEntity'
import { EngineModule } from "./Module"

export class SyncableModule<U extends {id:number}, T extends SyncableEntity<U>> extends EngineModule {

    private syncableGroup = new SyncableGroup<T>()

    get_group ( group : string ) {
        return this.syncableGroup.get_subscribers(group) || []
    }
    get_by_id ( id : number ) {
        return this.syncableGroup.get_by_id(id)
    }

    // Adding

    add_entity ( entity : T ) {
        const id = entity.get_id()
        const group = entity.get_group()
        this.syncableGroup.add_entity(id, entity)
        this.syncableGroup.join_groups(entity, [group])
    }

    // Get Sync Group

    get_syncForGroup ( name : string ) {
        return this.get_group(name).map( entity => entity.get_sync_data() )
    }

    recieve_sync ( data : U[] ) {
        data.forEach( sync => this.get_by_id(sync.id).receive_sync_data(sync) )
    }

}