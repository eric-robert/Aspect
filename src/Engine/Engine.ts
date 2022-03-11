import { EventBus } from "../Events/EventBus"
import { HandshakeModule } from "../Handshake/Handshake.module"
import { HandshakeModuleClass } from "../Handshake/Handshake.types"
import { Logger } from "../Logging/Logging"
import { LogLevel } from "../Logging/Logging.types"
import { SyncLoop } from "../Syncloop/SyncLoop"
import { SyncloopConstructor } from "../Syncloop/SyncLoop.types"
import { SyncSubscriber } from "../SyncSubscriber/SyncSubscriber"
import { EngineConstructor, EngineEvents, EngineSettings, ModuleClass, ValidSettings } from "./Engine.types"
import { EngineModule } from "./EngineModule"

export class AspectEngine {

    // The event bus allows modules to communicate with each other
    // through a pub/sub system
    private eventBus : EventBus

    // The sync loop is responsible for syncing the game ticks across the network
    // Each module can register a callback to be called on each tick.
    // Syncloop setup in handshaking process
    private syncLoop : SyncLoop

    // The client provides a collection of modules to the engine
    // The engine will create a new instance of each module for injection
    private modules : EngineModule[] 
    private rawModules : ModuleClass[]

    // Syncinc is broken up into groupings of events.
    // Clients can subscribe to these groups and only
    // recieve sync events that are in their group.
    private syncSubscriptions : SyncSubscriber

    // A special module for handling handshaking where clients and servers can
    // exchange information about the other end before the game starts.
    // this is not started by the engine, but left to a module to load in.
    private rawHandshakeModule : HandshakeModuleClass

    // A place for catch-all variables used in modules
    // Since modules lack constructors, they can't have their own variables
    private settings : EngineSettings = {}

    // Logging done through the logger with a default log level of IMPORTANT
    private logger : Logger
    private logLevel : number

    /**
     * The engine is the main class that handles all the modules and connections.
     * It is responsible for creating the modules, injecting them into the event bus,
     * and starting the sync loop.
     * Both the client and server will create an instance of the engine.
     * @param config Variables to set for the engine
     */
    constructor ( config : EngineConstructor ){

        // Default values
        if (!config.logLevel) config.logLevel = LogLevel.IMPORTANT

        // Set logging up
        this.logger = new Logger("Aspect Engine", config.logLevel)
        this.logLevel = config.logLevel
        this.logger.log('Aspect Engine Starting', LogLevel.IMPORTANT)

        // Set Modules
        this.rawModules = config.modules
        this.rawHandshakeModule = config.handshake

        // Grab settings
        this.settings = config.settings

        // Create the event bus & syncer
        this.eventBus = new EventBus()
        this.syncSubscriptions = new SyncSubscriber()

        // Create modules and kick off this instance
        this.start()

    }

    /**
     * Start the engine.
     * This will create the modules, call their init functions, and start the socket.
     */
    private start (){
        
        // Create all the module instances
        this.modules = this.rawModules.map(module => new module(this, this.logLevel))

        // Init all the modules
        this.modules.map( m => m.init())
        this.eventBus.process_all()

        // Start all the modules
        this.modules.map( m => m.start())
        this.eventBus.process_all()
    }

    /**
     * Get a module by Class. If there is no module with that class, you will get undefined.
     * @param moduleClass Class of the module to get
     * @returns The module with the given class
     */
    withModule<U extends EngineModule> ( module : ModuleClass ) : U {
        return this.modules.filter( m => m instanceof module )[0] as U
    }

    /**
     * Gets a setting from the engine by name. If the setting does not exist, you will get the default value.
     * @param name Name of the setting to get
     * @param defaultValue Default value to return if the setting does not exist
     * @returns The value of the setting
     */
    withSetting<T extends ValidSettings>(name : string, _default : T) : ValidSettings {
        return (this.settings[name] || _default) as T
    }

    /**
     * Get a new instance of the handshake module.
     * @returns The handshake module
     */
    withHandshake () : HandshakeModule {
        const handshake = new this.rawHandshakeModule(this, this.logLevel)
        handshake.init()
        handshake.start()
        return handshake
    }

    /**
     * Starting the sync loop from a sync loop constructor.
     * @param syncLoopConstructor The constructor of the sync loop to start
     */
    startSyncLoop (config : SyncloopConstructor) {
        this.syncLoop = new SyncLoop(config)
    }   

    /**
     * Get the sync loop constructor data for the engine.
     * Use this to sync with another sync loop across the network.
     * @returns The sync loop constructor data
     */
    getSyncLoop () : SyncloopConstructor {
        return this.syncLoop.get_state()
    }

    /**
     * Get the event bus for the engine.
     * @returns The event bus
     */
    getEventBus () : EventBus {
        return this.eventBus
    }

    /**
     * Get the SyncSubscriber for the engine.
     * @returns The SyncSubscriber
     */
    getSyncSubscriber () : SyncSubscriber {
        return this.syncSubscriptions
    }

}