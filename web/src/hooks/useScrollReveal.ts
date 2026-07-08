/* =========================================================
   知识侦探 · 滚动 reveal Hook
   =========================================================
 * @description 使用 IntersectionObserver 监听元素是否进入视口，
 *              进入后添加可见类名以触发 CSS 入场动画。
 * @author 知识侦探团队
 * @date 2026-07-08
 * ========================================================= */

import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * useScrollReveal 配置项
 */
export interface ScrollRevealOptions {
  /** 交叉比例阈值，默认 0.1 */
  threshold?: number;
  /** 根边距，可提前或延后触发 */
  rootMargin?: string;
  /** 是否只触发一次，默认 true */
  once?: boolean;
}

/**
 * 滚动 reveal Hook
 * @param options - 观察配置
 * @returns [ref, isVisible] ref 需绑定到目标元素，isVisible 表示是否可见
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
  options: ScrollRevealOptions = {}
): [React.RefObject<T | null>, boolean] {
  const { threshold = 0.1, rootMargin = '0px 0px -50px 0px', once = true } = options;
  const ref = useRef<T | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  /**
   * 设置元素可见状态
   * @param visible - 是否可见
   */
  const setVisible = useCallback(
    (visible: boolean) => {
      setIsVisible((prev) => {
        if (once && prev) return prev;
        return visible;
      });
    },
    [once]
  );

  useEffect(() => {
    const element = ref.current;
    if (!element || typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      setIsVisible(true);
      return;
    }

    let observer: IntersectionObserver | null = null;

    try {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setVisible(true);
              if (once && observer) {
                observer.unobserve(entry.target);
              }
            } else if (!once) {
              setVisible(false);
            }
          });
        },
        { threshold, rootMargin }
      );

      observer.observe(element);
    } catch (err) {
      console.warn('[useScrollReveal] 创建 IntersectionObserver 失败：', err);
      setIsVisible(true);
    }

    return () => {
      try {
        if (observer && element) {
          observer.unobserve(element);
        }
      } catch (err) {
        console.warn('[useScrollReveal] 取消观察失败：', err);
      }
    };
  }, [threshold, rootMargin, once, setVisible]);

  return [ref, isVisible];
}
