import { BaseDO } from '../base.entity';
export declare class DeptDO extends BaseDO {
    name: string;
    parentId: number;
    sort: number;
    leaderUserId?: number;
    phone?: string;
    email?: string;
    status: number;
}
