import { SyncableGroup } from "./SyncableGroup"
import {SyncableEntity} from './SyncableEntity'
import { EntityBuilder, hasID } from "./Sync.types"

export class SyncController<U extends hasID, T extends SyncableEntity<U>>{

    private syncableGroup = new SyncableGroup<T>()

    constructor ( private builder : EntityBuilder<U, T>, public name : string ) { }

    // Getting items
    
    get_item_byID ( id : number ) {
        return this.syncableGroup.get_by_id(id)
    }

    get_items_inGroup ( group : string ) {
        return this.syncableGroup.get_subscribers(group) || []
    }

    get_groups_withItem ( item : T ) {
        return this.syncableGroup.get_groups(item)
    }
    
    get_all_groups () {
        return this.syncableGroup.get_allGroups()
    }

    get_all_items () {
        return this.syncableGroup.get_all()
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
        return this.get_items_inGroup(name).map( entity => entity.get_sync_data() )
    }

    get_full_sync () {
        const items = this.get_all_items()
        const result : {[key : string] : U[]} = {}

        items.forEach( item => {
        
            const sync = item.get_sync_data()
            const groups = this.get_groups_withItem(item)
        
            groups.forEach( g => {
                if ( !result[g] ) 
                    result[g] = [sync]
                else
                    result[g].push(sync)
            })
        
        })

        return result
    }

    recieve_sync ( data : U[] ) {
        data.forEach( sync => {
            const entity = this.get_item_byID(sync.id)
            if ( entity ) {
                entity.receive_sync_data(sync)
            }
            else {
                const newEntity = new this.builder(sync)
                this.add_entity(newEntity)
            }
        })
    }

    // Tick

    tick_forwards () {
        this.get_all_items().forEach( item => item.step_interpolation() )
    }

}