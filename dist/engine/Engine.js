"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AspectEngine = void 0;
const EventBus_1 = require("../classes/eventbus/EventBus");
const simpler_logs_1 = require("simpler-logs");
class AspectEngine {
    constructor(config) {
        // A place for catch-all variables used in modules
        // Since modules lack constructors, they can't have their own variables
        this.settings = {};
        const total_modules = config.modules.length;
        const module_names = config.modules.map(m => m.name);
        this.logger = new simpler_logs_1.Logger(`AspectEngine`, 'debug');
        this.logger.log('info', 'Aspect Engine Starting');
        this.logger.log('debug', `Provided modules (${total_modules}): ${module_names.join(', ')}`);
        // Pull in the settings & intances
        this.settings = config.settings;
        this.eventBus = new EventBus_1.EventBus();
        // Create modules & start them up
        this.modules = config.modules.map(module => new module(this));
        this.handshakeModule = new config.handshakeModule(this);
        this.modules.forEach(m => m.init());
        this.handshakeModule.init();
        this.modules.forEach(m => m.start());
        this.handshakeModule.start();
    }
    withSetting(name, _default) {
        return (this.settings[name] || _default);
    }
    withHandshakeModule() {
        return this.handshakeModule;
    }
    withEventBus() {
        return this.eventBus;
    }
    withModule(module) {
        return this.modules.filter(m => m instanceof module)[0];
    }
}
exports.AspectEngine = AspectEngine;
