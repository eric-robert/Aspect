import { Logger } from "simpler-logs";
import { EventBus } from "../../eventbus/EventBus";
import { AspectEngine } from "../Engine";

export class EngineModule {

    // Exposes core systems to module
    public logger : Logger
    public engine : AspectEngine
    public event_bus : EventBus

    // Callback functions
    // Module init function is called after all modules are created.
    // so that modules can access other modules.
    private _inits : Function[] = []

    // Module start function is called after all modules are created and init.
    // to allow modules to start their own systems.
    private _starts : Function[] = []

    constructor ( engine : AspectEngine)  {
        this.engine = engine
        this.event_bus = engine.withEventBus()
        this.logger = new Logger(`${this.constructor.name}`, 'debug')
    }

    public withInit ( init : Function ) {
        this._inits.push( init )
    }

    public withStart ( start : Function ) {
        this._starts.push( start )
    }

    public triggerInit () {
        this._inits.forEach( init => init() )
    }

    public triggerStart () {
        this._starts.forEach( start => start() )
    }


}