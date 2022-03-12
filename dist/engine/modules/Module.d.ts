import { Logger } from "winston";
import { EventBus } from "../../classes/eventbus/EventBus";
import { AspectEngine } from "../Engine";
export declare class EngineModule {
    logger: Logger;
    engine: AspectEngine;
    event_bus: EventBus;
    constructor(engine: AspectEngine, root_logger: Logger);
    init(): void;
    start(): void;
}
