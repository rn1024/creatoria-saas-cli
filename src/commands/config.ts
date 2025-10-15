import { Command } from 'commander';
import * as path from 'path';
import * as fs from 'fs-extra';
import chalk from 'chalk';

export const configCommand = new Command('config')
  .description('Manage project configuration');

configCommand
  .command('show')
  .description('Show current configuration')
  .action(showConfig);

async function showConfig() {
  try {
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
      console.error(chalk.red('Not in a Creatoria project directory'));
      process.exit(1);
    }

    const packageJson = fs.readJsonSync(packageJsonPath);
    const envPath = path.join(process.cwd(), '.env');

    console.log(chalk.cyan('\n=== Project Configuration ===\n'));
    console.log(chalk.blue('Project Name:'), packageJson.name);
    console.log(chalk.blue('Version:'), packageJson.version);
    console.log(chalk.blue('Description:'), packageJson.description || 'N/A');

    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf-8');
      const envVars = envContent.split('\n').filter(line => line && !line.startsWith('#'));

      console.log(chalk.cyan('\n=== Environment Variables ===\n'));
      envVars.forEach(line => {
        const [key] = line.split('=');
        if (key) {
          console.log(chalk.gray(`  ${key}`));
        }
      });
    }

    console.log('');

  } catch (error: any) {
    console.error(chalk.red('Error showing config:'), error.message);
    process.exit(1);
  }
}
