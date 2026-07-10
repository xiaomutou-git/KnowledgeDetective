# 知识侦探 - Knowledge Detective

把枯燥的知识，变成一场你来破案的推理游戏

## 项目简介

知识侦探是一款创新的教育应用，将枯燥的知识内容转化为沉浸式的推理游戏。用户上传文章或文档后，系统会自动生成一个推理剧本，让用户在解谜过程中掌握知识要点。

本项目采用前后端分离架构：
- **前端**：React + TypeScript + Vite 单页面应用（SPA）
- **后端**：Node.js + Express + TypeScript + MySQL
- **AI 能力**：基于大语言模型自动生成推理剧本

## 功能特性

- **智能剧本生成**：基于 AI 技术，自动将文章内容转化为推理谜题
- **多文件格式支持**：支持上传 PDF、Word、TXT 等多种格式的文档
- **复古档案风格**：独特的 noir 风格界面，沉浸式侦探体验
- **线索收集系统**：通过收集线索、分析证据，逐步揭开真相
- **详细解析**：游戏结束后提供完整的知识点解析和学习建议
- **响应式设计**：完美适配桌面端、平板和移动端
- **数据持久化**：MySQL 数据库存储案卷和游戏记录

## 技术栈

### 前端
- React 18
- TypeScript
- Vite
- CSS Modules / 全局 CSS
- Vitest + Testing Library

### 后端
- Node.js
- Express
- TypeScript
- MySQL2
- Winston 日志
- Vitest 测试

## 项目结构

```
.
├── server/                 # TypeScript 后端
│   ├── src/
│   │   ├── config/         # 配置（数据库、AI、应用）
│   │   ├── controllers/    # 控制器
│   │   ├── services/       # 业务服务
│   │   ├── models/         # 数据模型
│   │   ├── middlewares/    # 中间件
│   │   ├── routes/         # 路由
│   │   ├── db/             # 数据库连接、迁移、种子
│   │   └── utils/          # 工具函数
│   ├── package.json
│   └── tsconfig.json
├── web/                    # React 前端
│   ├── src/
│   │   ├── components/     # 公共组件
│   │   ├── pages/          # 页面组件
│   │   ├── hooks/          # 自定义 Hooks
│   │   ├── services/       # API 服务
│   │   ├── types/          # TypeScript 类型
│   │   └── styles/         # 全局样式
│   ├── package.json
│   └── vite.config.ts
├── .github/workflows/      # GitHub Actions 部署配置
├── package.json            # 根目录工作区脚本
└── README.md
```

## 环境要求

- Node.js >= 18.0.0
- pnpm >= 8.0.0（推荐）
- MySQL >= 5.7

## 快速开始

### 1. 克隆项目

```bash
git clone git@github.com:xiaomutou-git/KnowledgeDetective.git
cd KnowledgeDetective
```

### 2. 安装依赖

分别安装前后端依赖：

```bash
cd server && pnpm install
cd ../web && pnpm install
```

### 3. 配置数据库

确保本地 MySQL 服务已启动，创建数据库：

```sql
CREATE DATABASE knowledge_detective CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

复制后端环境变量文件并填写数据库信息：

```bash
cd server
cp .env.example .env
```

编辑 `.env`：

```bash
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your-password
DB_NAME=knowledge_detective
AI_API_KEY=your-api-key-here
```

### 4. 执行数据库迁移和种子

```bash
pnpm run migrate
pnpm run seed
```

### 5. 启动开发服务器

在 `server` 目录启动后端：

```bash
pnpm run dev
```

在 `web` 目录启动前端（新终端）：

```bash
pnpm run dev
```

访问 http://localhost:5173 即可使用。

## 常用脚本

在根目录执行：

```bash
# 启动后端开发服务
pnpm run dev:server

# 启动前端开发服务
pnpm run dev:web

# 构建后端
pnpm run build:server

# 构建前端
pnpm run build:web

# 运行后端测试
pnpm run test:server

# 运行前端测试
pnpm run test:web

# 运行全部测试
pnpm run test

# 数据库迁移
pnpm run migrate

# 导入种子数据
pnpm run seed
```

## API 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/health | 健康检查 |
| GET | /api/cases | 案卷列表 |
| GET | /api/cases/:id | 案卷详情 |
| POST | /api/games/generate | AI 生成自定义案卷 |
| GET | /api/games | 游戏记录列表 |
| POST | /api/games | 创建游戏记录 |
| POST | /api/games/:id/complete | 完成游戏 |

## GitHub Pages 部署

本项目已配置 GitHub Actions 工作流，推送代码到 `main` 分支后会自动构建前端并部署到 GitHub Pages。

访问地址：https://xiaomutou-git.github.io/KnowledgeDetective/

注意：GitHub Pages 只部署前端静态页面，AI 生成和数据库功能需要配合后端服务使用。如果没有后端，前端会自动降级为本地静态数据模式。

## AI 配置

推荐使用 **硅基流动（SiliconFlow）**，新用户赠送 2000 万 Token：
- 官网：https://siliconflow.cn

在 `server/.env` 中配置：

```bash
AI_ENDPOINT=https://api.siliconflow.cn/v1/chat/completions
AI_API_KEY=your-api-key-here
AI_MODEL=Qwen/Qwen2.5-7B-Instruct
```

## 许可证

本项目基于 [MIT License](LICENSE) 开源。

## 贡献

欢迎提交 Issue 和 Pull Request。请参考 [CONTRIBUTING.md](CONTRIBUTING.md)。

## 联系方式

- GitHub Issues：https://github.com/xiaomutou-git/KnowledgeDetective/issues
- 邮箱：2581687833@qq.com
