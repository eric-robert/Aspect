import { Logger } from 'simpler-logs'
import * as T from './SyncLoop.types'

export class SyncLoop {

    private current_tick : number
    private start_time_ms : number 
    private ms_per_tick : number
    private ticks_per_sync : number 
    
    private on_tick : (id : number) => void
    private on_sync : (id : number) => void

    private logger : Logger

    constructor ( config : T.SyncloopConstructor) {
        
        this.logger = new Logger(`Syncloop`, "info")
        this.logger.log('info', `Starting sync loop`)

        // Save timings
        this.start_time_ms = config.start_time_ms || Date.now()
        this.ms_per_tick = config.ms_per_tick
        this.ticks_per_sync = config.ticks_per_sync

        // Compute current tick
        const since_start = Date.now() - this.start_time_ms
        this.current_tick = Math.floor(since_start / this.ms_per_tick)

        // Start it up
        this.on_tick = config.on_tick || (_ => {})
        this.on_sync = config.on_sync || (_ => {})
        setTimeout(() => this.execute_tick(), 0)
    }

    execute_tick () {
   
        // Calculations
        const expected_this = this.start_time_ms + (this.current_tick * this.ms_per_tick)
        const expected_next = expected_this + this.ms_per_tick
        const sync_tick = this.current_tick % this.ticks_per_sync == 0

        this.logger.log('debug', `Tick ${this.current_tick}`)

        // Callbacks
        if (this.on_tick) this.on_tick(this.current_tick)
        if (this.on_sync && sync_tick) this.on_sync(this.current_tick)

        // Increment
        this.current_tick ++

        // Run loop again        
        const end_time = Date.now()
        const next_loop = expected_next - end_time
        setTimeout(() => this.execute_tick(), next_loop)
    }

    // Syncing

    get_state () : T.SyncLoopSyncData {
        return {
            start_time_ms : this.start_time_ms,
            ms_per_tick : this.ms_per_tick,
            ticks_per_sync : this.ticks_per_sync
        }
    }

    // For when you need to do syncing

    get_ticksBehind () {
        const expected_this = this.start_time_ms + (this.current_tick * this.ms_per_tick)
        const gap = Date.now() - expected_this
        return Math.floor(gap / this.ms_per_tick)
    }

    set_currentTick ( tick : number ) {
        this.current_tick = tick
    }

}