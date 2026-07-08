/* =========================================================
   知识侦探 · 应用根组件
   =========================================================
 * @description 知识侦探 React SPA 的根组件，负责页面状态管理、
 *              视图切换、全局布局与公共组件（导航、页脚、进度条、返回顶部）。
 * @author 知识侦探团队
 * @date 2026-07-08
 * ========================================================= */

import React, { useState, useCallback, useEffect } from 'react';
import type { PageId } from './types/app';
import { useCases } from './hooks/useCases';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { ScrollProgress } from './components/common/ScrollProgress';
import { BackToTop } from './components/common/BackToTop';
import { HomePage } from './components/pages/HomePage';
import { FeaturesPage } from './components/pages/FeaturesPage';
import { CasesPage } from './components/pages/CasesPage';
import { GuidePage } from './components/pages/GuidePage';
import { GamePage } from './components/pages/GamePage';

/**
 * 根据页面标识渲染对应页面组件
 * @param page - 当前页面标识
 * @param cases - 案卷列表
 * @param initialCaseId - 游戏页初始案卷 id
 * @param onNavigate - 页面切换回调
 * @param onStartCase - 开始案卷回调
 * @returns 当前页面对应的 JSX
 */
function renderCurrentPage(
  page: PageId,
  cases: ReturnType<typeof useCases>['cases'],
  initialCaseId: string | null,
  onNavigate: (page: PageId) => void,
  onStartCase: (caseId: string) => void
): React.ReactNode {
  switch (page) {
    case 'home':
      return <HomePage cases={cases} onNavigate={onNavigate} onStartCase={onStartCase} />;
    case 'features':
      return <FeaturesPage onNavigate={onNavigate} />;
    case 'cases':
      return <CasesPage cases={cases} onNavigate={onNavigate} onStartCase={onStartCase} />;
    case 'guide':
      return <GuidePage onNavigate={onNavigate} />;
    case 'play':
      return <GamePage cases={cases} initialCaseId={initialCaseId} onNavigate={onNavigate} />;
    default:
      return <HomePage cases={cases} onNavigate={onNavigate} onStartCase={onStartCase} />;
  }
}

/**
 * App 根组件
 * @description 管理 SPA 的顶层状态，组合公共组件与页面组件。
 * @returns 应用根 JSX
 */
export const App: React.FC = () => {
  /** 当前页面状态 */
  const [currentPage, setCurrentPage] = useState<PageId>('home');
  /** 游戏页初始案卷 id */
  const [initialCaseId, setInitialCaseId] = useState<string | null>(null);
  /** 案卷数据与加载状态 */
  const { cases, loading, error, isLocalFallback } = useCases();

  /**
   * 处理 GitHub Pages 直接访问子路径的重定向
   * @description 404.html 将原始路径存入 sessionStorage，此处读取并恢复对应页面。
   */
  useEffect(() => {
    try {
      const redirectPath = sessionStorage.getItem('kd_redirect_path');
      if (!redirectPath) return;
      sessionStorage.removeItem('kd_redirect_path');

      const pathWithoutHash = redirectPath.split('#')[0];
      const pathWithoutQuery = pathWithoutHash.split('?')[0];
      const base = import.meta.env.BASE_URL || '/';
      const relativePath = pathWithoutQuery.startsWith(base)
        ? '/' + pathWithoutQuery.slice(base.length)
        : pathWithoutQuery;
      const normalizedPath = relativePath.startsWith('/') ? relativePath : '/' + relativePath;

      const pageMap: Record<string, PageId> = {
        '/index.html': 'home',
        '/features.html': 'features',
        '/cases.html': 'cases',
        '/guide.html': 'guide',
        '/play.html': 'play'
      };

      const pageId = pageMap[normalizedPath];
      if (pageId) {
        setCurrentPage(pageId);
      }
    } catch (err) {
      console.warn('[App] 处理重定向路径失败：', err);
    }
  }, []);

  /**
   * 切换页面并滚动到顶部
   * @param page - 目标页面标识
   */
  const handleNavigate = useCallback((page: PageId) => {
    try {
      setCurrentPage(page);
      setInitialCaseId(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.warn('[App] 页面切换失败：', err);
    }
  }, []);

  /**
   * 选择并开始某个案卷
   * @param caseId - 案卷唯一标识
   */
  const handleStartCase = useCallback((caseId: string) => {
    try {
      setInitialCaseId(caseId);
      setCurrentPage('play');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.warn('[App] 开始案卷失败：', err);
    }
  }, []);

  return (
    <>
      {/* 全局背景纹理层 */}
      <div className="background-layer" aria-hidden="true" />

      {/* 顶部滚动进度条 */}
      <ScrollProgress />

      {/* 顶部导航 */}
      <Header currentPage={currentPage} onNavigate={handleNavigate} />

      {/* 主内容区 */}
      <main className="content">
        {loading ? (
          <div className="page-section app-loading">
            <div className="loading-spinner" aria-label="加载中" />
            <p>正在调取案卷档案…</p>
          </div>
        ) : (
          <>
            {/* 本地模式提示 */}
            {isLocalFallback && error && (
              <div className="fallback-banner" role="status" aria-live="polite">
                <span className="fallback-dot" />
                <span>{error}</span>
              </div>
            )}

            {renderCurrentPage(currentPage, cases, initialCaseId, handleNavigate, handleStartCase)}
          </>
        )}
      </main>

      {/* 页脚 */}
      <Footer onNavigate={handleNavigate} />

      {/* 返回顶部 */}
      <BackToTop />
    </>
  );
};
