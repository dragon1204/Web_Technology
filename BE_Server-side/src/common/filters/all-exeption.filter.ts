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

        // Log error details for debugging
        if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
            this.logger.error(
                `Internal Server Error: ${request.method} ${request.url}`,
                exception instanceof Error ? exception.stack : String(exception)
            );
        } else if (status === HttpStatus.BAD_REQUEST) {
            // Log validation errors for debugging
            this.logger.warn(
                `Bad Request: ${request.method} ${request.url}`,
                `Body: ${JSON.stringify(request.body)}`,
                `Error: ${JSON.stringify(message)}`
            );
        }

        // Format error response
        const errorResponse: any = {
            success: false,
            message: typeof message === 'string' ? message : (message as any)?.message || message,
            timestamp: new Date().toISOString(),
            path: request.url,
        };

        // Add validation errors if available
        if (status === HttpStatus.BAD_REQUEST && typeof message === 'object' && (message as any)?.message) {
            errorResponse.errors = (message as any).message;
        }

        // Add debug info in development
        if (process.env.NODE_ENV === 'development') {
            errorResponse.debug = {
                method: request.method,
                body: request.body,
                ...(exception instanceof Error && {
                    error: exception.message,
                    stack: exception.stack,
                }),
            };
        }

        response.status(status).json(errorResponse);
    }
}