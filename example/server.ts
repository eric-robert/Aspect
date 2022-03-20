// An example of a Aspect Engine Client running

import {AspectEngine, EngineModule, Connection} from '../src/index'
import {ServerController} from '../src/index.server'
import { SimpleObject, SimplePhysics } from './physics.module'

// Construction of each module

class ServerModule extends EngineModule{
    
    private _serverController : ServerController
    private _physics : SimplePhysics

    init() {
        this._physics = this.engine.withModule(SimplePhysics)
    }

    start () {

        this._serverController = new ServerController(
            this.engine, 
            this.onConnected.bind(this),
            this.onDisconnected.bind(this)
        )

        this._physics.add_entity(new SimpleObject({
            id: 1,
            position: 0,
            velocity: 0,
            acceleration: 1
        }))
    }

    private onConnected (connection : Connection) {
        this.logger.log('info', `Client ${connection.id} connected to server`)
    }

    private onDisconnected ( connection : Connection ) {
        this.logger.log('info', "Left the server")
    }

}

// Start the engine running

new AspectEngine({
    modules : [
        ServerModule,
        SimplePhysics
    ], 
    settings : {}
})