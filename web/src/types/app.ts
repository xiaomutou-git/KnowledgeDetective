/* =========================================================
   知识侦探 · 应用级类型定义
   =========================================================
 * @description 定义 SPA 页面标识、导航配置等应用级公共类型。
 * @author 知识侦探团队
 * @date 2026-07-08
 * ========================================================= */

/**
 * SPA 页面标识
 * @description 用于 App.tsx 中通过 useState 切换当前视图。
 */
export type PageId = 'home' | 'features' | 'cases' | 'guide' | 'play';

/**
 * 导航项
 */
export interface NavItem {
  /** 页面标识 */
  id: PageId;
  /** 导航显示文本 */
  label: string;
  /** 对外链接（GitHub Pages 兼容 .html 后缀） */
  path: string;
}

/**
 * 页脚链接列
 */
export interface FooterColumn {
  /** 列标题 */
  title: string;
  /** 链接列表 */
  links: Array<{ label: string; path: string; external?: boolean }>;
}
