/**
 * =========================================================
 * 文件：src/services/uploadService.ts
 * =========================================================
 * 功能说明：文件上传与内容解析服务
 * - 支持 PDF、Word（.docx）、TXT 文件上传
 * - 提取文件中的文本内容，供 AI 生成案卷使用
 * - 对文件类型、大小进行校验，防止非法上传
 *
 * 创建时间：2026-07-08
 * 核心用途：将用户上传的学习材料转换为可生成案卷的文本
 * =========================================================
 */

import fs from 'fs';
import path from 'path';
import mammoth from 'mammoth';
import { AppError } from '../middlewares/errorHandler';
import { logger } from '../utils/logger';

/**
 * pdf-parse 模块类型声明
 * @description 该库默认导出为 CommonJS，此处使用类型断言消除 TypeScript 调用签名错误
 */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pdfParse = require('pdf-parse') as (buffer: Buffer) => Promise<{ text: string }>;

/**
 * 支持的 MIME 类型与扩展名映射
 * @description 用于校验上传文件格式
 */
const SUPPORTED_TYPES: Record<string, string> = {
  'application/pdf': '.pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
  'text/plain': '.txt'
};

/**
 * 允许的文件扩展名集合
 * @description 作为 MIME 校验的二次兜底
 */
const SUPPORTED_EXTENSIONS = ['.pdf', '.docx', '.txt'];

/**
 * 默认最大文件大小（字节）
 * @description 限制为 10MB，与请求体大小限制保持一致
 */
const MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * 解析结果 DTO
 * @description 文件解析后返回给调用方的数据结构
 */
export interface ParseResult {
  /** 原始文件名 */
  originalName: string;
  /** 文件大小（字节） */
  size: number;
  /** 文件 MIME 类型 */
  mimetype: string;
  /** 解析后的纯文本内容 */
  text: string;
  /** 文本字符数 */
  charCount: number;
}

/**
 * 校验文件是否可接受
 * @param {Express.Multer.File} file - multer 解析后的文件对象
 * @returns {boolean} 是否允许上传
 */
function isAcceptableFile(file: Express.Multer.File): boolean {
  if (!file) return false;
  if (SUPPORTED_TYPES[file.mimetype]) return true;
  const ext = path.extname(file.originalname).toLowerCase();
  return SUPPORTED_EXTENSIONS.includes(ext);
}

/**
 * 解析 PDF 文件文本
 * @param {Buffer} buffer - 文件二进制内容
 * @returns {Promise<string>} 提取的文本
 * @throws {AppError} 当解析失败时抛出
 */
async function parsePdf(buffer: Buffer): Promise<string> {
  try {
    const data = await pdfParse(buffer);
    return (data.text || '').trim();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error('PDF 解析失败', { message });
    throw new AppError('PDF 文件解析失败：' + message, 400, true);
  }
}

/**
 * 解析 Word 文档文本
 * @param {Buffer} buffer - 文件二进制内容
 * @returns {Promise<string>} 提取的文本
 * @throws {AppError} 当解析失败时抛出
 */
async function parseDocx(buffer: Buffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return (result.value || '').trim();
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error('Word 解析失败', { message });
    throw new AppError('Word 文件解析失败：' + message, 400, true);
  }
}

/**
 * 解析纯文本文件
 * @param {Buffer} buffer - 文件二进制内容
 * @returns {string} 文本内容
 */
function parseTxt(buffer: Buffer): string {
  return buffer.toString('utf-8').trim();
}

/**
 * 解析上传文件内容
 * @description 根据文件类型调用对应解析器，返回纯文本
 * @param {Express.Multer.File} file - multer 解析后的文件对象
 * @returns {Promise<ParseResult>} 解析结果
 * @throws {AppError} 当文件类型不支持、大小超限或解析失败时抛出
 */
export async function parseUploadedFile(file: Express.Multer.File): Promise<ParseResult> {
  if (!file) {
    throw new AppError('未接收到上传文件', 400, true);
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new AppError(`文件大小超过限制，最大允许 ${MAX_FILE_SIZE / 1024 / 1024}MB`, 413, true);
  }

  if (!isAcceptableFile(file)) {
    throw new AppError('不支持的文件类型，仅支持 PDF、Word（.docx）、TXT', 415, true);
  }

  let ext = path.extname(file.originalname).toLowerCase();
  // 当文件名缺少扩展名时，根据 MIME 类型推断扩展名，确保后续解析器选择正确
  if (!ext && file.mimetype && SUPPORTED_TYPES[file.mimetype]) {
    ext = SUPPORTED_TYPES[file.mimetype];
  }
  let text = '';

  try {
    switch (ext) {
      case '.pdf':
        text = await parsePdf(file.buffer);
        break;
      case '.docx':
        text = await parseDocx(file.buffer);
        break;
      case '.txt':
      default:
        // 对于无扩展名或无法识别的类型，默认按纯文本处理
        text = parseTxt(file.buffer);
        break;
    }
  } catch (err) {
    if (err instanceof AppError) throw err;
    const message = err instanceof Error ? err.message : String(err);
    logger.error('文件解析异常', { message });
    throw new AppError('文件解析异常：' + message, 500, true);
  }

  if (text.length < 10) {
    throw new AppError('文件内容太少，至少需要 10 个字符才能生成案卷', 400, true);
  }

  return {
    originalName: file.originalname,
    size: file.size,
    mimetype: file.mimetype,
    text,
    charCount: text.length
  };
}

/**
 * 删除本地临时文件
 * @description 如果 multer 配置了磁盘存储，上传完成后应清理临时文件
 * @param {string} filePath - 文件绝对路径
 * @returns {void}
 */
export function removeTempFile(filePath: string): void {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      logger.debug('临时文件已删除', { filePath });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.warn('删除临时文件失败', { filePath, message });
  }
}
