export type Window = { 
    [id:string] : {
        label : string
        data : any
    }
}

export type ActionEvent = {
    id ?: number
    target_tick ?: number
    label : string
    data : any
}