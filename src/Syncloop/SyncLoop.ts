import { Logger } from '../Logging/Logging'
import { LogLevel } from '../Logging/Logging.types'
import * as T from './SyncLoop.types'

export class SyncLoop {

    private current_tick : number
    private start_time : number 
    private tick_speed : number
    private sync_speed : number 
    
    private on_tick : (id : number) => void
    private on_sync : (id : number) => void

    private logger : Logger

    constructor ( config : T.SyncloopConstructor ) {
        
        this.logger = new Logger(`SyncLoop`, config.logLevel || LogLevel.INFO)

        // Save timings
        this.start_time = config.start_time || Date.now()
        this.tick_speed = config.tick_speed
        this.sync_speed = config.sync_speed
        this.current_tick = Math.floor((Date.now() - this.start_time) / this.tick_speed)

        // Start it up
        this.on_tick = config.on_tick || (_ => {})
        this.on_sync = config.on_sync || (_ => {})
        setTimeout(() => this.execute_physics_loop(), 0)
    }

    execute_physics_loop () {
   
        // Calculations
        const expected_this = this.start_time + (this.current_tick * this.tick_speed)
        const expected_next = expected_this + this.tick_speed

        this.logger.log(`Tick ${this.current_tick}`)

        // Callbacks
        if (this.on_tick) this.on_tick(this.current_tick)
        if (this.on_sync && this.current_tick % this.sync_speed == 0) this.on_sync(this.current_tick)

        // Increment
        this.current_tick ++

        // Run loop again        
        const end_time = Date.now()
        const next_loop = expected_next - end_time
        setTimeout(() => this.execute_physics_loop(), next_loop)

    }

    // Syncing

    get_state () {
        return {
            start_time : this.start_time,
            tick_speed : this.tick_speed,
            sync_speed : this.sync_speed,
        }
    }

    // For when you need to do syncing

    get_ticksBehind () {
        const expected_time = this.start_time + (this.current_tick * this.tick_speed)
        const gap = Date.now() - expected_time
        return Math.floor(gap / this.tick_speed)
    }

    set_currentTick ( tick : number ) {
        this.current_tick = tick
    }

}