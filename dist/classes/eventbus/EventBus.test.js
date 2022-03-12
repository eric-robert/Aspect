"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const EventBus_1 = require("./EventBus");
const winston_1 = __importDefault(require("winston"));
let debugLogger = winston_1.default.createLogger({
    level: 'debug',
    format: winston_1.default.format.json({ space: 4 }),
    transports: [
        new winston_1.default.transports.File({ filename: './logs/test-eventbus.log', options: { flags: 'w' } }),
    ]
});
test('Pub-Sub', () => {
    const eventbus = new EventBus_1.EventBus(debugLogger);
    let value = 0;
    eventbus.subscribe('test', () => value = 1);
    eventbus.emit('test');
    eventbus.do_processAll();
    expect(value === 1).toBe(true);
});
test('Pub-Sub-Delete', () => {
    const eventbus = new EventBus_1.EventBus(debugLogger);
    let value = 0;
    function event(event, remove) {
        value += 1;
        remove();
    }
    eventbus.subscribe('test', event);
    eventbus.emit('test');
    eventbus.emit('test');
    eventbus.do_processAll();
    expect(value === 1).toBe(true);
});
