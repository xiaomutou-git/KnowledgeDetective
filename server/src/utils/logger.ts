/**
 * =========================================================
 * 文件：src/utils/logger.ts
 * =========================================================
 * 功能说明：应用日志工具
 * - 基于 winston 封装，提供统一的日志输出格式
 * - 支持控制台与文件两种传输方式
 * - 生产环境输出到文件，开发/测试环境输出到控制台
 *
 * 创建时间：2026-07-08
 * 核心用途：为应用提供结构化、可追踪的日志能力
 * =========================================================
 */

import winston from 'winston';
import { appConfig } from '../config/app';

/**
 * winston 日志级别映射
 * @description error > warn > info > http > verbose > debug > silly
 */
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4
};

/**
 * 根据运行环境决定日志级别
 * @description 开发环境输出 debug，测试环境输出 info，生产环境输出 info
 * @returns {string} 日志级别字符串
 */
function getLevel(): string {
  if (appConfig.isDevelopment) return 'debug';
  if (appConfig.isTest) return 'info';
  return 'info';
}

/**
 * 日志颜色配置
 * @description 为不同级别分配终端颜色
 */
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white'
};

// 注册颜色
winston.addColors(colors);

/**
 * 控制台日志格式
 * @description 包含时间戳、级别、消息及元数据
 */
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  winston.format.colorize({ all: true }),
  winston.format.printf((info) => {
    const { timestamp, level, message, ...meta } = info;
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] ${level}: ${message}${metaStr}`;
  })
);

/**
 * 文件日志格式
 * @description JSON 结构化输出，便于后续日志分析
 */
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  winston.format.json()
);

/**
 * 传输目标数组
 * @description 默认均输出到控制台，生产环境追加文件
 */
const transports: winston.transport[] = [new winston.transports.Console({ format: consoleFormat })];

if (appConfig.isProduction) {
  transports.push(
    new winston.transports.File({ filename: 'logs/error.log', level: 'error', format: fileFormat }),
    new winston.transports.File({ filename: 'logs/combined.log', format: fileFormat })
  );
}

/**
 * 全局日志实例
 * @description 应用内统一使用该实例输出日志
 */
export const logger = winston.createLogger({
  level: getLevel(),
  levels,
  defaultMeta: { service: 'knowledge-detective-server' },
  transports
});

/**
 * 输出服务启动横幅
 * @description 在服务器启动时打印关键信息
 * @param {number} port - 服务监听端口
 * @param {string} url - 服务访问地址
 * @returns {void}
 */
export function logStartupBanner(port: number, url: string): void {
  logger.info('='.repeat(60));
  logger.info('  知识侦探 - TypeScript 后端服务');
  logger.info('='.repeat(60));
  logger.info(`  服务地址：${url}`);
  logger.info(`  API 前缀：${appConfig.apiPrefix}`);
  logger.info(`  运行环境：${appConfig.env}`);
  logger.info('='.repeat(60));
}
