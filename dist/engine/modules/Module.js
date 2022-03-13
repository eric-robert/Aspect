"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EngineModule = void 0;
const simpler_logs_1 = require("simpler-logs");
class EngineModule {
    constructor(engine) {
        this.engine = engine;
        this.event_bus = engine.withEventBus();
        this.logger = new simpler_logs_1.Logger(`${this.constructor.name}`, 'debug');
    }
    // Module init function is called after all modules are created.
    // so that modules can access other modules.
    init() { }
    // Module start function is called after all modules are created and init.
    // to allow modules to start their own systems.
    start() { }
}
exports.EngineModule = EngineModule;
