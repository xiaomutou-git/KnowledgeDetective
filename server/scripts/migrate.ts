/**
 * =========================================================
 * 文件：scripts/migrate.ts
 * =========================================================
 * 功能说明：数据库迁移脚本
 * - 自动执行 src/db/migrations/ 目录下的所有 .sql 文件
 * - 按文件名排序，确保迁移顺序一致
 * - 支持失败时安全退出并打印错误信息
 *
 * 创建时间：2026-07-08
 * 核心用途：npm run migrate 命令入口
 * =========================================================
 */

import fs from 'fs/promises';
import path from 'path';
import { getPool, closePool } from '../src/db/connection';
import { logger } from '../src/utils/logger';

/**
 * 迁移文件所在目录
 * @type {string}
 */
const MIGRATIONS_DIR = path.resolve(__dirname, '../src/db/migrations');

/**
 * 读取并按文件名排序迁移文件
 * @description 仅读取 .sql 后缀文件，按字典序排序
 * @returns {Promise<{ name: string; sql: string }[]>} 迁移文件列表
 * @throws {Error} 当读取目录失败时抛出
 */
async function loadMigrations(): Promise<{ name: string; sql: string }[]> {
  try {
    const entries = await fs.readdir(MIGRATIONS_DIR);
    const sqlFiles = entries
      .filter((file) => file.endsWith('.sql'))
      .sort((a, b) => a.localeCompare(b));

    const migrations: { name: string; sql: string }[] = [];
    for (const file of sqlFiles) {
      const filePath = path.join(MIGRATIONS_DIR, file);
      const sql = await fs.readFile(filePath, 'utf-8');
      migrations.push({ name: file, sql });
    }

    return migrations;
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    logger.error('读取迁移文件失败', { message: error.message });
    throw error;
  }
}

/**
 * 执行单条迁移 SQL
 * @description 使用连接池执行迁移 SQL，忽略重复创建错误
 * @param {mysql.Pool} pool - 数据库连接池
 * @param {string} name - 迁移文件名
 * @param {string} sql - 迁移 SQL 内容
 * @returns {Promise<void>}
 * @throws {Error} 当迁移执行失败且非重复创建错误时抛出
 */
async function runMigration(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pool: any,
  name: string,
  sql: string
): Promise<void> {
  try {
    await pool.execute(sql);
    logger.info(`迁移成功: ${name}`);
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    // 忽略表已存在的错误，避免重复执行失败
    if (error.message && error.message.includes('ER_TABLE_EXISTS_ERROR')) {
      logger.warn(`迁移跳过: ${name}（表已存在）`);
      return;
    }
    logger.error(`迁移失败: ${name}`, { message: error.message });
    throw error;
  }
}

/**
 * 主函数：运行所有迁移
 * @description 加载并依次执行迁移文件
 * @returns {Promise<void>}
 */
async function main(): Promise<void> {
  logger.info('开始执行数据库迁移...');

  try {
    const migrations = await loadMigrations();
    if (migrations.length === 0) {
      logger.warn('未找到迁移文件');
      return;
    }

    const pool = getPool();
    for (const { name, sql } of migrations) {
      await runMigration(pool, name, sql);
    }

    logger.info('所有迁移执行完成');
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    logger.error('数据库迁移过程中发生错误', { message: error.message });
    process.exitCode = 1;
  } finally {
    await closePool();
  }
}

// 执行迁移脚本
main();
