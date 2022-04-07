export const ClientSettings = { 
    SERVER_IP : 'server-ip'
}

export interface OnSyncEventData {
    gameTick : number,
    syncs : {
        [controller : string] : any
    }
}