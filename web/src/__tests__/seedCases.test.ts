/* =========================================================
   知识侦探 · 种子案卷数据测试
   =========================================================
 * @description 验证 seedCases 数据结构的完整性，确保每个案卷包含
 *              场景、线索、问题、选项、解析与知识卡等必要字段。
 * @author 知识侦探团队
 * @date 2026-07-08
 * ========================================================= */

import { describe, it, expect } from 'vitest';
import { seedCases, findCaseById, getSeedCases } from '../data/seedCases';

describe('seedCases 数据完整性', () => {
  /**
   * 测试用例：每个案卷包含完整字段
   */
  it('每个案卷都应包含 id、title、scene、clues、question、options、analysis、knowledgeCard', () => {
    seedCases.forEach((caseItem) => {
      expect(caseItem.id).toBeTruthy();
      expect(caseItem.num).toMatch(/^\d{3}$/);
      expect(caseItem.title).toBeTruthy();
      expect(caseItem.scene.length).toBeGreaterThan(0);
      expect(caseItem.clues.length).toBeGreaterThan(0);
      expect(caseItem.question).toBeTruthy();
      expect(caseItem.options.length).toBeGreaterThan(1);
      expect(caseItem.analysis.correctOptionId).toBeTruthy();
      expect(caseItem.knowledgeCard.concept).toBeTruthy();
    });
  });

  /**
   * 测试用例：正确选项必须存在于选项列表中
   */
  it('每个案卷的正确选项必须存在于选项列表中', () => {
    seedCases.forEach((caseItem) => {
      const optionIds = caseItem.options.map((o) => o.id);
      expect(optionIds).toContain(caseItem.analysis.correctOptionId);
    });
  });

  /**
   * 测试用例：findCaseById 能根据 id 查找案卷
   */
  it('findCaseById 可以根据 id 找到对应案卷', () => {
    const result = findCaseById('bayes-theorem');
    expect(result).toBeDefined();
    expect(result?.title).toBe('贝叶斯定理');
  });

  /**
   * 测试用例：findCaseById 对不存在的 id 返回 undefined
   */
  it('findCaseById 对不存在的 id 返回 undefined', () => {
    expect(findCaseById('not-exist')).toBeUndefined();
  });

  /**
   * 测试用例：getSeedCases 返回不可变副本
   */
  it('getSeedCases 返回与原始数据等长的副本', () => {
    const cases = getSeedCases();
    expect(cases.length).toBe(seedCases.length);
    expect(cases).not.toBe(seedCases);
  });
});
