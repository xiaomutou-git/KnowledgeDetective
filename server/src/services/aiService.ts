/**
 * =========================================================
 * 文件：src/services/aiService.ts
 * =========================================================
 * 功能说明：AI 调用服务
 * - 保留原 proxy-server.js 中的 buildPrompt 逻辑
 * - 使用 Node.js 原生 http/https 模块调用 AI API
 * - 解析返回内容中的 JSON 剧本数据
 *
 * 创建时间：2026-07-08
 * 核心用途：根据用户文章生成推理剧本
 * =========================================================
 */

import http from 'http';
import https from 'https';
import { URL } from 'url';
import { aiConfig, isAiConfigured } from '../config/ai';
import { AppError } from '../middlewares/errorHandler';
import { logger } from '../utils/logger';
import { CreateCaseInput } from '../models/caseModel';

/**
 * 构建生成推理剧本的提示词
 * @description 从原 proxy-server.js 迁移，保持 JSON schema 一致
 * @param {string} articleText - 用户输入的文章内容
 * @returns {string} 完整的提示词文本
 */
export function buildPrompt(articleText: string): string {
  const truncated = articleText.substring(0, 3000);

  return `你是一个知识侦探助手。用户输入了一篇文章，请分析这篇文章的核心概念和内容，然后生成一个「侦探推理剧本」，让用户在推理中学习这个知识点。

用户文章：
${truncated}

请严格按照以下 JSON 格式返回（不要加 markdown 代码块标记，只返回纯 JSON）：
{
  "title": "（从文章提取的核心概念名）",
  "subtitle": "（一句话描述推理场景）",
  "scene": "（一段推理场景描述，包含文章的核心知识。用 <em> 标签标注关键数字或概念）",
  "clues": [
    { "title": "线索1：XXXX", "hint": "点击查看", "content": "线索详细内容", "insight": "关键洞察：XXXX" },
    { "title": "线索2：XXXX", "hint": "点击查看", "content": "线索详细内容", "insight": "关键洞察：XXXX" },
    { "title": "线索3：XXXX", "hint": "点击查看", "content": "线索详细内容", "insight": "关键洞察：XXXX" }
  ],
  "question": "（基于文章内容设计的推理问题）",
  "options": [
    { "label": "A", "text": "选项A" },
    { "label": "B", "text": "选项B" },
    { "label": "C", "text": "选项C", "correct": true },
    { "label": "D", "text": "选项D" }
  ],
  "analysis": {
    "body": "（详细解析，用 <strong> 标注关键结论）",
    "kps": ["要点1", "要点2", "要点3", "要点4"],
    "formula": "（公式或关键推理步骤）"
  },
  "card": {
    "tag": "（分类标签，如\"物理思维 / PHYSICS\"）",
    "title": "（核心概念名）",
    "subtitle": "（一句话定义）",
    "definition": "（核心定义的详细解释）",
    "explanation": "（通俗易懂的生活化解释）",
    "application": "（应用场景说明）"
  }
}

请确保：
1. 所有内容与用户文章相关
2. 场景、线索、问题都围绕文章的核心知识点展开
3. 答案要有依据
4. 语言通俗易懂
5. 只返回纯 JSON，不要包含 markdown 代码块标记`;
}

/**
 * 调用 AI API 生成推理剧本
 * @description 使用原生 http/https 模块发送 POST 请求，解析返回的 JSON 内容
 * @param {string} articleText - 用户输入的文章内容
 * @returns {Promise<CreateCaseInput>} 生成的案卷输入数据
 * @throws {AppError} 当 API Key 未配置、网络异常、响应异常或 JSON 解析失败时抛出
 */
export function callAiApi(articleText: string): Promise<CreateCaseInput> {
  return new Promise((resolve, reject) => {
    // 请求前验证 API Key
    if (!isAiConfigured()) {
      reject(new AppError('API Key 未配置，请设置环境变量 AI_API_KEY', 500, true));
      return;
    }

    const prompt = buildPrompt(articleText);
    const requestBody = JSON.stringify({
      model: aiConfig.model,
      messages: [
        {
          role: 'system',
          content:
            '你是一个教育侦探，擅长将抽象知识转化为有趣的推理谜题。请始终返回纯 JSON，不要包含 markdown 代码块标记。'
        },
        { role: 'user', content: prompt }
      ],
      temperature: aiConfig.temperature,
      max_tokens: aiConfig.maxTokens
    });

    const parsedUrl = new URL(aiConfig.endpoint);
    const isHttps = parsedUrl.protocol === 'https:';
    const client = isHttps ? https : http;

    const options: http.RequestOptions = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (isHttps ? 443 : 80),
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${aiConfig.key}`,
        'Content-Length': Buffer.byteLength(requestBody)
      },
      timeout: aiConfig.timeout
    };

    const req = client.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            const response = JSON.parse(data);
            const content =
              response.choices &&
              response.choices[0] &&
              response.choices[0].message &&
              response.choices[0].message.content;

            if (!content) {
              reject(new AppError('API 返回格式异常', 500, true));
              return;
            }

            // 从 content 中提取 JSON 部分
            const jsonStart = content.indexOf('{');
            const jsonEnd = content.lastIndexOf('}');

            if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
              const jsonStr = content.substring(jsonStart, jsonEnd + 1);
              const scriptData = JSON.parse(jsonStr);
              scriptData.isSeed = false;
              resolve(scriptData as CreateCaseInput);
            } else {
              reject(new AppError('AI 返回的 JSON 格式不正确', 500, true));
            }
          } else {
            let errorMsg = `HTTP ${res.statusCode}`;
            try {
              const errResp = JSON.parse(data);
              errorMsg =
                (errResp.error && (errResp.error.message || JSON.stringify(errResp.error))) ||
                errorMsg;
            } catch (e) {
              // 忽略解析错误，使用默认错误信息
              logger.debug('解析错误响应失败', { error: String(e) });
            }
            reject(new AppError(errorMsg, res.statusCode || 500, true));
          }
        } catch (e) {
          const message = e instanceof Error ? e.message : String(e);
          reject(new AppError(`解析 AI 响应失败：${message}`, 500, true));
        }
      });
    });

    req.on('error', (err) => {
      reject(new AppError(`网络请求失败：${err.message}`, 500, true));
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new AppError('请求超时，请检查网络连接', 504, true));
    });

    req.write(requestBody);
    req.end();
  });
}

/**
 * 生成自定义案卷
 * @description 对外暴露的统一入口：调用 AI 并记录日志
 * @param {string} articleText - 用户输入的文章内容
 * @returns {Promise<CreateCaseInput>} 生成的案卷输入数据
 * @throws {AppError} 当文本过短或 AI 调用失败时抛出
 */
export async function generateCase(articleText: string): Promise<CreateCaseInput> {
  const text = (articleText || '').trim();
  if (text.length < 10) {
    throw new AppError('文本内容太短，至少需要 10 个字', 400, true);
  }

  logger.info(`收到 AI 生成请求，文本长度：${text.length}`);

  try {
    const result = await callAiApi(text);
    logger.info(`AI 生成成功：${result.title}`);
    return result;
  } catch (err) {
    if (err instanceof AppError) throw err;
    const message = err instanceof Error ? err.message : String(err);
    logger.error('AI 生成失败', { message });
    throw new AppError(`AI 生成失败：${message}`, 500, true);
  }
}
