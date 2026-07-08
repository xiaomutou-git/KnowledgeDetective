const fs = require('fs');
const html = fs.readFileSync('knowledge-detective-noir.html','utf8');
const vm = require('vm');
const matches = html.match(/<script>([\s\S]*?)<\/script>/g);
if (!matches || matches.length === 0) { console.log('no inline script'); process.exit(1); }
let code = matches.map(m => m.replace(/<\/?script>/g, '')).join('\n');
// 把 let/const 顶层声明替换成 var，避免重复声明问题
code = code.replace(/^(let|const)\s+SCRIPTS\s*=/m, 'var SCRIPTS =')
           .replace(/^(let|const)\s+currentScript\s*=/m, 'var currentScript =')
           .replace(/^(let|const)\s+hasAnswered\s*=/m, 'var hasAnswered =');

const ctx = {
  window: {},
  document: {
    getElementById: () => null,
    createElement: (t) => ({ appendChild(){}, classList:{add(){},remove(){},contains(){return false;}}, style:{}, setAttribute(){}, innerHTML:'', textContent:'', dataset:{} }),
    querySelectorAll: () => []
  },
  localStorage: { getItem(){return null;}, setItem(){} },
  toast: ()=>{},
  showPage: ()=>{},
  SCRIPTS: {},
  currentScript: null,
  hasAnswered: false,
  _collectedClues: 0,
  console,
  setTimeout,
  clearTimeout
};
vm.createContext(ctx);

// 运行主脚本
vm.runInContext(code, ctx);

const testScript = `
const sample = '贝叶斯定理是概率论中的一个重要定理。它描述的是在已知某些证据的情况下，对某个假设概率的更新。在医学检测中，贝叶斯定理可以帮助我们理解阳性结果的真实含义。例如，一种罕见病的发病率为0.1%，检测的真阳性率为99%，假阳性率为5%。当一个人检测呈阳性时，他真正患病的概率其实只有约2%。这个反直觉的结果告诉我们，基础比率在概率判断中至关重要。';
const s = generateCustomScript(sample);
console.log('ID:', s.id);
console.log('Title:', s.title);
console.log('Chap:', s.chap);
console.log('Difficulty:', s.difficulty);
console.log('Clues count (should be 3):', Array.isArray(s.clues) ? s.clues.length : s.clues);
console.log('Scene count:', s.scene.length);
console.log('Options count:', s.options.length);
console.log('Has analysis.body?', !!s.analysis.body);
console.log('Has analysis.kps?', Array.isArray(s.analysis.kps) && s.analysis.kps.length > 0);
console.log('Has analysis.formula?', !!s.analysis.formula);
console.log('Has card.def/exp/app?', !!s.card.def && !!s.card.exp && !!s.card.app);
console.log('_isCustom:', s._isCustom);
console.log('_rawSource length:', s._rawSource.length);
const correctCount = s.options.filter(o => o.correct).length;
console.log('Correct options (should be 1):', correctCount);
console.log('\\n--- Scene preview ---');
s.scene.forEach((p,i) => console.log((i+1)+': '+p.substring(0, 60)));
console.log('\\n--- Clues preview ---');
s.clues.forEach((c,i) => console.log((i+1)+'. '+c.title+' :: '+c.body.substring(0,40)));
console.log('\\n--- Question ---');
console.log(s.question);
s.options.forEach(o => console.log(o.label+'. '+o.text.substring(0,50)+'... ['+(o.correct?'OK':'')+']'));
`;

try { vm.runInContext(testScript, ctx); } catch(e) { console.error('RUNTIME:', e.message, e.stack); }
