/**
 * 诊断测试：模拟六爻排盘 + 大师分析
 * 加载 dist 编译后的文件，执行完整流程
 */
const fs = require('fs');
const path = require('path');

// 全局模拟
global.window = global;

// 加载引擎文件
function loadJS(filePath) {
  const code = fs.readFileSync(filePath, 'utf8');
  try {
    eval(code);
  } catch (e) {
    console.error(`[ERROR] 加载 ${filePath} 失败:`, e.message);
    throw e;
  }
}

// 按顺序加载
const distDir = 'E:\\天机阁\\dist';
const files = [
  'static/js/constants.js',
  'static/js/liuyao-engine.js',
  'static/js/masters-engine.js',
  'static/js/domain-analysis.js',
];

console.log('=== 加载引擎文件 ===');
for (const f of files) {
  const fp = path.join(distDir, f);
  console.log(`  加载: ${f}...`);
  try {
    loadJS(fp);
    console.log(`  ✓ ${f} 加载成功`);
  } catch (e) {
    console.error(`  ✗ ${f} 加载失败:`, e.message);
    process.exit(1);
  }
}

// 验证引擎已加载
console.log('\n=== 验证引擎 ===');
console.log('  LiuyaoEngine:', typeof LiuyaoEngine);
console.log('  MastersEngine:', typeof MastersEngine);
console.log('  DomainAnalysis:', typeof DomainAnalysis);

// 获取大师列表
const MASTERS = MastersEngine.MASTERS;
const masterKeys = Object.keys(MASTERS);
console.log(`\n  大师总数: ${masterKeys.length}`);

// 六爻相关大师
const liuyaoCategories = ['六爻', '梅花', '奇门', '大六壬', '综合'];
const liuyaoMasters = [];
for (const key of masterKeys) {
  const m = MASTERS[key];
  if (liuyaoCategories.includes(m.category)) {
    liuyaoMasters.push(m);
  }
}
console.log(`  六爻相关大师: ${liuyaoMasters.length} 位`);
for (const m of liuyaoMasters) {
  console.log(`    - ${m.name} (${m.category})`);
}

// 六爻排盘
console.log('\n=== 六爻排盘 ===');
const lines = [1, 0, 1, 0, 1, 0]; // 示例: 随机爻
let liuyaoResult;
try {
  liuyaoResult = LiuyaoEngine.divine(lines);
  console.log('  ✓ 排盘成功');
  console.log('  本卦:', liuyaoResult.gua_name);
  console.log('  变卦:', liuyaoResult.changed_gua ? liuyaoResult.changed_gua.name : '无');
  console.log('  动爻:', liuyaoResult.dong_yao);
  console.log('  世爻:', liuyaoResult.shi_yao);
  console.log('  应爻:', liuyaoResult.ying_yao);
  console.log('  六亲:', liuyaoResult.liu_qin);
  console.log('  六兽:', liuyaoResult.liu_shou);
  console.log('  纳甲:', liuyaoResult.najia ? liuyaoResult.najia.map(n => n.gan + n.zhi).join(',') : '无');
  console.log('  吉凶分数:', liuyaoResult.score);
  console.log('  趋势:', liuyaoResult.trend);
} catch (e) {
  console.error('  ✗ 排盘失败:', e.message);
  process.exit(1);
}

// 测试大师分析
console.log('\n=== 大师分析测试 ===');

