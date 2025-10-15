import { BaseEntity } from './base.entity';
import { UserDO } from './user.entity';
import { MenuDO } from './menu.entity';
export declare class RoleDO extends BaseEntity {
    name: string;
    displayName: string;
    description?: string;
    sort: number;
    status: boolean;
    users: UserDO[];
    menus: MenuDO[];
}
