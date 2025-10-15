import { BaseDO } from '../base.entity';
export declare class ConfigDO extends BaseDO {
    category: string;
    name: string;
    key: string;
    value: string;
    type: number;
    visible: boolean;
    remark?: string;
}
