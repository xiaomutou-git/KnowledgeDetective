/**
 * =========================================================
 * 文件：src/middlewares/errorHandler.ts
 * =========================================================
 * 功能说明：全局错误处理中间件
 * - 捕获应用内所有未处理的同步/异步异常
 * - 根据环境返回不同程度的错误信息（生产环境隐藏堆栈）
 * - 统一错误响应格式，避免敏感信息泄露
 *
 * 创建时间：2026-07-08
 * 核心用途：统一异常处理、错误响应规范化、安全兜底
 * =========================================================
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { appConfig } from '../config/app';

/**
 * 应用业务异常类
 * @description 用于区分可预期的业务错误与未捕获的运行时错误
 */
export class AppError extends Error {
  /**
   * HTTP 状态码
   * @type {number}
   */
  statusCode: number;

  /**
   * 是否已记录日志
   * @type {boolean}
   */
  isLogged: boolean;

  /**
   * 构造业务异常
   * @param {string} message - 错误描述
   * @param {number} [statusCode=500] - HTTP 状态码
   * @param {boolean} [isLogged=false] - 是否已由调用方记录
   */
  constructor(message: string, statusCode: number = 500, isLogged: boolean = false) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.isLogged = isLogged;
    // 修复原型链
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * 404 路由未找到处理中间件
 * @description 当没有任何路由匹配时抛出 404 业务异常
 * @param {Request} req - Express 请求对象
 * @param {Response} res - Express 响应对象
 * @param {NextFunction} next - 下一个中间件函数
 * @returns {void}
 */
export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  const error = new AppError(`路由未找到: ${req.method} ${req.originalUrl}`, 404);
  next(error);
}

/**
 * 全局错误处理中间件
 * @description Express 错误处理中间件，必须包含 4 个参数
 * @param {Error | AppError} err - 错误对象
 * @param {Request} _req - Express 请求对象（未使用）
 * @param {Response} res - Express 响应对象
 * @param {NextFunction} _next - 下一个中间件函数（未使用）
 * @returns {void}
 */
export function globalErrorHandler(
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // 判断是否为业务异常
  const isAppError = err instanceof AppError;
  const statusCode = isAppError ? err.statusCode : 500;

  // 生产环境下，非业务异常隐藏原始错误信息，避免泄露数据库结构、堆栈等敏感内容
  const message = isAppError
    ? err.message
    : appConfig.isProduction
      ? '服务器内部错误'
      : err.message || '服务器内部错误';

  // 未记录过的错误写入日志
  if (!isAppError || !err.isLogged) {
    logger.error('全局错误处理', {
      name: err.name,
      message: err.message,
      statusCode,
      stack: err.stack
    });
  }

  // 构造响应体
  const response: Record<string, unknown> = {
    success: false,
    error: message,
    statusCode
  };

  // 非生产环境返回堆栈，便于调试
  if (!appConfig.isProduction && err.stack) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
}
