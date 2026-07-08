/**
 * =========================================================
 * 文件：src/config/app.ts
 * =========================================================
 * 功能说明：Express 应用运行配置中心
 * - 负责加载环境变量并导出服务端口、运行环境、静态资源等配置
 * - 支持开发、测试、生产环境差异化配置
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
export const port = parseInt(process.env.PORT || '4315', 10);

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
  bodyLimit: parseInt(process.env.BODY_LIMIT || '10485760', 10),

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
  apiPrefix: process.env.API_PREFIX || '/api'
};

/**
 * 获取服务完整监听地址
 * @description 用于日志输出与外部展示
 * @returns {string} 例如 http://localhost:4315
 */
export function getServerUrl(): string {
  return `http://localhost:${appConfig.port}`;
}
