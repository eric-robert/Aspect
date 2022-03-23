import { Logger } from 'simpler-logs'
import * as T from './SyncLoop.types'

export class SyncLoop {

    private current_tick : number
    private start_time_ms : number 
    private ms_per_tick : number
    private ticks_per_sync : number 
    
    private on_tick : (id : number, catchup : boolean) => void
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

        // Execute ticks as needed
        let ticks_behind = this.get_ticksBehind() + 1

        // Update ticks
        this.current_tick += ticks_behind
        const sync_tick = this.current_tick % this.ticks_per_sync == 0

        this.logger.log('debug', `Tick ${this.current_tick}, ${ticks_behind} ticks behind`)
        
        // Execute ticks, marking those only used to catchup
        for (let i = 0; i < ticks_behind-1; i++) 
            if (this.on_tick) this.on_tick(this.current_tick - (ticks_behind - i), true)

        if (this.on_tick) this.on_tick(this.current_tick, false)
        if (this.on_sync && sync_tick) this.on_sync(this.current_tick)

        // Run loop again       
        const expected_next = this.current_tick * this.ms_per_tick + this.start_time_ms 
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
        const since_start = Date.now() - this.start_time_ms
        const behind = Math.floor(since_start / this.ms_per_tick) - this.current_tick
        return behind < 0 ? 0 : behind
    }

    set_currentTick ( tick : number ) {
        this.current_tick = tick
    }

    get_tick () {
        return this.current_tick
    }

}