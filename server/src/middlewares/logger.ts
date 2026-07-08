/**
 * =========================================================
 * 文件：src/middlewares/logger.ts
 * =========================================================
 * 功能说明：HTTP 请求日志中间件
 * - 记录每个请求的 method、path、statusCode、duration
 * - 使用 winston logger 输出，便于统一收集与分析
 *
 * 创建时间：2026-07-08
 * 核心用途：请求可观测性、性能排查、访问审计
 * =========================================================
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

/**
 * 请求日志中间件
 * @description 在请求开始时记录时间戳，响应完成时计算耗时并输出日志
 * @param {Request} req - Express 请求对象
 * @param {Response} res - Express 响应对象
 * @param {NextFunction} next - 下一个中间件函数
 * @returns {void}
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  // 记录请求开始时间（高精度时间，单位为毫秒）
  const start = process.hrtime.bigint();

  /**
   * 响应完成后的回调函数
   * @description 计算耗时并输出日志
   * @returns {void}
   */
  const logRequest = (): void => {
    // 移除监听器，避免重复触发
    res.removeListener('finish', logRequest);
    res.removeListener('close', logRequest);

    const end = process.hrtime.bigint();
    const durationMs = Number(end - start) / 1_000_000;

    const method = req.method;
    const path = req.originalUrl || req.url;
    const statusCode = res.statusCode;
    const contentLength = res.get('Content-Length') || '-';

    // 根据状态码选择日志级别
    const level = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'http';

    logger.log(level, `${method} ${path} ${statusCode} ${durationMs.toFixed(2)}ms ${contentLength}`, {
      method,
      path,
      statusCode,
      durationMs: Number(durationMs.toFixed(2)),
      contentLength,
      userAgent: req.get('user-agent') || '-',
      remoteAddress: req.ip || req.socket.remoteAddress || '-'
    });
  };

  // 响应正常完成或连接关闭时均记录日志
  res.once('finish', logRequest);
  res.once('close', logRequest);

  next();
}
