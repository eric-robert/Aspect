import { Point3D } from "cubic-array"
import { AspectEngine } from "../../engine/Engine"

export interface SyncableEntity<T> {
    id : number
    get_group () : string 
    get_sync_data () : T
    receive_sync_data ( data : T ) : void  
    step_interpolation ( engine : AspectEngine ) : boolean 
    apply_smoothing ?( smoothing : Point3D ) : void
    get_smoothing ?() : Point3D
    on_tick ?() : void
}