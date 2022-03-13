import { AspectEngine } from "./engine/Engine";
import { ModuleBuilder } from "./engine/Engine.types";
import { HandshakeModule } from "./engine/modules/Handshake.module";
import { EngineModule } from "./engine/modules/Module";
import { ClientModule } from "./modules/client/Client";

export * as core from './core'

interface construct {
    modules ?: ModuleBuilder<EngineModule>[]
    handshake ?: ModuleBuilder<HandshakeModule>
}

export default function ( construct : construct ) {
    return new AspectEngine({
        modules : [
            ClientModule,
            ...(construct.modules || [])
        ],
        handshakeModule : construct.handshake || HandshakeModule,
        settings : {}
    })
}