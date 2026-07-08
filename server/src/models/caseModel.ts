/**
 * =========================================================
 * 文件：src/models/caseModel.ts
 * =========================================================
 * 功能说明：案卷数据模型与类型定义
 * - 定义 Case 实体结构，覆盖数据库 cases 表字段
 * - 定义线索、选项、解析、知识卡等子类型
 * - 提供类型安全的案卷数据操作契约
 *
 * 创建时间：2026-07-08
 * 核心用途：统一案卷领域对象类型
 * =========================================================
 */

/**
 * 案卷线索项
 * @description 单个线索的结构，包含标题、提示、内容与洞察
 */
export interface ClueItem {
  /** 线索标题 */
  title: string;
  /** 提示文本 */
  hint: string;
  /** 线索详细内容 */
  content: string;
  /** 关键洞察 */
  insight: string;
}

/**
 * 案卷选项项
 * @description 单个问题的选项结构
 */
export interface OptionItem {
  /** 选项标签，如 A/B/C/D */
  label: string;
  /** 选项文本 */
  text: string;
  /** 是否为正确答案 */
  correct?: boolean;
}

/**
 * 案卷解析
 * @description 包含详细解析、要点、推理公式
 */
export interface CaseAnalysis {
  /** 详细解析文本 */
  body: string;
  /** 关键知识点列表 */
  kps: string[];
  /** 公式或关键推理步骤 */
  formula: string;
}

/**
 * 知识卡
 * @description 用于总结核心概念的知识卡片
 */
export interface KnowledgeCard {
  /** 分类标签 */
  tag: string;
  /** 核心概念名 */
  title: string;
  /** 一句话定义 */
  subtitle: string;
  /** 核心定义详细解释 */
  definition: string;
  /** 通俗易懂的生活化解释 */
  explanation: string;
  /** 应用场景说明 */
  application: string;
}

/**
 * 案卷实体
 * @description 对应数据库 cases 表的完整结构
 */
export interface Case {
  /** 案卷 ID */
  id: number;
  /** 案卷标题 */
  title: string;
  /** 副标题 */
  subtitle: string;
  /** 分类标签 */
  category: string;
  /** 难度 1-5 */
  difficulty: number;
  /** 场景描述 */
  scene: string;
  /** 线索数组 */
  clues: ClueItem[];
  /** 推理问题 */
  question: string;
  /** 选项数组 */
  options: OptionItem[];
  /** 解析 */
  analysis: CaseAnalysis;
  /** 知识卡 */
  card: KnowledgeCard;
  /** 是否种子数据 */
  isSeed: boolean;
  /** 创建时间 */
  createdAt: string;
  /** 更新时间 */
  updatedAt: string;
}

/**
 * 创建案卷的输入 DTO
 * @description 前端或 AI 服务生成案卷时传入的数据结构
 */
export interface CreateCaseInput {
  /** 案卷标题 */
  title: string;
  /** 副标题 */
  subtitle: string;
  /** 分类标签 */
  category?: string;
  /** 难度 1-5 */
  difficulty?: number;
  /** 场景描述 */
  scene: string;
  /** 线索数组 */
  clues: ClueItem[];
  /** 推理问题 */
  question: string;
  /** 选项数组 */
  options: OptionItem[];
  /** 解析 */
  analysis: CaseAnalysis;
  /** 知识卡 */
  card: KnowledgeCard;
  /** 是否种子数据 */
  isSeed?: boolean;
}

/**
 * 案卷列表查询过滤条件
 * @description 用于 GET /api/cases 的查询参数
 */
export interface CaseFilter {
  /** 分类标签过滤 */
  category?: string;
  /** 难度过滤 */
  difficulty?: number;
}
