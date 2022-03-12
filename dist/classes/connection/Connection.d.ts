import { Logger } from "winston";
import * as T from './Connection.types';
export declare class Connection {
    private static _id;
    private id;
    private logger;
    private metrics;
    private socket;
    private debug_latancy;
    private connectionListeners;
    constructor(config: T.ConnectionConstructor, root_logger: Logger);
    private get_wrapped;
    private get_unwrapped;
    send<Data>(event: string, data: Data): void;
    listen<Data>(event: string, callback: T.Callback<Data>): number;
    listen_singular(event: string, callback: (data: any) => void): void;
    remove_listener(id: number): void;
    get_latancy(): number;
    get_id(): number;
}
