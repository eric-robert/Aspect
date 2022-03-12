export declare class Metrics {
    private history;
    private latancy;
    private running_latancy;
    constructor(history?: number);
    update_latancy(time: number): void;
    get_latancy(): number;
}
