import { BaseEntity } from './base.entity';
export declare class LoginLogDO extends BaseEntity {
    userId: number;
    username: string;
    logType: number;
    ip?: string;
    userAgent?: string;
    result: boolean;
    errorMsg?: string;
}
