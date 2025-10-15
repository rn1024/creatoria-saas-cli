import { BaseEntity } from './base.entity';
export declare class OperationLogDO extends BaseEntity {
    userId: number;
    username: string;
    module: string;
    action: string;
    method: string;
    url: string;
    ip?: string;
    userAgent?: string;
    params?: any;
    result: boolean;
    errorMsg?: string;
    duration: number;
}
