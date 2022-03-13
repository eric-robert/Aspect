import { Logger } from "simpler-logs";
import { EventBus } from "../../classes/eventbus/EventBus";
import { AspectEngine } from "../Engine";
export declare class EngineModule {
    logger: Logger;
    engine: AspectEngine;
    event_bus: EventBus;
    constructor(engine: AspectEngine);
    init(): void;
    start(): void;
}
