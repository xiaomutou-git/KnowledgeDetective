# 知识侦探 - Knowledge Detective

把枯燥的知识，变成一场你来破案的推理游戏

## 项目简介

知识侦探是一款创新的教育应用，将枯燥的知识内容转化为沉浸式的推理游戏。用户上传文章或文档后，系统会自动生成一个推理剧本，让用户在解谜过程中掌握知识要点。

## 功能特性

- **智能剧本生成**：基于 AI 技术，自动将文章内容转化为推理谜题
- **多文件格式支持**：支持上传 PDF、Word、TXT 等多种格式的文档
- **复古档案风格**：独特的 noir 风格界面，沉浸式侦探体验
- **线索收集系统**：通过收集线索、分析证据，逐步揭开真相
- **详细解析**：游戏结束后提供完整的知识点解析和学习建议
- **响应式设计**：完美适配桌面端、平板和移动端

## 快速开始

### 环境要求

- Node.js >= 14.0.0
- pnpm >= 7.0.0（推荐）或 npm >= 6.0.0

### 安装步骤

1. **克隆项目**

```bash
git clone git@github.com:xiaomutou-git/KnowledgeDetective.git
cd KnowledgeDetective
```

2. **安装依赖**

```bash
pnpm install
```

3. **配置 API Key**

复制 `.env.example` 文件并填写你的 AI API Key：

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```bash
AI_API_KEY=your-api-key-here
```

推荐使用 **硅基流动（SiliconFlow）**，新用户赠送 2000 万 Token：
- 官网：https://siliconflow.cn
- 免费额度充足，适合开发测试

4. **启动服务**

```bash
node proxy-server.js
```

5. **打开浏览器**

访问 `http://localhost:4315` 即可开始体验。

## 访问路径

服务启动后，可通过以下路径访问各个页面：

| 路径 | 页面 | 说明 |
|------|------|------|
| `/` | 首页 | 产品官网首页，包含核心优势、案例预览、团队介绍 |
| `/features` | 功能展示页 | 六大核心功能详细介绍与操作流程时间线 |
| `/cases` | 案例展示页 | 精选推理案卷展示与详细说明 |
| `/guide` | 使用指南页 | 快速开始、详细操作指南、FAQ、环境配置 |
| `/play` | 推理游戏 | 原推理游戏 Demo，包含完整游戏功能 |
| `/api/health` | 健康检查 | 返回服务器与 AI 配置状态 |
| `/api/generate` | 剧本生成接口 | POST 接口，接收文本并返回推理剧本 |

## 项目结构

```
.
├── assets/
│   ├── css/
│   │   └── style.css          # 公共 noir 复古档案风格样式
│   └── js/
│       └── main.js            # 公共导航、页脚、移动端菜单、滚动动画、FAQ
├── .env.example               # 环境变量配置示例
├── .gitignore                 # Git 忽略配置
├── _test_custom.js            # 测试脚本
├── cases.html                 # 案例展示页
├── features.html              # 功能展示页
├── guide.html                 # 使用指南页
├── index.html                 # 产品官网首页
├── play.html                  # 推理游戏页（原 Demo 完整功能）
├── package.json               # 项目配置
├── proxy-server.js            # AI 代理服务器
└── README.md                  # 项目说明文档
```

## 使用说明

### 基本流程

1. **进入官网**：打开 `http://localhost:4315/` 浏览产品首页
2. **开始推理**：点击导航「开始推理」或访问 `/play` 进入游戏
3. **选择案件**：可以选择预设的知识库案件，或上传自己的文档
4. **阅读档案**：仔细阅读案件背景和线索信息
5. **收集线索**：在场景中寻找隐藏的线索和证据
6. **分析证据**：整理收集到的线索，推理案件真相
7. **回答问题**：根据推理结果回答问题，验证你的判断
8. **查看解析**：游戏结束后，查看详细的知识点解析

### 上传文档

支持以下文件格式：
- **TXT**：纯文本文件
- **PDF**：PDF 文档（需要浏览器支持 PDF.js）
- **DOC/DOCX**：Word 文档（需要浏览器支持 mammoth.js）

上传后系统会自动提取文本内容，并生成推理剧本。

## 技术栈

### 前端
- **HTML5**：页面结构
- **CSS3**：样式设计（noir 复古风格）
- **JavaScript (ES6+)**：交互逻辑
- **pdf.js**：PDF 文件解析
- **mammoth.js**：Word 文件解析

### 后端
- **Node.js**：服务端运行环境
- **HTTP/HTTPS**：内置模块，API 代理
- **dotenv**：环境变量管理

### AI 服务
- **硅基流动（SiliconFlow）**：默认 AI 服务提供商
- **Qwen/Qwen2.5-7B-Instruct**：默认使用的模型

## 配置说明

### 环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `AI_API_KEY` | AI 服务 API Key | 需自行配置 |
| `AI_ENDPOINT` | AI 服务端点 | `https://api.siliconflow.cn/v1/chat/completions` |
| `AI_MODEL` | 使用的模型 | `Qwen/Qwen2.5-7B-Instruct` |

### 服务配置

在 `proxy-server.js` 中可以修改以下配置：

- **端口号**：默认 `4315`
- **请求体大小限制**：默认 `10MB`
- **超时时间**：默认 `60秒`

## API 接口

### 健康检查

```
GET /api/health
```

返回服务器状态和 AI 配置信息。

### 生成推理剧本

```
POST /api/generate
Content-Type: application/json

{
  "text": "文章内容..."
}
```

返回生成的推理剧本数据。

## 测试

运行测试脚本验证功能：

```bash
node _test_custom.js
```

测试会验证剧本生成功能是否正常工作。

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！

## 联系方式

如有问题或建议，请通过以下方式联系：

- GitHub Issues：https://github.com/xiaomutou-git/KnowledgeDetective/issues

---

**享受知识探索的乐趣，成为一名真正的知识侦探！**
