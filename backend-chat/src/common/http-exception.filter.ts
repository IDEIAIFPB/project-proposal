import {
  Catch,
  ArgumentsHost,
  ExceptionFilter,
  HttpStatus,
  Logger,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';
import { AxiosError } from 'axios';
import { MetaApiErrorResponseData } from './interfaces/meta-api-error-response.interface';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'An unexpected internal error occurred.';
    let details: any = {}; // temporary type

    // 1. handle axiosErrors (communication errors with external APIs like Meta)
    if (exception instanceof AxiosError) {
      status = exception.response?.status || HttpStatus.BAD_GATEWAY;
      message = 'Error communicating with external API.';
      details = (exception.response?.data || {}) as MetaApiErrorResponseData; // Assert para sua interface

      // Logging details
      this.logger.error(
        `[AllExceptionsFilter] AxiosError - Path: ${request.url} | Status: ${status} | Message: ${exception.message}`
      );
      if (exception.response) {
        this.logger.error(
          `[AllExceptionsFilter] AxiosError Response Data: ${JSON.stringify(exception.response.data)}`
        );
      } else {
        this.logger.error(
          `[AllExceptionsFilter] AxiosError (no response): ${exception.message}`
        );
      }
    }
    // 2. Handle NestJS HTTP errors (e.g. HttpException, NotFoundException, etc.)
    else if (exception instanceof HttpException) {
      // Erros HTTP lançados pela nossa própria aplicação (ex: BadRequestException)
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null
      ) {
        message = (exceptionResponse as any).message || exception.message;
        details = exceptionResponse;
      } else {
        message = exception.message;
      }
      this.logger.warn(
        `[AllExceptionsFilter] HttpException - Path: ${request.url}, Method: ${request.method}, Status: ${status}, Message: ${message}`
      );
      this.logger.debug(
        `[AllExceptionsFilter] HttpException Details: ${JSON.stringify(details)}`,
        exception.stack
      );
    } else if (exception instanceof Error) {
      message = exception.message;
      details = { name: exception.name, stack: exception.stack };
      this.logger.error(
        `[AllExceptionsFilter] Generic Error - Path: ${request.url}, Method: ${request.method}, Message: ${message}`,
        exception.stack
      );
    }
    // 3. handle unknown or generic errors
    else {
      this.logger.error(
        `[AllExceptionsFilter] Unknown Error - Path: ${request.url} | Error: ${String(exception)}`
      );
      message = `An unknown error occurred: ${String(exception)}`;
      details = { error: String(exception) };
    }

    const responseBody: any = {
      success: false,
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    if (
      process.env.NODE_ENV !== 'production' &&
      Object.keys(details).length > 0
    ) {
      responseBody.details = details;
    }

    response.status(status).json(responseBody);
  }
}
