/* =========================================================
   知识侦探 · 滚动进度条组件
   =========================================================
 * @description 监听页面滚动进度，实时更新顶部进度条宽度。
 * @author 知识侦探团队
 * @date 2026-07-08
 * ========================================================= */

import React, { useState, useEffect, useCallback } from 'react';

/**
 * ScrollProgress 组件
 * @returns 顶部滚动进度条 JSX
 */
export const ScrollProgress: React.FC = () => {
  const [width, setWidth] = useState(0);

  /**
   * 更新滚动进度
   */
  const updateProgress = useCallback(() => {
    try {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setWidth(Math.min(100, Math.max(0, progress)));
    } catch (err) {
      console.warn('[ScrollProgress] 计算滚动进度失败：', err);
    }
  }, []);

  useEffect(() => {
    try {
      window.addEventListener('scroll', updateProgress, { passive: true });
      updateProgress();
    } catch (err) {
      console.warn('[ScrollProgress] 注册滚动监听失败：', err);
    }

    return () => {
      try {
        window.removeEventListener('scroll', updateProgress);
      } catch (err) {
        console.warn('[ScrollProgress] 移除滚动监听失败：', err);
      }
    };
  }, [updateProgress]);

  return (
    <div
      className="scroll-progress-bar"
      style={{ width: `${width}%` }}
      role="progressbar"
      aria-valuenow={Math.round(width)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="页面滚动进度"
    />
  );
};
