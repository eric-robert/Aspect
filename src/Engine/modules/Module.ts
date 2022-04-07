import { PubSub } from "instance-pubsub";
import { Logger } from "simpler-logs";
import { AspectEngine } from "../AspectEngine";

export class EngineModule {

    // Exposes core systems to module
    public logger : Logger
    public engine : AspectEngine
    public pubsub : PubSub

    constructor ( engine : AspectEngine)  {
        this.engine = engine
        this.pubsub = engine.withPubSub()
        this.logger = new Logger(`${this.constructor.name}`)
    }

    // Module init function is called after all modules are created.
    // so that modules can access other modules.
    init () {}

    // Module start function is called after all modules are created and init.
    // to allow modules to start their own systems.
    start ()  {}


}