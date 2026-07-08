/* =========================================================
   知识侦探 · 首页组件
   =========================================================
 * @description 呈现产品首页：Hero、核心优势、精选案卷预览、团队介绍与 CTA。
 * @author 知识侦探团队
 * @date 2026-07-08
 * ========================================================= */

import React from 'react';
import type { PageId } from '../../types/app';
import type { Case } from '../../types/case';
import { FadeIn } from '../common/FadeIn';

/** 核心优势数据 */
const FEATURES = [
  { icon: '§', title: 'AI 自动编卷', desc: '输入任意文本，AI 自动提取核心概念，生成包含场景、线索、问题与解析的完整推理剧本。' },
  { icon: '◆', title: '沉浸式线索系统', desc: '通过点击线索卡片逐步揭露关键信息，模拟真实侦探破案过程，强化记忆与理解。' },
  { icon: '∞', title: '无限自定义案件', desc: '支持粘贴文本、上传 TXT / PDF / Word 文档，将你的学习材料变成专属推理档案。' },
  { icon: '✓', title: '即时反馈解析', desc: '答完题目后立刻获得详细解析、知识要点与公式推导，错误也能变成学习机会。' },
  { icon: '◈', title: '知识卡封存', desc: '每侦破一案，自动生成精美知识档案卡，沉淀定义、解释与应用，随时复习。' },
  { icon: '⊕', title: '跨学科思维模型', desc: '内置概率、统计、博弈、逻辑、认知偏差等多领域经典案卷，训练多元思维。' }
];

/** 统计数据 */
const STATS = [
  { num: '12+', label: '精 选 案 卷', en: 'Built-in Cases' },
  { num: '∞', label: '自 定 义 档 案', en: 'Custom Upload' },
  { num: 'AI', label: '智 能 编 卷', en: 'Auto Generation' },
  { num: '100%', label: '本 地 存 储', en: 'Privacy First' }
];

/** 首页属性 */
interface HomePageProps {
  /** 案卷列表 */
  cases: Case[];
  /** 页面切换回调 */
  onNavigate: (page: PageId) => void;
  /** 选择并开始某案卷 */
  onStartCase: (caseId: string) => void;
}

/**
 * 渲染难度圆点
 * @param difficulty - 难度等级 1-5
 * @returns 难度圆点 JSX
 */
