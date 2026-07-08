/**
 * =========================================================
 * 文件：src/middlewares/cors.ts
 * =========================================================
 * 功能说明：跨域资源共享（CORS）中间件
 * - 为前端页面、第三方调用提供可控的跨域支持
 * - 开发环境允许所有来源，生产环境可通过环境变量限制
 *
 * 创建时间：2026-07-08
 * 核心用途：统一配置跨域响应头
 * =========================================================
 */

import { Request, Response, NextFunction } from 'express';
import { appConfig } from '../config/app';

/**
 * 允许跨域的 HTTP 方法
 * @type {string}
 */
const ALLOWED_METHODS = 'GET, POST, PUT, DELETE, PATCH, OPTIONS';

/**
 * 允许跨域的 HTTP 请求头
 * @type {string}
 */
const ALLOWED_HEADERS = 'Content-Type, Authorization, X-Requested-With';

/**
 * CORS 中间件
 * @description 根据环境动态设置 Access-Control-Allow-Origin 等响应头
 * @param {Request} req - Express 请求对象
 * @param {Response} res - Express 响应对象
 * @param {NextFunction} next - 下一个中间件函数
 * @returns {void}
 */
export function corsMiddleware(req: Request, res: Response, next: NextFunction): void {
  // 生产环境建议从环境变量读取，开发环境允许所有来源
  const allowedOrigin = appConfig.isProduction
    ? process.env.CORS_ALLOWED_ORIGIN || ''
    : '*';

  // 设置允许的源
  if (allowedOrigin) {
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  } else if (!appConfig.isProduction) {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }

  // 设置允许的方法与请求头
  res.setHeader('Access-Control-Allow-Methods', ALLOWED_METHODS);
  res.setHeader('Access-Control-Allow-Headers', ALLOWED_HEADERS);

  // 允许携带凭证（仅在非 * 时有效）
  if (allowedOrigin && allowedOrigin !== '*') {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }

  // 预检请求直接返回 204
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  next();
}
