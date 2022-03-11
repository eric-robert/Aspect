export class ConnectionMetrics {


    private latancy : number = 0
    private running_latancy : number[] = []

    /**
     * A utility class to track latancy across the network.
     * @param history Number of latancy values to keep for averages
     */
    constructor ( private history : number = 40 ){}

    /**
     * Record recieved data and calculate latancy.
     * Drops the oldest data if the history is full
     * @param time Time event was sent, not current time
     */
    update_latancy ( time : number ) {

        const latancy = Date.now() - time

        this.running_latancy.push(latancy)

        this.latancy = this.running_latancy
            .reduce((a,b) => a + b) / this.running_latancy.length

        if (this.running_latancy.length > this.history) this.running_latancy.shift()
    }

    /**
     * Get the current latancy
     * @returns Latancy in ms
     */
    get_latancy () : number {
        return this.latancy
    }

}