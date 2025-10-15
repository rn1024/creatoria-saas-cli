import { BaseDO } from '../base.entity';
export declare class PostDO extends BaseDO {
    code: string;
    name: string;
    sort: number;
    status: number;
    remark?: string;
}
