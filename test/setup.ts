/**
 * 测试环境设置
 */

import 'reflect-metadata';
import { Test } from '@nestjs/testing';

// 设置环境变量
process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'error';

// 全局超时设置
jest.setTimeout(10000);

// 清理函数
afterEach(() => {
  jest.clearAllMocks();
  jest.restoreAllMocks();
});

// 全局Mock
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// 扩展Jest匹配器
expect.extend({
  toBeValidEmail(received: string) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const pass = emailRegex.test(received);
    
    return {
      pass,
      message: () => 
        pass
          ? `expected ${received} not to be a valid email`
          : `expected ${received} to be a valid email`,
    };
  },
  
  toBeValidUrl(received: string) {
    let pass = false;
    try {
      new URL(received);
      pass = true;
    } catch {}
    
    return {
      pass,
      message: () =>
        pass
          ? `expected ${received} not to be a valid URL`
          : `expected ${received} to be a valid URL`,
    };
  },
  
  toBeWithinRange(received: number, floor: number, ceiling: number) {
    const pass = received >= floor && received <= ceiling;
    
    return {
      pass,
      message: () =>
        pass
          ? `expected ${received} not to be within range ${floor} - ${ceiling}`
          : `expected ${received} to be within range ${floor} - ${ceiling}`,
    };
  },
});

// TypeScript类型扩展
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidEmail(): R;
      toBeValidUrl(): R;
      toBeWithinRange(floor: number, ceiling: number): R;
    }
  }
}

export {};
