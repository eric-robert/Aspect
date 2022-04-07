import { MultiMap } from "cubic-array"
import { Logger } from "simpler-logs"

import {SyncableEntity} from './SyncableEntity'
import { EntityBuilder, hasID } from "./Sync.types"
import { AspectEngine } from "../index.shared"

export class SyncController<EntitySnapshot extends hasID, Entity extends SyncableEntity<EntitySnapshot>>{

    private entityLookup : MultiMap<string, Entity>
    private logger : Logger

    constructor ( private builder : EntityBuilder<EntitySnapshot, Entity>, public name : string ) { 

        this.entityLookup = new MultiMap()
        this.logger = new Logger(`${this.name}-syncing`)

    }

    // Creation

    begin_syncing_entity ( entity : Entity ) {
        const group = entity.get_group ? entity.get_group() : 'global'
        this.entityLookup.add(group, entity)
    }

    stop_syncing_entity ( id : number ){
        this.entityLookup.deleteID(id)
    }


    // Get Sync Groups

    get_sync () {

        const groups = this.entityLookup.get_allKeys()

        const entitySnapshots = new Map<number, EntitySnapshot>()
        const result = new Map<string, EntitySnapshot[]>()

        for ( const group of groups ){
            const results = []
            const entities = [...this.entityLookup.get_valuesByKey(group)] as Entity[]
            for ( const entity of entities ) {
                if (!entitySnapshots.has(entity.id)) 
                    entitySnapshots.set(entity.id, entity.get_sync_data())
                const snapshot = entitySnapshots.get(entity.id)
                results.push(snapshot)
            }
            result.set(group, results)
        }
    
        return {
            name : this.name,
            results : Object.fromEntries(result)
        }
    }

    // Get Sync

    recieve_sync ( data : EntitySnapshot[] ) {

        // Merge in data

        for ( const entity of data ) {

            const entitySource = this.entityLookup.get_byID(entity.id)

            if ( entitySource ) 
                entitySource.receive_sync_data(entity)

            else {
                this.logger.log(`${this.name} recieved new entity ${entity.id}`)
                this.begin_syncing_entity( new this.builder(entity) )
            }

        }
        
        // Purge missing entities

        const got_size = data.length
        const all_size = this.entityLookup.get_valuesCount()
        
        if (got_size < all_size) {
            const missing = this.entityLookup.get_allValues().filter( item => data.find( d => d.id == item.id ) == undefined )
            missing.forEach( item => this.entityLookup.deleteID(item.id))
            this.logger.log(`Removed entities from group: ${missing.length} `)
        }

    }

    // Tick

    tick_forwards ( engine : AspectEngine ) {

        const enties = this.entityLookup.get_allValues()
        
        for ( const entity of enties ) {

            const get_group = () => entity.get_group ? entity.get_group() : 'global'
            const previous_position = get_group()
            entity.tick_forward() 
            const new_position = get_group()

            if ( previous_position != new_position ) {
                this.entityLookup.deleteID(entity.id)
                this.begin_syncing_entity(entity)
            }


        }
        
    }

}