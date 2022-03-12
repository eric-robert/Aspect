export interface EmittedEvent<Data> {
    label: string;
    data: Data;
}
export interface MarkedForDelete {
    event: string;
    subscription: EventSubscription<any>;
}
export declare type RemoveSubscription = () => void;
export declare type EventSubscription<T> = (data: EmittedEvent<T>, remove?: RemoveSubscription) => void;
