import { EventBus } from "./EventBus";
import winston from "winston";
import { EmittedEvent, RemoveSubscription } from "./EventBus.types";

let debugLogger = winston.createLogger({
    level: 'debug',
    format: winston.format.json({ space: 4}),
    transports: [
        new winston.transports.File({ filename: './logs/test-eventbus.log', options : { flags : 'w' } }),
    ]
})

test('Pub-Sub', () => {

    const eventbus = new EventBus(debugLogger)

    let value = 0

    eventbus.subscribe('test', () => value = 1)
    eventbus.emit('test')
    eventbus.do_processAll()

    expect(value === 1).toBe(true);

});


test('Pub-Sub-Delete', () => {

    const eventbus = new EventBus(debugLogger)

    let value = 0

    function event<T> (event : EmittedEvent<T>, remove : RemoveSubscription) {
        value += 1
        remove()
    }   

    eventbus.subscribe('test', event)
    eventbus.emit('test')
    eventbus.emit('test')
    eventbus.do_processAll()

    expect(value === 1).toBe(true);

});