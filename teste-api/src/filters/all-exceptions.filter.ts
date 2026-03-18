import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';

interface StandardErrorResponse {
  statusCode: number;
  message: string | string[];
  error?: string;
}

interface NestErrorResponseObject {
  statusCode?: number;
  message?: string | string[];
  error?: string;
}

interface FastifyRequestWithId extends FastifyRequest {
  requestId?: string;
}

function isErrorResponseObject(
  value: unknown,
): value is NestErrorResponseObject {
  return typeof value === 'object' && value !== null;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<FastifyReply>();
    const req = ctx.getRequest<FastifyRequestWithId>();

    const requestId =
      (req.requestId ?? String(req.headers['x-request-id'] ?? '')) ||
      crypto.randomUUID();

    const path = req.url?.split('?')[0] ?? '/';

    if (exception instanceof HttpException) {
      this.handleHttpException(exception, res, path, requestId);
      return;
    }

    this.handleUnknownError(exception, res, path, requestId);
  }

  private handleHttpException(
    exception: HttpException,
    res: FastifyReply,
    path: string,
    requestId: string,
  ): void {
    const status = exception.getStatus();
    const response = exception.getResponse();

    let body: StandardErrorResponse;
    if (isErrorResponseObject(response)) {
      body = {
        statusCode: response.statusCode ?? status,
        message: response.message ?? exception.message,
        error: response.error,
      };
    } else {
      body = {
        statusCode: status,
        message: typeof response === 'string' ? response : exception.message,
      };
    }

    const logLevel = status >= 500 ? 'error' : status >= 400 ? 'warn' : 'log';
    this.logger[logLevel](`HttpException: ${status} ${path}`, {
      requestId,
      path,
      status,
      message: body.message,
    });

    res.header('X-Request-ID', requestId);
    res.status(status).send(body);
  }

  private handleUnknownError(
    exception: unknown,
    res: FastifyReply,
    path: string,
    requestId: string,
  ): void {
    const status = HttpStatus.INTERNAL_SERVER_ERROR;
    const error =
      exception instanceof Error ? exception : new Error(String(exception));
    const stack = error.stack ?? '';

    this.logger.error(error.message, {
      requestId,
      path,
      stack,
      name: error.name,
    });

    res.header('X-Request-ID', requestId);
    res.status(status).send({
      statusCode: status,
      message: 'Internal server error',
      error: 'Internal Server Error',
    });
  }
}
