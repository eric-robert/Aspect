import { EventsRecorded, Window } from './Actions.types';

export class ActionController {

    private actionWindows : Window[] = []
    private activeWindow : EventsRecorded = {}

    constructor ( private stepCallback : Function) {}

    // Stops a window from being added to and starts a new window for event records
    private close_window () {
        const now = Date.now()
        const new_active = {}
        const old_active = this.activeWindow

        this.actionWindows.push({ time: now, window: old_active })
        this.activeWindow = new_active

        return old_active
    }

    // Gets all windows since a certain time
    find_past_windows ( older_than : number ) {

        const now = Date.now()
        const cutoff = now - older_than

        // Take windows time is newer than cutoff
        const to_ret = (w:Window) => w.time < cutoff
        const to_kep = (w:Window) => w.time >= cutoff

        const to_return = this.actionWindows.filter(to_ret)
        const to_keep = this.actionWindows.filter(to_kep)
        this.actionWindows = to_keep

        return to_return.map(w => w.window)
    }

    record_action (key : string, value : any) {
        this.activeWindow[key] = value
    }

    do_window_step () {
        this.stepCallback()
        return this.close_window()
    }
        
} 