"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.typeOrmConfig = void 0;
const typeOrmConfig = () => {
    const dbType = process.env.DB_TYPE || 'postgres';
    if (dbType === 'postgres' || dbType === 'postgresql') {
        return {
            type: 'postgres',
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '5432'),
            username: process.env.DB_USERNAME || 'postgres',
            password: process.env.DB_PASSWORD || 'postgres',
            database: process.env.DB_DATABASE || 'env-test-1757505847',
            entities: [__dirname + '/../**/*.entity{.ts,.js}', __dirname + '/../../modules/**/*.entity{.ts,.js}'],
            synchronize: process.env.NODE_ENV === 'development',
            logging: process.env.NODE_ENV === 'development',
            migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
            migrationsTableName: 'migrations',
        };
    }
    if (dbType === 'mysql') {
        return {
            type: 'mysql',
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '3306'),
            username: process.env.DB_USERNAME || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_DATABASE || 'env-test-1757505847',
            entities: [__dirname + '/../**/*.entity{.ts,.js}', __dirname + '/../../modules/**/*.entity{.ts,.js}'],
            synchronize: process.env.NODE_ENV === 'development',
            logging: process.env.NODE_ENV === 'development',
            migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
            migrationsTableName: 'migrations',
        };
    }
    if (dbType === 'mongodb') {
        return {
            type: 'mongodb',
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '27017'),
            database: process.env.DB_DATABASE || 'env-test-1757505847',
            entities: [__dirname + '/../**/*.entity{.ts,.js}', __dirname + '/../../modules/**/*.entity{.ts,.js}'],
            synchronize: process.env.NODE_ENV === 'development',
            logging: process.env.NODE_ENV === 'development',
        };
    }
    return {
        type: 'postgres',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        username: process.env.DB_USERNAME || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        database: process.env.DB_DATABASE || 'env-test-1757505847',
        entities: [__dirname + '/../**/*.entity{.ts,.js}', __dirname + '/../../modules/**/*.entity{.ts,.js}'],
        synchronize: process.env.NODE_ENV === 'development',
        logging: process.env.NODE_ENV === 'development',
        migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
        migrationsTableName: 'migrations',
    };
};
exports.typeOrmConfig = typeOrmConfig;
//# sourceMappingURL=database.config.js.map