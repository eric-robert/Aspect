import { HandshakeModule } from "../../src/Handshake/Handshake.module";
import { next } from "../../src/Handshake/Handshake.types";

type sign_in_request = {
    name: string
}

export class Handshake extends HandshakeModule {

    init () {
        this.add_stage(this.ask_signin.bind(this))
    }

    on_connection() {
        this.initiate_handshake()
    }
    
    ask_signin(req : any, next : next ) {
        next({})
    }

}