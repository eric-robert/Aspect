import {Logger} from "winston";
import { EventBus } from "../../classes/eventbus/EventBus";
import { AspectEngine } from "../Engine";
import * as T from './Module.types'

export class EngineModule {

    // Exposes core systems to module
    public logger : Logger
    public engine : AspectEngine
    public event_bus : EventBus

    constructor ( engine : AspectEngine, root_logger : Logger )  {
        this.engine = engine
        this.logger = root_logger.child({module : this.constructor.name})
        this.event_bus = engine.withEventBus()
    }

    // Module init function is called after all modules are created.
    // so that modules can access other modules.
    public init () {}

    // Module start function is called after all modules are created and init.
    // to allow modules to start their own systems.
    public start () {}


}