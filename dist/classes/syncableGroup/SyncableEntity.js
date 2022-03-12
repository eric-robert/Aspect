"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncableEntity = void 0;
class SyncableEntity {
    // For tracking
    get_id() {
        throw new Error("Not implemented");
    }
    get_group() {
        throw new Error("Not implemented");
    }
    // For syncing
    get_sync_data() {
        throw new Error("Not implemented");
    }
    receive_sync_data(data) {
        throw new Error("Not implemented");
    }
}
exports.SyncableEntity = SyncableEntity;
