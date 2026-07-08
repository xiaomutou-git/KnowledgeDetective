/* =========================================================
   知识侦探 · App 组件测试
   =========================================================
 * @description 验证 App 根组件的页面渲染、导航切换与案卷启动逻辑。
 * @author 知识侦探团队
 * @date 2026-07-08
 * ========================================================= */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from '../App';
import * as useCasesModule from '../hooks/useCases';
import { seedCases } from '../data/seedCases';

/**
 * 模拟 useCases Hook
 * @description 避免测试期间发起真实网络请求，返回稳定的本地案卷数据。
 */
vi.mock('../hooks/useCases', () => ({
  useCases: vi.fn()
}));

describe('App 组件', () => {
  beforeEach(() => {
    // jsdom 未实现 scrollTo，需手动模拟
    window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;

    // 默认返回本地案卷，非加载、非降级
    vi.mocked(useCasesModule.useCases).mockReturnValue({
      cases: seedCases,
      loading: false,
      error: null,
      isLocalFallback: false,
      getCaseById: (id: string) => seedCases.find((c) => c.id === id),
      refetch: vi.fn()
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  /**
   * 获取桌面端导航按钮
   * @param name - 导航按钮名称正则
   * @returns 匹配的第一个桌面导航按钮
   */
  function getDesktopNav(name: RegExp): HTMLElement {
    const desktopNav = screen.getByRole('navigation', { name: /主导航/i });
    return within(desktopNav).getByRole('button', { name });
  }

  /**
   * 测试用例：默认渲染首页
   */
  it('默认渲染首页 Hero 区域', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /把枯燥的.*知识.*变成推理游戏/i })).toBeInTheDocument();
    });
  });

  /**
   * 测试用例：导航切换到功能页
   */
  it('点击导航可切换到功能页', async () => {
    const user = userEvent.setup();
    render(<App />);

    const featuresNav = getDesktopNav(/功能/i);
    await user.click(featuresNav);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /六大核心.*功能/i })).toBeInTheDocument();
    });
  });

  /**
   * 测试用例：导航切换到案例页并显示案卷
   */
  it('点击案例导航可显示精选案卷列表', async () => {
    const user = userEvent.setup();
    render(<App />);

    const casesNav = getDesktopNav(/案例/i);
    await user.click(casesNav);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /精选.*案卷/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /贝叶斯定理/i })).toBeInTheDocument();
    });
  });

  /**
   * 测试用例：点击首页案卷可进入游戏页
   */
  it('点击首页案卷可跳转到推理游戏页', async () => {
    const user = userEvent.setup();
    render(<App />);

    const caseButton = screen.getByRole('button', { name: /贝叶斯定理/i });
    await user.click(caseButton);

    await waitFor(() => {
      expect(screen.getByText(/一份罕见病检测报告的真伪/i)).toBeInTheDocument();
    });
  });

  /**
   * 测试用例：加载状态显示
   */
  it('案卷加载中显示加载提示', () => {
    vi.mocked(useCasesModule.useCases).mockReturnValue({
      cases: [],
      loading: true,
      error: null,
      isLocalFallback: false,
      getCaseById: vi.fn(),
      refetch: vi.fn()
    });

    render(<App />);
    expect(screen.getByText(/正在调取案卷档案/i)).toBeInTheDocument();
  });
});
