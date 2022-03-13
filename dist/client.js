"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Engine_1 = require("./engine/Engine");
const Handshake_module_1 = require("./engine/modules/Handshake.module");
const Client_1 = require("./modules/client/Client");
function default_1(construct) {
    return new Engine_1.AspectEngine({
        modules: [
            Client_1.ClientModule,
            ...(construct.modules || [])
        ],
        handshakeModule: construct.handshake || Handshake_module_1.HandshakeModule,
        settings: {}
    });
}
exports.default = default_1;
