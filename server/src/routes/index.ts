/**
 * =========================================================
 * 文件：src/routes/index.ts
 * =========================================================
 * 功能说明：路由聚合入口
 * - 统一注册 health、case、game 路由模块
 * - 统一 API 前缀 /api
 *
 * 创建时间：2026-07-08
 * 核心用途：集中管理应用路由挂载
 * =========================================================
 */

import { Application } from 'express';
import healthRoutes from './healthRoutes';
import caseRoutes from './caseRoutes';
import gameRoutes from './gameRoutes';
import uploadRoutes from './uploadRoutes';
import { appConfig } from '../config/app';

/**
 * 聚合注册所有 API 路由
 * @description 将各模块路由挂载到应用实例的 /api 前缀下
 * @param {Application} app - Express 应用实例
 * @returns {void}
 */
export function registerRoutes(app: Application): void {
  const prefix = appConfig.apiPrefix;

  /**
   * 健康检查路由
   * @endpoint GET /api/health
   */
  app.use(`${prefix}/health`, healthRoutes);

  /**
   * 案卷路由
   * @endpoint GET /api/cases, GET /api/cases/:id, DELETE /api/cases/:id
   */
  app.use(`${prefix}/cases`, caseRoutes);

  /**
   * 游戏路由
   * @endpoint GET/POST /api/games, POST /api/games/generate, POST /api/games/:id/complete
   */
  app.use(`${prefix}/games`, gameRoutes);

  /**
   * 文件上传路由
   * @endpoint POST /api/upload/parse
   */
  app.use(`${prefix}/upload`, uploadRoutes);
}
