import {
  ArgumentsHost,
  Catch,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import {
  PrismaClientInitializationError,
  PrismaClientKnownRequestError,
  PrismaClientRustPanicError,
  PrismaClientUnknownRequestError,
  PrismaClientValidationError,
} from '@prisma/client/runtime/library';
import { Response } from 'express';

import { MetricsService } from './common/metrics/metrics.service';
import APIResponse from './utils/apiResponse';

type MyResponseObj = {
  statusCode: number;
  success: boolean;
  message: string;
  data: string | object;
};

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
  constructor(private readonly metricsService: MetricsService) {
    super();
  }
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const myResponseObj: MyResponseObj = {
      statusCode: 500,
      success: false,
      message: 'Internal Server Error',
      data: '',
    };

    if (exception instanceof HttpException) {
      myResponseObj.statusCode = exception.getStatus();
      myResponseObj.data = exception.getResponse();
      myResponseObj.message = exception.message;
    } else if (exception instanceof PrismaClientKnownRequestError) {
      if (exception.code === 'P2002') {
        myResponseObj.statusCode = HttpStatus.CONFLICT;
        myResponseObj.message = 'Duplicate field value error';
      } else if (exception.code === 'P2025') {
        myResponseObj.statusCode = HttpStatus.NOT_FOUND;
        myResponseObj.message = 'Record not found';
      } else {
        myResponseObj.statusCode = HttpStatus.BAD_REQUEST;
        myResponseObj.message = `Prisma Known Request Error: ${exception.message}`;
      }
      myResponseObj.data = exception.message.replaceAll(/\n/g, ' ');
    } else if (exception instanceof PrismaClientValidationError) {
      myResponseObj.statusCode = HttpStatus.UNPROCESSABLE_ENTITY;
      myResponseObj.data = exception.message.replaceAll(/\n/g, ' ');
      myResponseObj.message = `Prisma Validation Error: ${exception.message}`;
    } else if (exception instanceof PrismaClientUnknownRequestError) {
      myResponseObj.statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      myResponseObj.data = exception.message.replaceAll(/\n/g, ' ');
      myResponseObj.message = `Prisma Unknown Request Error: ${exception.message}`;
    } else if (exception instanceof PrismaClientRustPanicError) {
      myResponseObj.statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      myResponseObj.data = exception.message.replaceAll(/\n/g, ' ');
      myResponseObj.message = `Prisma Rust Panic Error: ${exception.message}`;
    } else if (exception instanceof PrismaClientInitializationError) {
      myResponseObj.statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      myResponseObj.data = exception.message.replaceAll(/\n/g, ' ');
      myResponseObj.message = `Prisma Initialization Error: ${exception.message}`;
    } else {
      myResponseObj.statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      myResponseObj.data = 'Internal Server Error';
      myResponseObj.message = 'Internal Server Error';
    }

    APIResponse(response, myResponseObj);

    super.catch(exception, host);
  }
}
