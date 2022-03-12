import winston from 'winston'

export default function build_logger () {

    // Colors
    winston.addColors({
        error: 'red',
        warn: 'yellow',
        info: 'cyan',
        debug: 'green'
    });

    // Logger
    return winston.createLogger({
        level: 'debug',
        format: winston.format.json({ space: 4}),
        transports: [
            new winston.transports.Console({
                format: winston.format.combine(
                    winston.format.colorize(),
                    winston.format.printf(options => {
                        let prefix = options.module ? `[${options.module}] ` : '[Aspect] '
                        let meta = options.meta ? ` ${JSON.stringify(options.meta)}` : ''
                        return `${prefix}${options.level}: ${options.message} ${meta}`;
                    })
                )
            }),
            new winston.transports.File({ filename: './logs/logs.log', options : { flags : 'w' } }),
        ]
    })

} 