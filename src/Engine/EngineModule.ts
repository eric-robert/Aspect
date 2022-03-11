import { EventBus } from "../Events/EventBus"
import { Logger } from "../Logging/Logging"
import { LogLevel } from "../Logging/Logging.types"
import { AspectEngine } from "./Engine"

export class EngineModule {
    
    private logger : Logger
    public log : (message : string, level ?: number) => void
    public eventBus : EventBus

    /**
     * Modules encapsulate the logic of the engine and expose 
     * systems like the event bus, logger, and sync loop.
     * @param engine The engine instance
     * @param logLevel The log level of the module
     */
    constructor ( public engine : AspectEngine, private logLevel : number ) {
        this.logger = new Logger(`${this.constructor.name}`, logLevel)
        this.log = (message : string, level ?: number) => this.logger.log(message, level)
        this.eventBus = engine.getEventBus()
    }
    
    /**
     * Initialize the module by allowing it to pull in any dependency modules
     * and set up any internal state.
     */
    init (){}

    /**
     * Start the module. Called after all modules have been initialized.
     */
    start (){}

}