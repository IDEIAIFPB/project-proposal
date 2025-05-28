import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface ExceptionResponseShape {
  message?: string | string[];
  error?: string;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const rawResponse =
      exception instanceof HttpException
        ? exception.getResponse()
        : { message: 'Internal server error' };

    // Inicializa valores padrão
    let messages: string[] = ['Internal server error'];
    let name = 'InternalServerError';

    // Tipagem segura
    if (typeof rawResponse === 'object' && rawResponse !== null) {
      const exceptionResponse = rawResponse as Partial<ExceptionResponseShape>;

      if (Array.isArray(exceptionResponse.message)) {
        messages = exceptionResponse.message;
      } else if (typeof exceptionResponse.message === 'string') {
        messages = [exceptionResponse.message];
      }

      if (typeof exceptionResponse.error === 'string') {
        name = exceptionResponse.error;
      }
    } else if (typeof rawResponse === 'string') {
      messages = [rawResponse];
    }

    response.status(status).json({
      success: false,
      error: {
        messages,
        name,
      },
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
