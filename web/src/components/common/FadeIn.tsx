/* =========================================================
   知识侦探 · 滚动入场动画组件
   =========================================================
 * @description 包装任意子元素，当元素滚动进入视口时自动添加可见类名，
 *              触发 CSS 定义的 fade-in-up 入场动画。
 * @author 知识侦探团队
 * @date 2026-07-08
 * ========================================================= */

import React from 'react';
import { useScrollReveal } from '../../hooks/useScrollReveal';

/** FadeIn 组件属性 */
interface FadeInProps {
  /** 子节点 */
  children: React.ReactNode;
  /** 自定义类名 */
  className?: string;
  /** 延迟时间（秒），用于级联动画 */
  delay?: number;
}

/**
 * FadeIn 组件
 * @param props - 组件属性
 * @returns 包装后的子元素
 */
export const FadeIn: React.FC<FadeInProps> = ({ children, className = '', delay = 0 }) => {
  const [ref, isVisible] = useScrollReveal<HTMLDivElement>();

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className={`fade-in-up ${isVisible ? 'visible' : ''} ${className}`}
      style={{ transitionDelay: `${delay}s` }}
    >
      {children}
    </div>
  );
};
