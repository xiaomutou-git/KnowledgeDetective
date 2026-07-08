/* =========================================================
   知识侦探 · 推理游戏页组件
   =========================================================
 * @description 实现完整的推理游戏流程：案卷选择、自定义材料生成、
 *              场景阅读、线索收集、答题、解析、知识卡与本地档案库。
 * @author 知识侦探团队
 * @date 2026-07-08
 * ========================================================= */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { PageId } from '../../types/app';
import type { Case, Clue, ArchiveRecord } from '../../types/case';
import type { GamePhase, GenStep } from '../../types/game';
import { findCaseById } from '../../data/seedCases';
import { generateCaseFromText, ApiError } from '../../services/api';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { FadeIn } from '../common/FadeIn';

/** 生成步骤配置 */
const GEN_STEPS: GenStep[] = [
  { id: 'parse', num: 'STEP 01', title: '解析材料', sub: 'Extract Concepts', done: false, active: false },
  { id: 'build', num: 'STEP 02', title: '构建场景', sub: 'Build Scenario', done: false, active: false },
  { id: 'clues', num: 'STEP 03', title: '生成线索', sub: 'Create Clues', done: false, active: false },
  { id: 'question', num: 'STEP 04', title: '设计问题', sub: 'Design Question', done: false, active: false }
];

/** 生成动画文案 */
const GEN_QUOTES = [
  '正在分析材料中的关键概念…',
  '将抽象知识嵌入到侦探场景中…',
  '为每个关键概念设计可点击线索…',
  '生成具有迷惑性的选项与清晰解析…',
  '剧本即将完成，准备进入推理现场…'
];

/** 游戏页属性 */
interface GamePageProps {
  /** 案卷列表 */
  cases: Case[];
  /** 初始选中的案卷 id，可选 */
  initialCaseId?: string | null;
  /** 页面切换回调 */
  onNavigate: (page: PageId) => void;
}

/**
 * GamePage 组件
 * @param props - 组件属性
 * @returns 推理游戏页 JSX
 */
