export type Window = { 
    time : number,
    window : EventsRecorded 
}
export type EventsRecorded = {
    [key:string] : any
}