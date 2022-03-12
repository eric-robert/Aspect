export class SyncableEntity<T> {

    // For tracking

    public get_id () : number {
        throw new Error("Not implemented")
    }

    public get_group () : string {
        throw new Error("Not implemented")
    } 
    
    // For syncing

    public get_sync_data () : T {
        throw new Error("Not implemented")
    }

    public receive_sync_data ( data : T ) {
        throw new Error("Not implemented")
    }

}