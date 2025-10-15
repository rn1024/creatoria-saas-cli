import { BaseDO } from '@app/database/base.entity';
export declare enum DictDataStatusEnum {
    ENABLE = 0,
    DISABLE = 1
}
export declare class DictDataDO extends BaseDO {
    id: number;
    sort: number;
    label: string;
    value: string;
    dictType: string;
    status: DictDataStatusEnum;
    colorType: string | null;
    cssClass: string | null;
    remark: string | null;
}
