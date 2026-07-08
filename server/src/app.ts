/**
 * =========================================================
 * 文件：src/app.ts
 * =========================================================
 * 功能说明：Express 应用入口
 * - 配置中间件（CORS、请求体大小限制、请求日志、JSON 解析）
 * - 注册 API 路由
 * - 配置静态文件服务与页面路由映射
 * - 挂载全局错误处理中间件
 *
 * 创建时间：2026-07-08
 * 核心用途：构建并导出可测试的 Express 应用实例
 * =========================================================
 */

import express, { Application, Request, Response, NextFunction } from 'express';
import path from 'path';
import { appConfig } from './config/app';
import { corsMiddleware } from './middlewares/cors';
import { bodyLimitMiddleware } from './middlewares/bodyLimit';
import { requestLogger } from './middlewares/logger';
import { notFoundHandler, globalErrorHandler } from './middlewares/errorHandler';
import { registerRoutes } from './routes';
import { logger } from './utils/logger';

/**
 * 页面路由映射
 * @description 将友好路径映射到项目根目录下的 HTML 文件
 */
const PAGE_ROUTES: Record<string, string> = {
  '/': '/index.html',
  '/features': '/features.html',
  '/cases': '/cases.html',
  '/guide': '/guide.html',
  '/play': '/play.html'
};

/**
 * 创建并配置 Express 应用实例
 * @description 不包含监听逻辑，便于测试环境直接使用 supertest
 * @returns {Application} 配置完成的 Express 应用实例
 */
export function createApp(): Application {
  const app = express();

  // 1. 基础安全与跨域中间件
  app.use(corsMiddleware);

  // 2. 请求体大小限制中间件（在 JSON 解析之前）
  app.use(bodyLimitMiddleware);

  // 3. 请求日志中间件
  app.use(requestLogger);

  // 4. JSON 请求体解析
  app.use(
    express.json({
      limit: appConfig.bodyLimit,
      // 遇到非法 JSON 时返回统一错误
      verify: (_req, _res, buf) => {
        try {
          if (buf.length > 0) {
            JSON.parse(buf.toString());
          }
        } catch (e) {
          // 触发错误处理中间件
          throw e;
        }
      }
    })
  );

  // 5. 注册 API 路由
  registerRoutes(app);

  // 6. 页面路由映射
  Object.entries(PAGE_ROUTES).forEach(([route, file]) => {
    app.get(route, (_req: Request, res: Response, next: NextFunction) => {
      try {
        res.sendFile(path.join(appConfig.staticRoot, file), (err) => {
          if (err) {
            logger.warn(`发送页面文件失败: ${file}`, { message: err.message });
            next();
          }
        });
      } catch (err) {
        next(err);
      }
    });
  });

  // 7. 静态文件服务
  app.use(express.static(appConfig.staticRoot));

  // 8. 404 路由未找到处理
  app.use(notFoundHandler);

  // 9. 全局错误处理（必须放在最后）
  app.use(globalErrorHandler);

  return app;
}
