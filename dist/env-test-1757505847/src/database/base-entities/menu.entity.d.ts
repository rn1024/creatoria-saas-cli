import { BaseDO } from '../base.entity';
export declare class MenuDO extends BaseDO {
    name: string;
    permission?: string;
    type: number;
    sort: number;
    parentId: number;
    path?: string;
    icon?: string;
    component?: string;
    componentName?: string;
    status: number;
    visible?: boolean;
    keepAlive?: boolean;
    alwaysShow?: boolean;
}
