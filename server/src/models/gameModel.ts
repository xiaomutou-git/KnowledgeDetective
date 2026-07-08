/**
 * =========================================================
 * 文件：src/models/gameModel.ts
 * =========================================================
 * 功能说明：游戏记录数据模型与类型定义
 * - 定义 Game 实体结构，覆盖数据库 games 表字段
 * - 定义游戏状态、答案记录等子类型
 * - 提供类型安全的游戏数据操作契约
 *
 * 创建时间：2026-07-08
 * 核心用途：统一游戏记录领域对象类型
 * =========================================================
 */

/**
 * 游戏状态枚举
 * @description 游戏进行中的三种状态
 */
export type GameStatus = 'playing' | 'completed' | 'abandoned';

/**
 * 用户答案记录项
 * @description 每道题的用户作答记录
 */
export interface AnswerRecord {
  /** 问题标识 */
  questionId: string;
  /** 用户选择的选项标签 */
  selectedLabel: string;
  /** 是否正确 */
  isCorrect: boolean;
  /** 作答时间戳 */
  answeredAt: string;
}

/**
 * 游戏记录实体
 * @description 对应数据库 games 表的完整结构
 */
export interface Game {
  /** 游戏记录 ID */
  id: number;
  /** 关联案卷 ID */
  caseId: number;
  /** 用户标识 */
  userId: string;
  /** 游戏状态 */
  status: GameStatus;
  /** 得分 */
  score: number;
  /** 用户答案记录 */
  answers: AnswerRecord[];
  /** 完成时间 */
  completedAt: string | null;
  /** 创建时间 */
  createdAt: string;
  /** 更新时间 */
  updatedAt: string;
}

/**
 * 开始游戏的输入 DTO
 * @description 创建新游戏记录时传入的数据结构
 */
export interface CreateGameInput {
  /** 关联案卷 ID */
  caseId: number;
  /** 用户标识 */
  userId: string;
}

/**
 * 完成游戏的输入 DTO
 * @description 提交答案并完成游戏时传入的数据结构
 */
export interface CompleteGameInput {
  /** 用户选择的选项标签 */
  selectedLabel: string;
  /** 用户标识，用于校验 */
  userId: string;
}

/**
 * 完成游戏后的结果 DTO
 * @description 返回给用户，包含是否正确、正确答案与解析
 */
export interface CompleteGameResult {
  /** 是否回答正确 */
  correct: boolean;
  /** 正确答案标签 */
  correctLabel: string;
  /** 得分 */
  score: number;
  /** 解析信息 */
  analysis: {
    body: string;
    kps: string[];
    formula: string;
  };
  /** 知识卡 */
  card: {
    tag: string;
    title: string;
    subtitle: string;
    definition: string;
    explanation: string;
    application: string;
  };
}
