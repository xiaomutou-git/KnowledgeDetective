/* =========================================================
   知识侦探 · 功能特性页组件
   =========================================================
 * @description 展示产品六大核心功能与四步操作流程，引导用户进入推理游戏。
 * @author 知识侦探团队
 * @date 2026-07-08
 * ========================================================= */

import React from 'react';
import type { PageId } from '../../types/app';
import { FadeIn } from '../common/FadeIn';

/** 核心功能数据 */
const FEATURES = [
  { icon: '§', title: 'AI 自动编卷', desc: '基于大语言模型，将用户输入的文章自动解析为核心概念，并生成包含场景描述、线索、问题、选项与解析的完整推理剧本。' },
  { icon: '◆', title: '沉浸式线索系统', desc: '线索以卡片形式呈现，用户需要主动点击收集。每条线索都对应一个关键概念，收集完整后才能解锁推理问题。' },
  { icon: '∞', title: '无限自定义案件', desc: '支持直接粘贴文本，或通过浏览器 File API 读取 TXT、PDF、Word 文档。任何知识材料都能被转化为独家案卷。' },
  { icon: '✓', title: '即时反馈解析', desc: '提交答案后立即显示正确与否，并提供详细解析、关键要点（Key Points）和公式推导，巩固学习效果。' },
  { icon: '◈', title: '知识卡封存', desc: '破案成功后自动生成知识档案卡，沉淀核心定义、通俗解释与实际应用场景，形成可长期复习的知识资产。' },
  { icon: '⊕', title: '跨学科思维模型', desc: '内置概率、统计、博弈论、逻辑思维、认知偏差、第一性原理等多领域案卷，帮助用户建立可迁移的思维框架。' }
];

/** 操作步骤数据 */
const STEPS = [
  { num: 'STEP 01', title: '输入材料', desc: '粘贴文章文本，或上传 TXT / PDF / Word 文档。系统会自动提取文字内容，作为生成推理剧本的原材料。' },
  { num: 'STEP 02', title: 'AI 生成剧本', desc: '后端代理调用 AI API，基于材料生成标题、场景、线索、问题、选项与解析，并返回纯 JSON 数据供前端渲染。' },
  { num: 'STEP 03', title: '收集线索并推理', desc: '阅读案件场景，点击线索卡片获取关键信息。所有线索收集完毕后，分析选项并提交你的推理判断。' },
  { num: 'STEP 04', title: '查看解析并封存', desc: '系统展示正确答案与详细解析，最后点击「封存卷宗」生成知识卡，案件自动存入本地档案库。' }
];

/** 功能页属性 */
interface FeaturesPageProps {
  /** 页面切换回调 */
  onNavigate: (page: PageId) => void;
}

/**
 * FeaturesPage 组件
 * @param props - 组件属性
 * @returns 功能特性页 JSX
 */
export const FeaturesPage: React.FC<FeaturesPageProps> = ({ onNavigate }) => {
  /**
   * 进入游戏页
   */
  const goToPlay = () => {
    try {
      onNavigate('play');
    } catch (err) {
      console.warn('[FeaturesPage] 跳转游戏页失败：', err);
    }
  };

  return (
    <div className="page-section">
      {/* 页面 Hero */}
      <section className="hero is-small">
        <div className="hero-kicker">
          <span className="k-tag">FEATURES</span>
          <span className="k-line" />
          <span>CORE CAPABILITIES</span>
        </div>
        <h1 className="hero-title">
          <span>六大核心</span>
          <span>
            <em>功能</em>
          </span>
        </h1>
        <p className="hero-subtitle">
          从 AI 剧本生成到知识卡封存，每一个环节都为了让「理解」这件事变得更自然、更有趣。
        </p>
      </section>

      {/* 功能详情 */}
      <section className="section section-alt">
        <FadeIn>
          <div className="section-head">
            <div className="section-title-wrap">
              <h2>
                功能<em>详解</em>
              </h2>
              <span className="zh">每 一 项 都 为 深 度 学 习 而 设 计</span>
            </div>
            <div className="section-meta">
              <div>
                DEEP <strong>DIVE</strong>
              </div>
              <div>INTO CAPABILITIES</div>
            </div>
          </div>
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

      {/* 操作流程时间线 */}
      <section className="section">
        <FadeIn>
          <div className="section-head">
            <div className="section-title-wrap">
              <h2>
                操作<em>流程</em>
              </h2>
              <span className="zh">四 步 完 成 一 次 推 理 旅 程</span>
            </div>
            <div className="section-meta">
              <div>
                HOW IT <strong>WORKS</strong>
              </div>
              <div>FROM TEXT TO CASE</div>
            </div>
          </div>
        </FadeIn>
        <div className="timeline">
          {STEPS.map((step, index) => (
            <FadeIn key={step.num} delay={index * 0.08}>
              <div className={`timeline-item ${index === 0 ? 'active' : ''}`}>
                <div className="timeline-dot" />
                <div className="timeline-content">
                  <span className="step-num">{step.num}</span>
                  <h4>{step.title}</h4>
                  <p>{step.desc}</p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* 底部 CTA */}
      <FadeIn>
        <section className="cta-section">
          <h2>
            体验完整<em>功能</em>
          </h2>
          <p>无需注册，打开浏览器即可开始你的第一次推理。</p>
          <button className="btn-primary" onClick={goToPlay} type="button">
            <span>开始推理</span>
            <span className="arrow">→</span>
          </button>
        </section>
      </FadeIn>
    </div>
  );
};
