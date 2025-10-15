import { BaseDO } from '../base.entity';
export declare class OperateLogDO extends BaseDO {
    id: number;
    traceId?: string;
    userId: number;
    userType: number;
    module: string;
    name: string;
    type: number;
    content?: string;
    exts?: Record<string, any>;
    requestMethod: string;
    requestUrl: string;
    userIp?: string;
    userAgent?: string;
    javaMethod: string;
    javaMethodArgs?: string;
    startTime: Date;
    duration: number;
    resultCode: number;
    resultMsg?: string;
    resultData?: string;
    bizId?: number;
}
