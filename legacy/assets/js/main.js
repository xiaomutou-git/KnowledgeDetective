/* =========================================================
   知识侦探 · 公共前端交互脚本
   =========================================================
 * @description 为产品官网营销页面（首页、功能、案例、指南）提供公共交互能力：
 *              注入响应式导航与页脚、移动端抽屉菜单、滚动显隐动画、
 *              Hero 首屏入场动画、导航栏滚动阴影、FAQ 手风琴、
 *              GitHub Pages 链接自适应、滚动进度条、返回顶部、页面淡入淡出。
 * @author 知识侦探团队
 * @date 2026-07-08
 * @usage 在 index.html / features.html / cases.html / guide.html 底部引入本文件。
 *        游戏页 play.html 不引入，避免与游戏内联导航冲突。
 * ========================================================= */

(function () {
  'use strict';

  /* =========================================================
     常量与配置
     ========================================================= */

  /**
   * 站点导航配置
   * @description 所有内部页面路径统一使用 .html 后缀，确保在 GitHub Pages 等静态托管服务上可直接访问，
   *              无需依赖 404 重定向兜底。
   * @constant {Array<{label: string, path: string}>}
   */
  const NAV_ITEMS = [
    { label: '首页', path: '/index.html' },
    { label: '功能', path: '/features.html' },
    { label: '案例', path: '/cases.html' },
    { label: '指南', path: '/guide.html' },
    { label: '开始推理', path: '/play.html' }
  ];

  /**
   * 页脚链接分组配置
   * @description 内部页面路径统一使用 .html 后缀，锚点链接保持 hash 形式，外部链接保持不变。
   * @constant {Array<{title: string, links: Array<{label: string, path: string}>}>}
   */
  const FOOTER_COLUMNS = [
    {
      title: '产品',
      links: [
        { label: '功能特性', path: '/features.html' },
        { label: '成功案例', path: '/cases.html' },
        { label: '推理游戏', path: '/play.html' }
      ]
    },
    {
      title: '资源',
      links: [
        { label: '使用指南', path: '/guide.html' },
        { label: '快速开始', path: '/guide.html#quickstart' },
        { label: '常见问题', path: '/guide.html#faq' }
      ]
    },
    {
      title: '关于',
      links: [
        { label: 'GitHub', path: 'https://github.com/xiaomutou-git/KnowledgeDetective' },
        { label: '反馈问题', path: 'https://github.com/xiaomutou-git/KnowledgeDetective/issues' }
      ]
    }
  ];

  /**
   * 无后缀路径到 .html 路径的映射表
   * @description 用于兼容页面中可能遗留的旧无后缀硬编码链接，确保它们最终指向正确的 .html 文件。
   *              导航与页脚配置本身已使用 .html 后缀，因此不会重复转换。
   * @constant {Object<string, string>}
   */
  const HTML_PAGE_MAP = {
    '/': '/index.html',
    '/features': '/features.html',
    '/cases': '/cases.html',
    '/guide': '/guide.html',
    '/play': '/play.html'
  };

  /* =========================================================
     链接处理
     ========================================================= */

  /**
   * 构建最终可访问链接
   * @description 外部链接原样返回；内部无后缀路径（如 /features）会被映射为 /features.html；
   *              已带 .html 后缀的路径保持原样；支持保留 hash / query 后缀。
   * @param {string} path - 原始路径，例如 /features 或 /guide#quickstart
   * @returns {string} 处理后的可访问链接
   * @throws {Error} 不会主动抛出异常，参数非字符串时返回空字符串
   */
  function buildLink(path) {
    try {
      if (typeof path !== 'string') return '';
      if (path.indexOf('http') === 0) return path;

      // 分离哈希与查询参数
      const hashIndex = path.indexOf('#');
      const queryIndex = path.indexOf('?');
      let base = path;
      let suffix = '';

      if (hashIndex !== -1) {
        base = path.substring(0, hashIndex);
        suffix = path.substring(hashIndex);
      } else if (queryIndex !== -1) {
        base = path.substring(0, queryIndex);
        suffix = path.substring(queryIndex);
      }

      const mapped = HTML_PAGE_MAP[base];
      if (mapped) return mapped + suffix;
      return path;
    } catch (err) {
      console.warn('[main.js] 构建链接失败：', err);
      return path;
    }
  }

  /* =========================================================
     工具函数
     ========================================================= */

  /**
   * 获取当前页面路径，用于高亮对应导航项
   * @returns {string} 当前页面路径，例如 "/features" 或 "/features.html"
   */
  function getCurrentPath() {
    try {
      return window.location.pathname || '/';
    } catch (err) {
      console.warn('[main.js] 获取当前路径失败：', err);
      return '/';
    }
  }

  /**
   * 将带 .html 后缀的路径归一化为无后缀路径，便于与高亮配置比较
   * @param {string} path - 需要归一化的路径
   * @returns {string} 归一化后的路径，例如 /features.html -> /features
   */
  function normalizePath(path) {
    try {
      if (typeof path !== 'string') return '/';
      if (path.toLowerCase().endsWith('.html')) {
        return path.substring(0, path.length - 5) || '/';
      }
      return path;
    } catch (err) {
      console.warn('[main.js] 归一化路径失败：', err);
      return path;
    }
  }

  /**
   * 判断当前页面是否为指定路径（支持根路径、精确匹配及 .html 后缀兼容）
   * @param {string} path - 导航项路径
   * @param {string} current - 当前页面路径
   * @returns {boolean} 是否匹配
   */
  function isActivePath(path, current) {
    try {
      const normalizedCurrent = normalizePath(current);
      const normalizedPath = normalizePath(path);

      if (normalizedPath === '/') {
        return normalizedCurrent === '/' || normalizedCurrent === '/index';
      }
      return normalizedCurrent === normalizedPath || normalizedCurrent.startsWith(normalizedPath + '/');
    } catch (err) {
      console.warn('[main.js] 判断高亮路径失败：', err);
      return false;
    }
  }

  /**
   * 创建 SVG 品牌 Logo 字符串
   * @returns {string} SVG HTML 字符串
   */
  function createBrandLogo() {
    return (
      '<svg class="brand-logo" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">' +
      '<circle cx="28" cy="28" r="25" stroke="#1a1a1a" stroke-width="1" fill="none" opacity="0.85"/>' +
      '<circle cx="28" cy="28" r="22" stroke="#1a1a1a" stroke-width="0.5" fill="none" opacity="0.3" stroke-dasharray="1 2"/>' +
      '<circle cx="23" cy="22" r="11" stroke="#1a1a1a" stroke-width="1.8" fill="none"/>' +
      '<rect x="15.5" y="16.5" width="15" height="11" rx="0.5" fill="#fff" opacity="0.7"/>' +
      '<line x1="18" y1="20" x2="28" y2="20" stroke="#1a1a1a" stroke-width="0.6" opacity="0.5"/>' +
      '<line x1="18" y1="22.5" x2="26" y2="22.5" stroke="#1a1a1a" stroke-width="0.6" opacity="0.4"/>' +
      '<line x1="18" y1="25" x2="27" y2="25" stroke="#1a1a1a" stroke-width="0.6" opacity="0.35"/>' +
      '<line x1="32" y1="31" x2="41" y2="40" stroke="#1a1a1a" stroke-width="2" stroke-linecap="round"/>' +
      '<circle cx="15" cy="11" r="1.8" fill="#b83a2b"/>' +
      '<circle cx="40" cy="15" r="1" fill="#b83a2b" opacity="0.6"/>' +
      '<rect x="34" y="34" width="10" height="10" rx="1" fill="#b83a2b" opacity="0.85"/>' +
      '<text x="39" y="41.5" text-anchor="middle" font-size="7" fill="#fff" font-family="serif" font-weight="600">偵</text>' +
      '</svg>'
    );
  }

  /* =========================================================
     导航与页脚注入
     ========================================================= */

  /**
   * 注入公共顶部导航
   * @description 在页面 #site-header 容器（或 body 首个子元素前）插入响应式导航栏。
   *              包含品牌、桌面导航链接、状态徽章、移动端菜单按钮及抽屉菜单。
   *              在 GitHub Pages 环境下自动为内部链接追加 .html 后缀。
   * @throws {Error} 当无法创建或插入导航容器时可能抛出异常（已被 try-catch 包裹）
   */
  function injectHeader() {
    try {
      const current = getCurrentPath();
      const navLinksHtml = NAV_ITEMS.map(function (item) {
        const activeClass = isActivePath(item.path, current) ? ' active' : '';
        return '<a class="nav-link' + activeClass + '" href="' + buildLink(item.path) + '">' + item.label + '</a>';
      }).join('');

      const mobileNavLinksHtml = NAV_ITEMS.map(function (item) {
        const activeClass = isActivePath(item.path, current) ? ' active' : '';
        return '<a class="nav-link' + activeClass + '" href="' + buildLink(item.path) + '">' + item.label + '</a>';
      }).join('');

      const headerHtml =
        '<div class="topbar">' +
          '<a class="brand" href="' + buildLink('/') + '" aria-label="返回知识侦探首页">' +
            createBrandLogo() +
            '<span class="brand-text">' +
              '<span class="brand-main">知识侦探</span>' +
              '<span class="brand-en">· KNOWLEDGE DETECTIVE</span>' +
            '</span>' +
          '</a>' +
          '<nav class="nav-group" aria-label="主导航">' +
            navLinksHtml +
            '<div class="status" aria-label="服务状态">' +
              '<span class="live-dot"></span>' +
              '<strong>ONLINE</strong>' +
            '</div>' +
          '</nav>' +
          '<button class="mobile-menu-btn" aria-label="打开菜单" aria-expanded="false" aria-controls="mobile-nav">' +
            '<span></span><span></span><span></span>' +
          '</button>' +
        '</div>' +
        '<nav id="mobile-nav" class="mobile-nav" aria-label="移动端导航">' +
          mobileNavLinksHtml +
        '</nav>';

      let headerContainer = document.getElementById('site-header');
      if (!headerContainer) {
        headerContainer = document.createElement('header');
        headerContainer.id = 'site-header';
        const body = document.body;
        if (body && body.firstChild) {
          body.insertBefore(headerContainer, body.firstChild);
        } else if (body) {
          body.appendChild(headerContainer);
        }
      }
      headerContainer.innerHTML = headerHtml;
    } catch (err) {
      console.error('[main.js] 注入导航失败：', err);
    }
  }

  /**
   * 注入公共页脚
   * @description 在页面 #site-footer 容器（或 body 末尾）插入页脚，包含品牌介绍、链接分组与版权信息。
   *              在 GitHub Pages 环境下自动为内部链接追加 .html 后缀。
   * @throws {Error} 当无法创建或插入页脚容器时可能抛出异常（已被 try-catch 包裹）
   */
  function injectFooter() {
    try {
      const columnsHtml = FOOTER_COLUMNS.map(function (col) {
        const linksHtml = col.links.map(function (link) {
          const isExternal = link.path.indexOf('http') === 0;
          const attrs = isExternal ? ' target="_blank" rel="noopener noreferrer"' : '';
          return '<li><a href="' + buildLink(link.path) + '"' + attrs + '>' + link.label + '</a></li>';
        }).join('');
        return '<div class="footer-col"><h5>' + col.title + '</h5><ul>' + linksHtml + '</ul></div>';
      }).join('');

      const footerHtml =
        '<div class="footer-inner">' +
          '<div class="footer-brand">' +
            '<span class="brand-main">知识侦探</span>' +
            '<p>把枯燥的知识，变成一场你来破案的推理游戏。在解谜中理解概念，在推理中掌握知识。</p>' +
          '</div>' +
          columnsHtml +
        '</div>' +
        '<div class="footer-bottom">' +
          '<p>© 2026 知识侦探 · MIT License</p>' +
          '<p>DESIGNED FOR CURIOUS MINDS</p>' +
        '</div>';

      let footerContainer = document.getElementById('site-footer');
      if (!footerContainer) {
        footerContainer = document.createElement('footer');
        footerContainer.id = 'site-footer';
        footerContainer.className = 'footer';
        const body = document.body;
        if (body) {
          body.appendChild(footerContainer);
        }
      }
      footerContainer.innerHTML = footerHtml;
    } catch (err) {
      console.error('[main.js] 注入页脚失败：', err);
    }
  }

  /* =========================================================
     页面级交互增强
     ========================================================= */

  /**
   * 初始化页面切换淡入淡出效果
   * @description 监听 beforeunload/unload 事件，在页面卸载前为 body 添加
   *              page-unloading 类触发淡出动画；页面加载完成后添加 page-loaded
   *              类触发各区块依次淡入。
   */
  function initPageTransitions() {
    try {
      const body = document.body;
      if (!body) return;

      // 页面加载时先设置为不可见，随后触发淡入
      body.classList.add('page-loading');

      window.addEventListener('beforeunload', function () {
        try {
          body.classList.add('page-unloading');
        } catch (err) {
          console.warn('[main.js] 页面卸载动画触发失败：', err);
        }
      });

      window.addEventListener('pageshow', function (event) {
        try {
          // 处理浏览器后退缓存（bfcache）情况
          if (event.persisted) {
            body.classList.remove('page-loading', 'page-unloading');
            body.classList.add('page-loaded');
          }
        } catch (err) {
          console.warn('[main.js] 页面显示事件处理失败：', err);
        }
      });

      window.requestAnimationFrame(function () {
        try {
          window.setTimeout(function () {
            body.classList.remove('page-loading');
            body.classList.add('page-loaded');
          }, 50);
        } catch (err) {
          console.warn('[main.js] 页面淡入触发失败：', err);
        }
      });
    } catch (err) {
      console.error('[main.js] 初始化页面切换动画失败：', err);
    }
  }

  /**
   * 初始化滚动进度条
   * @description 在页面顶部创建固定进度条，根据滚动位置实时更新宽度，
   *              并在页面滚动超过阈值时显示返回顶部按钮。
   */
  function initScrollProgress() {
    try {
      const body = document.body;
      if (!body) return;

      let progressBar = document.getElementById('scroll-progress-bar');
      if (!progressBar) {
        progressBar = document.createElement('div');
        progressBar.id = 'scroll-progress-bar';
        progressBar.className = 'scroll-progress-bar';
        progressBar.setAttribute('role', 'progressbar');
        progressBar.setAttribute('aria-label', '页面滚动进度');
        progressBar.setAttribute('aria-valuemin', '0');
        progressBar.setAttribute('aria-valuemax', '100');
        progressBar.setAttribute('aria-valuenow', '0');
        body.appendChild(progressBar);
      }

      let backToTop = document.getElementById('back-to-top');
      if (!backToTop) {
        backToTop = document.createElement('button');
        backToTop.id = 'back-to-top';
        backToTop.className = 'back-to-top';
        backToTop.setAttribute('aria-label', '返回页面顶部');
        backToTop.setAttribute('title', '返回顶部');
        backToTop.innerHTML =
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
          '<line x1="12" y1="19" x2="12" y2="5"></line>' +
          '<polyline points="5 12 12 5 19 12"></polyline>' +
          '</svg>';
        body.appendChild(backToTop);
      }

      function updateScrollState() {
        try {
          const scrollTop = window.scrollY || window.pageYOffset || 0;
          const docHeight = document.documentElement.scrollHeight - window.innerHeight;
          const progress = docHeight > 0 ? Math.round((scrollTop / docHeight) * 100) : 0;

          progressBar.style.width = progress + '%';
          progressBar.setAttribute('aria-valuenow', String(progress));

          if (scrollTop > 400) {
            backToTop.classList.add('visible');
          } else {
            backToTop.classList.remove('visible');
          }
        } catch (err) {
          console.warn('[main.js] 更新滚动进度失败：', err);
        }
      }

      backToTop.addEventListener('click', function () {
        try {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (err) {
          console.warn('[main.js] 返回顶部失败：', err);
        }
      });

      window.addEventListener('scroll', updateScrollState, { passive: true });
      updateScrollState();
    } catch (err) {
      console.error('[main.js] 初始化滚动进度条失败：', err);
    }
  }

  /* =========================================================
     移动端菜单
     ========================================================= */

  /**
   * 初始化移动端抽屉菜单交互
   * @description 绑定汉堡按钮点击事件，切换抽屉菜单显隐及 aria-expanded 状态；
   *              点击抽屉内链接或页面其他区域时自动关闭菜单。
   */
  function initMobileMenu() {
    try {
      const menuBtn = document.querySelector('.mobile-menu-btn');
      const mobileNav = document.getElementById('mobile-nav');
      if (!menuBtn || !mobileNav) return;

      /**
       * 切换移动端菜单展开/收起状态
       * @param {boolean} [force] - 强制指定展开(true)或收起(false)
       */
      function toggleMenu(force) {
        try {
          const shouldOpen = typeof force === 'boolean' ? force : !mobileNav.classList.contains('open');
          mobileNav.classList.toggle('open', shouldOpen);
          menuBtn.classList.toggle('active', shouldOpen);
          menuBtn.setAttribute('aria-expanded', String(shouldOpen));
        } catch (err) {
          console.warn('[main.js] 切换菜单状态失败：', err);
        }
      }

      menuBtn.addEventListener('click', function () {
        toggleMenu();
      });

      mobileNav.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', function () {
          toggleMenu(false);
        });
      });

      document.addEventListener('click', function (event) {
        try {
          if (!mobileNav.classList.contains('open')) return;
          const target = event.target;
          if (!menuBtn.contains(target) && !mobileNav.contains(target)) {
            toggleMenu(false);
          }
        } catch (err) {
          console.warn('[main.js] 点击外部关闭菜单失败：', err);
        }
      });

      // 窗口尺寸恢复为桌面时自动收起菜单
      window.addEventListener('resize', function () {
        try {
          if (window.innerWidth > 1024 && mobileNav.classList.contains('open')) {
            toggleMenu(false);
          }
        } catch (err) {
          console.warn('[main.js] 窗口resize关闭菜单失败：', err);
        }
      });
    } catch (err) {
      console.error('[main.js] 初始化移动端菜单失败：', err);
    }
  }

  /* =========================================================
     滚动动画
     ========================================================= */

  /**
   * 初始化滚动入场动画
   * @description 为页面中带有 .fade-in-up 类的元素添加 IntersectionObserver 监听，
   *              当元素进入视口时添加 .visible 类触发 CSS 过渡动画。
   */
  function initScrollAnimations() {
    try {
      const animatedElements = document.querySelectorAll('.fade-in-up');
      if (!animatedElements.length) return;

      const observerOptions = {
        root: null,
        rootMargin: '0px 0px -80px 0px',
        threshold: 0.12
      };

      const observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          try {
            if (entry.isIntersecting) {
              entry.target.classList.add('visible');
              observer.unobserve(entry.target);
            }
          } catch (err) {
            console.warn('[main.js] 处理滚动动画条目失败：', err);
          }
        });
      }, observerOptions);

      animatedElements.forEach(function (el) {
        observer.observe(el);
      });
    } catch (err) {
      console.error('[main.js] 初始化滚动动画失败：', err);
    }
  }

  /* =========================================================
     Hero 首屏入场动画
     ========================================================= */

  /**
   * 初始化 Hero 首屏入场动画
   * @description 当页面存在 .hero 区域时，在下一帧为 body 添加 is-loaded 类，
   *              触发 CSS 中定义的 stagger 入场动画（kicker、标题、副标题、CTA、数据栏、装饰元素）。
   */
  function initHeroAnimations() {
    try {
      const hero = document.querySelector('.hero');
      if (!hero) return;

      const body = document.body;
      if (!body) return;

      window.requestAnimationFrame(function () {
        try {
          body.classList.add('is-loaded');
        } catch (err) {
          console.warn('[main.js] 添加 is-loaded 类失败：', err);
        }
      });
    } catch (err) {
      console.error('[main.js] 初始化 Hero 动画失败：', err);
    }
  }

  /* =========================================================
     导航栏滚动阴影
     ========================================================= */

  /**
   * 初始化导航栏滚动状态
   * @description 监听窗口滚动事件，当页面滚动超过 10px 时为 .topbar 添加 is-scrolled 类，
   *              从而产生细微阴影与边框变化，增强页面层次感。
   */
  function initHeaderScroll() {
    try {
      const topbar = document.querySelector('.topbar');
      if (!topbar) return;

      function updateScrollState() {
        try {
          const scrollY = window.scrollY || window.pageYOffset || 0;
          topbar.classList.toggle('is-scrolled', scrollY > 10);
        } catch (err) {
          console.warn('[main.js] 更新滚动状态失败：', err);
        }
      }

      window.addEventListener('scroll', updateScrollState, { passive: true });
      updateScrollState();
    } catch (err) {
      console.error('[main.js] 初始化导航栏滚动状态失败：', err);
    }
  }

  /* =========================================================
     FAQ 手风琴
     ========================================================= */

  /**
   * 初始化 FAQ 折叠面板
   * @description 为 .faq-item 容器内的 .faq-question 按钮绑定点击事件，
   *              切换父容器的 .open 类以展开/收起答案区域；支持手风琴模式（默认）。
   * @param {boolean} [accordion=true] - 是否开启手风琴模式，即同时只展开一个
   */
  function initFaq(accordion) {
    try {
      const faqItems = document.querySelectorAll('.faq-item');
      if (!faqItems.length) return;

      faqItems.forEach(function (item) {
        const question = item.querySelector('.faq-question');
        if (!question) return;

        question.addEventListener('click', function () {
          try {
            const isOpen = item.classList.contains('open');

            if (accordion !== false) {
              faqItems.forEach(function (other) {
                if (other !== item) {
                  other.classList.remove('open');
                }
              });
            }

            item.classList.toggle('open', !isOpen);
          } catch (err) {
            console.warn('[main.js] FAQ 点击切换失败：', err);
          }
        });
      });
    } catch (err) {
      console.error('[main.js] 初始化 FAQ 失败：', err);
    }
  }

  /* =========================================================
     外部/硬编码链接自适应
     ========================================================= */

  /**
   * 为页面中硬编码的内部链接自动追加 .html 后缀（GitHub Pages 环境下）
   * @description 扫描页面中所有 href 属性匹配 HTML_PAGE_MAP 的 a 标签，
   *              在静态托管环境下将其重写为带 .html 后缀的链接；
   *              避免逐页手动修改 HTML 文件中的 /play、/features 等链接。
   */
  function adaptStaticLinks() {
    try {
      if (!isGitHubPagesEnvironment()) return;

      const links = document.querySelectorAll('a[href]');
      links.forEach(function (link) {
        try {
          const href = link.getAttribute('href') || '';
          if (href.indexOf('http') === 0) return;

          const hashIndex = href.indexOf('#');
          const queryIndex = href.indexOf('?');
          let base = href;
          let suffix = '';

          if (hashIndex !== -1) {
            base = href.substring(0, hashIndex);
            suffix = href.substring(hashIndex);
          } else if (queryIndex !== -1) {
            base = href.substring(0, queryIndex);
            suffix = href.substring(queryIndex);
          }

          const mapped = HTML_PAGE_MAP[base];
          if (mapped && mapped !== base + suffix) {
            link.setAttribute('href', mapped + suffix);
          }
        } catch (err) {
          console.warn('[main.js] 自适应单个链接失败：', err);
        }
      });
    } catch (err) {
      console.error('[main.js] 自适应静态链接失败：', err);
    }
  }

  /* =========================================================
     初始化入口
     ========================================================= */

  /**
   * 初始化公共交互
   * @description 页面 DOM 就绪后依次注入导航、页脚，并初始化菜单、滚动动画、
   *              Hero 动画、导航阴影、FAQ、页面过渡、滚动进度条及链接自适应。
   */
  function init() {
    try {
      injectHeader();
      injectFooter();
      adaptStaticLinks();
      initPageTransitions();
      initScrollProgress();
      initMobileMenu();
      initScrollAnimations();
      initHeroAnimations();
      initHeaderScroll();
      initFaq(true);
    } catch (err) {
      console.error('[main.js] 公共脚本初始化失败：', err);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
