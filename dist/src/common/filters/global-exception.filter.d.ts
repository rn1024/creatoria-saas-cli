import { ExceptionFilter, ArgumentsHost } from '@nestjs/common';
export declare class GlobalExceptionFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost): void;
    private isCliContext;
    private handleCliException;
    private handleBaseException;
    private handleNodeError;
    private handleStandardError;
    private handleUnknownError;
    private formatHttpError;
    private isNodeError;
}
