export declare class SyncableGroup<T> {
    private subscribed_to_group;
    private groups_by_subscriber;
    private all_entities;
    private addGroupsToSubscriber;
    private addSubscriberToGroup;
    add_entity(id: number, entity: T): void;
    join_groups(entity: T, groups: string[]): void;
    get_by_id(id: number): T;
    get_subscribers(group: string): T[];
    get_groups(entity: T): string[];
    get_allGroups(): string[];
}
