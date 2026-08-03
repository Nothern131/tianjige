/**
 * 领域检测修复验证测试
 * 运行: node test-domain-fix.js
 */

// 模拟 domain-analysis.js 的 detectDomain 逻辑
(function () {
  'use strict';

  var DOMAINS = {
    career:   { key: 'career',   name: '事业前程', keywords: ['事业', '工作', '职场', '升职', '跳槽', '创业', '生意', '老板', '同事', '项目', '前途', '职业', '公司', '企业', '单位', '面试', '求职', '转行', '晋升', '公务员', '考公', '体制', '编制', '铁饭碗', '互联网', '大厂', 'IT', '行业', '上班', '辞职', '离职', '招聘', '应聘', '加班', '薪资', '待遇', '家族企业', '继承家业'] },
    love:     { key: 'love',     name: '感情姻缘', keywords: ['感情', '爱情', '婚姻', '恋爱', '分手', '复合', '对象', '伴侣', '表白', '暗恋', '相亲', '单身', '脱单', '出轨', '暧昧', '缘分', '正缘', '桃花', '离婚', '结婚', '夫妻', '未婚', '已婚', '分居', '复婚', '再婚', '姻缘', '老公', '老婆', '吵架', '冷战', '配偶', '二婚', '头婚', '再嫁', '续弦', '改嫁', '娶媳', '嫁人'] },
    wealth:   { key: 'wealth',   name: '财运财富', keywords: ['财运', '钱', '财富', '投资', '理财', '股票', '基金', '收入', '债务', '亏损', '赚钱', '偏财', '正财', '花销', '贷款', '买房', '买车'] },
    health:   { key: 'health',   name: '健康平安', keywords: ['健康', '身体', '疾病', '生病', '康复', '手术', '体检', '失眠', '头痛', '疼痛', '养生', '锻炼', '减肥', '怀孕', '平安'] },
    study:    { key: 'study',    name: '学业考试', keywords: ['学业', '考试', '学习', '成绩', '高考', '考研', '考证', '升学', '毕业', '论文', '学校', '专业', '录取', '分数', '挂科', '读书', '备考', '复习', '科目'] },
    family:   { key: 'family',   name: '家庭关系', keywords: ['家庭', '家人', '父母', '子女', '孩子', '亲情', '婆媳', '婆媳矛盾', '亲戚', '长辈', '兄弟姐妹', '公公', '婆婆', '岳父', '岳母', '继母', '继父', '养父', '养母', '独生子', '独生女', '亲家', '后代', '生育', '代沟', '家教', '家风', '祖孙', '传宗', '香火', '过继', '领养', '原生家庭', '家庭矛盾', '父母婚姻', '子女婚姻', '子女的婚姻', '孩子婚姻', '孩子的婚姻'] },
    social:   { key: 'social',   name: '人际关系', keywords: ['朋友', '社交', '人际', '合伙', '小人', '贵人', '人脉', '客户', '和解', '背叛'] },
    travel:   { key: 'travel',   name: '出行迁移', keywords: ['出行', '旅游', '出国', '移民', '远行', '搬家', '出差', '旅行', '签证', '留学', '航班', '旅途', '异地'] },
    general:  { key: 'general',  name: '综合运势', keywords: ['运势', '命运', '运气', '前程', '整体', '综合', '人生', '未来', '怎么样', '如何', '好不好', '顺利', '吉凶', '好坏', '走向', '趋势', '近况', '前路', '前景', '天命', '命数', '造化'] }
  };

  var DOMAIN_LIST = ['career', 'love', 'wealth', 'health', 'study', 'social', 'family', 'travel', 'general'];

  function detectDomain(question) {
    if (!question || !question.trim()) return null;
    var q = question;
    var best = null, bestScore = 0;
    for (var i = 0; i < DOMAIN_LIST.length; i++) {
      var dk = DOMAIN_LIST[i];
      if (dk === 'general' && best && best !== 'general') continue;
      var dm = DOMAINS[dk];
      var score = 0;
      for (var j = 0; j < dm.keywords.length; j++) {
        if (q.indexOf(dm.keywords[j]) !== -1) score += dm.keywords[j].length;
      }
      if (score > bestScore && score > 0) { bestScore = score; best = dk; }
    }
    if (!best) {
      var fuzzyMap = [
        { regex: /感情|爱情|恋爱|婚姻|分手|复合|对象|伴侣|表白|暗恋|相亲|单身|脱单|出轨|暧昧|缘分|正缘|桃花|姻缘|离婚|结婚|夫妻|未婚|已婚|分居|复婚|再婚|老公|老婆|吵架|冷战|配偶|二婚|嫁人|娶媳/, domain: 'love' },
        { regex: /财运|财富|钱|投资|理财|股票|基金|收入|债务|亏损|赚钱|花销|贷款|买房|买车/, domain: 'wealth' },
        { regex: /健康|身体|疾病|生病|康复|手术|体检|失眠|头痛|养生|减肥|怀孕|平安/, domain: 'health' },
        { regex: /学业|考试|学习|成绩|高考|考研|考证|升学|毕业|论文|学校|专业|录取|分数|挂科|读书/, domain: 'study' },
        { regex: /家庭|家人|亲情|父母|子女|孩子|婆媳|亲戚|长辈|兄弟姐妹|公公|婆婆|岳父|岳母|继母|继父|养父|养母|独生子|独生女|亲家|后代|生育|代沟|家教|家风|祖孙|传宗|香火|过继|领养|原生家庭|家庭矛盾|父母婚姻|子女婚姻/, domain: 'family' },
        { regex: /朋友|社交|人际|合作|合伙|纠纷|矛盾|小人|贵人|人脉|客户|竞争|对手|和解|背叛/, domain: 'social' },
        { regex: /出行|旅游|出国|移民|远行|搬家|出差|旅行|签证|留学|航班|旅途|异地/, domain: 'travel' },
        { regex: /工作|职场|升职|跳槽|创业|生意|老板|同事|项目|前途|职业|公司|企业|单位|面试|求职|转行|晋升|公务员|考公|体制|行业|发展|上班|辞职|离职|招聘|应聘|加班|薪资|待遇|家族企业|继承家业/, domain: 'career' },
        { regex: /运势|命运|运气|前程|整体|综合|人生|未来|怎么样|如何|好不好|顺利|吉凶|好坏|走向|趋势|近况|前路|前景|天命|命数|造化/, domain: 'general' }
      ];
      for (var fi = 0; fi < fuzzyMap.length; fi++) {
        if (fuzzyMap[fi].regex.test(q)) {
          best = fuzzyMap[fi].domain;
          break;
        }
      }
    }
    return best || 'general';
  }

  var passed = 0, failed = 0;
  var failures = [];

  function test(desc, question, expected) {
    var result = detectDomain(question);
    var status = result === expected;
    if (status) {
      passed++;
    } else {
      failed++;
      failures.push({ desc: desc, question: question, expected: expected, got: result });
    }
    console.log((status ? 'PASS' : 'FAIL') + ' | ' + desc + ' | "' + question + '" → ' + result + (status ? '' : ' (expected: ' + expected + ')'));
  }

  console.log('========== 领域检测修复验证 ==========\n');

  // 1. 核心修复：事业+家庭关键词混合（应归事业）
  console.log('--- 核心修复：事业语境中的家庭词 ---');
  test('继承家业→事业', '父母让我继承家业但我想考公', 'career');
  test('继承家业→事业2', '继承家业还是自己创业', 'career');
  test('家族企业→事业', '家族企业的发展前景', 'career');
  test('家族企业→事业2', '家族企业好还是去大厂好', 'career');
  test('企业+父母→事业', '父母想让我去企业上班', 'career');
  test('父母+考公→事业', '父母让我考公务员', 'career');
  test('父母+工作→事业', '父母希望我找个稳定的工作', 'career');
  test('父母+跳槽→事业', '父母反对我跳槽', 'career');
  console.log('');

  // 2. 新增关键词测试
  console.log('--- 新增关键词测试 ---');
  test('企业→事业', '这个企业发展怎么样', 'career');
  test('单位→事业', '在事业单位工作好还是企业好', 'career');
  test('上班→事业', '上班太累了想辞职', 'career');
  test('辞职→事业', '辞职去创业', 'career');
  test('离职→事业', '离职后找工作', 'career');
  test('招聘→事业', '最近招聘市场怎么样', 'career');
  test('应聘→事业', '去应聘了一家大厂', 'career');
  test('加班→事业', '加班太多想换工作', 'career');
  test('薪资→事业', '薪资待遇不满意', 'career');
  test('待遇→事业', '互联网行业待遇怎么样', 'career');
  test('打工→事业', '打工还是创业', 'career'); // "打工"不在关键词中，但模糊匹配会匹配"工作/创业"
  console.log('');

  // 3. 家庭领域仍能正确识别
  console.log('--- 家庭领域不应受影响的测试 ---');
  test('家庭矛盾→家庭', '家庭矛盾怎么化解', 'family');
  test('婆媳矛盾→家庭', '婆媳矛盾越来越严重', 'family');
  test('子女婚姻→家庭', '子女的婚姻问题让我头疼', 'family');
  test('父母婚姻→家庭', '父母婚姻出现问题', 'family');
  test('原生家庭→家庭', '原生家庭对我的影响', 'family');
  test('孩子教育→家庭', '孩子的教育问题', 'family'); // "孩子"匹配
  test('父母健康→健康', '父母身体健康', 'health'); // "父母" vs "健康" - 这取决于哪个先匹配
  console.log('');

  // 4. 其他领域边界测试
  console.log('--- 其他领域边界测试 ---');
  test('考公→事业', '考公和考研哪个好', 'career');
  test('考研考公→事业', '考研和考公哪个好', 'career'); // "考研"2分+"考公"2分，career先匹配
  test('互联网→事业', '互联网行业还能干多久', 'career');
  test('大厂→事业', '大厂裁员怎么办', 'career');
  test('夫妻吵架→感情', '夫妻吵架怎么解决', 'love');
  test('父母离婚→感情', '父母离婚对我的影响', 'love');
  test('买房→财运', '买房投资还是自住', 'wealth');
  test('贷款→财运', '贷款压力大怎么办', 'wealth');
  test('怀孕→健康', '怀孕期间需要注意什么', 'health');
  test('出国留学→出行', '出国留学还是国内读研', 'travel'); // "留学" vs "出国" vs "考研"
  test('合作创业→事业', '和朋友合作创业', 'career'); // "合作"(social) vs "创业"(career) - career should win
  console.log('');

  // 5. 综合运势兜底
  console.log('--- 综合运势兜底 ---');
  test('无关键词→综合', '最近怎么样', 'general');
  test('未来→综合', '未来会好吗', 'general');
  console.log('');

  // 6. 用户报告的问题场景模拟
  console.log('--- 用户报告场景模拟 ---');
  test('场景1', '互联网工作5年，纠结继续大厂还是考公', 'career');
  test('场景2', '考公务员好还是继续干互联网', 'career');
  test('场景3', '在单位上班5年了想辞职创业', 'career');
  test('场景4', '父母让我继承家业但我更想去互联网公司', 'career');
  test('场景5', '家族企业没前途，想去大厂', 'career');
  test('场景6', '打工还是考公哪个更有前途', 'career');
  test('场景7', '继承家业还是自己创业做互联网', 'career');
  console.log('');

  console.log('========== 结果 ==========');
  console.log('通过: ' + passed + '/' + (passed + failed));
  console.log('失败: ' + failed + '/' + (passed + failed));

  if (failures.length > 0) {
    console.log('\n--- 失败详情 ---');
    for (var i = 0; i < failures.length; i++) {
      var f = failures[i];
      console.log('[' + f.desc + '] "' + f.question + '" expected=' + f.expected + ' got=' + f.got);
    }
  }

  process.exit(failed > 0 ? 1 : 0);
})();