import { Injectable, LoggerService } from '@nestjs/common';
import * as fs from 'fs';
import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class CustomLogger implements LoggerService {
    private readonly logDirectory = 'src/logs';
    private readonly errorLogFilePath = `${this.logDirectory}/error.log`;
    private readonly debugLogFilePath = `${this.logDirectory}/debug.log`;

    log(message: string) {
        const formattedMessage = `[${new Date().toLocaleString()}] ${message}\n`;
        this.writeToFile(this.debugLogFilePath, formattedMessage);
    }

    error(message: string, trace: string) {
        const formattedMessage = `[${new Date().toLocaleString()}] [ERROR] ${message} - Trace: ${trace}\n`;
        this.writeToFile(this.errorLogFilePath, formattedMessage);
    }

    warn(message: string) {
        const formattedMessage = `[${new Date().toLocaleString()}] [WARN] ${message}\n`;
        this.writeToFile(this.errorLogFilePath, formattedMessage);
    }

    debug(message: string, trace?: any): void {
        const debug = process.env.DEBUG;
        if (debug === 'development') {
            const formattedMessage = `[${new Date().toISOString()}] [DEBUG] ${message}${trace ? ` - Trace: ${trace}` : ''}\n`;
            this.writeToFile(this.debugLogFilePath, formattedMessage);
        }
    }    
logToCustomFile(filename: string, message: string, variable: any) {
        const formattedMessage = `[${new Date().toLocaleString()}] ${message} - Variable: ${JSON.stringify(variable, null , 2)}\n`;
        const customFilePath = `${this.logDirectory}/${filename}.log`;
        this.writeToFile(customFilePath, formattedMessage);
    }
    private writeToFile(filePath: string, message: string) {
        // Ensure the logs directory exists
        if (!fs.existsSync(this.logDirectory)) {
            fs.mkdirSync(this.logDirectory, { recursive: true });
        }

        fs.appendFile(filePath, message, (err) => {
            if (err) {
                console.error(`Error writing to log file ${filePath}:`, err);
            }
        });
    }
}
