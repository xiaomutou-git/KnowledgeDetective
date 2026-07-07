/**
 * =========================================================
 * 知识侦探 - AI 代理服务器
 * =========================================================
 * 
 * @description 本地代理服务器，保护 AI API Key，前端无需配置即可使用
 * @author 知识侦探团队
 * @date 2026-06-16
 * 
 * 功能说明：
 * - 接收前端传来的文章内容
 * - 调用 AI API 生成推理剧本
 * - 将结果返回给前端
 * - API Key 通过环境变量配置，保护密钥安全
 * 
 * 使用方法：
 * 1. 安装依赖：npm install dotenv --save
 * 2. 配置 API Key：
 *    - 复制 .env.example 为 .env
 *    - 在 .env 文件中填写您的 SiliconFlow API Key
 *    - 或设置系统环境变量 AI_API_KEY
 * 3. 启动服务：node proxy-server.js
 * 4. 打开 knowledge-detective-noir.html 使用
 */

const http = require('http');
const https = require('https');
const url = require('url');
const fs = require('fs');
const path = require('path');

// 加载环境变量配置
try {
  require('dotenv').config();
} catch (e) {
  // 如果未安装 dotenv，使用系统环境变量
  console.log('提示：未安装 dotenv，将使用系统环境变量');
}

// =========================================================
// 配置区域 - 请修改此处
// =========================================================

/**
 * AI API 配置
 * @description 内置 API 配置，用户无需在前端输入
 * @property {string} endpoint - API 地址
 * @property {string} key - API Key（请替换为你自己的 Key）
 * @property {string} model - 模型名称
 */
const AI_CONFIG = {
  // 默认使用硅基流动（SiliconFlow）- 新用户送 2000 万 Token
  endpoint: process.env.AI_ENDPOINT || 'https://api.siliconflow.cn/v1/chat/completions',
  key: process.env.AI_API_KEY,
  model: process.env.AI_MODEL || 'Qwen/Qwen2.5-7B-Instruct'
};

// 服务器端口
const PORT = 3000;

// =========================================================
// MIME 类型映射
// =========================================================
const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// =========================================================
// 构建 AI 提示词
// =========================================================

/**
 * 构建生成推理剧本的提示词
 * @param {string} articleText - 用户输入的文章内容
 * @returns {string} 完整的提示词
 */
function buildPrompt(articleText) {
  const truncated = articleText.substring(0, 3000);
  
  return `你是一个知识侦探助手。用户输入了一篇文章，请分析这篇文章的核心概念和内容，然后生成一个「侦探推理剧本」，让用户在推理中学习这个知识点。

用户文章：
${truncated}

请严格按照以下 JSON 格式返回（不要加 markdown 代码块标记，只返回纯 JSON）：
{
  "title": "（从文章提取的核心概念名）",
  "subtitle": "（一句话描述推理场景）",
  "scene": "（一段推理场景描述，包含文章的核心知识。用 <em> 标签标注关键数字或概念）",
  "clues": [
    { "title": "线索1：XXXX", "hint": "点击查看", "content": "线索详细内容", "insight": "关键洞察：XXXX" },
    { "title": "线索2：XXXX", "hint": "点击查看", "content": "线索详细内容", "insight": "关键洞察：XXXX" },
    { "title": "线索3：XXXX", "hint": "点击查看", "content": "线索详细内容", "insight": "关键洞察：XXXX" }
  ],
  "question": "（基于文章内容设计的推理问题）",
  "options": [
    { "label": "A", "text": "选项A" },
    { "label": "B", "text": "选项B" },
    { "label": "C", "text": "选项C", "correct": true },
    { "label": "D", "text": "选项D" }
  ],
  "analysis": {
    "body": "（详细解析，用 <strong> 标注关键结论）",
    "kps": ["要点1", "要点2", "要点3", "要点4"],
    "formula": "（公式或关键推理步骤）"
  },
  "card": {
    "tag": "（分类标签，如\"物理思维 / PHYSICS\"）",
    "title": "（核心概念名）",
    "subtitle": "（一句话定义）",
    "definition": "（核心定义的详细解释）",
    "explanation": "（通俗易懂的生活化解释）",
    "application": "（应用场景说明）"
  }
}

请确保：
1. 所有内容与用户文章相关
2. 场景、线索、问题都围绕文章的核心知识点展开
3. 答案要有依据
4. 语言通俗易懂
5. 只返回纯 JSON，不要包含 markdown 代码块标记`;
}

// =========================================================
// 调用 AI API
// =========================================================

/**
 * 调用 AI API 生成推理剧本
 * @param {string} articleText - 用户输入的文章内容
 * @returns {Promise<object>} 生成的剧本数据
 */
