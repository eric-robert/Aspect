import * as T from "./EventBus.types";
export declare class EventBus {
    private subscribers;
    private queue;
    private logger;
    constructor();
    private process_backlog;
    subscribe<EventData>(label: string, sub: T.EventSubscription<EventData>): void;
    emit<EventData>(label: string, data?: EventData): void;
    do_processAll(): void;
}
