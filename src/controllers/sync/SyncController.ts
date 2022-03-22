import { MultiMap } from "./MultiMap"
import {SyncableEntity} from './SyncableEntity'
import { EntityBuilder, hasID } from "./Sync.types"
import { Logger } from "simpler-logs"
import { AspectEngine } from "../../engine/Engine"

export class SyncController<U extends hasID, T extends SyncableEntity<U>>{

    public multiMap = new MultiMap<string, T>()
    private logger : Logger = new Logger('SyncController', 'debug')

    constructor ( private builder : EntityBuilder<U, T>, public name : string ) { }

    // Adding

    add_entity ( entity : T ) {
        const group = entity.get_group()
        this.multiMap.add(group, entity)
    }

    remove_entity ( id : number ){
        this.multiMap.delete(id)
    }

    // Get Sync Group

    get_full_sync () {

        const items = this.multiMap.get_allValues()
        const result : {[key : string] : U[]} = {}

        items.forEach( item => {
        
            const sync = item.get_sync_data()
            const keys = this.multiMap.get_keysByValue(item)
        
            keys.forEach( k => {
                if (!result[k]) result[k]=[sync]
                else result[k].push(sync)
            })
        
        })

        return result
    }

    recieve_sync ( data : U[] ) {

        // Recieve data
        data.forEach( sync => {
            const entity = this.multiMap.get_byID(sync.id)
            if ( entity ) entity.receive_sync_data(sync)
            else {
                const newEntity = new this.builder(sync)
                this.logger.log('debug', `${this.name} syncing new entity ${newEntity.id}`)
                this.add_entity(newEntity)
            }
        })

        // Purge missing
        const got_size = data.length
        const all_size = this.multiMap.get_valuesCount()
        
        if (got_size < all_size) {
            const missing = this.multiMap.get_allValues().filter( item => data.find( d => d.id == item.id ) == undefined )
            missing.forEach( item => this.multiMap.delete(item.id))
        }
    }

    // Tick

    tick_forwards ( engine : AspectEngine ) {

        // Interoplate
        this.multiMap.get_allValues().forEach( item => 
        {
            const dirty = item.step_interpolation( engine ) 

            // If its marked as dirty it may need to move to a new group?
            if (dirty) {
                const key = this.multiMap.get_keysByValue(item).entries().next().value[0]
                const new_key = item.get_group()
                if ( key != new_key) {
                    this.multiMap.add(new_key, item)
                    if (key)
                        this.multiMap.remove(key, item)
                }
            }
        })
    }

}