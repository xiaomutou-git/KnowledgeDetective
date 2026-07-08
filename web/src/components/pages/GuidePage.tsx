/* =========================================================
   知识侦探 · 使用指南页组件
   =========================================================
 * @description 提供快速开始、详细操作步骤、环境配置与 FAQ 的使用指南页面。
 * @author 知识侦探团队
 * @date 2026-07-08
 * ========================================================= */

import React, { useState } from 'react';
import type { PageId } from '../../types/app';
import { FadeIn } from '../common/FadeIn';

/** 快速开始步骤 */
const QUICK_START_STEPS = [
  {
    num: 'STEP 01',
    title: '克隆项目并安装依赖',
    body: 'git clone git@github.com:xiaomutou-git/KnowledgeDetective.git\ncd KnowledgeDetective\npnpm install',
    extra: null
  },
  {
    num: 'STEP 02',
    title: '配置 AI API Key',
    body: 'cp .env.example .env\n# 编辑 .env 文件，填入你的 API Key\nAI_API_KEY=your-api-key-here',
    extra: '推荐使用硅基流动 SiliconFlow，新用户赠送 2000 万 Token。'
  },
  {
    num: 'STEP 03',
    title: '启动本地代理服务器',
    body: 'node proxy-server.js',
    extra: '服务默认运行在 http://localhost:4315。'
  },
  {
    num: 'STEP 04',
    title: '打开浏览器开始推理',
    body: '访问首页 http://localhost:4315/，点击「开始推理」进入游戏页面，选择案卷或上传自己的材料。',
    extra: null
  }
];

/** 操作指南步骤 */
const OPERATION_STEPS = [
  { icon: '01', title: '选择案卷', desc: '进入推理页面后，可以从精选案卷中选择一个主题，或滚动到页面底部使用「上传你的卷宗」功能。' },
  { icon: '02', title: '阅读场景', desc: '仔细阅读案件背景故事。场景会逐步揭示关键信息，帮助你将抽象概念嵌入到具体情境中。' },
  { icon: '03', title: '收集线索', desc: '点击线索卡片查看详细信息。所有线索收集完毕后，才能对推理问题做出判断。' },
  { icon: '04', title: '回答问题', desc: '根据场景与线索，选择你认为正确的选项。提交后会立即显示答案与详细解析。' },
  { icon: '05', title: '查看解析', desc: '解析包含正确答案、关键要点、公式推导与知识拓展。即使答错，也能从解析中完成学习。' },
  { icon: '06', title: '封存档案', desc: '点击「封存卷宗」生成知识卡。知识卡会自动保存到浏览器的本地档案库，方便随时复习。' }
];

/** FAQ 数据 */
const FAQS = [
  {
    question: '知识侦探需要联网吗？',
    answer: '本地服务启动后，前端页面可以直接在浏览器中打开。但如果你使用「自定义卷宗」功能让 AI 生成剧本，则需要联网调用 AI API。'
  },
  {
    question: 'API Key 会暴露在前端吗？',
    answer: '不会。API Key 仅存储在服务器的环境变量中，由 proxy-server.js 代理调用 AI API。前端只与本地代理通信，不会直接接触 API Key。'
  },
  {
    question: '支持哪些文档格式？',
    answer: '当前支持直接粘贴文本、上传 TXT 文件、PDF 文件（依赖 pdf.js）以及 Word 文档（依赖 mammoth.js）。建议文本长度不少于 50 字，以获得更好的生成效果。'
  },
  {
    question: '我的案件数据会被保存到哪里？',
    answer: '所有案件数据与知识卡都保存在浏览器的 localStorage 中，不会上传到服务器。清理浏览器数据会导致本地档案丢失，请知悉。'
  },
  {
    question: '生成失败怎么办？',
    answer: '请检查：1) API Key 是否正确配置；2) 网络连接是否正常；3) 输入文本是否过短或包含特殊格式。你也可以通过 /api/health 接口检查服务器与 AI 配置状态。'
  }
];

/** 指南页属性 */
interface GuidePageProps {
  /** 页面切换回调 */
  onNavigate: (page: PageId) => void;
}

/**
 * GuidePage 组件
 * @param props - 组件属性
 * @returns 使用指南页 JSX
 */
