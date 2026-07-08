/* =========================================================
   知识侦探 · 案例展示页组件
   =========================================================
 * @description 展示精选案卷列表、用户反馈与 CTA，支持点击案卷直接进入推理。
 * @author 知识侦探团队
 * @date 2026-07-08
 * ========================================================= */

import React from 'react';
import type { PageId } from '../../types/app';
import type { Case } from '../../types/case';
import { FadeIn } from '../common/FadeIn';

/** 用户反馈数据 */
const TESTIMONIALS = [
  { title: '把概率变得可触摸', quote: '「贝叶斯案卷让我第一次真正理解，为什么检测准确率 99% 并不意味着患病概率 99%。」' },
  { title: '自定义材料超实用', quote: '「我把课堂论文贴进去，AI 生成的线索和问题居然精准对应了核心论点，复习效率翻倍。」' },
  { title: '知识卡是复习神器', quote: '「每次封存卷宗后生成的知识卡，帮我建立了清晰的概念档案，考前翻一翻特别有效。」' }
];

/** 案例页属性 */
interface CasesPageProps {
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
 * CasesPage 组件
 * @param props - 组件属性
 * @returns 案例展示页 JSX
 */
export const CasesPage: React.FC<CasesPageProps> = ({ cases, onNavigate, onStartCase }) => {
  /**
   * 进入游戏页
   */
  const goToPlay = () => {
    try {
      onNavigate('play');
    } catch (err) {
      console.warn('[CasesPage] 跳转游戏页失败：', err);
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
      console.warn('[CasesPage] 开始案卷失败：', err);
    }
  };

  return (
    <div className="page-section">
      {/* 页面 Hero */}
      <section className="hero is-small">
        <div className="hero-kicker">
          <span className="k-tag">CASES</span>
          <span className="k-line" />
          <span>FEATURED DOSSIERS</span>
        </div>
        <h1 className="hero-title">
          <span>精选</span>
          <span>
            <em>案卷</em>
          </span>
        </h1>
        <p className="hero-subtitle">每一个案卷都是一次思维训练。点击任意案件，即可进入推理现场。</p>
      </section>

      {/* 案例列表 */}
      <section className="section section-alt">
        <FadeIn>
          <div className="section-head">
            <div className="section-title-wrap">
              <h2>
                悬案<em>待解</em>
              </h2>
              <span className="zh">跨 学 科 思 维 模 型 · 沉 浸 式 推 理</span>
            </div>
            <div className="section-meta">
              <div>
                OPEN <strong>CASES</strong>
              </div>
              <div>CLICK TO INVESTIGATE</div>
            </div>
          </div>
        </FadeIn>
        <div className="dossier-list">
          {cases.map((caseItem, index) => (
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
                  <div className="dossier-desc">{caseItem.scene.join(' ')}</div>
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

      {/* 用户反馈 */}
      <section className="section">
        <FadeIn>
          <div className="section-head">
            <div className="section-title-wrap">
              <h2>
                推理<em>反馈</em>
              </h2>
              <span className="zh">来 自 试 用 侦 探 的 档 案 记 录</span>
            </div>
            <div className="section-meta">
              <div>
                DETECTIVE <strong>FEEDBACK</strong>
              </div>
              <div>FROM THE FIELD</div>
            </div>
          </div>
        </FadeIn>
        <div className="card-grid">
          {TESTIMONIALS.map((item, index) => (
            <FadeIn key={item.title} delay={index * 0.08}>
              <div className="feature-card">
                <div className="card-icon">"</div>
                <h3>{item.title}</h3>
                <p>{item.quote}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* 底部 CTA */}
      <FadeIn>
        <section className="cta-section">
          <h2>
            选择你的<em>第一案</em>
          </h2>
          <p>从精选案卷开始，或上传自己的材料生成独家推理剧本。</p>
          <button className="btn-primary" onClick={goToPlay} type="button">
            <span>立即破案</span>
            <span className="arrow">→</span>
          </button>
        </section>
      </FadeIn>
    </div>
  );
};
