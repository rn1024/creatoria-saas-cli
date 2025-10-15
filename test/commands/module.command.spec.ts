import { Test, TestingModule } from '@nestjs/testing';
import { ModuleCommand } from '../../src/cli/commands/module.command';
import { ModuleManagerService } from '../../src/cli/services/module-manager.service';
import * as fs from 'fs-extra';
import * as path from 'path';

jest.mock('fs-extra');
jest.mock('../../src/cli/services/module-manager.service');

describe('ModuleCommand', () => {
  let command: ModuleCommand;
  let moduleManager: ModuleManagerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ModuleCommand,
        {
          provide: ModuleManagerService,
          useValue: {
            installModule: jest.fn(),
            uninstallModule: jest.fn(),
            listInstalledModules: jest.fn(),
            validateModule: jest.fn(),
            checkDependencies: jest.fn(),
          },
        },
      ],
    }).compile();

    command = module.get<ModuleCommand>(ModuleCommand);
    moduleManager = module.get<ModuleManagerService>(ModuleManagerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('install', () => {
    it('should install a module successfully', async () => {
      const moduleName = 'auth';
      const mockModuleInfo = {
        name: 'auth',
        version: '1.0.0',
        dependencies: [],
      };

      (moduleManager.validateModule as jest.Mock).mockResolvedValue(true);
      (moduleManager.checkDependencies as jest.Mock).mockResolvedValue(true);
      (moduleManager.installModule as jest.Mock).mockResolvedValue(mockModuleInfo);
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readJsonSync as jest.Mock).mockReturnValue({
        name: 'test-project',
        creatoria: { modules: [] },
      });
      (fs.writeJsonSync as jest.Mock).mockImplementation(() => {});

      await command.install(moduleName);

      expect(moduleManager.validateModule).toHaveBeenCalledWith(moduleName);
      expect(moduleManager.checkDependencies).toHaveBeenCalledWith(moduleName);
      expect(moduleManager.installModule).toHaveBeenCalledWith(moduleName);
      expect(fs.writeJsonSync).toHaveBeenCalled();
    });

    it('should handle module validation failure', async () => {
      const moduleName = 'invalid-module';

      (moduleManager.validateModule as jest.Mock).mockResolvedValue(false);

      await expect(command.install(moduleName)).rejects.toThrow(
        `Module ${moduleName} is not valid or not found`
      );

      expect(moduleManager.installModule).not.toHaveBeenCalled();
    });

    it('should handle dependency check failure', async () => {
      const moduleName = 'auth';

      (moduleManager.validateModule as jest.Mock).mockResolvedValue(true);
      (moduleManager.checkDependencies as jest.Mock).mockResolvedValue(false);

      await expect(command.install(moduleName)).rejects.toThrow(
        `Module ${moduleName} has unmet dependencies`
      );

      expect(moduleManager.installModule).not.toHaveBeenCalled();
    });

    it('should prevent duplicate module installation', async () => {
      const moduleName = 'auth';

      (moduleManager.validateModule as jest.Mock).mockResolvedValue(true);
      (moduleManager.checkDependencies as jest.Mock).mockResolvedValue(true);
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readJsonSync as jest.Mock).mockReturnValue({
        name: 'test-project',
        creatoria: {
          modules: [{ name: 'auth', version: '1.0.0' }],
        },
      });

      await expect(command.install(moduleName)).rejects.toThrow(
        `Module ${moduleName} is already installed`
      );

      expect(moduleManager.installModule).not.toHaveBeenCalled();
    });

    it('should handle installation with specific version', async () => {
      const moduleName = 'auth@2.0.0';
      const mockModuleInfo = {
        name: 'auth',
        version: '2.0.0',
        dependencies: [],
      };

      (moduleManager.validateModule as jest.Mock).mockResolvedValue(true);
      (moduleManager.checkDependencies as jest.Mock).mockResolvedValue(true);
      (moduleManager.installModule as jest.Mock).mockResolvedValue(mockModuleInfo);
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readJsonSync as jest.Mock).mockReturnValue({
        name: 'test-project',
        creatoria: { modules: [] },
      });
      (fs.writeJsonSync as jest.Mock).mockImplementation(() => {});

      await command.install(moduleName);

      expect(moduleManager.installModule).toHaveBeenCalledWith(moduleName);
      const writeCall = (fs.writeJsonSync as jest.Mock).mock.calls[0];
      expect(writeCall[1].creatoria.modules).toContainEqual(mockModuleInfo);
    });
  });

  describe('uninstall', () => {
    it('should uninstall a module successfully', async () => {
      const moduleName = 'auth';

      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readJsonSync as jest.Mock).mockReturnValue({
        name: 'test-project',
        creatoria: {
          modules: [{ name: 'auth', version: '1.0.0' }],
        },
      });
      (moduleManager.uninstallModule as jest.Mock).mockResolvedValue(true);
      (fs.writeJsonSync as jest.Mock).mockImplementation(() => {});

      await command.uninstall(moduleName);

      expect(moduleManager.uninstallModule).toHaveBeenCalledWith(moduleName);
      const writeCall = (fs.writeJsonSync as jest.Mock).mock.calls[0];
      expect(writeCall[1].creatoria.modules).toHaveLength(0);
    });

    it('should handle uninstalling non-existent module', async () => {
      const moduleName = 'non-existent';

      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readJsonSync as jest.Mock).mockReturnValue({
        name: 'test-project',
        creatoria: {
          modules: [{ name: 'auth', version: '1.0.0' }],
        },
      });

      await expect(command.uninstall(moduleName)).rejects.toThrow(
        `Module ${moduleName} is not installed`
      );

      expect(moduleManager.uninstallModule).not.toHaveBeenCalled();
    });

    it('should handle module with dependents', async () => {
      const moduleName = 'database';
      
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readJsonSync as jest.Mock).mockReturnValue({
        name: 'test-project',
        creatoria: {
          modules: [
            { name: 'database', version: '1.0.0' },
            { name: 'auth', version: '1.0.0', dependencies: ['database'] },
          ],
        },
      });

      await expect(command.uninstall(moduleName)).rejects.toThrow(
        `Cannot uninstall ${moduleName}: other modules depend on it`
      );

      expect(moduleManager.uninstallModule).not.toHaveBeenCalled();
    });
  });

  describe('list', () => {
    it('should list installed modules', async () => {
      const installedModules = [
        { name: 'auth', version: '1.0.0', description: 'Authentication module' },
        { name: 'database', version: '2.0.0', description: 'Database module' },
      ];

      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readJsonSync as jest.Mock).mockReturnValue({
        name: 'test-project',
        creatoria: {
          modules: installedModules,
        },
      });
      (moduleManager.listInstalledModules as jest.Mock).mockResolvedValue(installedModules);

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await command.list();

      expect(moduleManager.listInstalledModules).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Installed modules:'));
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('auth'));
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('database'));
      
      consoleSpy.mockRestore();
    });

    it('should handle empty module list', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readJsonSync as jest.Mock).mockReturnValue({
        name: 'test-project',
        creatoria: {
          modules: [],
        },
      });
      (moduleManager.listInstalledModules as jest.Mock).mockResolvedValue([]);

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await command.list();

      expect(consoleSpy).toHaveBeenCalledWith('No modules installed');
      
      consoleSpy.mockRestore();
    });

    it('should handle missing package.json', async () => {
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      await expect(command.list()).rejects.toThrow(
        'Not in a Creatoria project directory'
      );
    });
  });

  describe('update', () => {
    it('should update a module successfully', async () => {
      const moduleName = 'auth';
      const updatedModule = {
        name: 'auth',
        version: '2.0.0',
        dependencies: [],
      };

      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readJsonSync as jest.Mock).mockReturnValue({
        name: 'test-project',
        creatoria: {
          modules: [{ name: 'auth', version: '1.0.0' }],
        },
      });
      (moduleManager.validateModule as jest.Mock).mockResolvedValue(true);
      (moduleManager.installModule as jest.Mock).mockResolvedValue(updatedModule);
      (fs.writeJsonSync as jest.Mock).mockImplementation(() => {});

      await command.update(moduleName);

      expect(moduleManager.installModule).toHaveBeenCalledWith(`${moduleName}@latest`);
      const writeCall = (fs.writeJsonSync as jest.Mock).mock.calls[0];
      expect(writeCall[1].creatoria.modules[0].version).toBe('2.0.0');
    });

    it('should handle updating non-installed module', async () => {
      const moduleName = 'non-installed';

      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.readJsonSync as jest.Mock).mockReturnValue({
        name: 'test-project',
        creatoria: {
          modules: [],
        },
      });

      await expect(command.update(moduleName)).rejects.toThrow(
        `Module ${moduleName} is not installed`
      );
    });
  });
});