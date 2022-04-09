export class Metrics {

    private latancy : number = 0
    private running_latancy : number[] = []

    constructor ( private history : number = 10 ){}

    update_latancy ( time : number ) {

        const latancy = Date.now() - time

        this.running_latancy.push(latancy)

        this.latancy = this.running_latancy
            .reduce((a,b) => a + b) / this.running_latancy.length

        if (this.running_latancy.length > this.history) this.running_latancy.shift()
    }

    get_latancy () : number {
        return this.latancy
    }

}