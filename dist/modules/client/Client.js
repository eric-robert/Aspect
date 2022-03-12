"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientModule = void 0;
const socket_io_client_1 = require("socket.io-client");
const Connection_1 = require("../../classes/connection/Connection");
const SyncLoop_1 = require("../../classes/syncloop/SyncLoop");
const Module_1 = require("../../Engine/modules/Module");
const events_1 = require("../../events");
const T = __importStar(require("./Client.types"));
class ClientModule extends Module_1.EngineModule {
    init() {
        // Grab modules
        this._handshake_module = this.engine.withHandshakeModule();
        // Grab settings
        this.serverIP = this.engine.withSetting(T.ClientSettings.SERVER_IP, 'localhost:3000');
        // Add SyncLoop to handshake
        this._handshake_module.add_stage({
            name: 'syncloop',
            recieve: (id, _, success) => {
                this.on_sync_loop_sync(_);
                success();
            }
        });
    }
    start() {
        // Connect to server
        this.logger.log('info', `Connecting to ${this.serverIP}`);
        this.socket = (0, socket_io_client_1.io)('ws://' + this.serverIP);
        this.connection = new Connection_1.Connection({ socket: this.socket, options: {} }, this.logger);
        this.socket.on('connect', this.on_server_connection.bind(this));
    }
    // Event callbacks
    on_server_connection() {
        this.logger.log('debug', 'Connected to server');
        this._handshake_module.run_handshake(this.connection);
    }
    on_sync_loop_sync(data) {
        this.syncloop = new SyncLoop_1.SyncLoop({
            ...data,
            on_tick: this.on_tick.bind(this)
        }, this.logger);
    }
    on_tick() {
        this.event_bus.emit(events_1.Events.GAME_TICK);
        this.event_bus.do_processAll();
    }
    get_connection() { return this.connection; }
}
exports.ClientModule = ClientModule;
