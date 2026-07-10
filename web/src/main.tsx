/* =========================================================
   知识侦探 · 应用入口
   =========================================================
 * @description React 18 应用挂载入口，渲染 App 根组件到 DOM，
 *              并导入全局样式以激活 noir 复古档案视觉系统。
 *              整个挂载流程被 try-catch 包裹，避免未捕获异常导致白屏。
 * @author 知识侦探团队
 * @date 2026-07-08
 * ========================================================= */

import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './styles/global.css';

/**
 * 渲染应用
 * @description 获取 #root 容器、创建 React 18 Root 并渲染 App。
 *              任何步骤出错都会在页面上输出降级提示，而不是直接抛出异常。
 * @returns {void}
 */
function renderApp(): void {
  try {
    /**
     * 应用挂载根节点
     * @description 获取 index.html 中的 #root 容器。
     */
    const container = document.getElementById('root');

    if (!container) {
      throw new Error('[main] 找不到 #root 挂载节点，请检查 index.html。');
    }

    /**
     * 创建 React 18 Root 并渲染应用
     * @description 使用 createRoot 启用并发特性，StrictMode 用于检测潜在问题。
     */
    const root = createRoot(container);

    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    // eslint-disable-next-line no-console
    console.error('[main] 应用挂载失败:', message);

    // 向页面输出降级提示，避免完全白屏
    const fallbackHtml = `
      <div style="font-family: 'Noto Serif SC', serif; text-align: center; padding: 40px; color: #b83a2b;">
        <h1>知识侦探加载失败</h1>
        <p>请刷新页面重试。如果问题持续存在，请检查控制台日志。</p>
        <pre style="margin-top: 20px; color: #5a5a5a; font-size: 14px;">${message}</pre>
      </div>
    `;

    try {
      document.body.innerHTML = fallbackHtml;
    } catch (domErr) {
      // 如果连 document.body 都不可用，则只能打印到控制台
      // eslint-disable-next-line no-console
      console.error('[main] 降级提示写入失败:', domErr);
    }
  }
}

renderApp();
