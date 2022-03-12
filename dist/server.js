"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Engine_1 = require("./engine/Engine");
const Handshake_module_1 = require("./engine/modules/Handshake.module");
const Server_1 = require("./modules/server/Server");
function default_1() {
    return new Engine_1.AspectEngine({
        modules: [
            Server_1.ServerModule
        ],
        handshakeModule: Handshake_module_1.HandshakeModule,
        settings: {}
    });
}
exports.default = default_1;
