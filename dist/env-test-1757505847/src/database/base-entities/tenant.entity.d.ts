import { BaseDO } from '../base.entity';
export declare class TenantDO extends BaseDO {
    static readonly PACKAGE_ID_SYSTEM = 0;
    id: number;
    name: string;
    contactUserId: number;
    contactName: string;
    contactMobile: string;
    status: number;
    website: string;
    packageId: number;
    expireTime: Date;
    accountCount: number;
}
export declare class TenantPackageDO extends BaseDO {
    id: number;
    name: string;
    status: number;
    remark: string;
    menuIds: number[];
}
