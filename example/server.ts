// An example of a Aspect Engine Client running

import {AspectEngine, EngineModule, ServerController, Connection} from '../src/index'

// Construction of each module

class ServerModule extends EngineModule{
    
    private _serverController : ServerController

    start () {
        this._serverController = new ServerController(this.engine, this.onConnected.bind(this))
    }

    private onConnected (connection : Connection) {
        this.logger.log('info', "Connected to server")
    }

}

// Start the engine running

new AspectEngine({
    modules : [
        ServerModule
    ], 
    settings : {}
})