import { Logger } from 'simpler-logs'
import * as T from './Handshake.types'

export class Handshake {

    private stages : T.HandshakeStage<any, any>[] = []
    private current : number = -1
    private has_sent : boolean = false
    private id : number 

    // Communication with networking or other modules
    private do_open : T.Open
    private do_close : T.Close
    private do_send : T.Send
    private success_callback : () => void
    private failure_callback : () => void

    // Logger inherited from a provided root logger
    private logger : Logger

    constructor () {
        this.logger = new Logger(`Handshake`, "debug")
    }

    public init (config : T.HandshakeConstructor) {
        this.id = config.id
        this.do_open = config.on_open
        this.do_close = config.on_close
        this.do_send = config.on_send
        this.success_callback = config.on_finish
        this.failure_callback = config.on_failure
    }

    // Public Methods
    public add_stage<Send, Recieved> ( stage : T.HandshakeStage<Send, Recieved> ) {
        this.stages.push(stage)
    }

    public start () {
        this.progress_stage()
    }

    // Private methods
    private get_name (stage_name : string) {
        return `Handshake::${stage_name}`
    }
    
    private progress_stage (){

        // Reset from previous stage
        this.current++
        this.has_sent=false

        // IF we have an open listener, close it
        if (this.current != 0) this.do_close()

        // If we are out of stages, we are done
        const stages_left = this.current < this.stages.length
        if (!stages_left) return this.success_callback()
        
        // If not, then we need to open a listener, get its name
        const target_stage = this.stages[this.current]
        const label = this.get_name(target_stage.name)

        // Open a listener
        this.do_open(label, this.on_recieve.bind(this))

        // If we have an initiator, send the first message
        if (target_stage.initiate) {
            this.do_send(target_stage.initiate(this.id))
            this.has_sent = true
        }

    }
    
    private on_recieve ( recieved : any ) {

        const target_stage = this.stages[this.current]
        const initiator = !!target_stage.initiate
        const has_sent = this.has_sent

        this.has_sent = true  
        
        // If we didnt recieve a message, we failed
        if ( ! recieved ) {
            this.do_close()
            this.failure_callback()
        }

        // You are the listener recieving first message
        else if (!initiator && !has_sent) {
            this.logger.log("debug", `listener recieved first message ` + recieved)
            target_stage.recieve( this.id, recieved, 
                (_:any) => this.do_send(_ || true),
                () => {
                    this.do_send(null)
                    this.do_close()
                    this.failure_callback()
                }
            )
        }

        // You are the initiator recieving first message
        else if (initiator) {
            this.logger.log("debug", `initiator recieved first message ` + recieved)
            target_stage.recieve( this.id, recieved, 
                () => {
                    this.do_send(true)
                    this.progress_stage()
                }, 
                () => {
                    this.do_send(null)
                    this.do_close()
                    this.failure_callback()
                }
            )
        }

        // You are the listener recieving second message
        else if (!initiator && this.has_sent) {
            this.logger.log("debug", `listener recieved second message ` + recieved)
            this.progress_stage()
        }
        
    }

}