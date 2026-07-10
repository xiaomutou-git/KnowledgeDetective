/**
 * =========================================================
 * 文件：src/controllers/gameController.ts
 * =========================================================
 * 功能说明：游戏控制器
 * - 处理 /api/games 相关 HTTP 请求
 * - 负责参数校验、调用 service、构造响应
 *
 * 创建时间：2026-07-08
 * 核心用途：游戏模块的 HTTP 入口
 * =========================================================
 */

import { Request, Response, NextFunction } from 'express';
import { createGame, completeGame, listGames } from '../services/gameService';
import { generateCase } from '../services/aiService';
import { createCase } from '../services/caseService';
import { AppError } from '../middlewares/errorHandler';

/**
 * 生成自定义案卷
 * @description 处理 POST /api/games/generate，调用 AI 生成案卷并持久化
 * @param {Request} req - Express 请求对象
 * @param {Response} res - Express 响应对象
 * @param {NextFunction} next - 下一个中间件函数
 * @returns {Promise<void>}
 * @throws {AppError} 当输入非法或 AI 调用失败时抛出
 */
export async function generateCaseController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { articleText } = req.body;
    if (!articleText || typeof articleText !== 'string') {
      throw new AppError('请提供 articleText 文本', 400, true);
    }

    const generatedInput = await generateCase(articleText);
    const savedCase = await createCase(generatedInput);

    res.status(201).json({
      success: true,
      data: savedCase
    });
  } catch (err) {
    next(err);
  }
}

/**
 * 开始一局游戏
 * @description 处理 POST /api/games
 * @param {Request} req - Express 请求对象
 * @param {Response} res - Express 响应对象
 * @param {NextFunction} next - 下一个中间件函数
 * @returns {Promise<void>}
 * @throws {AppError} 当输入非法或创建失败时抛出
 */
export async function createGameController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { caseId, userId } = req.body;

    if (caseId === undefined || caseId === null) {
      throw new AppError('请提供 caseId', 400, true);
    }

    const parsedCaseId = parseInt(caseId, 10);
    if (isNaN(parsedCaseId)) {
      throw new AppError('caseId 必须是数字', 400, true);
    }

    const game = await createGame({
      caseId: parsedCaseId,
      userId: typeof userId === 'string' ? userId.trim() : 'anonymous'
    });

    res.status(201).json({
      success: true,
      data: game
    });
  } catch (err) {
    next(err);
  }
}

/**
 * 完成游戏并提交答案
 * @description 处理 POST /api/games/:id/complete
 * @param {Request} req - Express 请求对象
 * @param {Response} res - Express 响应对象
 * @param {NextFunction} next - 下一个中间件函数
 * @returns {Promise<void>}
 * @throws {AppError} 当输入非法或完成失败时抛出
 */
export async function completeGameController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const gameId = parseInt(req.params.id, 10);
    if (isNaN(gameId)) {
      throw new AppError('游戏 ID 必须是数字', 400, true);
    }

    const { selectedLabel, userId } = req.body;
    if (!selectedLabel || typeof selectedLabel !== 'string') {
      throw new AppError('请提供 selectedLabel 答案选项', 400, true);
    }

    const result = await completeGame(gameId, {
      selectedLabel,
      userId: typeof userId === 'string' ? userId.trim() : ''
    });

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (err) {
    next(err);
  }
}

/**
 * 获取游戏历史列表
 * @description 处理 GET /api/games?userId=xxx，仅返回该用户的游戏记录
 * @param {Request} req - Express 请求对象
 * @param {Response} res - Express 响应对象
 * @param {NextFunction} next - 下一个中间件函数
 * @returns {Promise<void>}
 * @throws {AppError} 当缺少 userId 或查询失败时抛出
 */
export async function getGames(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.query.userId;
    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      throw new AppError('请提供 userId 查询参数', 400, true);
    }

    const games = await listGames(userId.trim());

    res.status(200).json({
      success: true,
      data: games,
      total: games.length
    });
  } catch (err) {
    next(err);
  }
}
