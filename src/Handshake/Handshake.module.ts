import { Connection } from "../Connection/Connection";
import { EngineModule } from "../Engine/EngineModule";
import { HandshakeStage } from "./Handshake.types";

export class HandshakeModule extends EngineModule {

    // Who is connected
    private connection : Connection

    // What stages are we running
    private stages : HandshakeStage<any>[] = []
    private current_stage : number = 0
    private initiator : boolean = false

    // Callbacks
    private moveNext : (response : any) => void
    private on_finish : () => void
    
    private get_stage_id ( stage_id : number ) : string {
        return `_handshake_${stage_id}`
    }

    private trigger_stage ( stage_id : number, response : any ) {
        this.stages[stage_id](response, this.moveNext)
    }

    private listen_for_stage ( stage : number ) {
        
        const id = this.get_stage_id(stage)
        const map_to = this.initiator ? this.current_stage +1 : this.current_stage

        if (map_to >= this.stages.length) {
            if (this.on_finish) this.on_finish()
            return
        }

        this.connection.listen_singular(id, (their_response : any) => {
            this.trigger_stage(map_to, their_response)
        })
    }

    // Client listeners

    on_connection () {}

    // Server Functions

    connection_setup ( connection : Connection, finish ?: () => void ) {
        this.connection = connection
        this.on_finish = finish

        this.moveNext = this.moveToNextStage.bind(this)

        // Callback for client to get ready
        this.on_connection()

        // If the client called the "initiate_handshake" function
        // Then starting would be true, if not, listen for stage 0
        if (!this.initiator){
            this.listen_for_stage(0)
        }
    }

    initiate_handshake () {
        this.initiator = true
        this.trigger_stage(0, undefined)
        this.current_stage = 1
    }

    set_stages ( stages : HandshakeStage<any>[]) {
        this.stages = stages
    }

    add_stage (stage : HandshakeStage<any>) {
        this.stages.push(stage)
    }

    // Actual processing of stage

    private moveToNextStage (yourRepsonse : any) {

        const id = this.get_stage_id(this.current_stage)
        this.connection.send(id, yourRepsonse)

        if (!this.initiator) ++this.current_stage

        this.listen_for_stage(this.current_stage)

        if (this.initiator) ++this.current_stage

    }

}   