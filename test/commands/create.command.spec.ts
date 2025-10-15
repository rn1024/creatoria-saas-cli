import { Test, TestingModule } from '@nestjs/testing';
import { CreateCommand } from '../../src/cli/commands/create.command';
import * as fs from 'fs-extra';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

jest.mock('fs-extra');
jest.mock('child_process');

describe('CreateCommand', () => {
  let command: CreateCommand;
  let testDir: string;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CreateCommand],
    }).compile();

    command = module.get<CreateCommand>(CreateCommand);
    testDir = path.join(process.cwd(), 'test-project');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('run', () => {
    it('should create a new project with default settings', async () => {
      const projectName = 'test-project';
      
      (fs.existsSync as jest.Mock).mockReturnValue(false);
      (fs.copySync as jest.Mock).mockImplementation(() => {});
      (fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify({
        name: '{{projectName}}',
        version: '0.1.0',
        creatoria: {
          version: '1.0.0',
          template: 'default',
          createdAt: '{{createdAt}}',
          modules: []
        }
      }));
      (fs.writeFileSync as jest.Mock).mockImplementation(() => {});
      (fs.ensureDirSync as jest.Mock).mockImplementation(() => {});
      (execAsync as jest.Mock).mockResolvedValue({ stdout: '', stderr: '' });

      await command.run([projectName]);

      expect(fs.existsSync).toHaveBeenCalledWith(testDir);
      expect(fs.copySync).toHaveBeenCalled();
      expect(fs.writeFileSync).toHaveBeenCalled();
    });

    it('should handle existing directory error', async () => {
      const projectName = 'existing-project';
      
      (fs.existsSync as jest.Mock).mockReturnValue(true);

      await expect(command.run([projectName])).rejects.toThrow(
        `Directory ${projectName} already exists`
      );
    });

    it('should create project with custom database configuration', async () => {
      const projectName = 'test-project';
      const options = {
        dbHost: 'custom-host',
        dbPort: 5433,
        dbDatabase: 'custom_db',
        dbUsername: 'custom_user',
        dbPassword: 'custom_pass'
      };

      (fs.existsSync as jest.Mock).mockReturnValue(false);
      (fs.copySync as jest.Mock).mockImplementation(() => {});
      (fs.readFileSync as jest.Mock).mockReturnValue('');
      (fs.writeFileSync as jest.Mock).mockImplementation(() => {});
      (fs.ensureDirSync as jest.Mock).mockImplementation(() => {});
      (execAsync as jest.Mock).mockResolvedValue({ stdout: '', stderr: '' });

      await command.run([projectName], options);

      const envWriteCalls = (fs.writeFileSync as jest.Mock).mock.calls
        .filter(call => call[0].includes('.env'));
      
      expect(envWriteCalls.length).toBeGreaterThan(0);
      const envContent = envWriteCalls[0][1];
      expect(envContent).toContain(`DB_HOST=${options.dbHost}`);
      expect(envContent).toContain(`DB_PORT=${options.dbPort}`);
      expect(envContent).toContain(`DB_DATABASE=${options.dbDatabase}`);
      expect(envContent).toContain(`DB_USERNAME=${options.dbUsername}`);
    });

    it('should skip npm install when --skip-install flag is set', async () => {
      const projectName = 'test-project';
      const options = { skipInstall: true };

      (fs.existsSync as jest.Mock).mockReturnValue(false);
      (fs.copySync as jest.Mock).mockImplementation(() => {});
      (fs.readFileSync as jest.Mock).mockReturnValue('');
      (fs.writeFileSync as jest.Mock).mockImplementation(() => {});
      (fs.ensureDirSync as jest.Mock).mockImplementation(() => {});

      await command.run([projectName], options);

      expect(execAsync).not.toHaveBeenCalledWith(
        'npm install',
        expect.any(Object)
      );
    });

    it('should handle template processing errors gracefully', async () => {
      const projectName = 'test-project';
      
      (fs.existsSync as jest.Mock).mockReturnValue(false);
      (fs.copySync as jest.Mock).mockImplementation(() => {
        throw new Error('Copy failed');
      });

      await expect(command.run([projectName])).rejects.toThrow('Copy failed');
    });

    it('should process Handlebars templates correctly', async () => {
      const projectName = 'test-project';
      
      (fs.existsSync as jest.Mock).mockReturnValue(false);
      (fs.copySync as jest.Mock).mockImplementation(() => {});
      (fs.readFileSync as jest.Mock)
        .mockReturnValueOnce('Hello {{projectName}}!')
        .mockReturnValueOnce(JSON.stringify({ name: '{{projectName}}' }));
      (fs.writeFileSync as jest.Mock).mockImplementation(() => {});
      (fs.ensureDirSync as jest.Mock).mockImplementation(() => {});
      (fs.readdirSync as jest.Mock).mockReturnValue(['test.hbs']);
      (fs.statSync as jest.Mock).mockReturnValue({ isDirectory: () => false });
      (fs.renameSync as jest.Mock).mockImplementation(() => {});
      (execAsync as jest.Mock).mockResolvedValue({ stdout: '', stderr: '' });

      await command.run([projectName]);

      const writeFileCalls = (fs.writeFileSync as jest.Mock).mock.calls;
      const processedContent = writeFileCalls.find(call => 
        call[1].includes(`Hello ${projectName}!`)
      );
      
      expect(processedContent).toBeDefined();
    });
  });
});
