/**
 * =========================================================
 * 文件：src/config/ai.ts
 * =========================================================
 * 功能说明：AI API 配置中心
 * - 负责加载环境变量并导出 AI 服务配置
 * - 兼容原 proxy-server.js 的默认 endpoint 与 model
 * - API Key 必须显式配置，未配置时相关服务将抛出异常
 *
 * 创建时间：2026-07-08
 * 核心用途：集中管理 SiliconFlow / OpenAI 兼容 API 参数
 * =========================================================
 */

import dotenv from 'dotenv';
import path from 'path';

// 加载项目根目录下的 .env 文件（若存在）
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

/**
 * AI 服务配置对象
 * @description 从环境变量读取 AI Endpoint、API Key、Model 等参数
 */
export const aiConfig = {
  /**
   * AI API 端点地址
   * @type {string}
   * @default 'https://api.siliconflow.cn/v1/chat/completions'
   */
  endpoint: process.env.AI_ENDPOINT || 'https://api.siliconflow.cn/v1/chat/completions',

  /**
   * AI API 密钥
   * @type {string | undefined}
   * @description 必须配置，未配置时 AI 生成服务不可用
   */
  key: process.env.AI_API_KEY,

  /**
   * AI 模型名称
   * @type {string}
   * @default 'Qwen/Qwen2.5-7B-Instruct'
   */
  model: process.env.AI_MODEL || 'Qwen/Qwen2.5-7B-Instruct',

  /**
   * 采样温度，控制生成随机性
   * @type {number}
   * @default 0.7
   */
  temperature: parseFloat(process.env.AI_TEMPERATURE || '0.7'),

  /**
   * 最大生成 token 数
   * @type {number}
   * @default 4000
   */
  maxTokens: parseInt(process.env.AI_MAX_TOKENS || '4000', 10),

  /**
   * 请求超时时间（毫秒）
   * @type {number}
   * @default 60000
   */
  timeout: parseInt(process.env.AI_TIMEOUT || '60000', 10)
};

/**
 * 检查 AI API Key 是否已配置
 * @description 用于健康检查与服务启动前校验
 * @returns {boolean} true 表示已配置，false 表示未配置
 */
export function isAiConfigured(): boolean {
  return typeof aiConfig.key === 'string' && aiConfig.key.length > 0 && aiConfig.key !== 'your-api-key-here';
}
