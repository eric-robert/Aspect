import { Connection } from "../../classes/connection/Connection";
import { Handshake } from "../../classes/handshake/Handshake";
import { HandshakeStage } from "../../classes/handshake/Handshake.types";
import { EngineModule } from "./Module";

export class HandshakeModule extends EngineModule {

    private stages : HandshakeStage<any, any>[] = []
    
    add_stage<Send, Recieve> (stage : HandshakeStage<Send, Recieve>) {
        this.stages.push(stage)
    }


    run_handshake ( connection : Connection) {
        this.logger.log('info', 'Running handshake')

        const handshake = new Handshake(this.logger)
        this.stages.forEach( stage => handshake.add_stage(stage))

        let open_listener = -1
        let open_event = ''
        
        const do_open = (event : string, listen : (data : any) => void) => {
            open_listener = connection.listen(event, listen)
            open_event = event
        }

        const do_close = () => {
            connection.remove_listener(open_listener)
            open_listener = -1
        }

        const on_send = (data : any) => {
            connection.send(open_event, data)
        }

        return new Promise((resolve, reject) => {
            handshake.init({
                id : connection.get_id(),
                on_finish : () => {
                    this.logger.log('info', 'Handshake success')
                    resolve(true)
                },
                on_failure : () => {
                    this.logger.log('error', 'Handshake failed')
                    reject()
                },
                on_open : do_open.bind(this),
                on_close : do_close.bind(this),
                on_send : on_send.bind(this)
            })

            handshake.start()
        })
    }



}