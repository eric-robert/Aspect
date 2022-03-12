import * as T from './Engine.types'
import { Logger } from 'winston'
import { EngineModule } from './modules/Module'
import build_logger from './Engine.logging'
import { HandshakeModule } from './modules/Handshake.module'
import { EventBus } from '../classes/eventbus/EventBus'

export class AspectEngine {

    // A logger created for through winston which is used by all modules
    // to log messages. Child modules create child loggers to log messages
    private logger : Logger

    // The modules which are running in this engine
    private modules : EngineModule[]
    private handshakeModule : HandshakeModule

    // For events to be sent and recieved by modules
    private eventBus : EventBus

    // A place for catch-all variables used in modules
    // Since modules lack constructors, they can't have their own variables
    private settings : T.EngineSettings = {}

    constructor ( config : T.AspectEngineConstuctor ){

        const total_modules = config.modules.length
        const module_names = config.modules.map( m => m.name )

        this.logger = build_logger()
        this.logger.log('info', 'Aspect Engine Starting')
        this.logger.log('debug', `Provided modules (${total_modules}): ${module_names.join(', ')}`)

        // Pull in the settings & intances
        this.settings = config.settings
        this.eventBus = new EventBus( this.logger )

        // Create modules & start them up
        this.modules = config.modules.map( module => new module(this, this.logger))
        this.handshakeModule = new config.handshakeModule(this, this.logger)
        
        this.modules.forEach( m => m.init() )
        this.handshakeModule.init()
        
        this.modules.forEach( m => m.start() )
        this.handshakeModule.start()
    
    }

    withSetting(name : string, _default : T.ValidSettings) : T.ValidSettings {
        return (this.settings[name] || _default) as T.ValidSettings
    }

    withHandshakeModule() : HandshakeModule {
        return this.handshakeModule
    }

    withEventBus() : EventBus {
        return this.eventBus
    }
    

}