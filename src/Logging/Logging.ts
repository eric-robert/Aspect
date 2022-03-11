import { LogLevel } from "./Logging.types"

const boot_time = new Date()

export class Logger {

    constructor (private prefix : string, private level : number ) {}

    public log (message : string, level ?: number) {
        if (level === undefined) level = LogLevel.INFO
        if (this.level < level) return
        const current_time = new Date()
        const time_diff = current_time.getTime() - boot_time.getTime()
        console.log(`[${time_diff}][${this.prefix}] ${message}`)
    }

    public changeLevel (level : number) {
        this.level = level
    }

}