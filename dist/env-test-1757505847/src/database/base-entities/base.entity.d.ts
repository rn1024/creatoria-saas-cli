export declare abstract class BaseDO {
    id: number;
    createTime: Date;
    updateTime: Date;
    creator?: string;
    updater?: string;
    deleted: boolean;
    tenantId?: number;
}
