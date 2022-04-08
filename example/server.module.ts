import { Point3D } from 'cubic-array'
import {EngineModule, Connection, Events} from '../src/index.shared'
import {AspectServer} from '../src/index.server'
import { SimplePhysics, SimpleObject } from './physics.module'

export class ServerModule extends EngineModule{
    
    private physics : SimplePhysics
    private server : AspectServer

    init () {
        this.pubsub.subscribe( Events.CLIENT_JOIN , this.onConnected.bind(this))    
        this.pubsub.subscribe( Events.CLIENT_LEAVE , this.onDisconnected.bind(this))

        this.physics = this.engine.withModule(SimplePhysics)
        this.server = AspectServer.instance
    }
    start () {}

    private onConnected (connection : Connection) {

        const new_object = new SimpleObject({ 
            id : connection.id,
            position : 0,
            velocity : 0,
            acceleration : 0.001
        })
        this.physics.add_entity(new_object)
        this.server.joinGroup('0', connection)

    }

    private onDisconnected (connection : Connection) {

        this.physics.remove_entity(connection.id)
    
    }

}