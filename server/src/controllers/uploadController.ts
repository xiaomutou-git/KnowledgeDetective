/**
 * =========================================================
 * 文件：src/controllers/uploadController.ts
 * =========================================================
 * 功能说明：文件上传控制器
 * - 处理 POST /api/upload/parse 请求
 * - 使用 multer 内存存储接收文件
 * - 调用 uploadService 解析文件并返回文本
 *
 * 创建时间：2026-07-08
 * 核心用途：文件上传模块的 HTTP 入口
 * =========================================================
 */

import { Request, Response, NextFunction, RequestHandler } from 'express';
import multer from 'multer';
import { parseUploadedFile, removeTempFile } from '../services/uploadService';
import { AppError } from '../middlewares/errorHandler';
import { logger } from '../utils/logger';

/**
 * multer 内存存储配置
 * @description 文件不写入磁盘，直接以 Buffer 形式交给解析器
 */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    // 与全局请求体限制保持一致：10MB
    fileSize: 10 * 1024 * 1024,
    files: 1
  }
});

/**
 * 单文件上传中间件
 * @description 接收字段名为 file 的单个文件
 * @type {RequestHandler}
 */
export const uploadSingleFile: RequestHandler = upload.single('file');

/**
 * 解析上传文件
 * @description 处理 POST /api/upload/parse，返回文件名、文本长度与解析文本
 * @param {Request} req - Express 请求对象（需包含 multer 注入的 file）
 * @param {Response} res - Express 响应对象
 * @param {NextFunction} next - 下一个中间件函数
 * @returns {Promise<void>}
 * @throws {AppError} 当未上传文件、类型不支持或解析失败时抛出
 */
export async function parseUploadController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.file) {
      throw new AppError('请上传文件，字段名为 file', 400, true);
    }

    // multer 内存存储不会产生临时文件，磁盘存储时才清理
    if ((req.file as Express.Multer.File & { path?: string }).path) {
      removeTempFile((req.file as Express.Multer.File & { path?: string }).path as string);
    }

    const result = await parseUploadedFile(req.file);

    logger.info('文件上传解析成功', {
      originalName: result.originalName,
      size: result.size,
      charCount: result.charCount
    });

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (err) {
    next(err);
  }
}
