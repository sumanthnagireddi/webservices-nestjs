import { BlogMiddleware } from './blog.middleware';
import { Request, Response, NextFunction } from 'express';

describe('BlogMiddleware', () => {
  let middleware: BlogMiddleware;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    middleware = new BlogMiddleware();
    mockRequest = {
      method: 'GET',
      url: '/blogs',
      headers: {},
    };
    mockResponse = {
      statusCode: 200,
    };
    mockNext = jest.fn();
  });

  it('should be defined', () => {
    expect(middleware).toBeDefined();
  });

  it('should call next function', () => {
    middleware.use(mockRequest, mockResponse, mockNext);
    expect(mockNext).toHaveBeenCalled();
  });

  it('should pass through blog requests', () => {
    mockRequest.url = '/blogs/123';
    middleware.use(mockRequest, mockResponse, mockNext);
    expect(mockNext).toHaveBeenCalledTimes(1);
  });

  it('should handle POST requests', () => {
    mockRequest.method = 'POST';
    mockRequest.url = '/blogs';
    middleware.use(mockRequest, mockResponse, mockNext);
    expect(mockNext).toHaveBeenCalled();
  });

  it('should handle different HTTP methods', () => {
    const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
    methods.forEach((method) => {
      mockRequest.method = method;
      const nextFn = jest.fn();
      middleware.use(mockRequest, mockResponse, nextFn);
      expect(nextFn).toHaveBeenCalled();
    });
  });
});
