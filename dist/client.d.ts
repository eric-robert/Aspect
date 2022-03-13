import { AspectEngine } from "./engine/Engine";
import { ModuleBuilder } from "./engine/Engine.types";
import { HandshakeModule } from "./engine/modules/Handshake.module";
import { EngineModule } from "./engine/modules/Module";
interface construct {
    modules?: ModuleBuilder<EngineModule>[];
    handshake?: ModuleBuilder<HandshakeModule>;
}
export default function (construct: construct): AspectEngine;
export {};