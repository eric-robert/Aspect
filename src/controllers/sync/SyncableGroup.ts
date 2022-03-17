export class SyncableGroup<T> {

    private subscribed_to_group : Map<string, T[]> = new Map()
    private groups_by_subscriber : Map<T, string[]> = new Map()
    private all_entities : Map<number, T> = new Map()

    // Adding a connection to groups in both directions 

    private addGroupsToSubscriber (entity : T, group : string[]) {
        const subscribed = this.groups_by_subscriber.get(entity)
        if (!subscribed) this.groups_by_subscriber.set(entity, group)
        else subscribed.push(...group) 
    }

    private addSubscriberToGroup (entity : T, groups : string[]) {
        groups.forEach( group => {
            const connections = this.subscribed_to_group.get(group)
            if (!connections) this.subscribed_to_group.set(group, [entity])
            else connections.push(entity)
        })
    }

    // Joining
    
    add_entity ( id : number, entity : T ) {
        this.all_entities.set(id, entity)
    }

    join_groups ( entity : T, groups : string[] ) {        
        this.addGroupsToSubscriber(entity, groups)
        this.addSubscriberToGroup(entity, groups)
    }

    // Getters

    get_by_id ( id : number ) {
        return this.all_entities.get(id)
    }

    get_subscribers ( group : string ) { 
        return this.subscribed_to_group.get(group) || [] 
    }

    get_groups ( entity : T ) {
        return this.groups_by_subscriber.get(entity) || []
    }

    get_allGroups () {
        return Array.from(this.subscribed_to_group.keys())
    }

    get_all () {
        return Array.from(this.all_entities.values())
    }

}
