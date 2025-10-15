import { ConfigService } from '../../config/config.service';
export declare class ConfigCommand {
    private configService;
    constructor(configService: ConfigService);
    show(): Promise<void>;
    set(key: string, value: string): Promise<void>;
    runShow(args: string[], options: any): Promise<void>;
    runGet(args: string[], options: any): Promise<void>;
    runSet(args: string[], options: any): Promise<void>;
    runValidate(args: string[], options: any): Promise<void>;
}
