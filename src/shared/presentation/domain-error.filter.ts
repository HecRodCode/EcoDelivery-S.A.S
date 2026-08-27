import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import {
  DomainError,
  EntidadNoEncontradaError,
  TransicionEstadoInvalidaError,
} from '../domain/domain.error';

@Catch(DomainError)
export class DomainErrorFilter implements ExceptionFilter {
  catch(exception: DomainError, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    const status = this.resolveStatus(exception);

    response.status(status).json({
      statusCode: status,
      message: exception.message,
    });
  }

  private resolveStatus(exception: DomainError): number {
    if (exception instanceof EntidadNoEncontradaError) {
      return HttpStatus.NOT_FOUND;
    }
    if (exception instanceof TransicionEstadoInvalidaError) {
      return HttpStatus.CONFLICT;
    }
    return HttpStatus.BAD_REQUEST;
  }
}
