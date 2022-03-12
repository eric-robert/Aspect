"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Handshake = void 0;
class Handshake {
    constructor(logger) {
        this.stages = [];
        this.current = -1;
        this.has_sent = false;
        this.logger = logger.child({ module: 'Handshake' });
    }
    init(config) {
        this.id = config.id;
        this.do_open = config.on_open;
        this.do_close = config.on_close;
        this.do_send = config.on_send;
        this.success_callback = config.on_finish;
        this.failure_callback = config.on_failure;
    }
    // Public Methods
    add_stage(stage) {
        this.stages.push(stage);
    }
    start() {
        this.progress_stage();
    }
    // Private methods
    get_name(stage_name) {
        return `Handshake::${stage_name}`;
    }
    progress_stage() {
        // Reset from previous stage
        this.current++;
        this.has_sent = false;
        // IF we have an open listener, close it
        if (this.current != 0)
            this.do_close();
        // If we are out of stages, we are done
        const stages_left = this.current < this.stages.length;
        if (!stages_left)
            return this.success_callback();
        // If not, then we need to open a listener, get its name
        const target_stage = this.stages[this.current];
        const label = this.get_name(target_stage.name);
        // Open a listener
        this.do_open(label, this.on_recieve.bind(this));
        // If we have an initiator, send the first message
        if (target_stage.initiate) {
            this.do_send(target_stage.initiate(this.id));
            this.has_sent = true;
        }
    }
    on_recieve(recieved) {
        const target_stage = this.stages[this.current];
        const initiator = !!target_stage.initiate;
        const has_sent = this.has_sent;
        this.has_sent = true;
        // If we didnt recieve a message, we failed
        if (!recieved) {
            this.do_close();
            this.failure_callback();
        }
        // You are the listener recieving first message
        else if (!initiator && !has_sent) {
            this.logger.log("debug", `listener recieved first message ` + recieved);
            target_stage.recieve(this.id, recieved, (_) => this.do_send(_ || true), () => {
                this.do_send(null);
                this.do_close();
                this.failure_callback();
            });
        }
        // You are the initiator recieving first message
        else if (initiator) {
            this.logger.log("debug", `initiator recieved first message ` + recieved);
            target_stage.recieve(this.id, recieved, () => {
                this.do_send(true);
                this.progress_stage();
            }, () => {
                this.do_send(null);
                this.do_close();
                this.failure_callback();
            });
        }
        // You are the listener recieving second message
        else if (!initiator && this.has_sent) {
            this.logger.log("debug", `listener recieved second message ` + recieved);
            this.progress_stage();
        }
    }
}
exports.Handshake = Handshake;
