import { HandshakeModule } from "../../src/Handshake/Handshake.module";

/**
 * Indicates an emprty handshake stage for the client.
 * No custom handshake data is sent by the client.
 */
export class NoneHandshakeClient extends HandshakeModule {
    
    init() { 
        this.set_stages([]); 
    }
    
    on_connection() {}
}

/**
 * Indicates an emprty handshake stage for the server.
 * No custom handshake data is sent by the server.
 * The server will still send start the handshake process.
 */
export class NoneHandshakeServer extends HandshakeModule {
    
    init() { 
        this.set_stages([]); 
    }
    
    on_connection() {
        this.initiate_handshake()
    }
}