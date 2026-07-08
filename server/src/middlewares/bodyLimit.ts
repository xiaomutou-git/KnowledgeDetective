/**
 * =========================================================
 * 文件：src/middlewares/bodyLimit.ts
 * =========================================================
 * 功能说明：请求体大小限制中间件
 * - 限制单个请求体最大为 10MB
 * - 在 JSON 解析之前进行拦截，避免大请求导致内存暴涨
 *
 * 创建时间：2026-07-08
 * 核心用途：防止超大请求体攻击，保护服务稳定性
 * =========================================================
 */

import { Request, Response, NextFunction } from 'express';
import { appConfig } from '../config/app';
import { AppError } from './errorHandler';

/**
 * 默认请求体大小限制（字节）
 * @type {number}
 * @default 10485760 (10MB)
 */
const DEFAULT_BODY_LIMIT = 10 * 1024 * 1024;

/**
 * 请求体大小限制中间件
 * @description 通过检查 Content-Length 头或累积 data 长度实现限制
 * @param {Request} req - Express 请求对象
 * @param {Response} res - Express 响应对象
 * @param {NextFunction} next - 下一个中间件函数
 * @returns {void}
 */
export function bodyLimitMiddleware(req: Request, res: Response, next: NextFunction): void {
  const limit = appConfig.bodyLimit || DEFAULT_BODY_LIMIT;

  // 优先检查 Content-Length 头
  const contentLength = req.headers['content-length'];
  if (contentLength) {
    const size = parseInt(contentLength as string, 10);
    if (!isNaN(size) && size > limit) {
      next(new AppError(`请求体过大，最大允许 ${limit} 字节`, 413));
      return;
    }
  }

  // 对于无 Content-Length 或 chunked 编码的请求，监控实际数据长度
  let received = 0;
  let exceeded = false;

  /**
   * 数据到达时的监听函数
   * @description 累加数据长度，超出限制后销毁连接
   * @returns {void}
   */
  const onData = (): void => {
    if (exceeded) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    received += (req as any).socket.bytesRead || 0;
    if (received > limit) {
      exceeded = true;
      req.destroy();
      next(new AppError(`请求体过大，最大允许 ${limit} 字节`, 413));
    }
  };

  req.on('data', onData);
  req.once('end', () => {
    req.removeListener('data', onData);
  });

  next();
}
