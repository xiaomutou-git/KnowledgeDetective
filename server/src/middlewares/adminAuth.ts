/**
 * =========================================================
 * 文件：src/middlewares/adminAuth.ts
 * =========================================================
 * 功能说明：管理接口 API Key 认证中间件
 * - 保护敏感管理操作（如删除案卷）免受未授权访问
 * - 支持从 Authorization: Bearer <key> 或 x-admin-key 头读取密钥
 * - 与 server/.env 中的 ADMIN_API_KEY 环境变量进行恒定时间比较
 *
 * 创建时间：2026-07-09
 * 核心用途：为管理类接口提供统一认证层
 * =========================================================
 */

import { Request, Response, NextFunction } from 'express';
import { appConfig } from '../config/app';
import { AppError } from './errorHandler';

/**
 * 管理接口认证中间件
 * @description 校验请求携带的管理员 API Key 是否有效；未配置密钥时拒绝访问
 * @param {Request} req - Express 请求对象
 * @param {Response} res - Express 响应对象
 * @param {NextFunction} next - 下一个中间件函数
 * @returns {void}
 * @throws {AppError} 当未配置密钥、未提供密钥或密钥无效时抛出 401/403
 */
export function adminAuthMiddleware(req: Request, _res: Response, next: NextFunction): void {
  const adminKey = appConfig.adminApiKey;

  if (!adminKey) {
    throw new AppError('管理员 API Key 未配置，无法执行该操作', 503, true);
  }

  const providedKey = extractAdminKey(req);
  if (!providedKey) {
    throw new AppError('缺少管理员认证信息，请在请求头中提供 Authorization: Bearer <key> 或 x-admin-key', 401, true);
  }

  if (!constantTimeCompare(providedKey, adminKey)) {
    throw new AppError('管理员 API Key 无效', 403, true);
  }

  next();
}

/**
 * 从请求头中提取管理员密钥
 * @description 优先读取 Authorization: Bearer <key>，其次读取 x-admin-key
 * @param {Request} req - Express 请求对象
 * @returns {string | undefined} 提取到的密钥，未找到时返回 undefined
 */
function extractAdminKey(req: Request): string | undefined {
  const authHeader = req.headers.authorization;
  if (typeof authHeader === 'string') {
    const parts = authHeader.trim().split(' ');
    if (parts.length === 2 && parts[0].toLowerCase() === 'bearer' && parts[1].length > 0) {
      return parts[1];
    }
  }

  const customHeader = req.headers['x-admin-key'];
  if (typeof customHeader === 'string' && customHeader.length > 0) {
    return customHeader;
  }

  return undefined;
}

/**
 * 恒定时间字符串比较
 * @description 防止时序攻击，无论字符串是否匹配都比较完整长度
 * @param {string} a - 待比较字符串
 * @param {string} b - 待比较字符串
 * @returns {boolean} 两字符串是否相等
 */
function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}
