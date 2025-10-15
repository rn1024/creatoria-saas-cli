import { BaseEntity } from './base.entity';
import { RoleDO } from './role.entity';
import { DeptDO } from './dept.entity';
export declare class UserDO extends BaseEntity {
    username: string;
    password: string;
    email: string;
    nickname?: string;
    avatar?: string;
    phone?: string;
    isActive: boolean;
    sex?: number;
    mobile?: string;
    loginIp?: string;
    loginDate?: Date;
    roles: RoleDO[];
    dept: DeptDO;
    deptId?: number;
}
