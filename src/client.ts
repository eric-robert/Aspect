import { AspectEngine } from "./Engine/Engine";
import { ModuleClass } from "./Engine/Engine.types";
import { NoneHandshakeClient } from "./Handshake/Handshake.none";
import { HandshakeModuleClass } from "./Handshake/Handshake.types";
import { LogLevel } from "./Logging/Logging.types";
import { ClientModule } from "./Modules/Client/Client";

export interface AspectClientConstructor {

    // Client can define modules outside of the AspectEngine to be loaded
    // This is the primary way to run a client
    modules ?: ModuleClass[],

    // Client can also set a custom handshake module that will be used
    // when establishing a connection to the server
    handshake ?: HandshakeModuleClass

    // Client also needs a few settings to be passed to the engine
    logLevel ?: number

}

export default function ( config : AspectClientConstructor) {

    // To run the client, we need a few custom modules
    const requiredModules = [ ClientModule ];

    // And the ones given to use
    const givenModules = config.modules || [];

    // Create the AspectEngine ans we are done
    return new AspectEngine({
        logLevel: config.logLevel || LogLevel.DEBUG,
        modules: [ ...requiredModules, ...givenModules],
        handshake: config.handshake || NoneHandshakeClient,
        settings: {}
    })
}