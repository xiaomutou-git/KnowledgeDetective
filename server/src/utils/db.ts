/**
 * =========================================================
 * 文件：src/utils/db.ts
 * =========================================================
 * 功能说明：数据库相关通用工具函数
 * - 提供数据库连接错误的统一识别逻辑
 * - 供 service 层在捕获数据库异常时判断是否需要返回 503
 *
 * 创建时间：2026-07-09
 * 核心用途：统一数据库错误识别，消除 service 层代码重复
 * =========================================================
 */

/**
 * 判断错误是否为数据库连接类错误
 * @description 根据 MySQL 错误码或 Node.js 网络错误识别连接失败场景
 * @param {unknown} err - 原始错误对象
 * @returns {boolean} 是否为连接类错误
 */
export function isDatabaseConnectionError(err: unknown): boolean {
  if (err instanceof Error) {
    const code = (err as { code?: string }).code;
    const message = err.message.toLowerCase();
    const connectionErrors = ['ECONNREFUSED', 'ECONNRESET', 'ER_ACCESS_DENIED_ERROR', 'ER_BAD_DB_ERROR'];
    if (code && connectionErrors.includes(code)) return true;
    if (message.includes('access denied') || message.includes('connection refused') || message.includes('connect')) {
      return true;
    }
  }
  return false;
}
