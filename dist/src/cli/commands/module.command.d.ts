import { ConfigService } from '../../config/config.service';
export declare class ModuleCommand {
    private configService;
    private readonly logger;
    constructor(configService: ConfigService);
    install(source?: string): Promise<void>;
    list(): Promise<void>;
    enable(name: string): Promise<void>;
    disable(name: string): Promise<void>;
    info(name: string): Promise<void>;
    runAdd(args: string[], options: any): Promise<void>;
    runList(args: string[], options: any): Promise<void>;
    runRemove(args: string[], options: any): Promise<void>;
}
