/**
 * =========================================================
 * 文件：src/config/database.ts
 * =========================================================
 * 功能说明：数据库连接配置中心
 * - 负责加载环境变量并导出 MySQL 连接池配置
 * - 提供统一的数据库参数入口，供连接池与迁移脚本使用
 * - 支持 development / production / test 环境切换
 *
 * 创建时间：2026-07-08
 * 核心用途：集中管理 MySQL 数据库连接参数
 * =========================================================
 */

import dotenv from 'dotenv';
import path from 'path';

// 加载项目根目录下的 .env 文件（若存在）
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

/**
 * 数据库配置对象
 * @description 从环境变量读取 MySQL 连接信息，提供默认值
 */
export const databaseConfig = {
  /**
   * 数据库主机地址
   * @type {string}
   * @default 'localhost'
   */
  host: process.env.DB_HOST || 'localhost',

  /**
   * 数据库端口
   * @type {number}
   * @default 3306
   */
  port: parseInt(process.env.DB_PORT || '3306', 10),

  /**
   * 数据库用户名
   * @type {string}
   * @default 'root'
   */
  user: process.env.DB_USER || 'root',

  /**
   * 数据库密码
   * @type {string}
   * @default ''
   */
  password: process.env.DB_PASSWORD || '',

  /**
   * 数据库名称
   * @type {string}
   * @default 'knowledge_detective'
   */
  database: process.env.DB_NAME || 'knowledge_detective',

  /**
   * 连接池最大连接数
   * @type {number}
   * @default 10
   */
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT || '10', 10),

  /**
   * 连接超时时间（毫秒）
   * @type {number}
   * @default 60000
   */
  connectTimeout: parseInt(process.env.DB_CONNECT_TIMEOUT || '60000', 10)
};

/**
 * 获取用于 mysql2 的 URI 风格配置对象
 * @description 便于创建连接池时直接展开使用
 * @returns {object} 包含 host、port、user、password、database 等字段的对象
 * @example
 * const pool = mysql.createPool(getPoolConfig());
 */
export function getPoolConfig() {
  return {
    host: databaseConfig.host,
    port: databaseConfig.port,
    user: databaseConfig.user,
    password: databaseConfig.password,
    database: databaseConfig.database,
    connectionLimit: databaseConfig.connectionLimit,
    connectTimeout: databaseConfig.connectTimeout,
    // 将 BIGINT 转为字符串，避免精度丢失
    supportBigNumbers: true,
    bigNumberStrings: true,
    // 启用查询缓存
    timezone: '+00:00'
  };
}
