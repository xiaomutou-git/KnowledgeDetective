/**
 * =========================================================
 * 文件：src/routes/caseRoutes.ts
 * =========================================================
 * 功能说明：案卷路由定义
 * - 将 /api/cases 请求映射到 caseController
 *
 * 创建时间：2026-07-08
 * 核心用途：案卷模块路由注册
 * =========================================================
 */

import { Router } from 'express';
import { getCases, getCaseByIdController } from '../controllers/caseController';

/**
 * 案卷路由实例
 * @description 定义 / 与 /:id 路径下的 GET 接口
 */
const router = Router();

/**
 * GET / - 案卷列表
 * @description 支持 ?category=&difficulty= 过滤
 */
router.get('/', getCases);

/**
 * GET /:id - 案卷详情
 * @description 根据 ID 获取单个案卷
 */
router.get('/:id', getCaseByIdController);

export default router;
