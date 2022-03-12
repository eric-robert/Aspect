import { AspectEngine } from "./engine/Engine";
import { HandshakeModule } from "./engine/modules/Handshake.module";
import { ClientModule } from "./modules/client/Client";

export default function ( ) {
    return new AspectEngine({
        modules : [
            ClientModule
        ],
        handshakeModule : HandshakeModule,
        settings : {}
    })
}