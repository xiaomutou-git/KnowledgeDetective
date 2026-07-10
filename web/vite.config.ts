import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Vite 构建配置
 *
 * @description 知识侦探 React SPA 的构建入口配置，指定 GitHub Pages 部署基路径、
 *              开发服务器端口、构建输出目录，并启用 React 插件与 JSX 转换。
 * @author 知识侦探团队
 * @date 2026-07-08
 */
export default defineConfig({
  /**
   * 部署基路径
   * @description 默认本地开发或自托管使用根路径 /；GitHub Pages 部署时通过
   *              VITE_BASE_PATH=/KnowledgeDetective/ 环境变量覆盖
   */
  base: process.env.VITE_BASE_PATH || '/',

  /**
   * React 插件配置
   * @description 提供 Fast Refresh、JSX 自动运行时等能力
   */
  plugins: [react()],

  /**
   * 开发服务器配置
   * @description 默认端口 5173，与 Vite 默认一致；proxy 可转发 /api 到本地代理
   */
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:4315',
        changeOrigin: true,
      },
    },
  },

  /**
   * 构建输出配置
   * @description 输出到 web/dist，便于主仓库统一发布
   */
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
