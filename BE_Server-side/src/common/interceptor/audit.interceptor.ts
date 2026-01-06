import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, tap, catchError } from 'rxjs';
import { AuditService } from 'src/modules/audit/audit.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, user, body, params, requestId } = request;
    const ip = request.ip || request.connection?.remoteAddress;
    const userAgent = request.headers['user-agent'];

    // Extract entity info from URL patterns
    const entityMatch = url.match(/\/(users|gardens|vegetables|sales|sensors)(?:\/(\d+))?/);
    const entityType = entityMatch ? this.capitalize(entityMatch[1]) : undefined;
    const entityId = entityMatch?.[2] || params?.id || body?.id;

    // Map HTTP methods to actions
    const actionMap: Record<string, string> = {
      POST: 'CREATE',
      PUT: 'UPDATE',
      PATCH: 'UPDATE',
      DELETE: 'DELETE',
      GET: 'READ',
    };
    const action = actionMap[method] || method;

    const startTime = Date.now();

    return next.handle().pipe(
      tap((response) => {
        const duration = Date.now() - startTime;
        
        // Log CRUD operations only (skip READ for now to reduce noise)
        if (['CREATE', 'UPDATE', 'DELETE'].includes(action) && entityType) {
          this.auditService.log({
            action,
            entityType,
            entityId: String(entityId || 'unknown'),
            userId: user?.id,
            changes: {
              method,
              url,
              body,
              params,
              response: response?.id || response?.message,
              duration: `${duration}ms`,
            },
            requestId,
            ipAddress: ip,
            userAgent,
            success: true,
          });
        }
      }),
      catchError((error) => {
        // Log failed operations
        if (['CREATE', 'UPDATE', 'DELETE'].includes(action) && entityType) {
          this.auditService.log({
            action,
            entityType,
            entityId: String(entityId || 'unknown'),
            userId: user?.id,
            changes: { method, url, body, params },
            requestId,
            ipAddress: ip,
            userAgent,
            success: false,
            errorMessage: error.message || 'Unknown error',
          });
        }
        throw error;
      }),
    );
  }

  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1, -1);
  }
}
