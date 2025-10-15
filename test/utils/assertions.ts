/**
 * 测试断言辅助函数
 */

import { BaseException } from '../../src/common/exceptions/base.exception';

export class Assertions {
  /**
   * 断言抛出特定异常
   */
  static async assertThrowsException(
    fn: () => Promise<any>,
    errorCode: string,
    errorMessage?: string | RegExp,
  ): Promise<void> {
    let error: any;
    
    try {
      await fn();
    } catch (e) {
      error = e;
    }
    
    expect(error).toBeDefined();
    expect(error).toBeInstanceOf(BaseException);
    expect(error.code).toBe(errorCode);
    
    if (errorMessage) {
      if (typeof errorMessage === 'string') {
        expect(error.message).toContain(errorMessage);
      } else {
        expect(error.message).toMatch(errorMessage);
      }
    }
  }

  /**
   * 断言数组包含指定元素
   */
  static assertArrayContains<T>(
    array: T[],
    element: T,
    compareFn?: (a: T, b: T) => boolean,
  ): void {
    const contains = compareFn
      ? array.some(item => compareFn(item, element))
      : array.includes(element);
    
    expect(contains).toBe(true);
  }

  /**
   * 断言数组不包含指定元素
   */
  static assertArrayNotContains<T>(
    array: T[],
    element: T,
    compareFn?: (a: T, b: T) => boolean,
  ): void {
    const contains = compareFn
      ? array.some(item => compareFn(item, element))
      : array.includes(element);
    
    expect(contains).toBe(false);
  }

  /**
   * 断言对象包含指定属性
   */
  static assertObjectHasProperties(
    obj: any,
    properties: string[],
  ): void {
    for (const prop of properties) {
      expect(obj).toHaveProperty(prop);
    }
  }

  /**
   * 断言对象部分匹配
   */
  static assertObjectMatches(
    actual: any,
    expected: any,
    strict: boolean = false,
  ): void {
    if (strict) {
      expect(actual).toEqual(expected);
    } else {
      expect(actual).toMatchObject(expected);
    }
  }

  /**
   * 断言字符串匹配模式
   */
  static assertStringMatches(
    str: string,
    pattern: string | RegExp,
  ): void {
    if (typeof pattern === 'string') {
      expect(str).toContain(pattern);
    } else {
      expect(str).toMatch(pattern);
    }
  }

  /**
   * 断言数字在范围内
   */
  static assertNumberInRange(
    num: number,
    min: number,
    max: number,
    inclusive: boolean = true,
  ): void {
    if (inclusive) {
      expect(num).toBeGreaterThanOrEqual(min);
      expect(num).toBeLessThanOrEqual(max);
    } else {
      expect(num).toBeGreaterThan(min);
      expect(num).toBeLessThan(max);
    }
  }

  /**
   * 断言日期在范围内
   */
  static assertDateInRange(
    date: Date,
    start: Date,
    end: Date,
  ): void {
    expect(date.getTime()).toBeGreaterThanOrEqual(start.getTime());
    expect(date.getTime()).toBeLessThanOrEqual(end.getTime());
  }

  /**
   * 断言Promise被拒绝
   */
  static async assertPromiseRejected(
    promise: Promise<any>,
    errorMessage?: string | RegExp,
  ): Promise<void> {
    await expect(promise).rejects.toThrow(errorMessage);
  }

  /**
   * 断言Promise被解析
   */
  static async assertPromiseResolved<T>(
    promise: Promise<T>,
    expectedValue?: T,
  ): Promise<void> {
    const value = await promise;
    
    if (expectedValue !== undefined) {
      expect(value).toEqual(expectedValue);
    }
  }

  /**
   * 断言函数被调用
   */
  static assertFunctionCalled(
    fn: jest.Mock,
    times?: number,
    args?: any[],
  ): void {
    if (times !== undefined) {
      expect(fn).toHaveBeenCalledTimes(times);
    } else {
      expect(fn).toHaveBeenCalled();
    }
    
    if (args) {
      expect(fn).toHaveBeenCalledWith(...args);
    }
  }

