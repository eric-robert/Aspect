export interface SyncableEntity<SnapshotData> {

    // Each entity is given its own unique ID
    id : number

    // Each entity has a group that it belongs to so that it can be provided to the propper clients
    get_group ?: () => string 
    tick_forward ?: ( first_time : boolean) => void
    
    get_sync_data () : SnapshotData
    receive_sync_data ( data : SnapshotData ) : void  

    before_sync ?: () => void
    after_sync ?: () => void

    //TODO ADD A BUILT IN WAY FOR SMOOTHING
    // step_interpolation ( engine : AspectEngine ) : boolean 
    // apply_smoothing ?( smoothing : Point3D ) : void
    // get_smoothing ?() : Point3D
}