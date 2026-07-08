/**
 * =========================================================
 * 文件：src/services/gameService.ts
 * =========================================================
 * 功能说明：游戏记录业务服务
 * - 封装游戏记录的创建、完成、查询逻辑
 * - 处理答案校验、得分计算、状态流转
 * - 依赖 caseService 获取案卷信息
 *
 * 创建时间：2026-07-08
 * 核心用途：为控制器提供游戏领域业务能力
 * =========================================================
 */

import mysql from 'mysql2/promise';
import { query } from '../db/connection';
import {
  Game,
  CreateGameInput,
  CompleteGameInput,
  CompleteGameResult,
  AnswerRecord
} from '../models/gameModel';
import { getCaseById } from './caseService';
import { AppError } from '../middlewares/errorHandler';
import { logger } from '../utils/logger';

/**
 * 将数据库行转换为 Game 对象
 * @description 处理下划线命名与驼峰命名的映射，以及 JSON 字段解析
 * @param {mysql.RowDataPacket} row - 数据库原始行
 * @returns {Game} 标准化后的 Game 对象
 */
function rowToGame(row: mysql.RowDataPacket): Game {
  return {
    id: row.id,
    caseId: row.case_id,
    userId: row.user_id,
    status: row.status,
    score: row.score,
    answers: typeof row.answers === 'string' ? JSON.parse(row.answers) : row.answers,
    completedAt: row.completed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

/**
 * 创建新游戏记录
 * @description 为指定案卷和用户创建一局游戏，初始状态为 playing
 * @param {CreateGameInput} input - 创建游戏输入
 * @returns {Promise<Game>} 创建后的游戏记录
 * @throws {AppError} 当案卷不存在或创建失败时抛出
 */
export async function createGame(input: CreateGameInput): Promise<Game> {
  try {
    const caseItem = await getCaseById(input.caseId);
    if (!caseItem) {
      throw new AppError('案卷不存在，无法开始游戏', 404, true);
    }

    const sql = `
      INSERT INTO games (case_id, user_id, status, score, answers)
      VALUES (?, ?, 'playing', 0, ?)
    `;
    const values = [input.caseId, input.userId || '', JSON.stringify([])];
    const result = (await query(sql, values)) as mysql.ResultSetHeader;

    const game = await getGameById(result.insertId);
    if (!game) {
      throw new AppError('创建游戏记录后查询失败', 500, true);
    }
    return game;
  } catch (err) {
    if (err instanceof AppError) throw err;
    const error = err instanceof Error ? err : new Error(String(err));
    logger.error('创建游戏记录失败', { message: error.message });
    throw new AppError('创建游戏记录失败', 500, true);
  }
}

/**
 * 根据 ID 获取游戏记录
 * @description 查询单个游戏记录详情
 * @param {number} id - 游戏记录 ID
 * @returns {Promise<Game | null>} 游戏记录，不存在时返回 null
 * @throws {AppError} 当 ID 非法或查询失败时抛出
 */
export async function getGameById(id: number): Promise<Game | null> {
  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError('游戏 ID 必须是正整数', 400, true);
  }

  try {
    const rows = (await query('SELECT * FROM games WHERE id = ?', [id])) as mysql.RowDataPacket[];
    if (rows.length === 0) {
      return null;
    }
    return rowToGame(rows[0]);
  } catch (err) {
    if (err instanceof AppError) throw err;
    const error = err instanceof Error ? err : new Error(String(err));
    logger.error('查询游戏记录失败', { id, message: error.message });
    throw new AppError('查询游戏记录失败', 500, true);
  }
}

/**
 * 完成游戏
 * @description 校验用户答案，更新游戏状态、得分、答案记录
 * @param {number} gameId - 游戏记录 ID
 * @param {CompleteGameInput} input - 完成游戏输入
 * @returns {Promise<CompleteGameResult>} 完成结果，包含是否正确与解析
 * @throws {AppError} 当游戏不存在、状态异常、答案非法或查询失败时抛出
 */
export async function completeGame(
  gameId: number,
  input: CompleteGameInput
): Promise<CompleteGameResult> {
  if (!Number.isInteger(gameId) || gameId <= 0) {
    throw new AppError('游戏 ID 必须是正整数', 400, true);
  }

  try {
    const game = await getGameById(gameId);
    if (!game) {
      throw new AppError('游戏记录不存在', 404, true);
    }

    if (game.status === 'completed') {
      throw new AppError('该游戏已经完成，不能重复提交', 400, true);
    }

    if (game.status === 'abandoned') {
      throw new AppError('该游戏已放弃，无法提交答案', 400, true);
    }

    const caseItem = await getCaseById(game.caseId);
    if (!caseItem) {
      throw new AppError('关联案卷不存在', 404, true);
    }

    const correctOption = caseItem.options.find((opt) => opt.correct === true);
    if (!correctOption) {
      throw new AppError('案卷未设置正确答案', 500, true);
    }

    const selectedLabel = (input.selectedLabel || '').trim().toUpperCase();
    if (!selectedLabel) {
      throw new AppError('请提交答案选项', 400, true);
    }

    const isCorrect = selectedLabel === correctOption.label;
    const score = isCorrect ? 100 : 0;

    const answerRecord: AnswerRecord = {
      questionId: 'q1',
      selectedLabel,
      isCorrect,
      answeredAt: new Date().toISOString()
    };

    const updatedAnswers = [...game.answers, answerRecord];

    const sql = `
      UPDATE games
      SET status = 'completed',
          score = ?,
          answers = ?,
          completed_at = NOW()
      WHERE id = ?
    `;
    await query(sql, [score, JSON.stringify(updatedAnswers), gameId]);

    return {
      correct: isCorrect,
      correctLabel: correctOption.label,
      score,
      analysis: caseItem.analysis,
      card: caseItem.card
    };
  } catch (err) {
    if (err instanceof AppError) throw err;
    const error = err instanceof Error ? err : new Error(String(err));
    logger.error('完成游戏失败', { gameId, message: error.message });
    throw new AppError('完成游戏失败', 500, true);
  }
}

/**
 * 获取游戏历史列表
 * @description 按创建时间倒序返回所有游戏记录
 * @returns {Promise<Game[]>} 游戏记录列表
 * @throws {AppError} 当查询失败时抛出
 */
export async function listGames(): Promise<Game[]> {
  try {
    const rows = (await query('SELECT * FROM games ORDER BY created_at DESC')) as mysql.RowDataPacket[];
    return rows.map(rowToGame);
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    logger.error('查询游戏历史失败', { message: error.message });
    throw new AppError('查询游戏历史失败', 500, true);
  }
}
