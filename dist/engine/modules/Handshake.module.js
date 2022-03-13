"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HandshakeModule = void 0;
const Handshake_1 = require("../../classes/handshake/Handshake");
const Module_1 = require("./Module");
class HandshakeModule extends Module_1.EngineModule {
    constructor() {
        super(...arguments);
        this.stages = [];
    }
    add_stage(stage) {
        this.stages.push(stage);
    }
    run_handshake(connection) {
        this.logger.log('info', 'Running handshake');
        const handshake = new Handshake_1.Handshake();
        this.stages.forEach(stage => handshake.add_stage(stage));
        let open_listener = -1;
        let open_event = '';
        const do_open = (event, listen) => {
            open_listener = connection.listen(event, listen);
            open_event = event;
        };
        const do_close = () => {
            connection.remove_listener(open_listener);
            open_listener = -1;
        };
        const on_send = (data) => {
            connection.send(open_event, data);
        };
        return new Promise((resolve, reject) => {
            handshake.init({
                id: connection.get_id(),
                on_finish: () => {
                    this.logger.log('info', 'Handshake success');
                    resolve(true);
                },
                on_failure: () => {
                    this.logger.log('important', 'Handshake failed');
                    reject();
                },
                on_open: do_open.bind(this),
                on_close: do_close.bind(this),
                on_send: on_send.bind(this)
            });
            handshake.start();
        });
    }
}
exports.HandshakeModule = HandshakeModule;
