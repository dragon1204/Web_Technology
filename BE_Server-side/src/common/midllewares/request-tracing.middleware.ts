import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      requestId?: string;
      correlationId?: string;
    }
  }
}

@Injectable()
export class RequestTracingMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Generate or use existing request ID
    const requestId = req.headers['x-request-id'] as string || uuidv4();
    const correlationId = req.headers['x-correlation-id'] as string || requestId;

    // Attach to request object
    req.requestId = requestId;
    req.correlationId = correlationId;

    // Add to response headers for debugging
    res.setHeader('X-Request-Id', requestId);
    res.setHeader('X-Correlation-Id', correlationId);

    // Log incoming request
    console.log(`📥 [${requestId}] ${req.method} ${req.url} - IP: ${req.ip || req.connection.remoteAddress}`);

    // Log response when finished
    const originalSend = res.send;
    res.send = function (data) {
      console.log(`📤 [${requestId}] ${res.statusCode} ${req.method} ${req.url}`);
      return originalSend.call(this, data);
    };

    next();
  }
}
