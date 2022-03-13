"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventBus = void 0;
const simpler_logs_1 = require("simpler-logs");
class EventBus {
    constructor() {
        // Mapping of event labels to callbacks for that event
        this.subscribers = new Map();
        // Queue of events to process at next opportunity
        this.queue = [];
        this.logger = new simpler_logs_1.Logger(`EventBus`, 'debug');
    }
    // Utils
    process_backlog() {
        this.logger.log('debug', `Processing backlog (${this.queue.length}): ${this.queue.map(e => e.label).join(', ')}`);
        const count = this.queue.length;
        const markedForDelete = [];
        const marked = [];
        for (let i = 0; i < count; i++) {
            const event = this.queue[i];
            const callbacks = this.subscribers.get(event.label);
            // Trigger each callback and provide a callback to remove the subscription if needed
            if (callbacks) {
                callbacks
                    .filter(sub => !marked.includes(sub))
                    .forEach(callback => {
                    callback(event, () => {
                        marked.push(callback);
                        markedForDelete.push({ event: event.label, subscription: callback });
                    });
                });
            }
        }
        // Remove all marked subscriptions
        markedForDelete.forEach(({ event, subscription }) => {
            this.logger.log('debug', `Removing a subscription for event ${event}`);
            const callbacks = this.subscribers.get(event);
            if (!callbacks)
                return;
            const index = callbacks.indexOf(subscription);
            if (!index || index < 0)
                return;
            callbacks.splice(index, 1);
        });
        // Clear the queue of the events that were processed
        this.queue.splice(0, count);
    }
    // Public Functions
    subscribe(label, sub) {
        this.logger.log('debug', `Adding subscription to event ${label}`);
        const callbacks = this.subscribers.get(label);
        if (!callbacks)
            this.subscribers.set(label, [sub]);
        else
            callbacks.push(sub);
    }
    emit(label, data) {
        this.queue.push({ label, data });
    }
    do_processAll() {
        this.logger.log('debug', `Processing all events`);
        while (this.queue.length != 0)
            this.process_backlog();
    }
}
exports.EventBus = EventBus;