// 从 ep3-liuyao.html 提取的 generateLiuyaoAnalysis 逻辑
function testGenerateLiuyaoAnalysis(master, liuyao, question) {
  try {
    var p = master.pronouns || '吾';
    var guaName = liuyao.gua_name || '—';
    var changedGua = liuyao.changed_gua;
    var changedName = changedGua ? changedGua.name : '';
    var dongYao = liuyao.dong_yao || [];
    var shiYao = liuyao.shi_yao || '?';
    var yingYao = liuyao.ying_yao || '?';
    var liuQin = liuyao.liu_qin || [];
    var liuShou = liuyao.liu_shou || [];
    var najia = liuyao.najia || [];
    var score = liuyao.score || 50;
    var trend = liuyao.trend || 'neutral';
    var shiQin = liuQin[shiYao - 1] || '—';
    var yingQin = yingYao ? liuQin[yingYao - 1] || '—' : '';
    var shiShou = liuShou[shiYao - 1] || '';
    var changedShou = changedGua && changedGua.shou ? (changedGua.shou[shiYao - 1] || '') : '';

    function yaoPos(n) {
      return ['初爻', '二爻', '三爻', '四爻', '五爻', '上爻'][n - 1] || '第' + n + '爻';
    }

    var ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

    function inferTiming(shouldDongYao, domainKey) {
      var zhi = najia ? (najia[shouldDongYao - 1] ? najia[shouldDongYao - 1].zhi : '') : '';
      if (!zhi) return '';
      var chongMap = { 子: '午', 午: '子', 丑: '未', 未: '丑', 寅: '申', 申: '寅', 巳: '亥', 亥: '巳', 卯: '酉', 酉: '卯', 辰: '戌', 戌: '辰' };
      var heMap = { 子: '丑', 丑: '子', 寅: '亥', 亥: '寅', 卯: '戌', 戌: '卯', 辰: '酉', 酉: '辰', 巳: '申', 申: '巳', 午: '未', 未: '午' };
      var chongZhi = chongMap[zhi] || '';
      var heZhi = heMap[zhi] || '';
      var parts = [];
      parts.push('动爻地支「' + zhi + '」');
      if (chongZhi) parts.push('冲「' + chongZhi + '」');
      if (heZhi) parts.push('合「' + heZhi + '」');
      return parts.join(' ');
    }

    function qinDomainDetail(qin, domainKey) {
      var detail = '';
      if (domainKey === 'career') {
        if (qin === '官鬼') detail = '事业线：代表职位、官运、上级认可、工作压力、事业危机。';
        if (qin === '妻财') detail = '事业线：代表薪资待遇、项目收益、资源支持、职场人脉。';
        if (qin === '子孙') detail = '事业线：代表创意、技术能力、解忧之力。';
        if (qin === '父母') detail = '事业线：代表文书合同、公司制度、上级指令、学历背景。';
        if (qin === '兄弟') detail = '事业线：代表竞争、同僚、破财因素。';
      } else {
        if (qin === '官鬼') detail = '压力与阻碍';
        if (qin === '妻财') detail = '资源与收获';
        if (qin === '子孙') detail = '转机与解忧';
        if (qin === '父母') detail = '文书与长辈';
        if (qin === '兄弟') detail = '竞争与分享';
      }
      return detail;
    }

    // 事域检测
    var domainKey = 'general';
    if (typeof DomainAnalysis !== 'undefined' && DomainAnalysis.detectDomain) {
      var dk = DomainAnalysis.detectDomain(question);
      if (dk) domainKey = dk;
    }
    var domainName = { career: '事业', love: '感情', wealth: '财运', health: '健康', study: '学业', general: '综合' }[domainKey] || '综合';
    var judgedName = domainName === '综合' ? '此事' : domainName;

    // 六亲分布
    var qinPositions = {};
    for (var qi = 0; qi < 6; qi++) {
      var q = liuQin[qi] || '';
      if (!qinPositions[q]) qinPositions[q] = [];
      qinPositions[q].push(qi + 1);
    }

    var QIN_MAP = {
      career: { 官鬼: '事业压力与晋升机会', 妻财: '薪资待遇与资源', 子孙: '下属创意与新项目', 父母: '上级文书与合同', 兄弟: '同事竞争与合作关系' },
      general: { 官鬼: '压力与阻碍', 妻财: '资源与收获', 子孙: '转机与解忧', 父母: '文书与长辈', 兄弟: '竞争与分享' },
    };
    var qinMap = QIN_MAP[domainKey] || QIN_MAP.general;

    function shouAdvice(shou) {
      var adv = {
        career: { 青龙: '有贵人提携', 朱雀: '有口舌是非', 勾陈: '事多牵延', 螣蛇: '有虚惊变化', 白虎: '压力较大', 玄武: '有暗箱操作' },
        general: { 青龙: '主喜庆', 朱雀: '主口舌', 勾陈: '主迟滞', 螣蛇: '主虚惊', 白虎: '主凶伤', 玄武: '主暗昧' },
      };
      var m = adv[domainKey] || adv.general;
      return m[shou] || '';
    }

    var dist = Math.abs(shiYao - yingYao);
    var distText = dist <= 1 ? '世应相邻'
      : dist >= 3 ? '世应相隔' + dist + '爻'
      : '世应距离适中';

    function shiYingRelationText(sQin, yQin) {
      if (yQin === sQin) return '世应同六亲';
      return null;
    }

    // OPENING
    var qLevel = score >= 75 ? '大吉' : score >= 60 ? '偏吉' : score >= 40 ? '偏凶' : '大凶';
    var qLevel2 = score >= 75 ? '旺相' : score >= 55 ? '平和' : '衰弱';
    var openTpls = (master.liuyaoOpeningTemplates && master.liuyaoOpeningTemplates.length > 0)
      ? master.liuyaoOpeningTemplates : master.openingTemplates;
    var opening = '';
    if (openTpls && openTpls.length > 0) {
      var tpl = openTpls[0];
      opening = tpl.replace(/{日主}/g, shiQin).replace(/{日主五行}/g, qLevel2).replace(/{旺衰}/g, qLevel2).replace(/{吉凶}/g, qLevel).replace(/{纳甲}/g, guaName).replace(/{命造}/g, guaName);
    } else {
      opening = p + '观汝所问，此乃' + domainName + '之事。';
    }
    if (shiShou) opening += ' 世值' + shiShou + '，' + (shouAdvice(shiShou) || '') + '。';

    // OVERVIEW
    var overview = '';
    overview += '【问题拆解】\n';
    overview += '汝问「' + question + '」，此事属' + domainName + '。\n';
    overview += '\n【卦象总览】\n';
    overview += '本卦「' + guaName + '」，六亲分布：' + liuQin.join('、') + '。';
    overview += '世爻在' + yaoPos(shiYao) + '（' + shiQin + '），代表' + (qinMap[shiQin] || shiQin) + '；';
    overview += '应爻在' + yaoPos(yingYao) + '（' + yingQin + '），代表' + (qinMap[yingQin] || yingQin) + '。';
    if (dongYao.length > 0) {
      overview += '\n【动爻分析】\n';
      for (var di = 0; di < dongYao.length; di++) {
        var d = dongYao[di];
        var dq = liuQin[d - 1] || '—';
        var ds = liuShou[d - 1] || '';
        overview += yaoPos(d) + '临' + dq + (ds ? '值' + ds : '') + '。';
      }
    }

    // SPECIALTY
    var specialty = '';
    specialty += '【取用神】\n';
    var yongShenParts = [];
    yongShenParts.push('世爻' + yaoPos(shiYao) + '临' + shiQin + '——代表你自己');
    yongShenParts.push('应爻' + yaoPos(yingYao) + '临' + yingQin + '——代表对方或外部环境');
    specialty += yongShenParts.join('\n') + '\n';

    specialty += '\n【你的状态】\n';
    var youState = [];
    youState.push('世爻临' + shiQin + '居' + yaoPos(shiYao) + '——你是主动参与者');
    specialty += youState.join('\n') + '\n';

    specialty += '\n【对方/外部状态】\n';
    var otherState = [];
    otherState.push('应爻临' + yingQin + '居' + yaoPos(yingYao) + '——外部环境');
    specialty += otherState.join('\n') + '\n';

    specialty += '\n【动爻分析】\n';
    if (dongYao.length > 0) {
      for (var di2 = 0; di2 < dongYao.length; di2++) {
        var d2 = dongYao[di2];
        var dQin = liuQin[d2 - 1] || '—';
        var dShou = liuShou[d2 - 1] || '';
        specialty += yaoPos(d2) + '动，临' + dQin + (dShou ? '值' + dShou : '') + '。\n';
      }
    } else {
      specialty += '六爻安静，无动爻。\n';
    }

    if (changedName && dongYao.length > 0) {
      specialty += '\n【变卦详解】\n';
      specialty += '本卦「' + guaName + '」变为「' + changedName + '」。\n';
    }

    specialty += '\n\n【综合判断】\n';
    if (dongYao.length > 0) {
      specialty += '此卦有动爻，' + (score >= 60 ? '整体趋势偏向有利' : '整体趋势存在挑战');
    } else {
      specialty += '此卦六爻安静';
    }
    if (dist >= 3) specialty += '。此外，世应相隔较远。';

    specialty += '\n\n【针对汝问「' + question + '」】\n';
    specialty += score >= 60 ? '此事结果向好。' : '此事结果一般。';

    specialty += '\n\n【给你的建议】\n';
    specialty += '宜：\n  · 把握当前态势\n\n不宜：\n  · 不可轻举妄动\n';

    // 应期推断
    if (dongYao.length > 0 && najia) {
      specialty += '\n【应期推断】\n';
      var timingParts = [];
      for (var ti = 0; ti < dongYao.length; ti++) {
        var tiText = inferTiming(dongYao[ti], domainKey);
        if (tiText) timingParts.push(tiText);
      }
      if (timingParts.length > 0) {
        specialty += timingParts.join('\n');
      } else {
        specialty += '动爻无明确地支，应期需结合具体问事和时令综合判断。';
      }
    }

    // 六亲事域详解
    specialty += '\n【六亲事域详解】\n';
    var qinDetails = [];
    var allQin = ['官鬼', '妻财', '子孙', '父母', '兄弟'];
    for (var qi2 = 0; qi2 < allQin.length; qi2++) {
      var q2 = allQin[qi2];
      var posArr = qinPositions[q2] || [];
      if (posArr.length > 0) {
        var posText = posArr.map(function (p) { return yaoPos(p); }).join('、');
        var detailText = qinDomainDetail(q2, domainKey);
        if (detailText) {
          var movedFlag = posArr.some(function (p) { return dongYao.indexOf(p) >= 0; }) ? ' ⚡动' : '';
          qinDetails.push('『' + q2 + '』' + posText + movedFlag + '——' + detailText);
        }
      }
    }
    if (qinDetails.length > 0) {
      specialty += qinDetails.join('\n\n');
    } else {
      specialty += '六亲分布已完整呈现。';
    }

    // QUOTE
    var quote = '';
    var quoteTpls = (master.liuyaoQuoteTemplates && master.liuyaoQuoteTemplates.length > 0)
      ? master.liuyaoQuoteTemplates : master.quoteTemplates;
    if (quoteTpls && quoteTpls.length > 0) {
      var qt = quoteTpls[0];
      quote = p + '曰：' + qt;
    } else {
      quote = p + '曰：' + '《易经》云："穷则变，变则通。"';
    }

    // CLOSING
    var closing = '';
    var closeTpls = (master.liuyaoClosingTemplates && master.liuyaoClosingTemplates.length > 0)
      ? master.liuyaoClosingTemplates : master.closingTemplates;
    if (closeTpls && closeTpls.length > 0) {
      var ct = closeTpls[0];
      closing = ct.replace(/{结论}/g, score >= 60 ? '吉' : '凶').replace(/{建议}/g, '顺应时势');
    } else {
      closing = p + '曰：顺应时势。';
    }

    return { opening, overview, specialty, quote, closing };
  } catch (err) {
    return { error: err.message, stack: err.stack };
  }
}