  /**
   * 断言函数未被调用
   */
  static assertFunctionNotCalled(fn: jest.Mock): void {
    expect(fn).not.toHaveBeenCalled();
  }

  /**
   * 断言文件存在
   */
  static async assertFileExists(
    fs: any,
    filepath: string,
  ): Promise<void> {
    const exists = await fs.exists(filepath);
    expect(exists).toBe(true);
  }

  /**
   * 断言文件不存在
   */
  static async assertFileNotExists(
    fs: any,
    filepath: string,
  ): Promise<void> {
    const exists = await fs.exists(filepath);
    expect(exists).toBe(false);
  }

  /**
   * 断言文件内容
   */
  static async assertFileContent(
    fs: any,
    filepath: string,
    expectedContent: string | RegExp,
  ): Promise<void> {
    const content = await fs.readFile(filepath, 'utf8');
    
    if (typeof expectedContent === 'string') {
      expect(content).toBe(expectedContent);
    } else {
      expect(content).toMatch(expectedContent);
    }
  }

  /**
   * 断言JSON相等
   */
  static assertJSONEqual(
    actual: any,
    expected: any,
    ignoreKeys?: string[],
  ): void {
    const actualCopy = JSON.parse(JSON.stringify(actual));
    const expectedCopy = JSON.parse(JSON.stringify(expected));
    
    if (ignoreKeys) {
      const removeKeys = (obj: any) => {
        for (const key of ignoreKeys) {
          delete obj[key];
        }
        for (const value of Object.values(obj)) {
          if (typeof value === 'object' && value !== null) {
            removeKeys(value);
          }
        }
      };
      
      removeKeys(actualCopy);
      removeKeys(expectedCopy);
    }
    
    expect(actualCopy).toEqual(expectedCopy);
  }

  /**
   * 断言执行时间
   */
  static async assertExecutionTime(
    fn: () => Promise<any>,
    maxTime: number,
  ): Promise<void> {
    const startTime = Date.now();
    await fn();
    const duration = Date.now() - startTime;
    
    expect(duration).toBeLessThanOrEqual(maxTime);
  }

  /**
   * 断言内存使用
   */
  static async assertMemoryUsage(
    fn: () => Promise<any>,
    maxMemory: number,
  ): Promise<void> {
    const startMemory = process.memoryUsage().heapUsed;
    await fn();
    const endMemory = process.memoryUsage().heapUsed;
    const memoryUsed = endMemory - startMemory;
    
    expect(memoryUsed).toBeLessThanOrEqual(maxMemory);
  }

  /**
   * 断言事件被触发
   */
  static assertEventEmitted(
    emitter: any,
    eventName: string,
    expectedData?: any,
  ): void {
    const events = emitter._events?.get(eventName) || [];
    expect(events.length).toBeGreaterThan(0);
    
    if (expectedData !== undefined) {
      expect(emitter.emit).toHaveBeenCalledWith(eventName, expectedData);
    }
  }

  /**
   * 断言HTTP响应
   */
  static assertHttpResponse(
    response: any,
    expectedStatus: number,
    expectedBody?: any,
    expectedHeaders?: Record<string, string>,
  ): void {
    expect(response.statusCode).toBe(expectedStatus);
    
    if (expectedBody !== undefined) {
      expect(response.body).toEqual(expectedBody);
    }
    
    if (expectedHeaders) {
      for (const [key, value] of Object.entries(expectedHeaders)) {
        expect(response.headers[key]).toBe(value);
      }
    }
  }

  /**
   * 断言类型
   */
  static assertType(
    value: any,
    type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'function' | 'undefined' | 'null',
  ): void {
    switch (type) {
      case 'array':
        expect(Array.isArray(value)).toBe(true);
        break;
      case 'null':
        expect(value).toBeNull();
        break;
      case 'undefined':
        expect(value).toBeUndefined();
        break;
      default:
        expect(typeof value).toBe(type);
        break;
    }
  }
}
