import { BaseEntity } from './base.entity';
export declare class AuditLogDO extends BaseEntity {
    userId: number;
    username: string;
    entityName: string;
    entityId: number;
    operation: string;
    oldData?: any;
    newData?: any;
    ip?: string;
    userAgent?: string;
}
