/* =========================================================
   知识侦探 · 顶部导航组件
   =========================================================
 * @description 提供响应式顶部导航、品牌 Logo、导航高亮、
 *              移动端菜单按钮与滚动阴影效果。
 * @author 知识侦探团队
 * @date 2026-07-08
 * ========================================================= */

import React, { useState, useEffect, useCallback } from 'react';
import type { PageId, NavItem } from '../../types/app';

/** 导航配置 */
const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: '首页', path: '/index.html' },
  { id: 'features', label: '功能', path: '/features.html' },
  { id: 'cases', label: '案例', path: '/cases.html' },
  { id: 'guide', label: '指南', path: '/guide.html' },
  { id: 'play', label: '开始推理', path: '/play.html' }
];

/** Header 组件属性 */
interface HeaderProps {
  /** 当前页面标识 */
  currentPage: PageId;
  /** 页面切换回调 */
  onNavigate: (page: PageId) => void;
}

/**
 * Header 组件
 * @param props - 组件属性
 * @returns 顶部导航 JSX
 */
export const Header: React.FC<HeaderProps> = ({ currentPage, onNavigate }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  /**
   * 处理滚动事件，控制导航阴影
   */
  const handleScroll = useCallback(() => {
    try {
      setIsScrolled(window.scrollY > 10);
    } catch (err) {
      console.warn('[Header] 读取滚动位置失败：', err);
    }
  }, []);

  useEffect(() => {
    try {
      window.addEventListener('scroll', handleScroll, { passive: true });
      handleScroll();
    } catch (err) {
      console.warn('[Header] 注册滚动监听失败：', err);
    }

    return () => {
      try {
        window.removeEventListener('scroll', handleScroll);
      } catch (err) {
        console.warn('[Header] 移除滚动监听失败：', err);
      }
    };
  }, [handleScroll]);

  /**
   * 处理导航点击
   * @param item - 被点击的导航项
   */
  const handleNavClick = (item: NavItem) => {
    try {
      setIsMobileMenuOpen(false);
      onNavigate(item.id);
    } catch (err) {
      console.warn('[Header] 导航点击处理失败：', err);
    }
  };

  /**
   * 切换移动端菜单
   */
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  return (
    <header className={`topbar ${isScrolled ? 'is-scrolled' : ''}`}>
      <button
        className="brand"
        onClick={() => handleNavClick(NAV_ITEMS[0])}
        aria-label="返回首页"
        type="button"
      >
        <svg className="brand-logo" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="28" cy="28" r="25" stroke="#1a1a1a" strokeWidth="1" fill="none" opacity="0.85" />
          <circle cx="28" cy="28" r="22" stroke="#1a1a1a" strokeWidth="0.5" fill="none" opacity="0.3" strokeDasharray="1 2" />
          <circle cx="28" cy="28" r="14" stroke="#b83a2b" strokeWidth="1.5" fill="none" />
          <path d="M28 14v28M14 28h28" stroke="#1a1a1a" strokeWidth="0.6" opacity="0.4" />
          <circle cx="28" cy="28" r="3" fill="#b83a2b" />
        </svg>
        <span className="brand-text">
          <span className="brand-main">知识侦探</span>
          <span className="brand-en">KNOWLEDGE DETECTIVE</span>
        </span>
      </button>

      <nav className="nav-group" aria-label="主导航">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            className={`nav-link ${currentPage === item.id ? 'active' : ''}`}
            onClick={() => handleNavClick(item)}
            type="button"
            aria-current={currentPage === item.id ? 'page' : undefined}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className="status" aria-live="polite">
        <span className="live-dot" />
        <strong>READY</strong>
      </div>

      <button
        className={`mobile-menu-btn ${isMobileMenuOpen ? 'active' : ''}`}
        onClick={toggleMobileMenu}
        aria-label={isMobileMenuOpen ? '关闭菜单' : '打开菜单'}
        aria-expanded={isMobileMenuOpen}
        type="button"
      >
        <span />
        <span />
        <span />
      </button>

      <nav className={`mobile-nav ${isMobileMenuOpen ? 'open' : ''}`} aria-label="移动端导航">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            className={`nav-link ${currentPage === item.id ? 'active' : ''}`}
            onClick={() => handleNavClick(item)}
            type="button"
            aria-current={currentPage === item.id ? 'page' : undefined}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </header>
  );
};
