import { Logger } from 'simpler-logs'
import * as T from './SyncLoop.types'

export class SyncLoop {

    // What this syncloop views as the current state
    private current_tick : number
    private start_time_ms : number 
    private ms_per_tick : number
    private ticks_per_sync : number 

    // Callbacks to interact with the module
    private on_tick : T.Callback_onTick
    private on_sync : T.Callback_onSync

    // For metrics
    private wait_time = 0
    private wait_window = 0
    private wait_windowSize = 0
    private running : boolean = false
    private time : () => number

    // Logging
    private logger : Logger

    constructor ( config : T.SyncloopConstructor) {
        
        // Loggers
        this.logger = new Logger(`Syncloop`)
        this.logger.log(`Creating Sync-Loop`)

        // For syncronization
        this.time = config.time_provider

        // Metrics
        this.wait_window = this.time()
        this.wait_windowSize = config.metrics_windowSize || 10000

        // Add Callbacks
        this.on_tick = config.on_tick || (_ => {})
        this.on_sync = config.on_sync || (_ => {})
    }

    start ( data : T.SyncronizationData ) {
        this.recieve_sync(data)
    }

    recieve_sync ( data : T.SyncronizationData ) {

        // Pull in the data
        this.start_time_ms = data.start_time_ms || this.time()
        this.ms_per_tick = data.ms_per_tick
        this.ticks_per_sync = data.ticks_per_sync

        // Do the tick when you get to it if you need to
        if (!this.running) {
            this.running = true
            this.logger.log(`Syncloop Running`)
            const start = () => this.execute()
            setTimeout(start, 0)
        }
    }
     

    private execute () {

        // Utilization metrics
        this.metrics_utliization_recoder()

        // How many ticks do we need to do here?
        const {target, behind} = this.get_ticksBehind()
        this.current_tick = target

        // Do the ticks
        for (let i = 1; i <= behind; i++) {

            const is_catchup = i < behind
            const tick = this.current_tick - behind + i
            const should_sync = tick % this.ticks_per_sync == 0 && !is_catchup
            const is_first = i == 1

            if (this.on_tick) 
                this.on_tick({tick, is_catchup, is_first})
            if (should_sync && this.on_sync)
                this.on_sync({tick})
            
        } 

        // Compute time to next tick
        const expected_next = this.current_tick * this.ms_per_tick + this.start_time_ms 
        const end_time = this.time()
        const next_loop = expected_next - end_time

        // Metrics
        this.wait_time += next_loop

        // Wait for next loop
        setTimeout(() => this.execute(), next_loop)

    }

    // See's how much free time we have in our thread outside of syncloops
    private metrics_utliization_recoder () {

        const now = this.time()
        
        if ( now - this.wait_window > this.wait_windowSize) {

            const over = now - this.wait_window - this.wait_windowSize
            const utilization = 1 - ((this.wait_time - over) / this.wait_windowSize)
            
            this.logger.log(`Utilization: ${Math.floor(utilization * 100)}%`, 'debug')
            this.wait_window = now
            this.wait_time = 0
        }
    }

    private get_ticksBehind () {
        const since_start = this.time() - this.start_time_ms
        const target = Math.ceil(since_start / this.ms_per_tick)
        const behind = target - this.current_tick
        return {behind, target}
    }

    // Syncing with other loops

    get_state () : T.SyncronizationData {
        return {
            start_time_ms   : this.start_time_ms,
            ms_per_tick     : this.ms_per_tick,
            ticks_per_sync  : this.ticks_per_sync
        }
    }

    set_currentTick ( tick : number ) {
        this.current_tick = tick
    }

    get_next_tick () {
        return this.current_tick + 1
    }

    get_tick () {
        return this.current_tick
    }

    get_tick_in_ms ( ms : number ) {
        const now = this.time()
        const then = now + ms
        return Math.ceil((then - this.start_time_ms) / this.ms_per_tick) + 1
    }
}