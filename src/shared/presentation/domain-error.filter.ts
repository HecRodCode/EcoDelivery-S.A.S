import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import {
  DomainError,
  EmailAlreadyRegisteredError,
  EntityNotFoundError,
  InvalidCredentialsError,
  InvalidStatusTransitionError,
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
    if (exception instanceof EntityNotFoundError) {
      return HttpStatus.NOT_FOUND;
    }
    if (exception instanceof InvalidStatusTransitionError) {
      return HttpStatus.CONFLICT;
    }
    if (exception instanceof EmailAlreadyRegisteredError) {
      return HttpStatus.CONFLICT;
    }
    if (exception instanceof InvalidCredentialsError) {
      return HttpStatus.UNAUTHORIZED;
    }
    return HttpStatus.BAD_REQUEST;
  }
}
