import * as T from './Engine.types'
import { EngineModule } from './modules/Module'
import { EventBus } from '../classes/eventbus/EventBus'
import { Logger } from 'simpler-logs'
import { SyncController } from '../controllers/sync/SyncController'

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

    // Adds a sync controller to the engine
    private _syncControllers : SyncController<any, any>[] = []

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
        this.modules.forEach( m => m.init())    
        this.modules.forEach( m => m.start())
    
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
    
    withSyncControllers() : SyncController<any, any>[] {
        return this._syncControllers
    }


    // Adds a sync controller to the engine
    register_sync_controller ( syncController : SyncController<any, any>) {
        this._syncControllers.push(syncController)
    }



    

}