/* =========================================================
   知识侦探 · 游戏状态类型定义
   =========================================================
 * @description 定义推理游戏页面中的阶段、视图与运行时状态，
 *              用于在 React 组件间共享一致的状态语义。
 * @author 知识侦探团队
 * @date 2026-07-08
 * ========================================================= */

import type { Case } from './case';

/**
 * 游戏主阶段
 * @description 控制 GamePage 中当前展示的视图。
 */
export type GamePhase =
  /** 选择案卷或自定义材料 */
  | 'select'
  /** AI 生成剧本中 */
  | 'generating'
  /** 阅读场景 */
  | 'scene'
  /** 收集线索 */
  | 'clues'
  /** 回答问题 */
  | 'question'
  /** 查看解析 */
  | 'analysis'
  /** 查看知识卡 */
  | 'knowledgeCard'
  /** 查看本地档案库 */
  | 'archive';

/**
 * 自定义材料来源
 * @description 用户进入自定义案件时选择的输入方式。
 */
export type CustomInputType = 'text' | 'file';

/**
 * 生成步骤
 * @description AI 生成剧本时展示的进度步骤。
 */
export interface GenStep {
  /** 步骤唯一标识 */
  id: string;
  /** 步骤序号 */
  num: string;
  /** 步骤标题 */
  title: string;
  /** 步骤副标题 */
  sub: string;
  /** 是否已完成 */
  done: boolean;
  /** 是否进行中 */
  active: boolean;
}

/**
 * 游戏运行时状态
 * @description GamePage 组件内部维护的核心状态对象。
 */
export interface GameState {
  /** 当前阶段 */
  phase: GamePhase;
  /** 当前正在进行的案卷 */
  currentCase: Case | null;
  /** 已收集的线索 id 集合 */
  collectedClueIds: Set<string>;
  /** 当前选中的选项 id */
  selectedOptionId: string | null;
  /** 是否已经提交答案 */
  hasSubmitted: boolean;
  /** 提交后是否答对 */
  isCorrect: boolean | null;
  /** 自定义输入文本 */
  customText: string;
  /** 是否正在上传或生成 */
  isLoading: boolean;
  /** 生成错误信息 */
  error: string | null;
}
