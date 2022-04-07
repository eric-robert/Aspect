import { SyncableEntity } from "./SyncableEntity"

export interface hasID {
    id : number
}

export interface EntityBuilder<SnapshotData, Entity extends SyncableEntity<SnapshotData>> {
    new( sync : SnapshotData) : Entity
}