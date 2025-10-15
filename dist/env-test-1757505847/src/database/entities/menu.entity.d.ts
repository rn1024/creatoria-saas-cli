import { BaseEntity } from './base.entity';
import { RoleDO } from './role.entity';
export declare class MenuDO extends BaseEntity {
    name: string;
    path?: string;
    component?: string;
    icon?: string;
    sort: number;
    visible: boolean;
    status: boolean;
    permission?: string;
    type: number;
    children: MenuDO[];
    parent: MenuDO;
    roles: RoleDO[];
}
