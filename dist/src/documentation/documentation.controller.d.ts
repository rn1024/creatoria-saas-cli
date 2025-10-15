import { Response } from 'express';
import { DocumentationService } from './documentation.service';
import { DocumentFormat } from './interfaces/doc.interface';
export declare class DocumentationController {
    private readonly documentationService;
    constructor(documentationService: DocumentationService);
    getIndex(res: Response): Promise<void>;
    getApiDocumentation(format: DocumentFormat | undefined, res: Response): Promise<void>;
    getGuide(type: 'user' | 'developer', res: Response): Promise<void>;
    getReference(type: 'config', res: Response): Promise<void>;
    generateDocumentation(): Promise<{
        success: boolean;
        message: string;
        timestamp: string;
    }>;
    downloadDocumentation(format: 'zip' | 'tar', res: Response): Promise<void>;
}
