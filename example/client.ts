// An example of a Aspect Engine Client running

import {AspectEngine, EngineModule, ClientController, Connection} from '../src/index'

// Construction of each module

class ClientModule extends EngineModule{
    
    private _clientController: ClientController

    start () {
        this._clientController = new ClientController(this.engine, this.onConnected.bind(this))
    }

    private onConnected (connection : Connection) {
        this.logger.log('info', "Connected to server")
    }

}

// Start the engine running

new AspectEngine({
    modules : [
        ClientModule
    ], 
    settings : {}
})