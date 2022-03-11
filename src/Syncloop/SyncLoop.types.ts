export interface SyncloopConstructor {
    logLevel ?: number
    start_time ?: number,
    tick_speed : number,
    sync_speed : number,
    on_tick ?: (id : number) => void,
    on_sync ?: (id : number) => void
}