function renderDifficultyDots(difficulty: number): React.ReactNode {
  return (
    <span className="difficulty-dots" aria-label={`难度 ${difficulty}/5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={`difficulty-dot ${i < difficulty ? 'filled' : ''}`} />
      ))}
    </span>
  );
}

/**
 * HomePage 组件
 * @param props - 组件属性
 * @returns 首页 JSX
 */
export const HomePage: React.FC<HomePageProps> = ({ cases, onNavigate, onStartCase }) => {
  /**
   * 进入功能页
   */
  const goToFeatures = () => {
    try {
      onNavigate('features');
    } catch (err) {
      console.warn('[HomePage] 跳转功能页失败：', err);
    }
  };

  /**
   * 进入游戏页
   */
  const goToPlay = () => {
    try {
      onNavigate('play');
    } catch (err) {
      console.warn('[HomePage] 跳转游戏页失败：', err);
    }
  };

  /**
   * 开始指定案卷
   * @param caseId - 案卷 id
   */
  const startCase = (caseId: string) => {
    try {
      onStartCase(caseId);
    } catch (err) {
      console.warn('[HomePage] 开始案卷失败：', err);
    }
  };

  return (
    <div className="page-section">
      {/* Hero 区域 */}
      <section className="hero">
        <div className="hero-kicker">
          <span className="k-tag">KNOWLEDGE DETECTIVE</span>
          <span className="k-line" />
          <span>AI EDUCATION GAME</span>
        </div>
        <h1 className="hero-title">
          <span>把枯燥的</span>
          <span>
            <em>知识</em>
          </span>
          <span>变成推理游戏</span>
        </h1>
        <div className="hero-zh">
          破案的过程，就是<span className="accent">理解</span>的过程
        </div>
        <p className="hero-subtitle">
          上传任意文章，AI 自动生成侦探剧本。<em>收集线索、推理判断、封存档案</em>——在沉浸式解谜中掌握知识核心。
        </p>
        <div className="cta-row">
          <button className="btn-primary" onClick={goToPlay} type="button">
            <span>开始推理</span>
            <span className="arrow">→</span>
          </button>
          <button className="btn-ghost" onClick={goToFeatures} type="button">
            <span>了解功能</span>
          </button>
        </div>

        <div className="hero-decor" aria-hidden="true">
          <svg className="decor-magnifier" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="42" cy="42" r="28" stroke="currentColor" strokeWidth="3" />
            <line x1="62" y1="62" x2="90" y2="90" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
            <circle cx="42" cy="42" r="10" stroke="currentColor" strokeWidth="2" opacity="0.4" />
          </svg>
          <svg className="decor-fingerprint" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M50 10 C30 10 10 30 10 50" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M50 18 C34 18 18 34 18 50" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M50 26 C38 26 26 38 26 50" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M50 34 C42 34 34 42 34 50" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M50 74 C58 74 66 66 66 50" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M50 82 C62 82 74 70 74 50" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M50 90 C66 90 82 74 82 50" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <svg className="decor-stamp" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="12" y="12" width="76" height="76" rx="4" stroke="currentColor" strokeWidth="3" strokeDasharray="6 4" />
            <circle cx="50" cy="50" r="24" stroke="currentColor" strokeWidth="2" />
            <text x="50" y="55" textAnchor="middle" fontSize="16" fill="currentColor" fontFamily="'Noto Serif SC', serif" fontWeight="600">机密</text>
          </svg>
        </div>

        <div className="stats-row">
          {STATS.map((stat) => (
            <div className="stat-item" key={stat.label}>
              <div className="stat-num">{stat.num}</div>
              <div className="stat-label">{stat.label}</div>
              <div className="stat-en">{stat.en}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 核心优势 */}
      <section className="section section-alt" id="features">
        <FadeIn>
          <div className="section-head">
            <div className="section-title-wrap">
              <h2>
                核心<em>优势</em>
              </h2>
              <span className="zh">为 学 习 者 设 计 的 推 理 体 验</span>
            </div>
            <div className="section-meta">
              <div>
                WHY <strong>DETECTIVE</strong>
              </div>
              <div>LEARNING BY SOLVING</div>
            </div>
          </div>
        </FadeIn>
        <FadeIn>
          <p className="section-intro">
            知识侦探将「被动阅读」转化为「主动推理」。每一次破案，都是一次对知识结构的重新组织；每一条线索，都是对一个关键概念的深度理解。
          </p>
        </FadeIn>
        <div className="card-grid">
          {FEATURES.map((feature, index) => (
            <FadeIn key={feature.title} delay={index * 0.08}>
              <article className="feature-card">
                <div className="card-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.desc}</p>
              </article>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* 精选案卷 */}
      <section className="section" id="cases">
        <FadeIn>
          <div className="section-head">
            <div className="section-title-wrap">
              <h2>
                精选<em>案卷</em>
              </h2>
              <span className="zh">悬 案 待 解 · 点 击 进 入 推 理</span>
            </div>
            <div className="section-meta">
              <div>
                FEATURED <strong>CASES</strong>
              </div>
              <div>READY TO SOLVE</div>
            </div>
          </div>
        </FadeIn>
        <div className="dossier-list">
          {cases.slice(0, 4).map((caseItem, index) => (
            <FadeIn key={caseItem.id} delay={index * 0.08}>
              <button className="dossier" onClick={() => startCase(caseItem.id)} type="button">
                <div className="dossier-left">
                  <div className="dossier-num">{caseItem.num}</div>
                  <div className="dossier-type">{caseItem.type}</div>
                </div>
                <div className="dossier-main">
                  <h3>
                    {caseItem.title} <em>{caseItem.enTitle}</em>
                  </h3>
                  <div className="dossier-sub">{caseItem.subtitle}</div>
                  <div className="dossier-desc">{caseItem.scene[caseItem.scene.length - 1]}</div>
                  <div className="dossier-meta">
                    <div className="dossier-tags">
                      {caseItem.tags.map((tag) => (
                        <span key={tag} className="dossier-tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="dossier-difficulty">
                      <span>难度</span>
                      {renderDifficultyDots(caseItem.difficulty)}
                    </div>
                  </div>
                </div>
                <div className="dossier-right">
                  <div className="dossier-action">阅读卷宗</div>
                  <div className="dossier-arrow">→</div>
                </div>
              </button>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* 团队介绍 */}
      <section className="section section-alt" id="team">
        <FadeIn>
          <div className="section-head">
            <div className="section-title-wrap">
              <h2>
                侦探<em>事务所</em>
              </h2>
              <span className="zh">幕 后 团 队 · 致 力 于 让 知 识 更 有 趣</span>
            </div>
            <div className="section-meta">
              <div>
                THE <strong>TEAM</strong>
              </div>
              <div>BEHIND THE SCENES</div>
            </div>
          </div>
        </FadeIn>
        <div className="team-grid">
          <FadeIn delay={0}>
            <div className="team-card">
              <div className="team-badge" aria-hidden="true">
                <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="20" cy="20" r="12" />
                  <line x1="32" y1="32" x2="42" y2="42" />
                  <path d="M14 20h12" opacity="0.5" />
                </svg>
              </div>
              <h4>首席侦探</h4>
              <div className="team-role">产品策划 & 叙事设计</div>
              <p>负责将抽象知识转化为引人入胜的推理剧情，设计每一条线索与反转，让学习变成探案。</p>
            </div>
          </FadeIn>
          <FadeIn delay={0.08}>
            <div className="team-card">
              <div className="team-badge" aria-hidden="true">
                <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="24" cy="24" r="7" />
                  <path d="M24 10v7M24 31v7M10 24h7M31 24h7" />
                  <rect x="10" y="10" width="28" height="28" rx="4" opacity="0.15" />
                </svg>
              </div>
              <h4>技术探员</h4>
              <div className="team-role">前端工程 & AI 对接</div>
              <p>构建复古档案风格界面，实现 AI 剧本生成与本地档案存储，确保流畅的跨端体验。</p>
            </div>
          </FadeIn>
          <FadeIn delay={0.16}>
            <div className="team-card">
              <div className="team-badge" aria-hidden="true">
                <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="8" y="6" width="32" height="38" rx="2" />
                  <path d="M8 14h32M14 22h20M14 30h14" />
                </svg>
              </div>
              <h4>知识顾问</h4>
              <div className="team-role">内容教研 & 逻辑校验</div>
              <p>审核每个案卷的知识准确性与教育价值，确保推理过程严谨、解析清晰、要点到位。</p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* 底部 CTA */}
      <FadeIn>
        <section className="cta-section">
          <h2>
            准备好<em>破案</em>了吗？
          </h2>
          <p>选择一份精选案卷，或上传你自己的学习材料，开启第一段推理旅程。</p>
          <button className="btn-primary" onClick={goToPlay} type="button">
            <span>立即开始推理</span>
            <span className="arrow">→</span>
          </button>
        </section>
      </FadeIn>
    </div>
  );
};
