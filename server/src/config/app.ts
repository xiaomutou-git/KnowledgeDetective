/**
 * =========================================================
 * 文件：src/config/app.ts
 * =========================================================
 * 功能说明：Express 应用运行配置中心
 * - 负责加载环境变量并导出服务端口、运行环境、静态资源等配置
 * - 支持开发、测试、生产环境差异化配置
 * - 对数值型环境变量进行合法性校验，避免非法值导致服务异常
 *
 * 创建时间：2026-07-08
 * 核心用途：集中管理 Express 服务器运行参数
 * =========================================================
 */

import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// 加载项目根目录下的 .env 文件（若存在）
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

/**
 * 解析静态资源根目录
 * @description 优先使用环境变量 STATIC_ROOT；未配置时尝试指向 ../web/dist。
 *              若该目录不存在（本地开发未构建前端），则回退到 server 目录下的占位路径，
 *              避免静态文件中间件因目录不存在而抛出异常。
 * @returns {string} 静态资源根目录绝对路径
 */
function resolveStaticRoot(): string {
  if (process.env.STATIC_ROOT) {
    return path.resolve(process.env.STATIC_ROOT);
  }

  const projectRoot = path.resolve(process.cwd(), '..');
  const defaultDist = path.join(projectRoot, 'web', 'dist');
  if (fs.existsSync(defaultDist)) {
    return defaultDist;
  }

  // 回退路径：指向 server/public（若不存在，express.static 会忽略不存在的目录）
  return path.resolve(process.cwd(), 'public');
}

/**
 * 解析整数型环境变量
 * @description 读取环境变量并解析为整数，校验其有效性，非法时抛出明确错误。
 * @param {string | undefined} value - 环境变量值
 * @param {number} defaultValue - 默认值
 * @param {string} name - 环境变量名称，用于错误提示
 * @param {object} options - 校验选项
 * @param {number} [options.min] - 允许的最小值
 * @param {number} [options.max] - 允许的最大值
 * @returns {number} 解析后的有效整数
 * @throws {Error} 当值为 NaN、非整数或超出范围时抛出
 */
function parseIntegerEnv(
  value: string | undefined,
  defaultValue: number,
  name: string,
  options: { min?: number; max?: number } = {}
): number {
  const raw = value === undefined || value.trim() === '' ? String(defaultValue) : value.trim();
  const parsed = parseInt(raw, 10);

  if (Number.isNaN(parsed)) {
    throw new Error(`环境变量 ${name}="${value}" 不是有效整数，请检查 .env 配置`);
  }

  if (!Number.isInteger(parsed)) {
    throw new Error(`环境变量 ${name}="${value}" 必须是一个整数`);
  }

  if (options.min !== undefined && parsed < options.min) {
    throw new Error(`环境变量 ${name}=${parsed} 不能小于 ${options.min}`);
  }

  if (options.max !== undefined && parsed > options.max) {
    throw new Error(`环境变量 ${name}=${parsed} 不能大于 ${options.max}`);
  }

  return parsed;
}

/**
 * 当前运行环境
 * @type {string}
 * @default 'development'
 */
export const nodeEnv = process.env.NODE_ENV || 'development';

/**
 * 服务监听端口
 * @type {number}
 * @default 4315
 */
export const port = parseIntegerEnv(process.env.PORT, 4315, 'PORT', { min: 1, max: 65535 });

/**
 * 应用配置对象
 * @description 汇总 Express 应用所需的运行期参数
 */
export const appConfig = {
  /**
   * 运行环境
   * @type {string}
   */
  env: nodeEnv,

  /**
   * 监听端口
   * @type {number}
   */
  port,

  /**
   * 是否为开发环境
   * @type {boolean}
   */
  isDevelopment: nodeEnv === 'development',

  /**
   * 是否为测试环境
   * @type {boolean}
   */
  isTest: nodeEnv === 'test',

  /**
   * 是否为生产环境
   * @type {boolean}
   */
  isProduction: nodeEnv === 'production',

  /**
   * 请求体大小限制（字节）
   * @type {number}
   * @default 10485760 (10MB)
   */
  bodyLimit: parseIntegerEnv(process.env.BODY_LIMIT, 10 * 1024 * 1024, 'BODY_LIMIT', { min: 1024 }),

  /**
   * 静态文件根目录
   * @type {string}
   * @description 指向前端构建产物目录 web/dist，生产环境由此提供 SPA 静态资源
   */
  staticRoot: resolveStaticRoot(),

  /**
   * API 基础路径前缀
   * @type {string}
   * @default '/api'
   */
  apiPrefix: process.env.API_PREFIX || '/api',

  /**
   * 管理员 API Key
   * @type {string | undefined}
   * @description 用于保护删除案卷等管理接口；未配置时管理操作不可用
   */
  adminApiKey: process.env.ADMIN_API_KEY
};

/**
 * 获取服务完整监听地址
 * @description 用于日志输出与外部展示
 * @returns {string} 例如 http://localhost:4315
 */
export function getServerUrl(): string {
  return `http://localhost:${appConfig.port}`;
}
