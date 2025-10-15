import { ModuleAddCommand } from './module-add.command';
export declare class LazyModuleAddCommand extends ModuleAddCommand {
    run(args: string[], options: any): Promise<void>;
}
