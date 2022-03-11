export interface EmittedEvent { 
    label : string
    data : any
}
export type Subscription = (data : EmittedEvent, remove ?: () => void ) => any