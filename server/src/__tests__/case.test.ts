/**
 * =========================================================
 * 文件：src/__tests__/case.test.ts
 * =========================================================
 * 功能说明：案卷接口测试
 * - 测试 GET /api/cases 返回案卷列表
 * - 若数据库未配置则优雅跳过
 *
 * 创建时间：2026-07-08
 * 核心用途：验证案卷列表接口行为
 * =========================================================
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import http from 'http';
import { createApp } from '../app';
import { checkDatabaseHealth } from '../db/connection';
import { closePool } from '../db/connection';

/**
 * 测试服务器实例
 * @type {http.Server | undefined}
 */
let server: http.Server | undefined;

/**
 * 数据库是否可用
 * @type {boolean}
 */
let dbAvailable = false;

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
 * 测试前置：检查数据库可用性并启动临时 HTTP 服务
 */
beforeAll(async () => {
  const dbHealth = await checkDatabaseHealth();
  dbAvailable = dbHealth.healthy;

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

describe('GET /api/cases', () => {
  /**
   * 测试案卷列表接口
   * @description 数据库不可用时跳过
   */
  it('应返回案卷列表（数据库可用时）', async () => {
    if (!dbAvailable) {
      // eslint-disable-next-line no-console
      console.log('数据库未配置，跳过 /api/cases 测试');
      return;
    }

    const { status, body } = await getJson('/api/cases');

    expect(status).toBe(200);
    expect(body).toBeTypeOf('object');
    const response = body as Record<string, unknown>;
    expect(response.success).toBe(true);
    expect(Array.isArray(response.data)).toBe(true);
    expect(typeof response.total).toBe('number');
  });

  /**
   * 测试分类过滤参数
   */
  it('应支持按 category 过滤（数据库可用时）', async () => {
    if (!dbAvailable) {
      return;
    }

    const { status, body } = await getJson('/api/cases?category=物理');

    expect(status).toBe(200);
    const response = body as Record<string, unknown>;
    expect(Array.isArray(response.data)).toBe(true);
    const data = response.data as Array<Record<string, unknown>>;
    data.forEach((item) => {
      expect(item.category).toBe('物理');
    });
  });

  /**
   * 测试非法 difficulty 参数
   */
  it('非法 difficulty 应返回 400', async () => {
    if (!dbAvailable) {
      return;
    }

    const { status, body } = await getJson('/api/cases?difficulty=abc');

    expect(status).toBe(400);
    const response = body as Record<string, unknown>;
    expect(response.success).toBe(false);
  });
});
