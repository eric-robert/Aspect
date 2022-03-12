"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = __importDefault(require("winston"));
function build_logger() {
    // Colors
    winston_1.default.addColors({
        error: 'red',
        warn: 'yellow',
        info: 'cyan',
        debug: 'green'
    });
    // Logger
    return winston_1.default.createLogger({
        level: 'debug',
        format: winston_1.default.format.json({ space: 4 }),
        transports: [
            new winston_1.default.transports.Console({
                format: winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.printf(options => {
                    let prefix = options.module ? `[${options.module}] ` : '[Aspect] ';
                    let meta = options.meta ? ` ${JSON.stringify(options.meta)}` : '';
                    return `${prefix}${options.level}: ${options.message} ${meta}`;
                }))
            }),
            new winston_1.default.transports.File({ filename: './logs/logs.log', options: { flags: 'w' } }),
        ]
    });
}
exports.default = build_logger;
