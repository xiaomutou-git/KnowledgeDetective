/* =========================================================
   知识侦探 · 返回顶部组件
   =========================================================
 * @description 监听页面滚动位置，当页面滚动超过一定距离时显示返回顶部按钮。
 * @author 知识侦探团队
 * @date 2026-07-08
 * ========================================================= */

import React, { useState, useEffect, useCallback } from 'react';

/**
 * BackToTop 组件
 * @returns 返回顶部按钮 JSX
 */
export const BackToTop: React.FC = () => {
  const [visible, setVisible] = useState(false);

  /**
   * 检查滚动位置，控制按钮显隐
   */
  const checkVisibility = useCallback(() => {
    try {
      setVisible(window.scrollY > 400);
    } catch (err) {
      console.warn('[BackToTop] 检查滚动位置失败：', err);
    }
  }, []);

  useEffect(() => {
    try {
      window.addEventListener('scroll', checkVisibility, { passive: true });
      checkVisibility();
    } catch (err) {
      console.warn('[BackToTop] 注册滚动监听失败：', err);
    }

    return () => {
      try {
        window.removeEventListener('scroll', checkVisibility);
      } catch (err) {
        console.warn('[BackToTop] 移除滚动监听失败：', err);
      }
    };
  }, [checkVisibility]);

  /**
   * 平滑滚动到页面顶部
   */
  const scrollToTop = () => {
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.warn('[BackToTop] 滚动到顶部失败：', err);
    }
  };

  return (
    <button
      className={`back-to-top ${visible ? 'visible' : ''}`}
      onClick={scrollToTop}
      aria-label="返回顶部"
      type="button"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
        <path d="M18 15l-6-6-6 6" />
      </svg>
    </button>
  );
};