export const GamePage: React.FC<GamePageProps> = ({ cases, initialCaseId, onNavigate: _onNavigate }) => {
  const [phase, setPhase] = useState<GamePhase>('select');
  const [currentCase, setCurrentCase] = useState<Case | null>(null);
  const [collectedClueIds, setCollectedClueIds] = useState<Set<string>>(new Set());
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [customText, setCustomText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [genSteps, setGenSteps] = useState<GenStep[]>(GEN_STEPS);
  const [genQuote, setGenQuote] = useState('');
  const [expandedClueId, setExpandedClueId] = useState<string | null>(null);
  const [archives, setArchives] = useLocalStorage<ArchiveRecord[]>('kd_archives', []);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * 根据 initialCaseId 自动进入指定案卷
   */
  useEffect(() => {
    if (initialCaseId && phase === 'select') {
      const target = findCaseById(initialCaseId);
      if (target) {
        startExistingCase(target);
      }
    }
  }, [initialCaseId]);

  /**
   * 重置当前游戏状态
   */
  const resetGame = useCallback(() => {
    setCurrentCase(null);
    setCollectedClueIds(new Set());
    setSelectedOptionId(null);
    setIsCorrect(null);
    setExpandedClueId(null);
    setCustomText('');
    setError(null);
  }, []);

  /**
   * 进入案卷选择页
   */
  const goToSelect = useCallback(() => {
    resetGame();
    setPhase('select');
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.warn('[GamePage] 滚动到顶部失败：', err);
    }
  }, [resetGame]);

  /**
   * 开始一个已有案卷
   * @param caseItem - 案卷对象
   */
  const startExistingCase = useCallback((caseItem: Case) => {
    resetGame();
    setCurrentCase(caseItem);
    setPhase('scene');
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.warn('[GamePage] 滚动到顶部失败：', err);
    }
  }, [resetGame]);

  /**
   * 更新生成步骤状态
   * @param activeIndex - 当前激活的步骤索引
   */
  const updateGenSteps = useCallback((activeIndex: number) => {
    setGenSteps((prev) =>
      prev.map((step, index) => ({
        ...step,
        done: index < activeIndex,
        active: index === activeIndex
      }))
    );
  }, []);

  /**
   * 开始自定义材料生成流程
   */
  const handleGenerate = useCallback(async () => {
    const text = customText.trim();
    if (text.length < 50) {
      setError('请输入至少 50 字的材料，以便生成更完整的推理剧本。');
      return;
    }

    setIsLoading(true);
    setError(null);
    setPhase('generating');
    setGenSteps(GEN_STEPS);

    try {
      // 模拟生成步骤动画
      for (let i = 0; i < GEN_STEPS.length; i++) {
        updateGenSteps(i);
        setGenQuote(GEN_QUOTES[i] || '');
        await new Promise((resolve) => setTimeout(resolve, 900));
      }

      try {
        const generated = await generateCaseFromText(text);
        setCurrentCase(generated);
        setPhase('scene');
      } catch (err) {
        console.warn('[GamePage] 后端生成失败，使用本地案卷 fallback：', err);
        // 降级：根据文本长度选取一个本地案卷作为演示
        const fallback = cases[text.length % cases.length];
        if (fallback) {
          setCurrentCase(fallback);
          setPhase('scene');
          setError('后端服务不可用，已为你加载一份本地精选案卷作为演示。');
        } else {
          throw new ApiError('没有可用的本地案卷');
        }
      }
    } catch (err) {
      setPhase('select');
      if (err instanceof ApiError) {
        setError(`生成失败：${err.message}`);
      } else {
        setError('生成失败，请检查网络或稍后重试。');
      }
    } finally {
      setIsLoading(false);
      setGenQuote('');
    }
  }, [customText, cases, updateGenSteps]);

  /**
   * 处理文件选择
   * @param event - 文件选择事件
   */
  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const result = e.target?.result;
          if (typeof result === 'string') {
            setCustomText(result);
          }
        } catch (err) {
          console.warn('[GamePage] 读取文件内容失败：', err);
          setError('读取文件内容失败，请尝试复制文本后粘贴。');
        }
      };
      reader.onerror = () => {
        setError('文件读取出错，请检查文件格式。');
      };
      reader.readAsText(file);
    } catch (err) {
      console.warn('[GamePage] 处理文件选择失败：', err);
      setError('处理文件失败，请直接粘贴文本。');
    }
  }, []);

  /**
   * 触发文件选择框
   */
  const triggerFileInput = useCallback(() => {
    try {
      fileInputRef.current?.click();
    } catch (err) {
      console.warn('[GamePage] 触发文件选择失败：', err);
    }
  }, []);

  /**
   * 切换线索展开状态，并标记为已收集
   * @param clue - 线索对象
   */
  const toggleClue = useCallback((clue: Clue) => {
    try {
      setExpandedClueId((prev) => (prev === clue.id ? null : clue.id));
      setCollectedClueIds((prev) => {
        const next = new Set(prev);
        next.add(clue.id);
        return next;
      });
    } catch (err) {
      console.warn('[GamePage] 切换线索失败：', err);
    }
  }, []);

  /**
   * 提交答案
   */
  const submitAnswer = useCallback(() => {
    try {
      if (!selectedOptionId || !currentCase) return;
      const correct = selectedOptionId === currentCase.analysis.correctOptionId;
      setIsCorrect(correct);
      setPhase('analysis');
    } catch (err) {
      console.warn('[GamePage] 提交答案失败：', err);
    }
  }, [selectedOptionId, currentCase]);

  /**
   * 封存卷宗，保存到本地档案库
   */
  const archiveCase = useCallback(() => {
    try {
      if (!currentCase || isCorrect === null) return;
      const record: ArchiveRecord = {
        caseId: currentCase.id,
        archivedAt: Date.now(),
        isCorrect
      };
      setArchives((prev) => {
        const filtered = prev.filter((item) => item.caseId !== currentCase.id);
        return [record, ...filtered];
      });
      setPhase('knowledgeCard');
    } catch (err) {
      console.warn('[GamePage] 封存卷宗失败：', err);
      setError('封存卷宗失败，请重试。');
    }
  }, [currentCase, isCorrect, setArchives]);

  /**
   * 渲染难度圆点
   * @param difficulty - 难度等级
   */
  const renderDifficultyDots = (difficulty: number) => (
    <span className="difficulty-dots" aria-label={`难度 ${difficulty}/5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={`difficulty-dot ${i < difficulty ? 'filled' : ''}`} />
      ))}
    </span>
  );

  // ------------------ 选择案卷视图 ------------------
  const renderSelect = () => (
    <div className="page-section">
      <section className="hero is-small">
        <div className="hero-kicker">
          <span className="k-tag">PLAY</span>
          <span className="k-line" />
          <span>START INVESTIGATION</span>
        </div>
        <h1 className="hero-title">
          <span>选择你的</span>
          <span>
            <em>第一案</em>
          </span>
        </h1>
        <p className="hero-subtitle">从精选案卷中挑选一份卷宗，或使用自己的材料生成独家推理剧本。</p>
      </section>

      <section className="section section-alt">
        <FadeIn>
          <div className="section-head">
            <div className="section-title-wrap">
              <h2>
                精选<em>案卷</em>
              </h2>
              <span className="zh">点 击 进 入 推 理 现 场</span>
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
          {cases.map((caseItem, index) => (
            <FadeIn key={caseItem.id} delay={index * 0.08}>
              <button className="dossier" onClick={() => startExistingCase(caseItem)} type="button">
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

      <section className="custom-wrap">
        <FadeIn>
          <div className="custom-card">
            <div className="custom-card-head">
              <div className="ch-title">
                上传你的<em>卷宗</em>
              </div>
              <div className="ch-sub">CUSTOM DOSSIER</div>
            </div>
            <p className="custom-intro">
              粘贴任意学习材料，<em>AI 会自动将其转化为推理剧本</em>。建议文本长度不少于 50 字，支持 TXT、PDF、Word 格式。
            </p>
            <textarea
              className="custom-textarea"
              placeholder="在此粘贴你的学习材料、文章片段或课堂笔记..."
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              rows={8}
            />
            <div className="custom-meter">
              <span>字数</span>
              <span className="meter-bar">
                <span
                  className="meter-bar-fill"
                  style={{ width: `${Math.min(100, (customText.length / 200) * 100)}%` }}
                />
              </span>
              <span className={`meter-num ${customText.length >= 50 ? 'ok' : ''}`}>{customText.length}</span>
            </div>
            <div className="custom-foot">
              <div className="custom-foot-info">
                <span className="pulse-dot" />
                <span>本地处理 · 隐私优先</span>
              </div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.pdf,.doc,.docx"
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />
                <button className="btn-ghost" onClick={triggerFileInput} type="button" disabled={isLoading}>
                  <span>上传文件</span>
                </button>
                <button className="btn-primary" onClick={handleGenerate} type="button" disabled={isLoading}>
                  <span>生成剧本</span>
                  <span className="arrow">→</span>
                </button>
              </div>
            </div>
            {error && (
              <p style={{ marginTop: 16, color: 'var(--vermilion)', fontSize: 14 }}>
                {error}
              </p>
            )}
          </div>
        </FadeIn>
      </section>

      <FadeIn>
        <section className="cta-section">
          <h2>
            查看已封存<em>档案</em>
          </h2>
          <p>所有侦破记录都保存在本地档案库中，随时回顾知识卡。</p>
          <button className="btn-ghost" onClick={() => setPhase('archive')} type="button">
            <span>打开档案库</span>
          </button>
        </section>
      </FadeIn>
    </div>
  );

  // ------------------ 生成中视图 ------------------
  const renderGenerating = () => (
    <div className="gen-page page-section">
      <div className="gen-kicker">GENERATING CASE</div>
      <div className="gen-text">
        {genQuote}
        <span className="cursor" />
      </div>
      <div className="gen-steps">
        {genSteps.map((step) => (
          <div key={step.id} className={`gen-step ${step.active ? 'active' : ''} ${step.done ? 'done' : ''}`}>
            <div className="step-num">{step.num}</div>
            <div className="step-title">{step.title}</div>
            <div className="step-sub">{step.sub}</div>
            <div className="step-status">{step.done ? 'DONE' : step.active ? 'PROCESSING' : 'WAITING'}</div>
          </div>
        ))}
      </div>
    </div>
  );

  // ------------------ 场景视图 ------------------
  const renderScene = () => {
    if (!currentCase) return null;
    return (
      <div className="mystery page-section">
        <FadeIn>
          <div className="case-breadcrumb">
            <div className="bc-left">
              档案编号 <strong>CASE #{currentCase.num}</strong> · {currentCase.type}
            </div>
            <button className="case-back" onClick={goToSelect} type="button">
              ← 返回案卷库
            </button>
          </div>
        </FadeIn>

        <FadeIn>
          <h1 className="mystery-title">
            {currentCase.title} <em>{currentCase.enTitle}</em>
          </h1>
          <div className="mystery-subtitle">{currentCase.subtitle}</div>
          <div className="mystery-meta">
            {currentCase.tags.map((tag) => (
              <span key={tag} className="meta-chip">
                {tag}
              </span>
            ))}
            <span className="meta-chip">
              难度 <strong>{currentCase.difficulty}/5</strong>
            </span>
          </div>
        </FadeIn>

        <FadeIn>
          <div className="progress-wrap">
            <span className="progress-label">调 查 进 度</span>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: '25%' }} />
            </div>
            <span className="progress-stats">
              <strong>01</strong> / 04
            </span>
          </div>
        </FadeIn>

        <FadeIn>
          <div className="scene-box">
            {currentCase.scene.map((paragraph, index) => (
              <p key={index} className="visible">
                {paragraph}
              </p>
            ))}
          </div>
        </FadeIn>

        <FadeIn>
          <div className="cta-row" style={{ justifyContent: 'center', marginTop: 60 }}>
            <button className="btn-primary" onClick={() => setPhase('clues')} type="button">
              <span>开始收集线索</span>
              <span className="arrow">→</span>
            </button>
          </div>
        </FadeIn>
      </div>
    );
  };

  // ------------------ 线索视图 ------------------
  const renderClues = () => {
    if (!currentCase) return null;
    const allCollected = collectedClueIds.size >= currentCase.clues.length;
    return (
      <div className="mystery page-section">
        <FadeIn>
          <div className="case-breadcrumb">
            <div className="bc-left">
              档案编号 <strong>CASE #{currentCase.num}</strong> · 线索收集
            </div>
            <button className="case-back" onClick={() => setPhase('scene')} type="button">
              ← 返回场景
            </button>
          </div>
        </FadeIn>

        <FadeIn>
          <div className="progress-wrap">
            <span className="progress-label">调 查 进 度</span>
            <div className="progress-track">
              <div
                className="progress-fill"
                style={{ width: `${25 + (collectedClueIds.size / currentCase.clues.length) * 25}%` }}
              />
            </div>
            <span className="progress-stats">
              <strong>{String(collectedClueIds.size).padStart(2, '0')}</strong> / {String(currentCase.clues.length).padStart(2, '0')}
            </span>
          </div>
        </FadeIn>

        <section className="clue-section">
          <FadeIn>
            <div className="clue-head">
              <h3>
                收集<em>线索</em>
              </h3>
              <div className="ch-hint">CLICK TO REVEAL</div>
            </div>
          </FadeIn>
          <div className="clue-grid">
            {currentCase.clues.map((clue, index) => (
              <FadeIn key={clue.id} delay={index * 0.06}>
                <div
                  className={`clue-card ${expandedClueId === clue.id ? 'expanded' : ''} ${collectedClueIds.has(clue.id) ? 'collected' : ''}`}
                  onClick={() => toggleClue(clue)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') toggleClue(clue);
                  }}
                >
                  <div className="clue-num">{String(index + 1).padStart(2, '0')}</div>
                  <h4>{clue.title}</h4>
                  <div className="clue-hint">{clue.hint}</div>
                  <div className="clue-body">
                    <p className="clue-body-text">{clue.body}</p>
                    <div className="clue-insight">{clue.insight}</div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </section>

        <FadeIn>
          <div className="cta-row" style={{ justifyContent: 'center', marginTop: 60 }}>
            <button className="btn-primary" onClick={() => setPhase('question')} disabled={!allCollected} type="button">
              <span>{allCollected ? '进入推理问题' : '先收集所有线索'}</span>
              <span className="arrow">→</span>
            </button>
          </div>
        </FadeIn>
      </div>
    );
  };

  // ------------------ 问题视图 ------------------
  const renderQuestion = () => {
    if (!currentCase) return null;
    return (
      <div className="mystery page-section">
        <FadeIn>
          <div className="case-breadcrumb">
            <div className="bc-left">
              档案编号 <strong>CASE #{currentCase.num}</strong> · 推理判断
            </div>
            <button className="case-back" onClick={() => setPhase('clues')} type="button">
              ← 返回线索
            </button>
          </div>
        </FadeIn>

        <FadeIn>
          <div className="progress-wrap">
            <span className="progress-label">调 查 进 度</span>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: '75%' }} />
            </div>
            <span className="progress-stats">
              <strong>03</strong> / 04
            </span>
          </div>
        </FadeIn>

        <FadeIn>
          <div className="question-box">
            <div className="q-kicker">推理问题</div>
            <h2 className="question-text">{currentCase.question}</h2>
            <div className="option-list">
              {currentCase.options.map((option) => (
                <div
                  key={option.id}
                  className={`option ${selectedOptionId === option.id ? 'selected' : ''}`}
                  onClick={() => setSelectedOptionId(option.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') setSelectedOptionId(option.id);
                  }}
                >
                  <div className="option-label">{option.id}</div>
                  <div className="option-text">{option.text}</div>
                </div>
              ))}
            </div>
            <div className="option-hint">选择你认为正确的选项，点击提交查看解析。</div>
          </div>
        </FadeIn>

        <FadeIn>
          <div className="cta-row" style={{ justifyContent: 'center', marginTop: 40 }}>
            <button className="btn-primary" onClick={submitAnswer} disabled={!selectedOptionId} type="button">
              <span>提交推理</span>
              <span className="arrow">→</span>
            </button>
          </div>
        </FadeIn>
      </div>
    );
  };

  // ------------------ 解析视图 ------------------
  const renderAnalysis = () => {
    if (!currentCase) return null;
    return (
      <div className="mystery page-section">
        <FadeIn>
          <div className="case-breadcrumb">
            <div className="bc-left">
              档案编号 <strong>CASE #{currentCase.num}</strong> · 案情解析
            </div>
            <button className="case-back" onClick={() => setPhase('question')} type="button">
              ← 重新选择
            </button>
          </div>
        </FadeIn>

        <FadeIn>
          <div className="analysis-box show">
            <div className="analysis-kicker">{isCorrect ? '推理正确' : '推理有误'}</div>
            <h2 className="analysis-title">
              {isCorrect ? '恭喜你，成功' : '很遗憾，未能'}看破<em>真相</em>
            </h2>
            <div className="analysis-body">
              <p>{currentCase.analysis.body}</p>
            </div>
            <div className="analysis-kps">
              {currentCase.analysis.keyPoints.map((point, index) => (
                <div key={index} className="analysis-kp" style={{ animationDelay: `${index * 0.1}s` }}>
                  <span>{point}</span>
                </div>
              ))}
            </div>
            {currentCase.analysis.formula && (
              <div className="analysis-formula">{currentCase.analysis.formula}</div>
            )}
          </div>
        </FadeIn>

        <FadeIn>
          <button className={`unlock-btn show`} onClick={archiveCase} type="button">
            封存卷宗，生成知识卡
          </button>
        </FadeIn>
      </div>
    );
  };

  // ------------------ 知识卡视图 ------------------
  const renderKnowledgeCard = () => {
    if (!currentCase) return null;
    const card = currentCase.knowledgeCard;
    return (
      <div className="card-page page-section">
        <FadeIn>
          <div className="knowledge-card">
            <div className="kc-header">
              <div className="kc-label">KNOWLEDGE CARD</div>
              <div className="kc-ref">REF: {currentCase.num}</div>
            </div>
            <h1 className="kc-title">
              {card.concept} <em>{currentCase.enTitle}</em>
            </h1>
            <div className="kc-subtitle">{currentCase.subtitle}</div>

            <section className="kc-section">
              <div className="kc-section-head">
                <div className="kc-section-title">核心定义</div>
                <div className="kc-section-num">01</div>
              </div>
              <div className="kc-section-body">
                <p>{card.definition}</p>
              </div>
            </section>

            <section className="kc-section">
              <div className="kc-section-head">
                <div className="kc-section-title">通俗解释</div>
                <div className="kc-section-num">02</div>
              </div>
              <div className="kc-section-body">
                <p>{card.explanation}</p>
              </div>
            </section>

            <section className="kc-section">
              <div className="kc-section-head">
                <div className="kc-section-title">应用场景</div>
                <div className="kc-section-num">03</div>
              </div>
              <div className="kc-section-body">
                <p>{card.application}</p>
              </div>
            </section>

            <div className="kc-footer">
              <div className="kc-pagenum">PAGE 01 / 01</div>
              <div className="kc-signature">Knowledge Detective</div>
            </div>
          </div>
        </FadeIn>

        <FadeIn>
          <div className="kc-actions">
            <button className="btn-ghost" onClick={goToSelect} type="button">
              <span>返回案卷库</span>
            </button>
            <button className="btn-primary" onClick={() => setPhase('archive')} type="button">
              <span>查看档案库</span>
              <span className="arrow">→</span>
            </button>
          </div>
        </FadeIn>
      </div>
    );
  };

  // ------------------ 档案库视图 ------------------
  const renderArchive = () => {
    const archivedCases = archives
      .map((record) => ({ record, caseItem: findCaseById(record.caseId) }))
      .filter((item) => item.caseItem);

    return (
      <div className="archive-page page-section">
        <FadeIn>
          <div className="archive-head">
            <h2>
              本地<em>档案库</em>
            </h2>
            <div className="ah-sub">
              ARCHIVED <strong>CASES</strong>
              <br />
              LOCAL STORAGE
            </div>
          </div>
        </FadeIn>

        {archivedCases.length === 0 ? (
          <FadeIn>
            <div className="archive-empty">
              <span className="icon">∅</span>
              暂无封存档案，快去侦破你的第一个案件吧。
            </div>
          </FadeIn>
        ) : (
          <div className="archive-table">
            <div className="archive-head-row">
              <span>编号</span>
              <span>类型</span>
              <span>案卷</span>
              <span>简介</span>
              <span>状态</span>
            </div>
            {archivedCases.map(({ record, caseItem }, index) => {
              if (!caseItem) return null;
              const date = new Date(record.archivedAt).toLocaleDateString('zh-CN');
              return (
                <FadeIn key={`${caseItem.id}-${record.archivedAt}`} delay={index * 0.06}>
                  <div className="archive-row" onClick={() => startExistingCase(caseItem)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') startExistingCase(caseItem); }}>
                    <div className="ar-cell num">{caseItem.num}</div>
                    <div className="ar-cell tag">{caseItem.type}</div>
                    <div className="ar-cell title">{caseItem.title}</div>
                    <div className="ar-cell desc">
                      {caseItem.subtitle}
                      <span className="ar-date-inline">{date}</span>
                    </div>
                    <div className="ar-cell action">
                      <span className="seal-mark">{record.isCorrect ? '推理正确' : '已复盘'}</span>
                    </div>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        )}

        <FadeIn>
          <div className="cta-row" style={{ justifyContent: 'center', marginTop: 60 }}>
            <button className="btn-ghost" onClick={goToSelect} type="button">
              <span>返回案卷库</span>
            </button>
          </div>
        </FadeIn>
      </div>
    );
  };

  // ------------------ 主渲染 ------------------
  switch (phase) {
    case 'select':
      return renderSelect();
    case 'generating':
      return renderGenerating();
    case 'scene':
      return renderScene();
    case 'clues':
      return renderClues();
    case 'question':
      return renderQuestion();
    case 'analysis':
      return renderAnalysis();
    case 'knowledgeCard':
      return renderKnowledgeCard();
    case 'archive':
      return renderArchive();
    default:
      return renderSelect();
  }
};
