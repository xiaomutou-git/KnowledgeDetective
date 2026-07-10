/**
 * =========================================================
 * 文件：src/utils/json.ts
 * =========================================================
 * 功能说明：JSON 解析相关通用工具函数
 * - 提供数据库 JSON 字段的安全解析能力
 * - 解析失败时记录日志并返回默认值，避免请求崩溃
 *
 * 创建时间：2026-07-09
 * 核心用途：统一 JSON 安全解析，消除 service 层代码重复
 * =========================================================
 */

import { logger } from './logger';

/**
 * 安全解析 JSON 字段
 * @description 将数据库中的 JSON 字符串解析为对象，解析失败时记录日志并返回默认值
 * @template T 解析后的目标类型
 * @param {unknown} value - 数据库字段值
 * @param {string} fieldName - 字段名称，用于日志记录
 * @returns {T | null} 解析后的对象；解析失败或值非字符串时返回 null
 */
export function safeParseJson<T>(value: unknown, fieldName: string): T | null;

/**
 * 安全解析 JSON 字段（带默认值重载）
 * @description 将数据库中的 JSON 字符串解析为对象，解析失败时记录日志并返回默认值
 * @template T 解析后的目标类型
 * @param {unknown} value - 数据库字段值
 * @param {string} fieldName - 字段名称，用于日志记录
 * @param {T} defaultValue - 解析失败时的默认值
 * @returns {T} 解析后的对象或默认值
 */
export function safeParseJson<T>(value: unknown, fieldName: string, defaultValue: T): T;

/**
 * 安全解析 JSON 字段实现
 * @description 将数据库中的 JSON 字符串解析为对象，解析失败时记录日志并返回默认值
 * @template T 解析后的目标类型
 * @param {unknown} value - 数据库字段值
 * @param {string} fieldName - 字段名称，用于日志记录
 * @param {T | null} [defaultValue=null] - 解析失败时的默认值
 * @returns {T | null} 解析后的对象或默认值
 */
export function safeParseJson<T>(
  value: unknown,
  fieldName: string,
  defaultValue: T | null = null
): T | null {
  if (typeof value !== 'string') {
    return (value as T | null) ?? defaultValue;
  }
  try {
    return JSON.parse(value) as T;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.warn('数据库 JSON 字段解析失败', { fieldName, message, value: value.substring(0, 100) });
    return defaultValue;
  }
}
