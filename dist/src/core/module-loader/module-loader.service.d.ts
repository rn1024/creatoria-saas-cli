import { Type } from '@nestjs/common';
import { ConfigService } from '../../config/config.service';
import { ModuleInfo } from '../../interfaces/module.interface';
export declare class ModuleLoaderService {
    private configService;
    private readonly logger;
    private readonly git;
    private modules;
    constructor(configService: ConfigService);
    loadModules(): Promise<Type<any>[]>;
    installModule(moduleSource: string): Promise<void>;
    private loadModule;
    enableModule(moduleName: string): Promise<void>;
    disableModule(moduleName: string): Promise<void>;
    getModuleInfo(moduleName: string): ModuleInfo | undefined;
    getAllModules(): ModuleInfo[];
    isModuleEnabled(moduleName: string): boolean;
}
