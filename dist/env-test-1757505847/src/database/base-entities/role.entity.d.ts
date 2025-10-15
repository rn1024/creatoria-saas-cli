import { BaseDO } from '../base.entity';
export declare class RoleDO extends BaseDO {
    name: string;
    code: string;
    sort: number;
    dataScope: number;
    dataScopeDeptIds?: number[];
    status: number;
    type: number;
    remark?: string;
}
