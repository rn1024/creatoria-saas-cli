import { BaseDO } from '../base.entity';
export declare enum NoticeTypeEnum {
    NOTICE = 1,
    ANNOUNCEMENT = 2
}
export declare enum CommonStatusEnum {
    ENABLE = 0,
    DISABLE = 1
}
export declare class NoticeDO extends BaseDO {
    id: number;
    title: string;
    type: NoticeTypeEnum;
    content: string;
    status: CommonStatusEnum;
}
