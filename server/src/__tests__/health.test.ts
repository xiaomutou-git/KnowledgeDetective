/**
 * =========================================================
 * 文件：src/__tests__/health.test.ts
 * =========================================================
 * 功能说明：健康检查接口测试
 * - 测试 GET /api/health 返回状态、服务列表
 * - 不依赖数据库配置，始终可运行
 *
 * 创建时间：2026-07-08
 * 核心用途：验证健康检查接口行为
 * =========================================================
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import http from 'http';
import { createApp } from '../app';
import { closePool } from '../db/connection';

/**
 * 测试服务器实例
 * @type {http.Server | undefined}
 */
let server: http.Server | undefined;

/**
 * 测试基础 URL
 * @type {string}
 */
let baseUrl = 'http://localhost:0';

/**
 * 发送 GET 请求
 * @description 使用 Node.js 原生 http 模块发送请求并解析 JSON 响应
 * @param {string} path - 请求路径
 * @returns {Promise<{ status: number; body: unknown }>} 状态码与响应体
 */
function getJson(path: string): Promise<{ status: number; body: unknown }> {
  return new Promise((resolve, reject) => {
    const req = http.get(`${baseUrl}${path}`, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const body = data ? JSON.parse(data) : null;
          resolve({ status: res.statusCode || 0, body });
        } catch (err) {
          reject(err instanceof Error ? err : new Error(String(err)));
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * 测试前置：启动临时 HTTP 服务
 * @description 使用 createApp 创建应用并监听随机可用端口
 */
beforeAll(async () => {
  const app = createApp();
  await new Promise<void>((resolve) => {
    server = app.listen(0, () => {
      const address = server?.address();
      if (address && typeof address === 'object') {
        baseUrl = `http://localhost:${address.port}`;
      }
      resolve();
    });
  });
});

/**
 * 测试后置：关闭临时 HTTP 服务与数据库连接池
 */
afterAll(async () => {
  if (server) {
    await new Promise<void>((resolve) => {
      server?.close(() => {
        resolve();
      });
    });
  }
  await closePool();
});

describe('GET /api/health', () => {
  /**
   * 测试健康检查返回基本字段
   */
  it('应返回状态与服务信息', async () => {
    const { status, body } = await getJson('/api/health');

    // 数据库不可用时健康检查返回 503，可用时返回 200
    expect([200, 503]).toContain(status);
    expect(body).toBeTypeOf('object');
    const response = body as Record<string, unknown>;
    expect(response.status).toMatch(/ok|degraded/);
    expect(response.services).toBeTypeOf('object');

    const services = response.services as Record<string, unknown>;
    expect(services.db).toBeTypeOf('object');
    expect(services.ai).toBeTypeOf('object');
  });

  /**
   * 测试数据库健康信息结构
   */
  it('应包含数据库健康状态', async () => {
    const { body } = await getJson('/api/health');
    const response = body as Record<string, unknown>;
    const services = response.services as Record<string, unknown>;
    const db = services.db as Record<string, unknown>;

    expect(typeof db.healthy).toBe('boolean');
    expect(typeof db.message).toBe('string');
  });

  /**
   * 测试 AI 配置信息结构
   */
  it('应包含 AI 配置状态', async () => {
    const { body } = await getJson('/api/health');
    const response = body as Record<string, unknown>;
    const services = response.services as Record<string, unknown>;
    const ai = services.ai as Record<string, unknown>;

    expect(typeof ai.configured).toBe('boolean');
    expect(typeof ai.message).toBe('string');
  });
});
