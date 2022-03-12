"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AspectEngine = void 0;
const Engine_logging_1 = __importDefault(require("./Engine.logging"));
const EventBus_1 = require("../classes/eventbus/EventBus");
class AspectEngine {
    constructor(config) {
        // A place for catch-all variables used in modules
        // Since modules lack constructors, they can't have their own variables
        this.settings = {};
        const total_modules = config.modules.length;
        const module_names = config.modules.map(m => m.name);
        this.logger = (0, Engine_logging_1.default)();
        this.logger.log('info', 'Aspect Engine Starting');
        this.logger.log('debug', `Provided modules (${total_modules}): ${module_names.join(', ')}`);
        // Pull in the settings & intances
        this.settings = config.settings;
        this.eventBus = new EventBus_1.EventBus(this.logger);
        // Create modules & start them up
        this.modules = config.modules.map(module => new module(this, this.logger));
        this.handshakeModule = new config.handshakeModule(this, this.logger);
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
}
exports.AspectEngine = AspectEngine;
