import {AspectServer} from '../src/index.server'
import {SimplePhysics, SimpleObject} from './physics.module'
import { ServerModule } from './server.module'

const server = new AspectServer({
    modules: [
        SimplePhysics,
        ServerModule
    ]
})
