/* =========================================================
   知识侦探 · API 服务封装
   =========================================================
 * @description 封装与本地代理服务器 / 后端 API 的通信，
 *              提供健康检查、剧本生成等能力，并在请求失败时返回明确的错误信息。
 * @author 知识侦探团队
 * @date 2026-07-08
 * ========================================================= */

/// <reference types="vite/client" />

import type { Case, Clue, Option, Analysis, KnowledgeCard } from '../types/case';

/**
 * API 基础地址
 * @description 优先读取 Vite 环境变量 VITE_API_URL，未配置时默认使用本地代理地址。
 *              生产构建时由 .env.production 覆盖。
 */
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4315/api';

/**
 * 后端返回的案卷结构
 * @description 与数据库表结构保持一致，字段命名采用下划线/后端风格。
 */
export interface BackendCase {
  /** 案卷数字 ID */
  id: number;
  /** 案卷标题 */
  title: string;
  /** 副标题 */
  subtitle: string;
  /** 分类标签 */
  category: string;
  /** 难度 1-5 */
  difficulty: number;
  /** 场景描述文本 */
  scene: string;
  /** 线索数组（后端格式） */
  clues: Array<{ title: string; hint: string; content: string; insight: string }>;
  /** 推理问题 */
  question: string;
  /** 选项数组（后端格式） */
  options: Array<{ label: string; text: string; correct?: boolean }>;
  /** 解析（后端格式） */
  analysis: { body: string; kps: string[]; formula: string };
  /** 知识卡（后端格式） */
  card: {
    tag: string;
    title: string;
    subtitle: string;
    definition: string;
    explanation: string;
    application: string;
  };
  /** 是否种子数据 */
  is_seed?: boolean;
  /** 创建时间 */
  created_at?: string;
  /** 更新时间 */
  updated_at?: string;
}

/**
 * 后端统一响应包装
 * @template T 实际数据类型
 */
export interface ApiResponse<T> {
  /** 是否成功 */
  success: boolean;
  /** 实际数据 */
  data: T;
  /** 总数（列表接口可能返回） */
  total?: number;
  /** 错误信息 */
  message?: string;
}

/**
 * 将后端案卷转换为前端 Case 格式
 * @description 字段名、结构不一致时在此处统一适配，避免组件层感知后端差异。
 * @param backend - 后端返回的原始案卷对象
 * @returns 前端标准的 Case 对象
 */
export function mapBackendCaseToFrontend(backend: BackendCase): Case {
  // 找出正确答案的选项标签
  const correctOption = backend.options.find((opt) => opt.correct === true);
  const correctOptionId = correctOption ? correctOption.label : '';

  // 将场景文本按段落拆分为数组
  const sceneParagraphs = backend.scene
    ? backend.scene.split(/\n+/).filter((p) => p.trim().length > 0)
    : [];

  // 将分类标签拆分为关键词标签
  const tags = backend.category
    ? backend.category.split(/[/|,、]/).map((t) => t.trim()).filter(Boolean)
    : ['AI生成'];

  // 为每个线索生成稳定 ID
  const clues: Clue[] = backend.clues.map((c, index) => ({
    id: `c-${backend.id}-${index + 1}`,
    title: c.title,
    hint: c.hint,
    body: c.content,
    insight: c.insight
  }));

  // 选项标签直接作为 id
  const options: Option[] = backend.options.map((opt) => ({
    id: opt.label,
    text: opt.text
  }));

  const analysis: Analysis = {
    correctOptionId,
    body: backend.analysis.body,
    keyPoints: backend.analysis.kps,
    formula: backend.analysis.formula
  };

  const knowledgeCard: KnowledgeCard = {
    concept: backend.card.title || backend.title,
    definition: backend.card.definition,
    explanation: backend.card.explanation,
    application: backend.card.application
  };

  return {
    id: String(backend.id),
    num: String(backend.id).padStart(3, '0'),
    title: backend.title,
    enTitle: backend.card.title || backend.title,
    subtitle: backend.subtitle,
    type: backend.category || '综合',
    difficulty: backend.difficulty,
    tags,
    scene: sceneParagraphs,
    clues,
    question: backend.question,
    options,
    analysis,
    knowledgeCard
  };
}

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
    const response = await fetchWithTimeout(`${API_BASE_URL}/games/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ articleText: text })
    });

    if (!response.ok) {
      await handleErrorResponse(response);
    }

    const data = (await response.json()) as ApiResponse<BackendCase>;
    return mapBackendCaseToFrontend(data.data);
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError('生成案卷失败', 0, err instanceof Error ? err.message : String(err));
  }
}

/**
 * 从后端获取案卷列表
 * @description 调用 GET /api/cases 获取所有案卷，并转换为前端 Case 格式。
 * @returns {Promise<Case[]>} 案卷列表
 * @throws {ApiError} 网络错误或后端返回非 2xx 时抛出
 */
export async function fetchCases(): Promise<Case[]> {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/cases`);

    if (!response.ok) {
      await handleErrorResponse(response);
    }

    const data = (await response.json()) as ApiResponse<BackendCase[]>;
    const backends = Array.isArray(data.data) ? data.data : [];
    return backends.map(mapBackendCaseToFrontend);
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError('获取案卷列表失败', 0, err instanceof Error ? err.message : String(err));
  }
}
