import {AspectServer} from '../src/index.server'
import {SimplePhysics, SimpleObject} from './physics.module'

const server = new AspectServer({
    modules: [
        SimplePhysics
    ]
})

setTimeout(() => {
    const entity = new SimpleObject({
        id : 0,
        position : 0,
        velocity : 0,
        acceleration : 0
    })
    server.engine.withSyncControllers()[0].begin_syncing_entity(entity)
}, 200)
