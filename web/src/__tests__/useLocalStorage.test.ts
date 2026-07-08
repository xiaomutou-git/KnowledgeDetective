/* =========================================================
   知识侦探 · useLocalStorage Hook 测试
   =========================================================
 * @description 验证 localStorage 读写、Hook 状态同步与移除功能。
 * @author 知识侦探团队
 * @date 2026-07-08
 * ========================================================= */

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLocalStorage, readStorage, writeStorage, removeStorage } from '../hooks/useLocalStorage';

describe('useLocalStorage Hook', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  /**
   * 测试用例：默认值写入
   */
  it('首次读取时返回默认值', () => {
    const { result } = renderHook(() => useLocalStorage('kd_test', 'default'));
    expect(result.current[0]).toBe('default');
  });

  /**
   * 测试用例：设置值并持久化
   */
  it('设置值后会同步到 localStorage', () => {
    const { result } = renderHook(() => useLocalStorage('kd_test', 0));

    act(() => {
      result.current[1](42);
    });

    expect(result.current[0]).toBe(42);
    expect(localStorage.getItem('kd_test')).toBe('42');
  });

  /**
   * 测试用例：函数式更新
   */
  it('支持函数式更新', () => {
    const { result } = renderHook(() => useLocalStorage('kd_test', 1));

    act(() => {
      result.current[1]((prev) => prev + 9);
    });

    expect(result.current[0]).toBe(10);
  });

  /**
   * 测试用例：移除值
   */
  it('调用移除值会清空 localStorage 并恢复默认值', () => {
    const { result } = renderHook(() => useLocalStorage('kd_test', 'default'));

    act(() => {
      result.current[1]('changed');
    });
    expect(result.current[0]).toBe('changed');

    act(() => {
      result.current[2]();
    });
    expect(result.current[0]).toBe('default');
    expect(localStorage.getItem('kd_test')).toBeNull();
  });

  /**
   * 测试用例：直接工具函数读取
   */
  it('readStorage 能正确解析已存储的 JSON', () => {
    writeStorage('kd_obj', { name: 'detective', level: 1 });
    expect(readStorage('kd_obj', { name: '', level: 0 })).toEqual({ name: 'detective', level: 1 });
  });

  /**
   * 测试用例：removeStorage 清除键
   */
  it('removeStorage 会清除指定键', () => {
    writeStorage('kd_remove', 'value');
    removeStorage('kd_remove');
    expect(localStorage.getItem('kd_remove')).toBeNull();
  });
});
