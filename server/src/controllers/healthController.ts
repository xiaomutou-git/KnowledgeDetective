/**
 * =========================================================
 * 文件：src/controllers/healthController.ts
 * =========================================================
 * 功能说明：健康检查控制器
 * - 处理 GET /api/health
 * - 检查数据库连接状态与 AI API 配置状态
 *
 * 创建时间：2026-07-08
 * 核心用途：服务健康监控入口
 * =========================================================
 */

import { Request, Response, NextFunction } from 'express';
import { checkDatabaseHealth } from '../db/connection';
import { isAiConfigured } from '../config/ai';
import { logger } from '../utils/logger';

/**
 * 健康检查
 * @description 检查 db 与 ai 状态，并返回整体健康结果
 * @param {Request} _req - Express 请求对象（未使用）
 * @param {Response} res - Express 响应对象
 * @param {NextFunction} next - 下一个中间件函数
 * @returns {Promise<void>}
 */
export async function healthCheck(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const dbHealth = await checkDatabaseHealth();
    const aiConfigured = isAiConfigured();

    const overallHealthy = dbHealth.healthy;

    const response = {
      success: overallHealthy,
      status: overallHealthy ? 'ok' : 'degraded',
      message: overallHealthy
        ? '知识侦探后端服务运行中'
        : '知识侦探后端服务部分功能异常',
      timestamp: new Date().toISOString(),
      services: {
        db: dbHealth,
        ai: {
          configured: aiConfigured,
          message: aiConfigured ? 'AI API 已配置' : 'AI API 未配置，AI 生成功能不可用'
        }
      }
    };

    res.status(overallHealthy ? 200 : 503).json(response);
  } catch (err) {
    logger.error('健康检查失败', { error: String(err) });
    next(err);
  }
}
