export interface SyncloopConstructor {
    start_time_ms ?: number
    ms_per_tick : number
    ticks_per_sync : number
    on_tick ?: (catchup : boolean) => void,
    on_sync ?: (id : number) => void
}

export interface SyncLoopSyncData {
    start_time_ms : number
    ms_per_tick : number
    ticks_per_sync : number
}