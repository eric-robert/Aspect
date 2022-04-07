import { Logger } from 'simpler-logs'
import {PubSub} from 'instance-pubsub'
import * as T from './AspectEngine.types'
import { EngineModule } from './modules/Module'
import { SyncController } from '../index.shared'

export const Events = T.Events
export const Requests = T.Requests

// import { ActionController } from '../../_old/controllers/action/ActionController'

export class AspectEngine {

    static instance : AspectEngine

    // Logs are through simple-logger
    private logger : Logger

    // The engine allows customation through various user-given modules
    private modules : EngineModule[]

    // Provided on init for various global settings not included elsewheree
    private global_settings : T._settings
    
    // The engine has a bus for events
    private pubsub : PubSub

    // For syncing entities and easy expandability
    private syncControllers : SyncController<any, any>[]

    /*    
        // Adds a sync controller to the engine
        private _syncControllers : SyncController<any, any>[] = []

        // Action Controllers to sync too
        private _actionControllers : ActionController[] = []
    */

    // Contruction of the engine

    constructor ( config ?: T.AspectEngineConstuctor  ){

        AspectEngine.instance = this

        // Setup the logger
        if (!config) config = {}
        this.logger = config.logger || new Logger('AspectEngine')

        // Load the modules
        config.modules = config.modules || []
        const total_modules = config.modules.length
        const module_names = config.modules.map( m => m.name )
        const print_names = module_names.join(', ') || 'none'
        this.logger.log('Aspect Engine Starting')
        this.logger.log(`Loading ${total_modules} modules: ${print_names}`)

        // Pull in the settings
        config.settings = config.settings || {}
        const print_settings = Object.keys(config.settings).join(', ') || 'none'
        this.logger.log(`Loading settings for: ${print_settings}`)
        this.global_settings = config.global_settings || {}

        // Create the pub sub system
        this.pubsub = new PubSub()
        this.syncControllers = []

        // Create modules & start them up
        this.modules = config.modules.map( module => new module(this))
        this.modules.forEach( m => m.init())    
        this.modules.forEach( m => m.start())

    }

    // Access to engine resources

    withSetting<T>(name : string, _default : T) : T {
        return (this.global_settings[name] || _default) as T
    }

    withPubSub() : PubSub {
        return this.pubsub
    }
    
    withModule<T extends EngineModule>(module : T.Class<T> ) : T {
        return this.modules.filter(m => m instanceof module)[0] as T
    }

    withSyncControllers() : SyncController<any, any>[] {
        return this.syncControllers
    }

    // Register controllers
    
    register_sync_controller ( syncController : SyncController<any, any>) {
        this.syncControllers.push(syncController)
    }


    /*
    

    withActionControllers() : ActionController[] {
        return this._actionControllers
    }

    // Adds a sync controller to the engine
    

    // Adds an action controller to the engine
    register_action_controller ( actionController : ActionController) {
        this._actionControllers.push(actionController)
    }
    */

    /*
    on_game_tick() {
        this._syncControllers.forEach( s => s.tick_forwards(this) )
    }
    */

}