import {AspectClient} from '../src/index.client'
import {SimplePhysics} from './physics.module'

const client = new AspectClient({
    modules : [
        SimplePhysics
    ]
})