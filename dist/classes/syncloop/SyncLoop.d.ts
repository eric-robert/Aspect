import { Logger } from 'winston';
import * as T from './SyncLoop.types';
export declare class SyncLoop {
    private current_tick;
    private start_time_ms;
    private ms_per_tick;
    private ticks_per_sync;
    private on_tick;
    private on_sync;
    private logger;
    constructor(config: T.SyncloopConstructor, root_logger: Logger);
    execute_tick(): void;
    get_state(): T.SyncLoopSyncData;
    get_ticksBehind(): number;
    set_currentTick(tick: number): void;
}
