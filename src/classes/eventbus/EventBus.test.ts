import { EventBus } from "./EventBus";
import { EmittedEvent, RemoveSubscription } from "./EventBus.types";


test('Pub-Sub', () => {

    const eventbus = new EventBus()

    let value = 0

    eventbus.subscribe('test', () => value = 1)
    eventbus.emit('test')
    eventbus.do_processAll()

    expect(value === 1).toBe(true);

});


test('Pub-Sub-Delete', () => {

    const eventbus = new EventBus()

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