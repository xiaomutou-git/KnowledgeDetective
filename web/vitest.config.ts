import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

/**
 * Vitest 测试配置
 *
 * @description 配置 jsdom 测试环境、全局测试工具别名与 React 插件支持。
 * @author 知识侦探团队
 * @date 2026-07-08
 */
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/__tests__/setup.ts'],
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});
