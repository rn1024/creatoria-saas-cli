import { CommandRunner } from 'nest-commander';
import { HotReloadService } from '../services/hot-reload.service';
import { DynamicModuleLoaderService } from '../services/dynamic-module-loader.service';
interface DevOptions {
    port?: string;
    watch?: boolean;
    hotReload?: boolean;
    debug?: boolean;
}
export declare class DevCommand extends CommandRunner {
    private readonly hotReloadService;
    private readonly moduleLoader;
    constructor(hotReloadService: HotReloadService, moduleLoader: DynamicModuleLoaderService);
    run(passedParams: string[], options: DevOptions): Promise<void>;
    private registerReloadCallbacks;
    private triggerAppReload;
    parsePort(val: string): string;
    parseWatch(): boolean;
    parseHotReload(): boolean;
    parseDebug(): boolean;
}
export {};
