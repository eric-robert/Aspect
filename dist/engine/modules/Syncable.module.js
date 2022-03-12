"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncableModule = void 0;
const SyncableGroup_1 = require("../../classes/syncableGroup/SyncableGroup");
const Module_1 = require("./Module");
class SyncableModule extends Module_1.EngineModule {
    constructor() {
        super(...arguments);
        this.syncableGroup = new SyncableGroup_1.SyncableGroup();
    }
    get_group(group) {
        return this.syncableGroup.get_subscribers(group) || [];
    }
    get_by_id(id) {
        return this.syncableGroup.get_by_id(id);
    }
    // Adding
    add_entity(entity) {
        const id = entity.get_id();
        const group = entity.get_group();
        this.syncableGroup.add_entity(id, entity);
        this.syncableGroup.join_groups(entity, [group]);
    }
    // Get Sync Group
    get_nameForSync() {
        throw new Error("Not implemented");
    }
    get_syncForGroup(name) {
        return this.get_group(name).map(entity => entity.get_sync_data());
    }
    recieve_sync(data) {
        data.forEach(sync => this.get_by_id(sync.id).receive_sync_data(sync));
    }
}
exports.SyncableModule = SyncableModule;
