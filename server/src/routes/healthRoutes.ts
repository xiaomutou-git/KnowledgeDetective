/**
 * =========================================================
 * 文件：src/routes/healthRoutes.ts
 * =========================================================
 * 功能说明：健康检查路由定义
 * - 将 /api/health 请求映射到 healthController
 *
 * 创建时间：2026-07-08
 * 核心用途：健康检查模块路由注册
 * =========================================================
 */

import { Router } from 'express';
import { healthCheck } from '../controllers/healthController';

/**
 * 健康检查路由实例
 * @description 定义 / 路径下的 GET 健康检查接口
 */
const router: Router = Router();

/**
 * GET / - 健康检查
 * @description 返回服务及依赖组件健康状态
 */
router.get('/', healthCheck);

export default router;
