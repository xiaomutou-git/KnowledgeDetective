/* =========================================================
   知识侦探 · 页脚组件
   =========================================================
 * @description 提供品牌介绍、链接分组与版权信息的响应式页脚。
 * @author 知识侦探团队
 * @date 2026-07-08
 * ========================================================= */

import React from 'react';
import type { PageId, FooterColumn } from '../../types/app';

/** 页脚链接配置 */
const FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: '产品',
    links: [
      { label: '功能特性', path: '/features.html' },
      { label: '成功案例', path: '/cases.html' },
      { label: '推理游戏', path: '/play.html' }
    ]
  },
  {
    title: '资源',
    links: [
      { label: '使用指南', path: '/guide.html' },
      { label: '快速开始', path: '/guide.html#quickstart' },
      { label: '常见问题', path: '/guide.html#faq' }
    ]
  },
  {
    title: '关于',
    links: [
      { label: 'GitHub', path: 'https://github.com/xiaomutou-git/KnowledgeDetective', external: true },
      { label: '反馈问题', path: 'https://github.com/xiaomutou-git/KnowledgeDetective/issues', external: true }
    ]
  }
];

/** 页脚属性 */
interface FooterProps {
  /** 页面切换回调 */
  onNavigate: (page: PageId) => void;
}

/**
 * 解析页脚链接对应的内部页面
 * @param path - 链接路径
 * @returns 对应的 PageId 或 null
 */
function resolvePageId(path: string): PageId | null {
  try {
    const base = path.split('#')[0].split('?')[0];
    const map: Record<string, PageId> = {
      '/index.html': 'home',
      '/features.html': 'features',
      '/cases.html': 'cases',
      '/guide.html': 'guide',
      '/play.html': 'play'
    };
    return map[base] || null;
  } catch (err) {
    console.warn('[Footer] 解析页面路径失败：', err);
    return null;
  }
}

/**
 * Footer 组件
 * @param props - 组件属性
 * @returns 页脚 JSX
 */
export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  /**
   * 处理链接点击
   * @param event - 点击事件
   * @param link - 链接配置
   */
  const handleLinkClick = (event: React.MouseEvent, link: FooterColumn['links'][number]) => {
    try {
      if (link.external) {
        return;
      }
      const pageId = resolvePageId(link.path);
      if (pageId) {
        event.preventDefault();
        onNavigate(pageId);
        if (link.path.includes('#')) {
          const hash = link.path.split('#')[1];
          setTimeout(() => {
            try {
              const target = document.getElementById(hash);
              if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
              }
            } catch (err) {
              console.warn('[Footer] 滚动到锚点失败：', err);
            }
          }, 100);
        }
      }
    } catch (err) {
      console.warn('[Footer] 链接点击处理失败：', err);
    }
  };

  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <div className="brand-text">
            <span className="brand-main">知识侦探</span>
            <span className="brand-en">KNOWLEDGE DETECTIVE</span>
          </div>
          <p>
            把枯燥的知识变成一场你来破案的推理游戏。
            <br />
            通过沉浸式线索与即时解析，让抽象概念变得可触摸。
          </p>
        </div>

        {FOOTER_COLUMNS.map((col) => (
          <div className="footer-col" key={col.title}>
            <h5>{col.title}</h5>
            <ul>
              {col.links.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.path}
                    target={link.external ? '_blank' : undefined}
                    rel={link.external ? 'noopener noreferrer' : undefined}
                    onClick={(e) => handleLinkClick(e, link)}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="footer-bottom">
        <p>© 2026 知识侦探 KnowledgeDetective. MIT License.</p>
        <p>DESIGNED FOR REASONING & LEARNING</p>
      </div>
    </footer>
  );
};
