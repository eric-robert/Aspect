export interface SyncloopConstructor {

    on_tick ?: Callback_onTick
    on_sync ?: Callback_onSync

    metrics_windowSize ?: number

}

export interface TickInfo {
    tick:       number
    is_catchup: boolean
    is_first:   boolean
}

export interface SyncInfo {
    tick: number
}

export type Callback_onTick = (_ : TickInfo) => void
export type Callback_onSync = (_ : SyncInfo) => void


export interface SyncronizationData {

    start_time_ms   ?: number
    ms_per_tick     : number
    ticks_per_sync  : number

}