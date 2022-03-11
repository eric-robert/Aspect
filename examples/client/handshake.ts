import { HandshakeModule } from "../../src/Handshake/Handshake.module";
import { next } from "../../src/Handshake/Handshake.types";

export class Handshake extends HandshakeModule {

    init () {
        this.add_stage(this.sign_in.bind(this))
    }

    on_connection() {}
    
    sign_in (_ : any, next : next ) {
        console.log('here?')
        next({
            name: "Bob",
        })
    }

}