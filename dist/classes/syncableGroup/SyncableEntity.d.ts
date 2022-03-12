export declare class SyncableEntity<T> {
    get_id(): number;
    get_group(): string;
    get_sync_data(): T;
    receive_sync_data(data: T): void;
}
