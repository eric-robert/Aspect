import { AspectEngine } from "./engine/Engine";
import { HandshakeModule } from "./engine/modules/Handshake.module";
import { ServerModule } from "./modules/server/Server";

export default function ( ) {
    return new AspectEngine({
        modules : [
            ServerModule
        ],
        handshakeModule : HandshakeModule,
        settings : {}
    })
}