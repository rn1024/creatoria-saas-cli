import { Command } from 'commander';
export declare class ModuleDoctorCommand {
    static register(program: Command): void;
    static checkModule(moduleName: string): Promise<void>;
    static checkAllModules(): Promise<void>;
    static checkDependencies(modulePath: string): Promise<void>;
}