// 测试每个大师
const question = '想问一下最近工作运势如何，有没有晋升机会？';

for (const m of liuyaoMasters) {
  console.log(`\n  --- ${m.name} (${m.id}) ---`);
  console.log(`  模板: 开=${!!m.liuyaoOpeningTemplates}/${!!m.openingTemplates}, 引=${!!m.liuyaoQuoteTemplates}/${!!m.quoteTemplates}, 结=${!!m.liuyaoClosingTemplates}/${!!m.closingTemplates}`);

  const result = testGenerateLiuyaoAnalysis(m, liuyaoResult, question);
  if (result.error) {
    console.log(`  ✗ 错误: ${result.error}`);
    console.log(`  Stack: ${result.stack}`);
  } else {
    console.log(`  ✓ 成功`);
    console.log(`  开篇: ${result.opening.substring(0, 80)}...`);
    console.log(`  总论: ${result.overview.substring(0, 80)}...`);
    console.log(`  专论: ${result.specialty.substring(0, 200)}...`);
    // 检查应期推断
    if (result.specialty.indexOf('【应期推断】') >= 0) {
      console.log(`  ✓ 含应期推断`);
    } else {
      console.log(`  ✗ 缺少应期推断`);
    }
    // 检查六亲事域详解
    if (result.specialty.indexOf('【六亲事域详解】') >= 0) {
      console.log(`  ✓ 含六亲事域详解`);
    }
  }
}

console.log('\n=== 测试完成 ===');