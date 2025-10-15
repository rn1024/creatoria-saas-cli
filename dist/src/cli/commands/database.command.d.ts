import { ConfigService } from '../../config/config.service';
export declare class DatabaseCommand {
    private configService;
    private readonly logger;
    private dataSource;
    constructor(configService: ConfigService);
    private initDataSource;
    migrate(options: {
        module?: string;
    }): Promise<void>;
    seed(options: {
        module?: string;
        force?: boolean;
    }): Promise<void>;
    private getSeedHistory;
    private recordSeedExecution;
    reset(options?: {
        force?: boolean;
    }): Promise<void>;
}
