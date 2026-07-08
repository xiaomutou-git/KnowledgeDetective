/* =========================================================
   知识侦探 · 案卷类型定义
   =========================================================
 * @description 定义推理游戏中案卷、线索、选项、解析与知识卡的核心数据结构，
 *              为组件、服务与本地 seed 数据提供类型约束。
 * @author 知识侦探团队
 * @date 2026-07-08
 * ========================================================= */

/**
 * 线索项
 * @description 案件中可点击收集的线索卡片，承载一个关键概念或信息。
 */
export interface Clue {
  /** 线索唯一标识 */
  id: string;
  /** 线索标题 */
  title: string;
  /** 线索提示语，用于未展开时提示 */
  hint: string;
  /** 线索正文 */
  body: string;
  /** 线索洞察，点明与该线索相关的核心概念 */
  insight: string;
}

/**
 * 选项项
 * @description 推理问题的可选答案。
 */
export interface Option {
  /** 选项唯一标识，通常为 A/B/C/D */
  id: string;
  /** 选项文本 */
  text: string;
}

/**
 * 解析内容
 * @description 用户提交答案后展示的详细解析。
 */
export interface Analysis {
  /** 正确选项的 id */
  correctOptionId: string;
  /** 解析正文 */
  body: string;
  /** 关键要点列表 */
  keyPoints: string[];
  /** 公式或推导过程，支持多行文本 */
  formula: string;
}

/**
 * 知识卡
 * @description 案件结束后自动生成的知识档案卡，用于长期复习。
 */
export interface KnowledgeCard {
  /** 核心概念 */
  concept: string;
  /** 核心定义 */
  definition: string;
  /** 通俗解释 */
  explanation: string;
  /** 实际应用场景 */
  application: string;
}

/**
 * 案卷
 * @description 一个完整的推理案件，包含场景、线索、问题、解析与知识卡。
 */
export interface Case {
  /** 案卷唯一标识 */
  id: string;
  /** 案卷编号，如 001 */
  num: string;
  /** 案卷中文标题 */
  title: string;
  /** 案卷英文标题 */
  enTitle: string;
  /** 案件副标题 */
  subtitle: string;
  /** 学科/思维类型标签 */
  type: string;
  /** 难度 1-5 */
  difficulty: number;
  /** 关键词标签 */
  tags: string[];
  /** 场景描述，支持多个段落 */
  scene: string[];
  /** 线索列表 */
  clues: Clue[];
  /** 推理问题 */
  question: string;
  /** 选项列表 */
  options: Option[];
  /** 解析内容 */
  analysis: Analysis;
  /** 知识卡内容 */
  knowledgeCard: KnowledgeCard;
}

/**
 * 存档记录
 * @description 已封存案件在 localStorage 中的持久化结构。
 */
export interface ArchiveRecord {
  /** 案卷 id */
  caseId: string;
  /** 封存时间戳 */
  archivedAt: number;
  /** 是否正确答对 */
  isCorrect: boolean;
}