function callAiApi(articleText) {
  return new Promise((resolve, reject) => {
    // 请求前再次验证 API Key
    if (!AI_CONFIG.key) {
      reject(new Error('API Key 未配置，请设置环境变量 AI_API_KEY'));
      return;
    }
    
    const prompt = buildPrompt(articleText);
    
    const requestBody = JSON.stringify({
      model: AI_CONFIG.model,
      messages: [
        { 
          role: 'system', 
          content: '你是一个教育侦探，擅长将抽象知识转化为有趣的推理谜题。请始终返回纯 JSON，不要包含 markdown 代码块标记。' 
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 4000
    });

    const parsedUrl = new url.URL(AI_CONFIG.endpoint);
    const isHttps = parsedUrl.protocol === 'https:';
    const client = isHttps ? https : http;

    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (isHttps ? 443 : 80),
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AI_CONFIG.key}`,
        'Content-Length': Buffer.byteLength(requestBody)
      },
      timeout: 60000 // 60 秒超时
    };

    const req = client.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            const response = JSON.parse(data);
            const content = response.choices && response.choices[0] && response.choices[0].message && response.choices[0].message.content;
            
            if (!content) {
              reject(new Error('API 返回格式异常'));
              return;
            }
            
            // 提取 JSON
            const jsonStart = content.indexOf('{');
            const jsonEnd = content.lastIndexOf('}');
            
            if (jsonStart !== -1 && jsonEnd !== -1) {
              const jsonStr = content.substring(jsonStart, jsonEnd + 1);
              const scriptData = JSON.parse(jsonStr);
              scriptData.id = 'ai_' + Date.now();
              resolve(scriptData);
            } else {
              reject(new Error('AI 返回的 JSON 格式不正确'));
            }
          } else {
            let errorMsg = `HTTP ${res.statusCode}`;
            try {
              const errResp = JSON.parse(data);
              errorMsg = errResp.error && (errResp.error.message || JSON.stringify(errResp.error)) || errorMsg;
            } catch (e) {}
            reject(new Error(errorMsg));
          }
        } catch (e) {
          reject(new Error('解析 AI 响应失败：' + e.message));
        }
      });
    });

    req.on('error', (err) => {
      reject(new Error('网络请求失败：' + err.message));
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('请求超时，请检查网络连接'));
    });

    req.write(requestBody);
    req.end();
  });
}

// =========================================================
// 静态文件服务
// =========================================================

/**
 * 提供静态文件服务
 * @param {string} filePath - 请求的文件路径
 * @param {http.ServerResponse} res - HTTP 响应对象
 */
function serveStaticFile(filePath, res) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';
  
  fs.readFile(filePath, (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('File not found');
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Server error');
      }
      return;
    }
    
    res.writeHead(200, { 
      'Content-Type': contentType
    });
    res.end(data);
  });
}

// =========================================================
// 主服务器
// =========================================================

const server = http.createServer((req, res) => {
  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // API 路由：生成推理剧本
  if (pathname === '/api/generate' && req.method === 'POST') {
    let body = '';
    let aborted = false;
    const MAX_BODY_SIZE = 10 * 1024 * 1024; // 10MB 限制
    
    req.on('data', (chunk) => {
      if (aborted) return;
      body += chunk;
      if (body.length > MAX_BODY_SIZE) {
        aborted = true;
        req.destroy();
        res.writeHead(413, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Request entity too large' }));
        return;
      }
    });
    
    req.on('end', async () => {
      if (aborted) return;
      try {
        const { text } = JSON.parse(body);
        
        if (!text || text.trim().length < 10) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: '文本内容太短，至少需要 10 个字' }));
          return;
        }

        console.log(`[${new Date().toISOString()}] 收到生成请求，文本长度：${text.length}`);
        
        const scriptData = await callAiApi(text);
        
        console.log(`[${new Date().toISOString()}] 生成成功：${scriptData.title}`);
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, data: scriptData }));
      } catch (error) {
        console.error(`[${new Date().toISOString()}] 生成失败：`, error.message);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message || '生成失败' }));
      }
    });
    return;
  }

  // 健康检查
  if (pathname === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      status: 'ok', 
      message: '知识侦探代理服务器运行中',
      aiConfigured: !!AI_CONFIG.key
    }));
    return;
  }

  // 静态文件服务
  let filePath = pathname === '/' ? '/knowledge-detective-noir.html' : pathname;
  filePath = path.join(__dirname, filePath);
  
  // 路径规范化和安全检查，防止目录遍历攻击
  filePath = path.normalize(filePath);
  
  // 使用 path.relative 进行跨平台安全检查
  // 在 Windows 上，path.normalize('../test') 可能保留盘符，startsWith 检查会失效
  const relativePath = path.relative(__dirname, filePath);
  if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Forbidden');
    return;
  }
  
  serveStaticFile(filePath, res);
});

// =========================================================
// 启动服务器
// =========================================================

server.listen(PORT, () => {
  console.log('='.repeat(60));
  console.log('  知识侦探 - AI 代理服务器');
  console.log('='.repeat(60));
  console.log(`  服务地址：http://localhost:${PORT}`);
  console.log(`  演示页面：http://localhost:${PORT}/knowledge-detective-noir.html`);
  console.log(`  API 地址：http://localhost:${PORT}/api/generate`);
  console.log(`  健康检查：http://localhost:${PORT}/api/health`);
  console.log('='.repeat(60));
  
  if (!AI_CONFIG.key) {
    console.log('\n  ⚠️ 错误：API Key 未配置！');
    console.log('  请通过环境变量 AI_API_KEY 配置您的 API Key');
    console.log('  或创建 .env 文件并添加 AI_API_KEY=your-key');
    console.log('  推荐：硅基流动 https://siliconflow.cn (新用户送 2000 万 Token)');
    console.log('='.repeat(60));
    console.log('\n  服务器启动失败，请先配置 API Key！\n');
    process.exit(1);
  } else {
    console.log('\n  ✓ API 已配置，开箱即用！');
  }
  console.log('='.repeat(60));
});

// 优雅退出
process.on('SIGINT', () => {
  console.log('\n\n  服务器已关闭，再见！');
  process.exit(0);
});
