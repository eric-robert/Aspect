"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Handshake_1 = require("./Handshake");
class HandshakeBridge {
    constructor() {
        this.open_pipes = [
            {
                name: undefined,
                callback: undefined
            },
            {
                name: undefined,
                callback: undefined
            }
        ];
        this.handshake_initiator = new Handshake_1.Handshake();
        this.handshake_responder = new Handshake_1.Handshake();
        this.init_handshake(this.handshake_initiator, 0);
        this.init_handshake(this.handshake_responder, 1);
    }
    init_handshake(handshake, pipe) {
        handshake.init({
            id: -1,
            on_finish() { },
            on_failure() { },
            on_open: ((event, listen) => {
                if (!this.open_pipes[pipe].name) {
                    this.open_pipes[pipe].name = event;
                    this.open_pipes[pipe].callback = listen;
                }
            }).bind(this),
            on_close: (() => {
                this.open_pipes[pipe].name = undefined;
            }).bind(this),
            on_send: ((data) => {
                if (this.open_pipes[pipe].name == this.open_pipes[1 - pipe].name) {
                    this.open_pipes[1 - pipe].callback(data);
                }
            }).bind(this)
        });
    }
    add_stage(side, stage) {
        if (side == 'initiator') {
            this.handshake_initiator.add_stage(stage);
        }
        else if (side == 'responder') {
            this.handshake_responder.add_stage(stage);
        }
    }
    start() {
        this.handshake_responder.start();
        this.handshake_initiator.start();
    }
}
test('Simple Handshake', () => {
    const bridge = new HandshakeBridge();
    bridge.add_stage('initiator', {
        name: 'test',
        initiate: () => {
            return "Hello";
        },
        recieve(id, data, success, fail) {
            success();
        }
    });
    bridge.add_stage('responder', {
        name: 'test',
        recieve(id, data, success, fail) {
            success("Hi");
        }
    });
    bridge.start();
});
