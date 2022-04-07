import { Logger } from "simpler-logs";
import { AspectEngine } from "./AspectEngine";
import { EngineModule } from "./modules/Module";

export interface AspectEngineConstuctor {

    logger ?: Logger
    modules ?: Class<EngineModule>[],
    settings ?: _settings
    global_settings ?: _settings
}

export interface Class<T> {
    new(engine : AspectEngine) : T
}

export interface _settings {
    [key: string]: string | number
}

export const Events = {

    // Game engine will need to step forwards in time sometimes
    // This is differnt than an actual game tick
    INTERP_TICK : 'interp-tick',

    // Game ticks move forward server events and such
    GAME_TICK : 'game-tick',

    // Render ticks actually render the game
    RENDER_TICK : 'render-tick',
}


export interface TickEventBody {
    tick : number
    actions : {
        [label:string] : any
    }
}

export const Requests = {
    REQUEST_SYNC_LOOP : 'request-sync-loop',
    RESPONSE_SYNC_LOOP : 'response-sync-loop',
    
    REQUEST_CONNECTION_INFO: 'request-connection-info',
    RESPONSE_CONNECTION_INFO: 'response-connection-info',
    
    CLIENT_SEND_ACTION : 'action-push-event',
    GAME_SYNC_EVENT : 'game-sync-event',
}

export interface SyncEventData {
    tick : number,
    included_actions : number[],
    states : {
        [system : string] : any[]
    }
}