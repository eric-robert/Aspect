import { SyncableEntity } from '../../classes/syncableGroup/SyncableEntity';
import { EngineModule } from "./Module";
export declare class SyncableModule<U extends {
    id: number;
}, T extends SyncableEntity<U>> extends EngineModule {
    private syncableGroup;
    get_group(group: string): T[];
    get_by_id(id: number): T;
    add_entity(entity: T): void;
    get_nameForSync(): void;
    get_syncForGroup(name: string): U[];
    recieve_sync(data: U[]): void;
}
