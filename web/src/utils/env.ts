/**
 * =========================================================
 * 文件：src/utils/env.ts
 * =========================================================
 * 功能说明：运行环境检测工具
 * - 检测当前是否运行在 GitHub Pages 等纯静态托管环境
 * - 为前端路由、API 请求、功能开关提供环境判断能力
 *
 * 创建时间：2026-07-10
 * 核心用途：统一封装环境判断逻辑，避免多组件重复实现
 * =========================================================
 */

/**
 * 判断当前是否运行在 GitHub Pages 环境
 * @description 通过检测 window.location.hostname 是否包含 github.io 判断。
 *              GitHub Pages 仅部署前端静态资源，没有后端服务，因此需要关闭
 *              上传、AI 生成等依赖后端的能力。
 * @returns {boolean} 是否为 GitHub Pages 环境
 */
export function isGitHubPages(): boolean {
  try {
    return typeof window !== 'undefined' && window.location.hostname.includes('github.io');
  } catch (err) {
    console.warn('[env] 环境检测失败：', err);
    return false;
  }
}
