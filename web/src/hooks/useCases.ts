/* =========================================================
   知识侦探 · 案卷数据 Hook
   =========================================================
 * @description 封装案卷列表的获取逻辑：优先尝试后端 API，
 *              失败时自动降级到本地 seedCases，并提供加载与错误状态。
 * @author 知识侦探团队
 * @date 2026-07-08
 * ========================================================= */

import { useEffect, useState, useCallback } from 'react';
import type { Case } from '../types/case';
import { getSeedCases, findCaseById } from '../data/seedCases';
import { checkHealth, ApiError } from '../services/api';

/**
 * useCases 返回值
 */
export interface UseCasesReturn {
  /** 案卷列表 */
  cases: Case[];
  /** 是否正在加载 */
  loading: boolean;
  /** 错误信息 */
  error: string | null;
  /** 是否使用了本地 fallback */
  isLocalFallback: boolean;
  /** 根据 id 查找案卷 */
  getCaseById: (id: string) => Case | undefined;
  /** 手动重新加载 */
  refetch: () => void;
}

/**
 * 案卷数据 Hook
 * @description 组件挂载时尝试连接后端，若后端不可用则使用本地种子数据。
 * @returns {UseCasesReturn} 案卷数据、加载状态、错误信息与操作方法
 */
export function useCases(): UseCasesReturn {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isLocalFallback, setIsLocalFallback] = useState<boolean>(false);

  /**
   * 加载案卷数据
   * @description 先尝试健康检查，失败后降级使用本地 seedCases。
   */
  const loadCases = useCallback(async () => {
    setLoading(true);
    setError(null);
    setIsLocalFallback(false);

    try {
      await checkHealth();
      setCases([...getSeedCases()]);
    } catch (err) {
      console.warn('[useCases] 后端不可用，降级使用本地案卷：', err);
      setCases([...getSeedCases()]);
      setIsLocalFallback(true);
      if (err instanceof ApiError) {
        setError(`本地模式：${err.message}`);
      } else {
        setError('本地模式：无法连接到后端服务，已加载本地案卷。');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        setLoading(true);
        setError(null);
        setIsLocalFallback(false);
        await checkHealth();
        if (!cancelled) {
          setCases([...getSeedCases()]);
        }
      } catch (err) {
        console.warn('[useCases] 后端不可用，降级使用本地案卷：', err);
        if (!cancelled) {
          setCases([...getSeedCases()]);
          setIsLocalFallback(true);
          if (err instanceof ApiError) {
            setError(`本地模式：${err.message}`);
          } else {
            setError('本地模式：无法连接到后端服务，已加载本地案卷。');
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, []);

  /**
   * 根据 id 查找案卷
   * @param id - 案卷唯一标识
   * @returns 对应的 Case 或 undefined
   */
  const getCaseById = useCallback((id: string): Case | undefined => {
    return findCaseById(id);
  }, []);

  return {
    cases,
    loading,
    error,
    isLocalFallback,
    getCaseById,
    refetch: loadCases
  };
}
