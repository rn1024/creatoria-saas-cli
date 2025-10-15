import { Repository } from 'typeorm';
import { SysConfig } from './entities/config.entity';
import { SysLog } from './entities/log.entity';
export declare class SystemService {
    private configRepository;
    private logRepository;
    constructor(configRepository: Repository<SysConfig>, logRepository: Repository<SysLog>);
    getConfig(key: string): Promise<string | null>;
    setConfig(key: string, value: string, description?: string): Promise<SysConfig>;
    getAllConfigs(): Promise<SysConfig[]>;
    log(data: Partial<SysLog>): Promise<SysLog>;
    getLogs(query: any): Promise<{
        items: SysLog[];
        total: number;
    }>;
    getSystemInfo(): Promise<any>;
    healthCheck(): Promise<any>;
}
