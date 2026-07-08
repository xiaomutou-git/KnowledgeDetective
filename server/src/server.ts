/**
 * =========================================================
 * 文件：src/server.ts
 * =========================================================
 * 功能说明：服务器启动入口
 * - 创建 Express 应用并启动 HTTP 监听
 * - 处理 SIGINT/SIGTERM 优雅退出
 * - 关闭数据库连接池等资源
 *
 * 创建时间：2026-07-08
 * 核心用途：生产/开发环境服务启动入口
 * =========================================================
 */

import { createApp } from './app';
import { port, getServerUrl } from './config/app';
import { closePool } from './db/connection';
import { logStartupBanner, logger } from './utils/logger';

/**
 * 启动服务器
 * @description 创建 HTTP 服务并开始监听指定端口
 * @returns {void}
 */
function startServer(): void {
  const app = createApp();

  const server = app.listen(port, () => {
    logStartupBanner(port, getServerUrl());
  });

  /**
   * 优雅关闭服务器
   * @description 关闭 HTTP 服务与数据库连接池
   * @param {string} signal - 接收到的系统信号名称
   * @returns {Promise<void>}
   */
  async function gracefulShutdown(signal: string): Promise<void> {
    logger.info(`接收到信号 ${signal}，开始优雅关闭服务...`);

    server.close(async (err) => {
      if (err) {
        logger.error('关闭 HTTP 服务失败', { message: err.message });
      } else {
        logger.info('HTTP 服务已关闭');
      }

      try {
        await closePool();
      } catch (poolErr) {
        logger.error('关闭数据库连接池失败', {
          error: poolErr instanceof Error ? poolErr.message : String(poolErr)
        });
      }

      process.exit(err ? 1 : 0);
    });
  }

  // 监听系统终止信号
  process.on('SIGINT', () => {
    void gracefulShutdown('SIGINT');
  });

  process.on('SIGTERM', () => {
    void gracefulShutdown('SIGTERM');
  });

  // 捕获未处理的异常与拒绝的 Promise
  process.on('uncaughtException', (err) => {
    logger.error('未捕获的异常', {
      message: err.message,
      stack: err.stack
    });
    void gracefulShutdown('uncaughtException');
  });

  process.on('unhandledRejection', (reason) => {
    logger.error('未处理的 Promise 拒绝', {
      reason: reason instanceof Error ? reason.message : String(reason)
    });
  });
}

// 启动服务
startServer();
