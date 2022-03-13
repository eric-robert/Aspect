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
exports.ServerModule = void 0;
const socket_io_1 = require("socket.io");
const Connection_1 = require("../../classes/connection/Connection");
const SyncableGroup_1 = require("../../classes/syncableGroup/SyncableGroup");
const SyncLoop_1 = require("../../classes/syncloop/SyncLoop");
const Module_1 = require("../../Engine/modules/Module");
const events_1 = require("../../events");
const T = __importStar(require("./Server.types"));
class ServerModule extends Module_1.EngineModule {
    init() {
        // Grab modules
        this._handshake_module = this.engine.withHandshakeModule();
        // Create instances
        this.syncGroup = new SyncableGroup_1.SyncableGroup();
        // Grab settings
        this.port = this.engine.withSetting(T.ServerSettings.PORT, 3000);
        this.ms_per_tick = this.engine.withSetting(T.ServerSettings.MS_PER_TICK, 1000);
        this.ticks_per_sync = this.engine.withSetting(T.ServerSettings.TICKS_PER_SYNC, 10);
        // Add SyncLoop to handshake
        this._handshake_module.add_stage({
            name: 'syncloop',
            initiate: () => this.syncloop.get_state(),
            recieve: (id, _, success) => success()
        });
    }
    start() {
        // Start server
        this.logger.log('info', `Starting server on port ${this.port}`);
        this.server = new socket_io_1.Server(this.port, { serveClient: false, cors: { origin: '*' } });
        this.server.on('connection', this.on_websocket_connection.bind(this));
        // Start sync loop
        this.syncloop = new SyncLoop_1.SyncLoop({
            ms_per_tick: this.ms_per_tick,
            ticks_per_sync: this.ticks_per_sync,
            on_tick: this.on_tick.bind(this),
            on_sync: this.on_sync.bind(this)
        });
    }
    add_to_syncgroup(connection_id, groups) {
        this.syncGroup.join_groups(this.syncGroup.get_by_id(connection_id), groups);
    }
    on_websocket_connection(socket) {
        const connection = new Connection_1.Connection({ socket, options: {} });
        this.logger.log('info', `New connection from ${connection.get_id()}`);
        // Add to sync group
        this.syncGroup.add_entity(connection.get_id(), connection);
        // Run the handshake itself
        this._handshake_module.run_handshake(connection)
            .then(() => { })
            .catch((err) => { });
    }
    on_tick() {
        this.event_bus.emit(events_1.Events.GAME_TICK);
        this.event_bus.do_processAll();
    }
    on_sync() { }
}
exports.ServerModule = ServerModule;
