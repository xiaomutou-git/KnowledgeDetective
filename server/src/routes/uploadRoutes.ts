/**
 * =========================================================
 * 文件：src/routes/uploadRoutes.ts
 * =========================================================
 * 功能说明：文件上传路由定义
 * - 将 /api/upload 请求映射到 uploadController
 *
 * 创建时间：2026-07-08
 * 核心用途：文件上传模块路由注册
 * =========================================================
 */

import { Router } from 'express';
import { uploadSingleFile, parseUploadController } from '../controllers/uploadController';

/**
 * 文件上传路由实例
 * @description 定义 /parse 路径下的 POST 文件解析接口
 */
const router: Router = Router();

/**
 * POST /parse - 上传并解析文件
 * @description 接收 PDF / Word / TXT 文件，返回提取的文本内容
 */
router.post('/parse', uploadSingleFile, parseUploadController);

export default router;
