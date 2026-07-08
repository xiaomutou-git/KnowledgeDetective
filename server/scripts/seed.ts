/**
 * =========================================================
 * 功能说明：数据库种子脚本
 * - 自动执行 src/db/seeds/ 目录下的所有 .sql 文件
 * - 种子数据用于本地开发和演示
 * - 执行失败时安全退出并打印错误信息
 *
 * 创建时间：2026-07-08
 * 核心用途：npm run seed 命令入口
 * =========================================================
 */

import fs from 'fs/promises';
import path from 'path';
import { getPool, closePool } from '../src/db/connection';
import { logger } from '../src/utils/logger';

/**
 * 种子文件所在目录
 * @type {string}
 */
const SEEDS_DIR = path.resolve(__dirname, '../src/db/seeds');

/**
 * 读取并按文件名排序种子文件
 * @description 仅读取 .sql 后缀文件，按字典序排序
 * @returns {Promise<{ name: string; sql: string }[]>} 种子文件列表
 * @throws {Error} 当读取目录失败时抛出
 */
async function loadSeeds(): Promise<{ name: string; sql: string }[]> {
  try {
    const entries = await fs.readdir(SEEDS_DIR);
    const sqlFiles = entries
      .filter((file) => file.endsWith('.sql'))
      .sort((a, b) => a.localeCompare(b));

    const seeds: { name: string; sql: string }[] = [];
    for (const file of sqlFiles) {
      const filePath = path.join(SEEDS_DIR, file);
      const sql = await fs.readFile(filePath, 'utf-8');
      seeds.push({ name: file, sql });
    }

    return seeds;
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    logger.error('读取种子文件失败', { message: error.message });
    throw error;
  }
}

/**
 * 执行单条种子 SQL
 * @description 使用连接池执行种子 SQL，忽略重复数据错误
 * @param {mysql.Pool} pool - 数据库连接池
 * @param {string} name - 种子文件名
 * @param {string} sql - 种子 SQL 内容
 * @returns {Promise<void>}
 * @throws {Error} 当种子执行失败且非重复错误时抛出
 */
async function runSeed(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pool: any,
  name: string,
  sql: string
): Promise<void> {
  try {
    await pool.execute(sql);
    logger.info(`种子成功: ${name}`);
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    // 忽略重复数据错误
    if (error.message && error.message.includes('ER_DUP_ENTRY')) {
      logger.warn(`种子跳过: ${name}（数据已存在）`);
      return;
    }
    logger.error(`种子失败: ${name}`, { message: error.message });
    throw error;
  }
}

/**
 * 主函数：运行所有种子
 * @description 加载并依次执行种子文件
 * @returns {Promise<void>}
 */
async function main(): Promise<void> {
  logger.info('开始执行数据库种子...');

  try {
    const seeds = await loadSeeds();
    if (seeds.length === 0) {
      logger.warn('未找到种子文件');
      return;
    }

    const pool = getPool();
    for (const { name, sql } of seeds) {
      await runSeed(pool, name, sql);
    }

    logger.info('所有种子执行完成');
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    logger.error('数据库种子过程中发生错误', { message: error.message });
    process.exitCode = 1;
  } finally {
    await closePool();
  }
}

// 执行种子脚本
main();
