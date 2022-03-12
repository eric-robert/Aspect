"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Connection = void 0;
const metrics_1 = require("./metrics/metrics");
class Connection {
    constructor(config, root_logger) {
        this.debug_latancy = 0;
        this.connectionListeners = new Map();
        this.id = ++Connection._id;
        this.logger = root_logger.child({ module: `Connection ${this.id}` });
        // Allowed to artificially set latancy
        this.debug_latancy = config.options.debug_latancy || 0;
        // Save instanses
        this.socket = config.socket;
        this.metrics = new metrics_1.Metrics();
    }
    // Private
    get_wrapped(data) {
        return { data, time: Date.now() };
    }
    get_unwrapped(data) {
        this.metrics.update_latancy(data.time);
        return data.data;
    }
    // Public
    send(event, data) {
        this.logger.log('debug', `Sending event: '${event}'`);
        const wrapped = this.get_wrapped(data);
        const send = () => this.socket.emit(event, wrapped);
        setTimeout(send, this.debug_latancy);
    }
    listen(event, callback) {
        this.logger.log('debug', `Listening for event: '${event}'`);
        const id = ++Connection._id;
        const listener = (response) => {
            setTimeout(() => {
                callback(this.get_unwrapped(response));
            }, this.debug_latancy);
        };
        const record = { event, callback: listener };
        this.socket.on(event, listener);
        this.connectionListeners.set(id, record);
        return id;
    }
    listen_singular(event, callback) {
        const id = this.listen(event, data => {
            callback(data);
            this.remove_listener(id);
        });
    }
    remove_listener(id) {
        const { event, callback } = this.connectionListeners.get(id);
        this.logger.log('debug', `Removing listener for event: '${event}'`);
        this.connectionListeners.delete(id);
        this.socket.off(event, callback);
    }
    // Getters
    get_latancy() { return this.metrics.get_latancy(); }
    get_id() { return this.id; }
}
exports.Connection = Connection;
Connection._id = 0;
