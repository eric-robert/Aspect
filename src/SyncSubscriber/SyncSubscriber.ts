import { Connection } from "../Connection/Connection"

export class SyncSubscriber {

    private subscribers : Map<string, Connection[]> = new Map()
    private subscribed_to : Map<Connection, string[]> = new Map()

    // Adding a connection to groups in both directions 

    private addGroupsToConnection (connection : Connection, group : string[]) {
        const subscribed = this.subscribed_to.get(connection)
        if (!subscribed) this.subscribed_to.set(connection, group)
        else subscribed.push(...group) 
    }

    private addConnectionToGroups (connection : Connection, groups : string[]) {
        groups.forEach( group => {
            const connections = this.subscribers.get(group)
            if (!connections) this.subscribers.set(group, [connection])
            else connections.push(connection)
        })
    }

    // Joining
    
    join_groups ( connection : Connection, groups : string[] ) {
        this.addConnectionToGroups(connection, groups)
        this.addGroupsToConnection(connection, groups)
    }

    // Getters

    get_subscribers ( group : string ) { 
        return this.subscribers.get(group) || [] 
    }

    get_groups ( connection : Connection ) {
        return this.subscribed_to.get(connection) || []
    }

}
