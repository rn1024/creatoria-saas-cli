import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
export interface JwtPayload {
    sub: number;
    username: string;
    roles?: string[];
    permissions?: string[];
    tenantId?: number;
    iat?: number;
    exp?: number;
}
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    private readonly configService;
    constructor(configService: ConfigService);
    validate(payload: JwtPayload): Promise<{
        userId: number;
        username: string;
        roles: string[];
        permissions: string[];
        tenantId: number | undefined;
    }>;
}
export {};
