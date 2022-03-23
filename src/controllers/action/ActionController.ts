import { EventsRecorded, Window } from './Actions.types';

export class ActionController {

    private window_ids : number[] = []
    private actionWindows : Map<number, Window> = new Map()
    private activeWindow : EventsRecorded = {}

    constructor ( private stepCallback : Function) {}

    record_action (key : string, value : any) {
        this.activeWindow[key] = value
    }

    do_window_step ( tick : number ) {
        this.stepCallback()
        const window = { time: Date.now(), window: this.activeWindow }
        this.activeWindow = {}
        this.window_ids.push(tick)
        this.actionWindows.set(tick, window)
        return window.window
    }

    get_window (tick : number){
        const target = this.actionWindows.get(tick)
        return target ? target.window : {}
    }
        
} 