/* =========================================================
   知识侦探 · localStorage Hook
   =========================================================
 * @description 封装浏览器 localStorage 的读写操作，提供类型安全的
 *              状态持久化能力，并处理存储异常与 JSON 解析异常。
 * @author 知识侦探团队
 * @date 2026-07-08
 * ========================================================= */

import { useState, useEffect, useCallback } from 'react';

/**
 * 从 localStorage 读取并解析值
 * @template T 存储值的类型
 * @param key - localStorage 键名
 * @param defaultValue - 读取失败或不存在时的默认值
 * @returns 解析后的值或默认值
 */
export function readStorage<T>(key: string, defaultValue: T): T {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return defaultValue;
    }
    const raw = window.localStorage.getItem(key);
    if (raw === null) {
      return defaultValue;
    }
    return JSON.parse(raw) as T;
  } catch (err) {
    console.warn(`[useLocalStorage] 读取 ${key} 失败：`, err);
    return defaultValue;
  }
}

/**
 * 向 localStorage 写入值
 * @template T 存储值的类型
 * @param key - localStorage 键名
 * @param value - 待写入的值
 */
export function writeStorage<T>(key: string, value: T): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`[useLocalStorage] 写入 ${key} 失败：`, err);
  }
}

/**
 * 从 localStorage 移除指定键
 * @param key - localStorage 键名
 */
export function removeStorage(key: string): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }
    window.localStorage.removeItem(key);
  } catch (err) {
    console.warn(`[useLocalStorage] 移除 ${key} 失败：`, err);
  }
}

/**
 * localStorage 状态 Hook
 * @template T 存储值的类型
 * @param key - localStorage 键名
 * @param defaultValue - 默认值
 * @returns [当前值, 设置值函数, 移除值函数]
 */
export function useLocalStorage<T>(key: string, defaultValue: T): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const [storedValue, setStoredValue] = useState<T>(() => readStorage(key, defaultValue));

  /**
   * 设置值并同步到 localStorage
   * @param value - 新值或基于旧值的计算函数
   */
  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue((prev) => {
        const next = typeof value === 'function' ? (value as (prev: T) => T)(prev) : value;
        writeStorage(key, next);
        return next;
      });
    },
    [key]
  );

  /**
   * 移除 localStorage 中的键并恢复默认值
   */
  const removeValue = useCallback(() => {
    removeStorage(key);
    setStoredValue(defaultValue);
  }, [key, defaultValue]);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === key && event.newValue !== null) {
        try {
          setStoredValue(JSON.parse(event.newValue) as T);
        } catch (err) {
          console.warn(`[useLocalStorage] 监听同步 ${key} 失败：`, err);
        }
      }
    };

    try {
      window.addEventListener('storage', handleStorage);
    } catch (err) {
      console.warn('[useLocalStorage] 注册 storage 监听失败：', err);
    }

    return () => {
      try {
        window.removeEventListener('storage', handleStorage);
      } catch (err) {
        console.warn('[useLocalStorage] 移除 storage 监听失败：', err);
      }
    };
  }, [key]);

  return [storedValue, setValue, removeValue];
}
