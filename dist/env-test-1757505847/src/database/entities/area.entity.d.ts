import { BaseEntity } from './base.entity';
export declare class AreaDO extends BaseEntity {
    name: string;
    code: string;
    type: number;
    latitude?: number;
    longitude?: number;
    sort: number;
    children: AreaDO[];
    parent: AreaDO;
}
