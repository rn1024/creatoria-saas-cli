import { BaseDO } from '../base.entity';
export declare class UserDO extends BaseDO {
    username: string;
    nickname: string;
    email?: string;
    mobile?: string;
    sex: number;
    avatar?: string;
    password: string;
    status: number;
    deptId?: number;
    postIds?: number[];
    remark?: string;
    loginIp?: string;
    loginDate?: Date;
}
