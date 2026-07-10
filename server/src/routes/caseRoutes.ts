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
import { getCases, getCaseByIdController, deleteCaseController } from '../controllers/caseController';
import { adminAuthMiddleware } from '../middlewares/adminAuth';

/**
 * 案卷路由实例
 * @description 定义 / 与 /:id 路径下的 GET、DELETE 接口
 */
const router: Router = Router();

/**
 * GET / - 案卷列表
 * @description 支持 ?category=&difficulty= 过滤
 */
router.get('/', getCases);

/**
 * GET /:id - 案卷详情
 * @description 根据 ID 获取单个案卷
 */
router.get('/:id', getCaseByIdController)

/**
 * DELETE /:id - 删除案卷
 * @description 根据 ID 删除案卷，关联游戏记录由外键级联删除
 *              该操作受管理员 API Key 保护，防止未授权删除
 */
router.delete('/:id', adminAuthMiddleware, deleteCaseController);

export default router;
