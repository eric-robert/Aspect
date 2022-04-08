import { Logger } from 'simpler-logs';
import { Window, ActionEvent } from './WindowedActions.types';

export class WindowedActions {

    static actionID = 0

    private actionWindows : Map<number, Window>
    private activeWindow : number
    private logger : Logger

    constructor () {
        this.activeWindow = 0
        this.actionWindows = new Map()
        this.logger = new Logger('Windowed-actions')
    }

    purge_old_windows ( cutoff : number ) {

        for ( const [tick, value] of this.actionWindows ) {
            if ( tick <= cutoff ) 
                this.actionWindows.delete(tick)
        }

        this.activeWindow = cutoff + 1
    }

    purge_events ( events : number[] ){
        
        const items = new Set(events.map(id => `${id}`))

        for ( const [tick, value] of this.actionWindows ) 
            for ( const key in value ) 
                if ( items.has(key) )
                    delete value[key]
    }

    record_action ( event : ActionEvent ) {

        const actionID = event.id || WindowedActions.actionID++
        
        if ( !this.actionWindows.has(event.target_tick) )
            this.actionWindows.set(event.target_tick, {})

        this.actionWindows.get(event.target_tick)[actionID] = {
            label : event.label,
            data : event.data
        }

        return actionID
    }

    close_window ( tick : number ) {
        this.activeWindow = tick + 1
        return this.actionWindows[tick] || {}
    }

    get_window (tick : number){
        const target = this.actionWindows.get(tick)
        return target || {}
    }

    get_window_actions_ids ( range : number[] ){
        const result = []
        for ( const tick of range )
            result.push(...Object.keys(this.get_window(tick)))
        return result
    }
        
} 