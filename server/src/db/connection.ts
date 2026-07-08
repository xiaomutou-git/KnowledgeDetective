/**
 * =========================================================
 * 文件：src/db/connection.ts
 * =========================================================
 * 功能说明：MySQL 数据库连接池
 * - 基于 mysql2/promise 创建连接池
 * - 提供 query 辅助方法，自动解析 JSON 字段
 * - 提供健康检查能力，供 /api/health 使用
 *
 * 创建时间：2026-07-08
 * 核心用途：统一管理数据库连接生命周期
 * =========================================================
 */

import mysql from 'mysql2/promise';
import { getPoolConfig } from '../config/database';
import { logger } from '../utils/logger';

/**
 * MySQL 连接池实例
 * @description 应用全局唯一连接池，避免重复创建
 */
let pool: mysql.Pool | null = null;

/**
 * 初始化数据库连接池
 * @description 首次调用时创建连接池，后续调用返回同一实例
 * @returns {mysql.Pool} 连接池实例
 * @throws {Error} 当连接池创建失败时抛出
 */
export function getPool(): mysql.Pool {
  if (!pool) {
    try {
      pool = mysql.createPool(getPoolConfig());
      logger.info('MySQL 连接池已创建', {
        host: getPoolConfig().host,
        database: getPoolConfig().database
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      logger.error('创建 MySQL 连接池失败', { message: error.message });
      throw error;
    }
  }
  return pool;
}

/**
 * 执行 SQL 查询
 * @description 使用连接池执行查询，自动释放连接
 * @param {string} sql - SQL 语句
 * @param {unknown[]} [values] - 查询参数
 * @returns {Promise<mysql.RowDataPacket[] | mysql.ResultSetHeader>} 查询结果
 * @throws {Error} 当查询执行失败时抛出
 */
export async function query(
  sql: string,
  values?: unknown[]
): Promise<mysql.RowDataPacket[] | mysql.ResultSetHeader> {
  const connectionPool = getPool();
  try {
    // mysql2 的 execute 要求 values 类型为 ExecuteValues，此处将 unknown[] 安全转换
    const [rows] = await connectionPool.execute(sql, values as mysql.ExecuteValues);
    return rows as mysql.RowDataPacket[] | mysql.ResultSetHeader;
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    logger.error('数据库查询失败', { sql, message: error.message });
    throw error;
  }
}

/**
 * 检查数据库连接健康状态
 * @description 执行 SELECT 1 验证数据库是否可达
 * @returns {Promise<{ healthy: boolean; message: string }>} 健康检查结果
 */
export async function checkDatabaseHealth(): Promise<{ healthy: boolean; message: string }> {
  try {
    const connectionPool = getPool();
    const [rows] = await connectionPool.execute('SELECT 1 AS ok');
    const result = rows as mysql.RowDataPacket[];
    if (result && result.length > 0 && result[0].ok === 1) {
      return { healthy: true, message: '数据库连接正常' };
    }
    return { healthy: false, message: '数据库健康检查返回异常' };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { healthy: false, message: `数据库连接失败: ${message}` };
  }
}

/**
 * 关闭数据库连接池
 * @description 用于优雅停机与测试结束后的资源释放
 * @returns {Promise<void>}
 */
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    logger.info('MySQL 连接池已关闭');
  }
}
