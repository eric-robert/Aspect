## Fire Aspect

A quick and dirty real-time websocket-basted server-client engine for node and websites

Features:

- `Interpolation`

- `Socket.io`

- `Modules Systems`

Simply load up with a client and a server and see how they establish a sync with eachother.
Add your own modules for greater effect.


### Installation

```
    npm install fire-aspect
```


### Usage

Fire aspect aims to sync server and clients with eachother in a real time networked way. This means behind the scenes fire-aspect will get everything running for you and keep it all in sync, fighting against latency and dropped clients.

Classes implement syncable entity to be used across the network

```
export class SimpleObject implements SyncableEntity<SyncData> {
```

Then implement handlers for fire-aspect to call to sync

```

    public get_sync_data(): SyncData {
        return {
            id: this.id,
            position: this._position,
            velocity: this._velocity,
            acceleration: this._acceleration
        }
    }

    public receive_sync_data ( data : SyncData ) {
        this._position = data.position
        this._velocity = data.velocity
        this._acceleration = data.acceleration
    }

```

Clients and servers then both pull in the module so it runs on both clients

```
import {AspectClient} from '../src/index.client'
import {SimplePhysics} from './physics.module'

const client = new AspectClient({
    modules : [
        SimplePhysics
    ]
})
```

```
import {AspectServer} from '../src/index.server'
import {SimplePhysics, SimpleObject} from './physics.module'
import { ServerModule } from './server.module'

const server = new AspectServer({
    modules: [
        SimplePhysics,
        ServerModule
    ]
})
```
