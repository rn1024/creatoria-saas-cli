import { SystemService } from './system.service';
export declare class SystemController {
    private readonly systemService;
    constructor(systemService: SystemService);
    getSystemInfo(): Promise<any>;
    healthCheck(): Promise<any>;
    getAllConfigs(): Promise<import("./entities/config.entity").SysConfig[]>;
    getConfig(key: string): Promise<{
        key: string;
        value: string | null;
    }>;
    setConfig(body: {
        key: string;
        value: string;
        description?: string;
    }): Promise<import("./entities/config.entity").SysConfig>;
    getLogs(query: any): Promise<{
        items: import("./entities/log.entity").SysLog[];
        total: number;
    }>;
    log(body: any): Promise<import("./entities/log.entity").SysLog>;
}
