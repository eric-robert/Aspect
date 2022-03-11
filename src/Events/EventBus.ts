import { Subscription, EmittedEvent } from "./EventBus.types"

export class EventBus {

    private subscribers : Map<string, Subscription[]> = new Map()
    private queue : EmittedEvent[] = []

    /**
     * Subscribe to an event on the engine
     * @param label The event to subscribe to
     * @param sub The callback to call when the event is emitted
     */
    subscribe ( label : string, sub : Subscription ) {
        const callbacks = this.subscribers.get(label)
        if (!callbacks) this.subscribers.set(label, [sub])
        else callbacks.push(sub)
    }

    /**
     * Emit an event on the engine. Will be processed by the engine's event bus
     * at the next opportunity. But not guaranteed to be processed immediately.
     * @param label The event to emit
     * @param data The data to emit
     */
    emit (label : string, data ?: any) {
        this.queue.push({label, data})
    }

    /**
     * Process all events in the queue recursively. If an event is emitted while
     * processing another event, the event will be processed after the current event
     * is finished.
     */
    process_all () {
        while (this.queue.length != 0)  
            this.process_backlog()
        
    }

    /**
     * Process all events in the queue. If an event is emitted while processing
     * another event, the event will skipped.
     */
    private process_backlog () {

        const events = this.queue
        const count = events.length
        const markedForDelete : {event:string, subscription:Subscription}[] = []

        for (let i = 0; i < count; i++) {
            
            const event = events[i]
            const callbacks = this.subscribers.get(event.label)

            // Allow an event to remove the subscription from the list
            const removeCallback = (subscription : Subscription) => () => markedForDelete.push({ event : event.label, subscription})

            if (callbacks) 
                callbacks.forEach(cb => cb(event, removeCallback(cb)))
        }

        // Remove all marked subscriptions
        markedForDelete.forEach(({event, subscription}) => {
            const callbacks = this.subscribers.get(event)
            if (!callbacks) return
            const index = callbacks.indexOf(subscription)
            if (!index || index < 0) return
            callbacks.splice(index, 1)
        })

        // Clear the queue of the events that were processed
        this.queue.splice(0, count)
    
    }

}