export const GuidePage: React.FC<GuidePageProps> = ({ onNavigate }) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  /**
   * 切换 FAQ 展开状态
   * @param index - FAQ 索引
   */
  const toggleFaq = (index: number) => {
    try {
      setOpenFaqIndex((prev) => (prev === index ? null : index));
    } catch (err) {
      console.warn('[GuidePage] 切换 FAQ 失败：', err);
    }
  };

  /**
   * 进入游戏页
   */
  const goToPlay = () => {
    try {
      onNavigate('play');
    } catch (err) {
      console.warn('[GuidePage] 跳转游戏页失败：', err);
    }
  };

  return (
    <div className="page-section">
      {/* 页面 Hero */}
      <section className="hero is-small">
        <div className="hero-kicker">
          <span className="k-tag">GUIDE</span>
          <span className="k-line" />
          <span>USER MANUAL</span>
        </div>
        <h1 className="hero-title">
          <span>使用</span>
          <span>
            <em>指南</em>
          </span>
        </h1>
        <p className="hero-subtitle">从安装配置到推理结案，一份完整的侦探手册。</p>
      </section>

      {/* 快速开始 */}
      <section className="section section-alt" id="quickstart">
        <FadeIn>
          <div className="section-head">
            <div className="section-title-wrap">
              <h2>
                快速<em>开始</em>
              </h2>
              <span className="zh">五 分 钟 内 启 动 你 的 第 一 个 案 件</span>
            </div>
            <div className="section-meta">
              <div>
                QUICK <strong>START</strong>
              </div>
              <div>GET UP AND RUNNING</div>
            </div>
          </div>
        </FadeIn>
        <div className="timeline">
          {QUICK_START_STEPS.map((step, index) => (
            <FadeIn key={step.num} delay={index * 0.08}>
              <div className={`timeline-item ${index === 0 ? 'active' : ''}`}>
                <div className="timeline-dot" />
                <div className="timeline-content">
                  <span className="step-num">{step.num}</span>
                  <h4>{step.title}</h4>
                  <div className="code-block">{step.body}</div>
                  {step.extra && <p style={{ marginTop: 14 }}>{step.extra}</p>}
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* 详细操作指南 */}
      <section className="section">
        <FadeIn>
          <div className="section-head">
            <div className="section-title-wrap">
              <h2>
                操作<em>指南</em>
              </h2>
              <span className="zh">从 开 卷 到 封 存 的 完 整 流 程</span>
            </div>
            <div className="section-meta">
              <div>
                DETAILED <strong>OPERATIONS</strong>
              </div>
              <div>CASE WORKFLOW</div>
            </div>
          </div>
        </FadeIn>
        <div className="card-grid">
          {OPERATION_STEPS.map((step, index) => (
            <FadeIn key={step.title} delay={index * 0.08}>
              <div className="feature-card">
                <div className="card-icon">{step.icon}</div>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* 环境配置 */}
      <section className="section section-alt" id="env">
        <FadeIn>
          <div className="section-head">
            <div className="section-title-wrap">
              <h2>
                环境<em>配置</em>
              </h2>
              <span className="zh">服 务 启 动 前 的 准 备 工 作</span>
            </div>
            <div className="section-meta">
              <div>
                ENVIRONMENT <strong>SETUP</strong>
              </div>
              <div>REQUIREMENTS & CONFIG</div>
            </div>
          </div>
        </FadeIn>
        <FadeIn>
          <div className="feature-card" style={{ marginBottom: 24 }}>
            <div className="card-icon">req</div>
            <h3>系统要求</h3>
            <p>Node.js &gt;= 14.0.0 · 现代浏览器（Chrome / Edge / Firefox / Safari）· 网络连接（用于调用 AI API）</p>
          </div>
        </FadeIn>
        <FadeIn>
          <div className="feature-card" style={{ marginBottom: 24 }}>
            <div className="card-icon">env</div>
            <h3>环境变量说明</h3>
            <p style={{ marginBottom: 14 }}>
              在 <code style={{ fontFamily: "'JetBrains Mono', monospace", background: 'var(--paper-1)', padding: '2px 6px' }}>.env</code>{' '}
              文件中配置以下变量：
            </p>
            <div className="code-block">
              {'AI_API_KEY=your-api-key-here\nAI_ENDPOINT=https://api.siliconflow.cn/v1/chat/completions\nAI_MODEL=Qwen/Qwen2.5-7B-Instruct'}
            </div>
          </div>
        </FadeIn>
        <FadeIn>
          <div className="feature-card">
            <div className="card-icon">run</div>
            <h3>启动命令</h3>
            <div className="code-block">node proxy-server.js</div>
            <p style={{ marginTop: 14 }}>启动成功后，控制台会打印访问地址与 API 状态。如果 API Key 未配置，服务器会提示并退出。</p>
          </div>
        </FadeIn>
      </section>

      {/* FAQ */}
      <section className="section" id="faq">
        <FadeIn>
          <div className="section-head">
            <div className="section-title-wrap">
              <h2>
                常见<em>问题</em>
              </h2>
              <span className="zh">FAQ · 解 答 你 的 疑 惑</span>
            </div>
            <div className="section-meta">
              <div>
                FREQUENTLY <strong>ASKED</strong>
              </div>
              <div>QUESTIONS</div>
            </div>
          </div>
        </FadeIn>
        <div className="faq-list">
          {FAQS.map((faq, index) => (
            <FadeIn key={faq.question} delay={index * 0.06}>
              <div className={`faq-item ${openFaqIndex === index ? 'open' : ''}`}>
                <button className="faq-question" onClick={() => toggleFaq(index)} type="button" aria-expanded={openFaqIndex === index}>
                  <span>{faq.question}</span>
                  <span className="q-icon">+</span>
                </button>
                <div className="faq-answer">
                  <p>{faq.answer}</p>
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
            还有<em>疑问</em>？
          </h2>
          <p>前往 GitHub 提交 Issue，或直接进入游戏页面开始体验。</p>
          <div className="cta-row" style={{ justifyContent: 'center' }}>
            <a
              className="btn-ghost"
              href="https://github.com/xiaomutou-git/KnowledgeDetective/issues"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>提交反馈</span>
            </a>
            <button className="btn-primary" onClick={goToPlay} type="button">
              <span>开始推理</span>
              <span className="arrow">→</span>
            </button>
          </div>
        </section>
      </FadeIn>
    </div>
  );
};
