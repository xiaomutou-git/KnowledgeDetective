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
import { getSeedCases, findCaseById as findSeedCaseById } from '../data/seedCases';
import { fetchCases, ApiError } from '../services/api';

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
   * @description 先尝试从后端 /api/cases 获取案卷；若后端不可用或请求失败，
   *              则降级使用本地 seedCases，保证离线体验。
   */
  const loadCases = useCallback(async () => {
    setLoading(true);
    setError(null);
    setIsLocalFallback(false);

    try {
      const backendCases = await fetchCases();
      if (backendCases.length > 0) {
        setCases(backendCases);
      } else {
        setCases([...getSeedCases()]);
        setIsLocalFallback(true);
        setError('后端暂无案卷数据，已加载本地精选案卷。');
      }
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
        const backendCases = await fetchCases();
        if (!cancelled) {
          if (backendCases.length > 0) {
            setCases(backendCases);
          } else {
            setCases([...getSeedCases()]);
            setIsLocalFallback(true);
            setError('后端暂无案卷数据，已加载本地精选案卷。');
          }
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
   * @description 优先从已加载的案卷列表中查找，未命中时再查询本地种子数据，
   *              确保后端案卷与本地案卷都能被正确定位。
   * @param id - 案卷唯一标识
   * @returns 对应的 Case 或 undefined
   */
  const getCaseById = useCallback(
    (id: string): Case | undefined => {
      return cases.find((c) => String(c.id) === String(id)) || findSeedCaseById(id);
    },
    [cases]
  );

  return {
    cases,
    loading,
    error,
    isLocalFallback,
    getCaseById,
    refetch: loadCases
  };
}
