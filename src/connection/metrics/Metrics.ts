interface Heartbeat {
    Local_0 : number
    Remote_1 : number
    Local_2 : number
}

export class Metrics {

    private latancy : number = 0
    private offset : number = 0

    constructor (){}

    update_latancy ( heartbeat : Heartbeat ) {

        const latancy = (heartbeat.Local_2 - heartbeat.Local_0) / 2
        const offset = heartbeat.Remote_1 - heartbeat.Local_0 - latancy

        this.latancy = (this.latancy * 0.9) + (latancy * 0.1)
        this.offset = (this.offset * 0.9) + (offset * 0.1)
    }

    get_latancy () : number {
        return this.latancy
    }

    get_offset () : number {
        return this.offset
    }

}