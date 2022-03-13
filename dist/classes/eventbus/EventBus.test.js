"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const EventBus_1 = require("./EventBus");
test('Pub-Sub', () => {
    const eventbus = new EventBus_1.EventBus();
    let value = 0;
    eventbus.subscribe('test', () => value = 1);
    eventbus.emit('test');
    eventbus.do_processAll();
    expect(value === 1).toBe(true);
});
test('Pub-Sub-Delete', () => {
    const eventbus = new EventBus_1.EventBus();
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
