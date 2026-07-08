/**
 * =========================================================
 * 文件：src/routes/gameRoutes.ts
 * =========================================================
 * 功能说明：游戏路由定义
 * - 将 /api/games 请求映射到 gameController
 *
 * 创建时间：2026-07-08
 * 核心用途：游戏模块路由注册
 * =========================================================
 */

import { Router } from 'express';
import {
  generateCaseController,
  createGameController,
  completeGameController,
  getGames
} from '../controllers/gameController';

/**
 * 游戏路由实例
 * @description 定义游戏相关接口
 */
const router: Router = Router();

/**
 * GET / - 游戏历史列表
 * @description 获取所有游戏记录
 */
router.get('/', getGames);

/**
 * POST /generate - AI 生成自定义案卷
 * @description 接收 articleText，生成并保存案卷
 */
router.post('/generate', generateCaseController);

/**
 * POST / - 开始一局游戏
 * @description 创建新的游戏记录
 */
router.post('/', createGameController);

/**
 * POST /:id/complete - 完成游戏
 * @description 提交答案，返回校验结果与解析
 */
router.post('/:id/complete', completeGameController);

export default router;
