"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncableGroup = void 0;
class SyncableGroup {
    constructor() {
        this.subscribed_to_group = new Map();
        this.groups_by_subscriber = new Map();
        this.all_entities = new Map();
    }
    // Adding a connection to groups in both directions 
    addGroupsToSubscriber(entity, group) {
        const subscribed = this.groups_by_subscriber.get(entity);
        if (!subscribed)
            this.groups_by_subscriber.set(entity, group);
        else
            subscribed.push(...group);
    }
    addSubscriberToGroup(entity, groups) {
        groups.forEach(group => {
            const connections = this.subscribed_to_group.get(group);
            if (!connections)
                this.subscribed_to_group.set(group, [entity]);
            else
                connections.push(entity);
        });
    }
    // Joining
    add_entity(id, entity) {
        this.all_entities.set(id, entity);
    }
    join_groups(entity, groups) {
        this.addGroupsToSubscriber(entity, groups);
        this.addSubscriberToGroup(entity, groups);
    }
    // Getters
    get_by_id(id) {
        return this.all_entities.get(id);
    }
    get_subscribers(group) {
        return this.subscribed_to_group.get(group) || [];
    }
    get_groups(entity) {
        return this.groups_by_subscriber.get(entity) || [];
    }
    get_allGroups() {
        return Array.from(this.subscribed_to_group.keys());
    }
}
exports.SyncableGroup = SyncableGroup;
