/* =========================================================
   知识侦探 · API 服务封装
   =========================================================
 * @description 封装与本地代理服务器 / 后端 API 的通信，
 *              提供健康检查、剧本生成等能力，并在请求失败时返回明确的错误信息。
 * @author 知识侦探团队
 * @date 2026-07-08
 * ========================================================= */

/// <reference types="vite/client" />

import type { Case } from '../types/case';

/**
 * API 基础地址
 * @description 优先读取 Vite 环境变量 VITE_API_URL，未配置时默认使用本地代理地址。
 *              生产构建时由 .env.production 覆盖。
 */
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4315/api';

/**
 * API 通用请求超时时间（毫秒）
 */
const DEFAULT_TIMEOUT = 30000;

/**
 * 健康检查响应
 */
export interface HealthResponse {
  /** 服务状态 */
  status: string;
  /** AI 代理配置是否就绪 */
  aiConfigured?: boolean;
}

/**
 * 生成剧本请求体
 */
export interface GenerateCaseRequest {
  /** 用户输入的原始文本 */
  text: string;
}

/**
 * 生成剧本响应体
 */
export interface GenerateCaseResponse {
  /** 生成的案卷数据 */
  case: Case;
}

/**
 * API 错误类
 * @description 统一封装 API 请求过程中出现的错误，便于上层组件区分处理。
 */
export class ApiError extends Error {
  /** HTTP 状态码 */
  status: number;
  /** 后端返回的错误详情 */
  detail: string;

  /**
   * 构造 API 错误
   * @param message - 错误摘要
   * @param status - HTTP 状态码，默认为 0（网络或未知错误）
   * @param detail - 后端返回的详细错误信息
   */
  constructor(message: string, status = 0, detail = '') {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.detail = detail;
  }
}

/**
 * 带超时的 fetch 封装
 * @param url - 请求地址
 * @param options - fetch 配置项
 * @returns Response 对象
 * @throws {ApiError} 网络超时或请求失败时抛出
 */
async function fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);

  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    return response;
  } catch (err) {
    if (err instanceof Error) {
      if (err.name === 'AbortError') {
        throw new ApiError('请求超时，请检查网络或稍后重试', 0, err.message);
      }
      throw new ApiError(`网络请求失败：${err.message}`, 0, err.message);
    }
    throw new ApiError('网络请求失败', 0, String(err));
  } finally {
    clearTimeout(timer);
  }
}

/**
 * 解析错误响应
 * @param response - fetch 返回的 Response 对象
 * @throws {ApiError} 总是抛出经过封装的错误
 */
async function handleErrorResponse(response: Response): Promise<never> {
  let detail = '';
  try {
    const data = await response.json();
    detail = data.detail || data.message || JSON.stringify(data);
  } catch (err) {
    detail = response.statusText || '未知错误';
    console.warn('[api] 解析错误响应失败：', err);
  }
  throw new ApiError(`请求失败（${response.status}）`, response.status, detail);
}

/**
 * 检查服务器健康状态
 * @description 调用 /api/health 接口确认代理服务器与 AI 配置是否可用。
 * @returns {Promise<HealthResponse>} 健康检查结果
 * @throws {ApiError} 网络或服务器错误时抛出
 */
export async function checkHealth(): Promise<HealthResponse> {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/health`);
    if (!response.ok) {
      await handleErrorResponse(response);
    }
    const data = (await response.json()) as HealthResponse;
    return data;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError('健康检查失败', 0, err instanceof Error ? err.message : String(err));
  }
}

/**
 * 根据文本生成推理案卷
 * @description 将用户输入的材料提交给后端 AI 代理，返回结构化案卷 JSON。
 *              若后端不可用，上层可降级使用本地 seedCases。
 * @param text - 用户输入的原始文本，建议不少于 50 字
 * @returns {Promise<Case>} 生成的案卷对象
 * @throws {ApiError} 网络错误、超时或后端返回非 2xx 时抛出
 */
export async function generateCaseFromText(text: string): Promise<Case> {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text } satisfies GenerateCaseRequest)
    });

    if (!response.ok) {
      await handleErrorResponse(response);
    }

    const data = (await response.json()) as GenerateCaseResponse;
    return data.case;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError('生成案卷失败', 0, err instanceof Error ? err.message : String(err));
  }
}
