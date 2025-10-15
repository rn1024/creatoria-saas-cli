import { BaseDO } from '@app/database/base.entity';
export declare enum DictStatusEnum {
    ENABLE = 0,
    DISABLE = 1
}
export declare class DictTypeDO extends BaseDO {
    id: number;
    name: string;
    type: string;
    status: DictStatusEnum;
    remark: string | null;
}
