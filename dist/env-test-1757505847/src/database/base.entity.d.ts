export declare abstract class BaseDO {
    id: number;
    createdAt: Date;
    updatedAt: Date;
}
export declare abstract class TreeBaseDO extends BaseDO {
    parentId?: number;
    ancestors?: string;
    children?: TreeBaseDO[];
}
