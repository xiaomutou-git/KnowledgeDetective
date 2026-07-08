/* =========================================================
   知识侦探 · 应用入口
   =========================================================
 * @description React 18 应用挂载入口，渲染 App 根组件到 DOM，
 *              并导入全局样式以激活 noir 复古档案视觉系统。
 * @author 知识侦探团队
 * @date 2026-07-08
 * ========================================================= */

import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './styles/global.css';

/**
 * 应用挂载根节点
 * @description 获取 index.html 中的 #root 容器，若不存在则抛出异常。
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
