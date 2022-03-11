import {AspectServer} from '../../src'
import { Handshake } from './handshake'

AspectServer({
    handshake : Handshake,
    msPerTick : 1000
})