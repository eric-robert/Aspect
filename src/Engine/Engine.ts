import * as T from './Engine.types'
import { EngineModule } from './modules/Module'
import { EventBus } from '../eventbus/EventBus'
import { Logger } from 'simpler-logs'

export class AspectEngine {

    // A logger created for through winston which is used by all modules
    // to log messages. Child modules create child loggers to log messages
    private logger : Logger

    // The modules which are running in this engine
    private modules : EngineModule[]
    
    // For events to be sent and recieved by modules
    private eventBus : EventBus

    // A place for catch-all variables used in modules
    // Since modules lack constructors, they can't have their own variables
    private settings : T.EngineSettings = {}

    constructor ( config : T.AspectEngineConstuctor ){

        const total_modules = config.modules.length
        const module_names = config.modules.map( m => m.name )

        this.logger = new Logger(`AspectEngine`, 'debug')
        this.logger.log('info', 'Aspect Engine Starting')
        this.logger.log('debug', `Provided modules (${total_modules}): ${module_names.join(', ')}`)

        // Pull in the settings & intances
        this.settings = config.settings
        this.eventBus = new EventBus ()

        // Create modules & start them up
        this.modules = config.modules.map( module => new module(this))
        this.modules.forEach( m => m.triggerInit())    
        this.modules.forEach( m => m.triggerStart())
    
    }

    withSetting(name : string, _default : T.ValidSettings) : T.ValidSettings {
        return (this.settings[name] || _default) as T.ValidSettings
    }

    withEventBus() : EventBus {
        return this.eventBus
    }

    withModule<T extends EngineModule>(module : T.ModuleBuilder<T> ):T{
        return this.modules.filter(m => m instanceof module)[0] as T
    }
    

}