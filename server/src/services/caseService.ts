/**
 * =========================================================
 * 文件：src/services/caseService.ts
 * =========================================================
 * 功能说明：案卷业务服务
 * - 封装案卷的 CRUD 业务逻辑
 * - 处理数据库 JSON 字段的序列化与反序列化
 * - 支持按分类、难度过滤查询
 *
 * 创建时间：2026-07-08
 * 核心用途：为控制器提供案卷领域业务能力
 * =========================================================
 */

import mysql from 'mysql2/promise';
import { query } from '../db/connection';
import { Case, CreateCaseInput, CaseFilter } from '../models/caseModel';
import { AppError } from '../middlewares/errorHandler';
import { logger } from '../utils/logger';

/**
 * 将数据库行转换为 Case 对象
 * @description 处理下划线命名与驼峰命名的映射，以及 JSON 字段解析
 * @param {mysql.RowDataPacket} row - 数据库原始行
 * @returns {Case} 标准化后的 Case 对象
 */
function rowToCase(row: mysql.RowDataPacket): Case {
  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle,
    category: row.category,
    difficulty: row.difficulty,
    scene: row.scene,
    clues: typeof row.clues === 'string' ? JSON.parse(row.clues) : row.clues,
    question: row.question,
    options: typeof row.options === 'string' ? JSON.parse(row.options) : row.options,
    analysis: typeof row.analysis === 'string' ? JSON.parse(row.analysis) : row.analysis,
    card: typeof row.card === 'string' ? JSON.parse(row.card) : row.card,
    isSeed: row.is_seed === 1 || row.is_seed === true,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

/**
 * 获取案卷列表
 * @description 支持按 category 和 difficulty 过滤，按创建时间倒序
 * @param {CaseFilter} [filter={}] - 过滤条件
 * @returns {Promise<Case[]>} 案卷列表
 * @throws {AppError} 当查询参数非法时抛出
 */
export async function listCases(filter: CaseFilter = {}): Promise<Case[]> {
  const conditions: string[] = [];
  const values: (string | number)[] = [];

  if (filter.category) {
    conditions.push('category = ?');
    values.push(filter.category);
  }

  if (typeof filter.difficulty === 'number') {
    if (filter.difficulty < 1 || filter.difficulty > 5) {
      throw new AppError('难度参数必须在 1-5 之间', 400, true);
    }
    conditions.push('difficulty = ?');
    values.push(filter.difficulty);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const sql = `SELECT * FROM cases ${whereClause} ORDER BY created_at DESC`;

  try {
    const rows = (await query(sql, values)) as mysql.RowDataPacket[];
    return rows.map(rowToCase);
  } catch (err) {
    if (err instanceof AppError) throw err;
    const error = err instanceof Error ? err : new Error(String(err));
    logger.error('查询案卷列表失败', { message: error.message });
    throw new AppError('查询案卷列表失败', 500, true);
  }
}

/**
 * 根据 ID 获取案卷详情
 * @description 查询单个案卷，若不存在返回 404
 * @param {number} id - 案卷 ID
 * @returns {Promise<Case | null>} 案卷详情，不存在时返回 null
 * @throws {AppError} 当 ID 非法或查询失败时抛出
 */
export async function getCaseById(id: number): Promise<Case | null> {
  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError('案卷 ID 必须是正整数', 400, true);
  }

  try {
    const rows = (await query('SELECT * FROM cases WHERE id = ?', [id])) as mysql.RowDataPacket[];
    if (rows.length === 0) {
      return null;
    }
    return rowToCase(rows[0]);
  } catch (err) {
    if (err instanceof AppError) throw err;
    const error = err instanceof Error ? err : new Error(String(err));
    logger.error('查询案卷详情失败', { id, message: error.message });
    throw new AppError('查询案卷详情失败', 500, true);
  }
}

/**
 * 创建案卷
 * @description 将输入 DTO 写入数据库，JSON 字段自动序列化
 * @param {CreateCaseInput} input - 案卷输入数据
 * @returns {Promise<Case>} 创建后的案卷对象
 * @throws {AppError} 当输入数据非法或写入失败时抛出
 */
export async function createCase(input: CreateCaseInput): Promise<Case> {
  try {
    const sql = `
      INSERT INTO cases
        (title, subtitle, category, difficulty, scene, clues, question, options, analysis, card, is_seed)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      input.title,
      input.subtitle,
      input.category || '',
      input.difficulty || 1,
      input.scene,
      JSON.stringify(input.clues),
      input.question,
      JSON.stringify(input.options),
      JSON.stringify(input.analysis),
      JSON.stringify(input.card),
      input.isSeed ? 1 : 0
    ];

    const result = (await query(sql, values)) as mysql.ResultSetHeader;
    const created = await getCaseById(result.insertId);
    if (!created) {
      throw new AppError('创建案卷后查询失败', 500, true);
    }
    return created;
  } catch (err) {
    if (err instanceof AppError) throw err;
    const error = err instanceof Error ? err : new Error(String(err));
    logger.error('创建案卷失败', { message: error.message });
    throw new AppError('创建案卷失败', 500, true);
  }
}

/**
 * 删除案卷
 * @description 根据 ID 删除案卷，关联的游戏记录会通过外键级联删除
 * @param {number} id - 案卷 ID
 * @returns {Promise<boolean>} 是否成功删除
 * @throws {AppError} 当 ID 非法或删除失败时抛出
 */
export async function deleteCase(id: number): Promise<boolean> {
  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError('案卷 ID 必须是正整数', 400, true);
  }

  try {
    const result = (await query('DELETE FROM cases WHERE id = ?', [id])) as mysql.ResultSetHeader;
    return result.affectedRows > 0;
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    logger.error('删除案卷失败', { id, message: error.message });
    throw new AppError('删除案卷失败', 500, true);
  }
}
