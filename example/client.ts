// An example of a Aspect Engine Client running

import {AspectEngine, EngineModule, ClientController, Connection} from '../src/index'
import { SimplePhysics } from './physics.module'

// Construction of each module

class ClientModule extends EngineModule{
    
    private _clientController: ClientController
    private _physics : SimplePhysics

    init() {
        this._physics = this.engine.withModule(SimplePhysics)
    }

    start () {
        this._clientController = new ClientController(
            this.engine, 
            this.onConnected.bind(this),
            this.onDisconnected.bind(this)
        )
    }

    private onConnected (connection : Connection) {
        this.logger.log('info', "Connected to server")
    }

    private onDisconnected () {
        this.logger.log('info', "Left the server")
    }

}

// Start the engine running

new AspectEngine({
    modules : [
        ClientModule,
        SimplePhysics
    ], 
    settings : {}
})