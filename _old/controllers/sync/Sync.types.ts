import { SyncableEntity } from "./SyncableEntity"

export interface hasID {
    id : number
}

export interface EntityBuilder<U, T extends SyncableEntity<U>> {
    new( sync : U) : T
}