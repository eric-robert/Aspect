import { Logger } from "simpler-logs";
import { EventBus } from "../../classes/eventbus/EventBus";
import { SyncController } from "../../controllers/sync/SyncController";
import { AspectEngine } from "../Engine";

export class EngineModule {

    // Exposes core systems to module
    public logger : Logger
    public engine : AspectEngine
    public event_bus : EventBus

    constructor ( engine : AspectEngine)  {
        this.engine = engine
        this.event_bus = engine.withEventBus()
        this.logger = new Logger(`${this.constructor.name}`, 'debug')
    }

    // Module init function is called after all modules are created.
    // so that modules can access other modules.
    init () {}

    // Module start function is called after all modules are created and init.
    // to allow modules to start their own systems.
    start ()  {}


}