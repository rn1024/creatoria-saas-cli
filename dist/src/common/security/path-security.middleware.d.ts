import { NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PathSecurityService } from './path-security.service';
import { LoggerService } from '../logger/logger.service';
export declare class PathSecurityMiddleware implements NestMiddleware {
    private readonly pathSecurity;
    private readonly logger;
    constructor(pathSecurity: PathSecurityService, logger: LoggerService);
    use(req: Request, res: Response, next: NextFunction): void;
    private validateRequestPath;
    private validateQueryPaths;
    private validateBodyPaths;
    private validateUploadedFiles;
}
