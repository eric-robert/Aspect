import {AspectClient} from '../src/index.client'
import {SimplePhysics} from './physics.module'

const client = new AspectClient({
    modules : [
        SimplePhysics
    ]
})


setTimeout(() => {
    client.recordAction({
        label : 'move',
        data : {
            x : 1,
            y : 1
        }
    })
}, 2000)
