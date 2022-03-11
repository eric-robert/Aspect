import { AspectEngine } from "./Engine/Engine";
import { ModuleClass, EngineSettings } from "./Engine/Engine.types";
import { NoneHandshakeServer } from "./Handshake/Handshake.none";
import { HandshakeModuleClass } from "./Handshake/Handshake.types";
import { LogLevel } from "./Logging/Logging.types";
import { ServerModule } from "./Modules/Server/Server";
import { ServerSettings } from "./Modules/Server/Server.types";

export interface ServerConstructor {

    // The server can define modules outside of the AspectEngine to be loaded
    // This is the primary way to run a server
    modules ?: ModuleClass[],

    // The server can also set a custom handshake module that will be used
    // when establishing a connection to the client
    handshake ?: HandshakeModuleClass,
    
    // Client also needs a few settings to be passed to the engine
    logLevel ?: number
    msPerTick ?: number
    ticksPerSync ?: number

}

export default function ( config : ServerConstructor) {

    // To run the client, we need a few custom modules
    const requiredModules = [ ServerModule ];

    // And the ones given to use
    const givenModules = config.modules || [];

    return new AspectEngine({
        logLevel: config.logLevel || LogLevel.DEBUG,
        modules: [ ...requiredModules, ...givenModules],
        handshake: config.handshake || NoneHandshakeServer,
        settings: {
            [ServerSettings.MS_PER_TICK] : config.msPerTick || 1000,
            [ServerSettings.TICKS_PER_SYNC] : config.ticksPerSync || 4
        }
    })
}