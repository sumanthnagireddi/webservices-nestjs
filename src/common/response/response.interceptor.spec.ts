import { ResponseInterceptor } from './response.interceptor';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';

describe('ResponseInterceptor', () => {
  let interceptor: ResponseInterceptor;
  let mockExecutionContext: ExecutionContext;
  let mockCallHandler: CallHandler;

  beforeEach(() => {
    interceptor = new ResponseInterceptor();
    
    mockExecutionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({}),
        getResponse: jest.fn().mockReturnValue({}),
      }),
      getClass: jest.fn(),
      getHandler: jest.fn(),
      getArgs: jest.fn(),
      getArgByIndex: jest.fn(),
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
      getType: jest.fn(),
    } as any;

    mockCallHandler = {
      handle: jest.fn().mockReturnValue(of({ data: 'test' })),
    };
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should call next.handle()', (done) => {
    interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe(() => {
      expect(mockCallHandler.handle).toHaveBeenCalled();
      done();
    });
  });

  it('should return an observable', () => {
    const result = interceptor.intercept(mockExecutionContext, mockCallHandler);
    expect(result).toBeDefined();
    expect(result.subscribe).toBeDefined();
  });

  it('should pass through the response data', (done) => {
    const testData = { message: 'success', data: [1, 2, 3] };
    mockCallHandler.handle = jest.fn().mockReturnValue(of(testData));

    interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe((data) => {
      expect(data).toEqual(testData);
      done();
    });
  });

  it('should handle empty responses', (done) => {
    mockCallHandler.handle = jest.fn().mockReturnValue(of(null));

    interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe((data) => {
      expect(data).toBeNull();
      done();
    });
  });
});
