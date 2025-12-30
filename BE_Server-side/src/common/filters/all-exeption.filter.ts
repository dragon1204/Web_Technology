import { ArgumentsHost, ExceptionFilter, HttpException, HttpStatus, Logger } from "@nestjs/common";
import { Request, Response } from "express";

export class AllExceptionsFilter implements ExceptionFilter {
    private readonly logger = new Logger(AllExceptionsFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        const status = 
            exception instanceof HttpException
                ? exception.getStatus()
                : HttpStatus.INTERNAL_SERVER_ERROR;

        const message = 
            exception instanceof HttpException
                ? exception.getResponse()
                : 'Internal server error';

        // Log error details for debugging (especially for 500 errors)
        if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
            this.logger.error(
                `Internal Server Error: ${request.method} ${request.url}`,
                exception instanceof Error ? exception.stack : String(exception)
            );
        }

        response.status(status).json({
            message,
            timestamp: new Date().toISOString(),
            path: request.url,
            ...(process.env.NODE_ENV === 'development' && exception instanceof Error && {
                error: exception.message,
                stack: exception.stack,
            }),
        });
    }
}