import { BaseEntity } from './base.entity';
import { UserDO } from './user.entity';
export declare class DeptDO extends BaseEntity {
    name: string;
    sort: number;
    leaderUserId?: number;
    phone?: string;
    email?: string;
    status: boolean;
    children: DeptDO[];
    parent: DeptDO;
    users: UserDO[];
}
