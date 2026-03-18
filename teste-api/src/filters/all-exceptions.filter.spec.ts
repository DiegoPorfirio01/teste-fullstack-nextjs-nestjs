import type { ArgumentsHost } from '@nestjs/common';
import { HttpException, HttpStatus } from '@nestjs/common';
import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { AllExceptionsFilter } from './all-exceptions.filter';

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter;
  let mockReply: jest.Mocked<Partial<FastifyReply>>;
  let mockRequest: Partial<FastifyRequest>;

  const createHost = (): ArgumentsHost => {
    const ctx = {
      getResponse: () => mockReply,
      getRequest: () => mockRequest,
      switchToHttp: () => ctx,
    };
    return { switchToHttp: () => ctx } as unknown as ArgumentsHost;
  };

  beforeEach(async () => {
    mockReply = {
      header: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    mockRequest = {
      url: '/api/v1/test',
      headers: {},
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [AllExceptionsFilter],
    })
      .setLogger(false as never)
      .compile();

    filter = module.get<AllExceptionsFilter>(AllExceptionsFilter);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('HttpException', () => {
    it('should handle HttpException with object response', () => {
      const exception = new HttpException(
        { message: 'Validation failed', statusCode: 400, error: 'Bad Request' },
        HttpStatus.BAD_REQUEST,
      );

      filter.catch(exception, createHost());

      expect(mockReply.header).toHaveBeenCalledWith(
        'X-Request-ID',
        expect.any(String),
      );
      expect(mockReply.status).toHaveBeenCalledWith(400);
      expect(mockReply.send).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 400,
          message: 'Validation failed',
          error: 'Bad Request',
        }),
      );
    });

    it('should handle HttpException with string response', () => {
      const exception = new HttpException('Forbidden', HttpStatus.FORBIDDEN);

      filter.catch(exception, createHost());

      expect(mockReply.status).toHaveBeenCalledWith(403);
      expect(mockReply.send).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 403,
          message: 'Forbidden',
        }),
      );
    });

    it('should use x-request-id from request when present', () => {
      mockRequest = {
        url: '/test',
        headers: { 'x-request-id': 'custom-id-123' },
      };
      const exception = new HttpException('Error', HttpStatus.BAD_REQUEST);

      filter.catch(exception, createHost());

      expect(mockReply.header).toHaveBeenCalledWith(
        'X-Request-ID',
        'custom-id-123',
      );
    });

    it('should handle UnauthorizedException (401)', () => {
      const exception = new HttpException(
        'Unauthorized',
        HttpStatus.UNAUTHORIZED,
      );

      filter.catch(exception, createHost());

      expect(mockReply.status).toHaveBeenCalledWith(401);
      expect(mockReply.send).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
          message: 'Unauthorized',
        }),
      );
    });
  });

  describe('unknown errors', () => {
    it('should handle generic Error with 500', () => {
      const exception = new Error('Database connection failed');

      filter.catch(exception, createHost());

      expect(mockReply.status).toHaveBeenCalledWith(500);
      expect(mockReply.send).toHaveBeenCalledWith({
        statusCode: 500,
        message: 'Internal server error',
        error: 'Internal Server Error',
      });
    });

    it('should handle non-Error thrown value', () => {
      filter.catch('something broke', createHost());

      expect(mockReply.status).toHaveBeenCalledWith(500);
      expect(mockReply.send).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 500,
          message: 'Internal server error',
        }),
      );
    });
  });
});
