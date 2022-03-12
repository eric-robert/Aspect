"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EngineModule = void 0;
class EngineModule {
    constructor(engine, root_logger) {
        this.engine = engine;
        this.logger = root_logger.child({ module: this.constructor.name });
        this.event_bus = engine.withEventBus();
    }
    // Module init function is called after all modules are created.
    // so that modules can access other modules.
    init() { }
    // Module start function is called after all modules are created and init.
    // to allow modules to start their own systems.
    start() { }
}
exports.EngineModule = EngineModule;
