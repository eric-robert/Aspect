"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Metrics = void 0;
class Metrics {
    constructor(history = 40) {
        this.history = history;
        this.latancy = 0;
        this.running_latancy = [];
    }
    update_latancy(time) {
        const latancy = Date.now() - time;
        this.running_latancy.push(latancy);
        this.latancy = this.running_latancy
            .reduce((a, b) => a + b) / this.running_latancy.length;
        if (this.running_latancy.length > this.history)
            this.running_latancy.shift();
    }
    get_latancy() {
        return this.latancy;
    }
}
exports.Metrics = Metrics;
