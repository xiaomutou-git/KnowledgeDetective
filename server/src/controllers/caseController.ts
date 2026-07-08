/**
 * =========================================================
 * 文件：src/controllers/caseController.ts
 * =========================================================
 * 功能说明：案卷控制器
 * - 处理 /api/cases 相关 HTTP 请求
 * - 负责参数校验、调用 service、构造响应
 *
 * 创建时间：2026-07-08
 * 核心用途：案卷模块的 HTTP 入口
 * =========================================================
 */

import { Request, Response, NextFunction } from 'express';
import { listCases, getCaseById } from '../services/caseService';
import { AppError } from '../middlewares/errorHandler';
import { CaseFilter } from '../models/caseModel';

/**
 * 获取案卷列表
 * @description 处理 GET /api/cases，支持 category 和 difficulty 过滤
 * @param {Request} req - Express 请求对象
 * @param {Response} res - Express 响应对象
 * @param {NextFunction} next - 下一个中间件函数
 * @returns {Promise<void>}
 * @throws {AppError} 当参数校验失败或查询失败时抛出
 */
export async function getCases(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const filter: CaseFilter = {};

    const category = req.query.category;
    if (category && typeof category === 'string') {
      filter.category = category.trim();
    }

    const difficulty = req.query.difficulty;
    if (difficulty !== undefined && difficulty !== '') {
      const parsed = parseInt(difficulty as string, 10);
      if (isNaN(parsed)) {
        throw new AppError('difficulty 必须是数字', 400, true);
      }
      filter.difficulty = parsed;
    }

    const cases = await listCases(filter);

    res.status(200).json({
      success: true,
      data: cases,
      total: cases.length
    });
  } catch (err) {
    next(err);
  }
}

/**
 * 获取案卷详情
 * @description 处理 GET /api/cases/:id
 * @param {Request} req - Express 请求对象
 * @param {Response} res - Express 响应对象
 * @param {NextFunction} next - 下一个中间件函数
 * @returns {Promise<void>}
 * @throws {AppError} 当案卷不存在或查询失败时抛出
 */
export async function getCaseByIdController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      throw new AppError('案卷 ID 必须是数字', 400, true);
    }

    const caseItem = await getCaseById(id);
    if (!caseItem) {
      throw new AppError('案卷不存在', 404, true);
    }

    res.status(200).json({
      success: true,
      data: caseItem
    });
  } catch (err) {
    next(err);
  }
}
