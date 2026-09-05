/**
 * 天机阁 · 太乙神数引擎 v1 — 纯前端算法，零API调用
 * 太乙积年 · 十六神 · 九宫 · 五福三基 · 四神
 */
(function (global) {
  'use strict';

  /* ========== 一、基础常量 ========== */

  /** 太乙十六神，按顺序排列 */
  var GODS_16 = [
    '地主',
    '阳德',
    '和德',
    '吕申',
    '高丛',
    '太阳',
    '大炅',
    '大神',
    '大威',
    '天道',
    '大武',
    '武德',
    '太簇',
    '阴主',
    '阴德',
    '大义',
  ];

  /** 九宫 */
  var GONG_9 = ['乾', '离', '艮', '震', '中', '兑', '坤', '坎', '巽'];

  /** 九宫方位 */
  var GONG_DIR = {
    乾: '西北',
    离: '南',
    艮: '东北',
    震: '东',
    中: '中',
    兑: '西',
    坤: '西南',
    坎: '北',
    巽: '东南',
  };

  /** 十六神对应宫位（按局数0-23排列，每局太乙入一宫，十六神依次排布） */
  var GONG_POSITIONS = ['乾', '离', '艮', '震', '中', '兑', '坤', '坎', '巽'];

  /** 太乙上古甲子年（公元前10153917年） */
  var TAIYI_EPOCH = 10153917;

  /** 天干 */
  var GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
  /** 地支 */
  var ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

  /** 时辰对应地支索引 */
  var SHICHEN_ZHI_MAP = {
    子时: 0,
    丑时: 1,
    寅时: 2,
    卯时: 3,
    辰时: 4,
    巳时: 5,
    午时: 6,
    未时: 7,
    申时: 8,
    酉时: 9,
    戌时: 10,
    亥时: 11,
  };

  /** 十六神吉凶属性 */
  var GOD_AUSPICIOUS = {
    地主: '吉',
    阳德: '吉',
    和德: '吉',
    吕申: '吉',
    高丛: '吉',
    太阳: '大吉',
    大炅: '凶',
    大神: '凶',
    大威: '凶',
    天道: '吉',
    大武: '凶',
    武德: '吉',
    太簇: '凶',
    阴主: '凶',
    阴德: '吉',
    大义: '吉',
  };

  /** 十六神五行属性 */
  var GOD_WUXING = {
    地主: '土',
    阳德: '木',
    和德: '火',
    吕申: '土',
    高丛: '金',
    太阳: '火',
    大炅: '水',
    大神: '水',
    大威: '金',
    天道: '金',
    大武: '水',
    武德: '金',
    太簇: '木',
    阴主: '水',
    阴德: '木',
    大义: '火',
  };

  /* ========== 二、太乙核心计算 ========== */

  /**
   * 计算太乙积年数
   * 公式：积年 = 上古甲子年(10153917) + 目标年份
   */
  function calcJiNian(year) {
    return TAIYI_EPOCH + year;
  }

  /**
   * 计算太乙局数
   * 积年 mod 24
   */
  function calcJuShu(jiNian) {
    return jiNian % 24;
  }

  /**
   * 计算太乙行度（入宫数）
   * 太乙每年行一宫，二十四年巡行一周
   * 积年 mod 24 得入宫序数
   * 太乙入宫规则：阳局顺行，阴局逆行（简化：按局数取模）
   */
  function calcTaiyiGong(juShu) {
    // 太乙行宫：每24年一周，局数0→乾1，局数1→离2，...局数8→巽9，局数9→离2，以此类推
    // 奇数为阳局（顺行），偶数为阴局（逆行）
    var cycle = juShu % 18; // 18局一个完整九宫循环
    if (cycle < 9) {
      return GONG_POSITIONS[cycle];
    } else {
      // 逆行
      return GONG_POSITIONS[17 - cycle];
    }
  }

  /**
   * 排列十六神位置
   * 根据局数，太乙入某宫，十六神依次排列于九宫和间神位
   */
  function arrangeGods(juShu) {
    var gods = [];
    var startIdx = juShu % 16; // 起始神索引

    // 九宫循环索引
    for (var i = 0; i < 16; i++) {
      var godIdx = (startIdx + i) % 16;
      var godName = GODS_16[godIdx];

      // 宫位映射：每16神对应9宫+7间神
      var position;
      var gongIdx = i % 9;
      if (i < 9) {
        position = GONG_POSITIONS[gongIdx] + '宫(正)';
      } else if (i < 16) {
        var between = GONG_POSITIONS[gongIdx] + '-' + GONG_POSITIONS[(gongIdx + 1) % 9];
        position = between + '(间)';
      } else {
        position = GONG_POSITIONS[gongIdx] + '宫';
      }

      gods.push({
        name: godName,
        position: GONG_DIR[GONG_POSITIONS[gongIdx]] || '中',
        auspicious: GOD_AUSPICIOUS[godName] || '平',
        wuxing: GOD_WUXING[godName] || '',
      });
    }

    // 按宫位重排：乾→离→艮→震→中→兑→坤→坎→巽，间神插入宫之间
    var ordered = [];
    var gongNames = ['乾', '离', '艮', '震', '中', '兑', '坤', '坎', '巽'];

    for (var g = 0; g < gongNames.length; g++) {
      var gName = gongNames[g];
      // 找该宫的正神
      for (var j = 0; j < gods.length; j++) {
        if (gods[j].position === GONG_DIR[gName]) {
          ordered.push(gods[j]);
          break;
        }
      }
    }

    // 补间神
    for (var k = 0; k < gods.length; k++) {
      if (ordered.indexOf(gods[k]) === -1) {
        ordered.push(gods[k]);
      }
    }

    return ordered;
  }

  /**
   * 计算五福
   * 五福：太乙五福之神，主福禄
   * 公式：积年 mod 225 ÷ 45
   */
  function calcWufu(jiNian) {
    var wufuIdx = Math.floor((jiNian % 225) / 45);
    var gongNames = ['乾', '离', '艮', '震', '中', '兑', '坤', '坎', '巽'];
    var wufuGong = gongNames[wufuIdx % 9];
    var wufuDir = GONG_DIR[wufuGong];
    return '五福入' + wufuGong + '宫（' + wufuDir + '），主福禄双全，百事顺遂';
  }

  /**
   * 计算三基（君基、臣基、民基）
   * 太乙三基：君基主国运，臣基主臣道，民基主民生
   * 君基：积年 mod 360 ÷ 30
   * 臣基：积年 mod 360 ÷ 30（偏移）
   * 民基：积年 mod 360 ÷ 30（偏移）
   */
  function calcSanji(jiNian) {
    var gongNames = ['乾', '离', '艮', '震', '中', '兑', '坤', '坎', '巽'];

    var junIdx = Math.floor((jiNian % 360) / 30) % 9;
    var chenIdx = Math.floor(((jiNian + 120) % 360) / 30) % 9;
    var minIdx = Math.floor(((jiNian + 240) % 360) / 30) % 9;

    var jun = gongNames[junIdx];
    var chen = gongNames[chenIdx];
    var min = gongNames[minIdx];

    return (
      '君基入' +
      jun +
      '宫（' +
      GONG_DIR[jun] +
      '），臣基入' +
      chen +
      '宫（' +
      GONG_DIR[chen] +
      '），民基入' +
      min +
      '宫（' +
      GONG_DIR[min] +
      '）'
    );
  }

  /**
   * 计算四神（天乙、地乙、直符、四神）
   * 天乙：积年 mod 360 ÷ 36
   * 地乙：积年 + 180 mod 360 ÷ 36
   * 直符：积年 + 90 mod 360 ÷ 36
   * 四神：积年 + 270 mod 360 ÷ 36
   */
  function calcSishen(jiNian) {
    var gongNames = ['乾', '离', '艮', '震', '中', '兑', '坤', '坎', '巽'];

    var tianyiIdx = Math.floor((jiNian % 360) / 36) % 9;
    var diyiIdx = Math.floor(((jiNian + 180) % 360) / 36) % 9;
    var zhifuIdx = Math.floor(((jiNian + 90) % 360) / 36) % 9;
    var sishenIdx = Math.floor(((jiNian + 270) % 360) / 36) % 9;

    return {
      tianyi: { name: '天乙', position: gongNames[tianyiIdx] + '宫（' + GONG_DIR[gongNames[tianyiIdx]] + '）' },
      diyi: { name: '地乙', position: gongNames[diyiIdx] + '宫（' + GONG_DIR[gongNames[diyiIdx]] + '）' },
      zhifu: { name: '直符', position: gongNames[zhifuIdx] + '宫（' + GONG_DIR[gongNames[zhifuIdx]] + '）' },
      sishen: { name: '四神', position: gongNames[sishenIdx] + '宫（' + GONG_DIR[gongNames[sishenIdx]] + '）' },
    };
  }

  /**
   * 计算太乙行度（360度制）
   */
  function calcTaiyiDegree(jiNian) {
    return jiNian % 360;
  }

  /* ========== 三、解读生成 ========== */

  /** 九宫太乙释义（每宫含卦象、含义、宜忌） */
  var GONG_INTERPRETATION = {
    乾: {
      gua: '乾为天',
      meaning: '天道运行，刚健中正，国运昌隆之象。',
      action: '宜开拓进取、行大事、决断要务；忌优柔寡断、瞻前顾后。',
      why: '乾卦六爻皆阳，纯阳至健。太乙入此宫，象征天时在我、大势可借。',
    },
    离: {
      gua: '离为火',
      meaning: '文明昭著，礼乐昌盛，文教兴隆之象。',
      action: '宜文化教育、修德明志、传播善名；忌虚浮不实、好高骛远。',
      why: '离卦外阳内阴，光明附丽。太乙入此宫，象征以文明化天下，功在教化。',
    },
    艮: {
      gua: '艮为山',
      meaning: '静止蓄势，厚积薄发，内省修身之象。',
      action: '宜闭关修养、整理旧务、蓄力待发；忌冒进躁动、强攻硬上。',
      why: '艮卦两阴覆于上，一阳止于下，主止。太乙入此宫，象征时机未到，当以静制动。',
    },
    震: {
      gua: '震为雷',
      meaning: '震动变革，万象更新，破旧立新之象。',
      action: '宜改革创新、启动新计划、破除陈规；忌因循守旧、畏缩不前。',
      why: '震卦一阳动于下，阳气勃发。太乙入此宫，象征旧局将破、新机已现，当顺势而变。',
    },
    中: {
      gua: '中宫为枢',
      meaning: '统御四方，执中守正，全局运筹之象。',
      action: '宜统筹全局、制定战略、居中调度；忌偏听偏信、顾此失彼。',
      why: '中宫为九宫之枢，太乙居此象征掌控全局、居中制衡。当以中正之道行事。',
    },
    兑: {
      gua: '兑为泽',
      meaning: '喜悦沟通，口舌是非并存，外交谈判之象。',
      action: '宜外交谈判、沟通协调、缔结盟约；忌口无遮拦、言辞失当。',
      why: '兑卦上缺下连，主口舌喜悦。太乙入此宫，象征以言语通达事物，然亦需防祸从口出。',
    },
    坤: {
      gua: '坤为地',
      meaning: '厚德载物，包容万象，积蓄力量之象。',
      action: '宜积蓄力量、以柔克刚、宽容待人；忌锋芒毕露、强争硬抢。',
      why: '坤卦六爻皆阴，纯阴至顺。太乙入此宫，象征当前宜顺势而为、以退为进，不可强求。',
    },
    坎: {
      gua: '坎为水',
      meaning: '险陷暗流，危机潜伏，内省反思之象。',
      action: '宜谨言慎行、内省反思、韬光养晦；忌冒险冲动、正面强攻。',
      why: '坎卦外虚内实，水流险陷。太乙入此宫，象征表面平静之下暗藏危机，当以谨慎为上。',
    },
    巽: {
      gua: '巽为风',
      meaning: '风行天下，政令畅通，传播推广之象。',
      action: '宜发布政令、宣传推广、传播资讯；忌朝令夕改、信令不一。',
      why: '巽卦下断上入，风无孔不入。太乙入此宫，象征顺势传播，影响力可及远方。',
    },
  };

  /** 十六神含义表 */
  var GOD_MEANING = {
    地主: '主大地安固，万物归藏，为太乙之本。吉：地宁君安，事业根基稳固。',
    阳德: '主阳和之德，施恩布惠，助人为乐。吉：得人扶持，善缘广结。',
    和德: '主和谐中正，和合万物，以柔济刚。吉：人际和谐，合作顺利。',
    吕申: '主申明律法，公正无私，执法如山。吉：是非分明，正义得伸。',
    高丛: '主高洁超然，不随俗流，清贵自持。吉：名声清显，贵人暗助。',
    太阳: '主大明照临，威德广被，万象更新。大吉：光明普照，运势亨通，百事可为。',
    大炅: '主火光摇曳，虚饰不实，事有反复。凶：虚名无实，易遭欺骗，宜防小人。',
    大神: '主神明降临，威严肃穆，敬畏为先。凶：神威难测，行事须敬，不可轻慢。',
    大威: '主威严震慑，强势压人，以力服众。凶：强势过盛，易生冲突，宜收敛锋芒。',
    天道: '主天道循环，因果不爽，顺势而行。吉：天道扶持，顺势则昌，逆之则败。',
    大武: '主武勇刚烈，兵戈杀伐，以力取胜。凶：好勇斗狠，易招伤亡，宜退让为安。',
    武德: '主武德兼备，刚柔并济，以武止戈。吉：武备有备，以战止战，先防后攻。',
    太簇: '主律管发声，时机已到，当有所为。凶：时运未至，强求无益，宜耐心等待。',
    阴主: '主阴私隐秘，暗中行动，不宜示人。凶：暗流涌动，小人藏患，宜明察秋毫。',
    阴德: '主阴冥之德，暗中有救，积善余庆。吉：阴德护佑，不为人知而自保。',
    大义: '主大义凛然，舍身取义，正气长存。吉：正气在身，邪不可干，大义灭亲。',
  };

  /**
   * 生成太乙解读文本（九段式：结论→依据→白话解释→具体做法）
   */
  function generateInterpretation(taiyiGong, gods, wufu, sanji, sishen, juShu, jiNian) {
    var lines = [];
    var taiyiDir = GONG_DIR[taiyiGong] || '中';
    var gongInfo = GONG_INTERPRETATION[taiyiGong] || {};

    // 一、局象概述
    lines.push('【局象概述】');
    lines.push(
      '结论：太乙行至' + taiyiGong + '宫（' + taiyiDir + '方），局数' + juShu + '，时值第' + (Math.floor(jiNian / 360) + 1) + '纪' + getEpochName(jiNian) + '。'
    );
    lines.push(
      '依据：太乙积年数' + jiNian + '，以24为周期巡行九宫，局数' + juShu + '决定太乙当前落宫位置。' +
        '太乙者，天帝之神也，统御九宫八门，察天时之变，定人事之机。'
    );
    lines.push(
      '白话解释：太乙神数以天道运行推演人事吉凶。局数' + juShu + '即太乙本轮巡行的位置参数——' +
        (juShu % 2 === 0 ? '偶数为阴局，太乙逆行，气场向内收敛，宜守不宜攻。' : '奇数为阳局，太乙顺行，气场向外发散，宜进取开拓。') +
        '当前太乙落' + taiyiGong + '宫（' + taiyiDir + '方），此方位即本轮天时的核心能量所在。'
    );

    // 二、太乙落宫
    lines.push('');
    lines.push('【太乙落宫】');
    lines.push(
      '结论：太乙入' + taiyiGong + '宫（' + taiyiDir + '方），本宫主' + gongInfo.meaning + ''
    );
    lines.push(
      '依据：' + gongInfo.gua + '，卦象' + gongInfo.why + ''
    );
    lines.push(
      '白话解释：太乙落' + taiyiGong + '宫，意味着本轮天时的核心主题是"' + gongInfo.meaning.replace('之象。', '').replace('之象', '') + '"。' +
        gongInfo.action
    );

    // 三、十六神分析
    lines.push('');
    lines.push('【十六神】');
    var jiGods = [], xiongGods = [], daJiGods = [];
    for (var i = 0; i < gods.length; i++) {
      var g = gods[i];
      if (g.auspicious === '大吉') { daJiGods.push(g); }
      else if (g.auspicious === '吉') { jiGods.push(g); }
      else if (g.auspicious === '凶') { xiongGods.push(g); }
    }
    lines.push(
      '结论：十六神中，大吉神' + (daJiGods.length || 0) + '尊（' +
        (daJiGods.length ? daJiGods.map(function(g){return g.name;}).join('、') : '无') + '），' +
        '吉神' + jiGods.length + '尊（' +
        (jiGods.length ? jiGods.map(function(g){return g.name;}).join('、') : '无') + '），' +
        '凶神' + xiongGods.length + '尊（' +
        (xiongGods.length ? xiongGods.map(function(g){return g.name;}).join('、') : '无') + '）。'
    );
    lines.push('依据：十六神按局数起序，依次排布于九宫及间位，每一神各有其职司与吉凶属性。');
    if (daJiGods.length > 0) {
      lines.push(
        '白话解释：大吉神' + daJiGods.map(function(g){return g.name;}).join('、') +
          '在当前局中显现，' +
          daJiGods.map(function(g){return GOD_MEANING[g.name] || '';}).join('；') +
          '此为本轮天时之最强助力。'
      );
    }
    if (xiongGods.length > 0) {
      lines.push(
        '警示：凶神' + xiongGods.map(function(g){return g.name;}).join('、') +
          '潜伏其中，' +
          xiongGods.map(function(g){return GOD_MEANING[g.name] || '';}).join('；') +
          '应对此保持警惕，规避相关方位与时机。'
      );
    }
    lines.push('');
    // 逐神简要
    for (var j = 0; j < gods.length; j++) {
      var sg = gods[j];
      var tag = sg.auspicious === '大吉' ? '【大吉】' : sg.auspicious === '吉' ? '【吉】' : sg.auspicious === '凶' ? '【凶】' : '【平】';
      lines.push(tag + ' ' + sg.name + '·' + sg.position + '：' + (GOD_MEANING[sg.name] || '') + ' ' + sg.wuxing + '行。');
    }

    // 四、五福
    lines.push('');
    lines.push('【五福】');
    lines.push('结论：五福入' + wufu.replace(/五福入(.+?)宫/, '$1') + '宫（' + (wufu.match(/[（(](.+?)[)）]/) ? wufu.match(/[（(](.+?)[)）]/)[1] : '中') + '），主福禄双全。');
    lines.push('依据：五福以积年除以225取余再分五段，对应九宫循环。');
    lines.push('白话解释：五福是太乙神数中的福禄之神，其所落之宫即为本轮最得福气之方位。' +
      '此方位能量最为和顺，凡求福求禄、谋事求成，皆可向此方位借势。');
    lines.push('具体做法：择五福所落方位行事，可增运势加持；重要决策参考此方位能量强弱。');

    // 五、三基
    lines.push('');
    lines.push('【三基】');
    lines.push('结论：君基、臣基、民基分落三方，各司其职。');
    lines.push('依据：君基主国运（积年mod360÷30），臣基主臣道（偏移120），民基主民生（偏移240）。');
    lines.push('白话解释：三基代表国家运转的三个层面——君基对应决策层、臣基对应执行层、民基对应基础层。' +
      '三基得位则上下协调，三基失衡则事多阻滞。当前三基分布详见太乙盘。');
    lines.push('具体做法：决策宜顺应三基之势——君基方宜定策，臣基方宜执行，民基方宜安民。');

    // 六、四神
    lines.push('');
    lines.push('【四神】');
    lines.push(
      '结论：天乙' + sishen.tianyi.position + '，地乙' + sishen.diyi.position + '，直符' + sishen.zhifu.position + '，四神' + sishen.sishen.position + '。'
    );
    lines.push('依据：四神由积年分别偏移0/90/180/270度后映射九宫得出，代表天时地利的四个维度。');
    lines.push(
      '白话解释：天乙主天时，地乙主地利，直符主人和，四神主神助。四神各守其位，则天地人神四才俱备。' +
        '若某神落入凶宫，则对应维度有缺失，需有所规避。'
    );

    // 七、阴阳局判断
    lines.push('');
    lines.push('【阴阳局】');
    var isYang = (juShu % 2 === 1);
    lines.push('结论：此局为' + (isYang ? '阳局' : '阴局') + '，气场' + (isYang ? '向外发散、进取为主' : '向内收敛、守成为主') + '。');
    lines.push('依据：局数为奇为阳，偶为阴。阳局太乙顺行九宫，阴局逆行。');
    lines.push(
      '白话解释：' + (isYang
        ? '阳局主"进气"——气场由内向外扩张，事情处于上升通道，谋事可主动出击、借势推进。'
        : '阴局主"退气"——气场由外向内收敛，事情趋于稳定保守，谋事宜稳扎稳打、不宜冒进。') +
        '局数' + juShu + '即本轮循环中太乙所处的具体位置参数。'
    );
    lines.push('具体做法：' + (isYang ? '宜积极进取，把握时机推进计划；但盛极必衰，见好就收。' : '宜守成固本，不宜强行开拓；待阳气复生再图进取。'));

    // 八、宫位方位指南
    lines.push('');
    lines.push('【方位指南】');
    var allDirs = ['乾（西北）','离（南）','艮（东北）','震（东）','中','兑（西）','坤（西南）','坎（北）','巽（东南）'];
    var goodDirs = [], badDirs = [];
    allDirs.forEach(function(dirStr, idx) {
      var gName = GONG_9[idx];
      var hasJi = gods.some(function(g){ return g.position.indexOf(GONG_DIR[gName]) >= 0; });
      if (hasJi) goodDirs.push(dirStr);
      else badDirs.push(dirStr);
    });
    lines.push('宜行方位：' + goodDirs.slice(0, 4).join('、') + (goodDirs.length > 4 ? '等。' : '。'));
    lines.push('忌行方位：' + badDirs.slice(0, 3).join('、') + (badDirs.length > 3 ? '等。' : '。'));
    lines.push('白话解释：太乙当前落' + taiyiGong + '宫（' + taiyiDir + '方），此方位为本轮天时能量最旺之处。' +
      '宜向此方位或吉神汇聚方位行动；凶神所落方位宜回避。');

    // 九、总体断语
    lines.push('');
    lines.push('【总体断语】');
    var totalJi = daJiGods.length + jiGods.length;
    if (totalJi >= 10) {
      lines.push('吉神' + totalJi + '尊当道，太乙得位，此乃大吉之象。诸事顺遂，天时地利人和兼具。');
      lines.push('具体做法：顺势而为，积极进取，可大胆推进重要计划。然大吉之后当思警惕，见好就收，不可贪得无厌。');
    } else if (totalJi >= 7) {
      lines.push('吉神' + totalJi + '尊过半，凶神' + xiongGods.length + '尊潜伏，整体运势平稳向好。');
      lines.push('具体做法：宜顺势而为，趋吉避凶。重点把握太乙落宫方位及五福方位，规避凶神所在方位与时机。');
    } else if (totalJi >= 4) {
      lines.push('吉凶参半，吉神' + totalJi + '尊对凶神' + xiongGods.length + '尊。局势胶着，进退两难。');
      lines.push('具体做法：宜守正待时，不可冒进。先稳固现有根基，待吉神运势增强后再图进取。以静制动为上策。');
    } else {
      lines.push('凶神' + xiongGods.length + '尊较盛，吉神仅' + totalJi + '尊。时运未至，多阻少顺。');
      lines.push('具体做法：宜韬光养晦，以静制动。收敛锋芒，积蓄力量，等待下一轮太乙巡行转向后再行大事。');
    }

    return lines.join('\n');
  }

  /**
   * 获取纪元名称
   */
  function getEpochName(jiNian) {
    var cycles = ['上元', '中元', '下元'];
    var cycle = Math.floor((jiNian % 360) / 120);
    return cycles[cycle] + '·第' + (Math.floor(jiNian / 360) + 1) + '纪';
  }

  /* ========== 四、公开API ========== */

  global.TaiyiEngine = {
    /**
     * 太乙神数起算
     * @param {string} date - 日期字符串 YYYY-MM-DD
     * @param {string} time - 时辰名称 如 '子时'
     * @returns {object} 太乙盘结果
     */
    divine: function (date, time) {
      var parts = date.split('-');
      var year = parseInt(parts[0], 10);
      var month = parseInt(parts[1], 10);
      var day = parseInt(parts[2], 10);

      var jiNian = calcJiNian(year);
      var juShu = calcJuShu(jiNian);
      var taiyiGong = calcTaiyiGong(juShu);
      var gods = arrangeGods(juShu);
      var wufu = calcWufu(jiNian);
      var sanji = calcSanji(jiNian);
      var sishen = calcSishen(jiNian);
      var degree = calcTaiyiDegree(jiNian);
      var epoch = getEpochName(jiNian);
      var interpretation = generateInterpretation(taiyiGong, gods, wufu, sanji, sishen, juShu, jiNian);

      return {
        epoch: epoch,
        ji_nian: jiNian,
        ju_shu: juShu,
        taiyi_gong: taiyiGong,
        taiyi_dir: GONG_DIR[taiyiGong] || '中',
        gods: gods,
        wufu: wufu,
        sanji: sanji,
        sishen: sishen,
        degree: degree,
        taiyi_position: taiyiGong + '宫（' + (GONG_DIR[taiyiGong] || '') + '）',
        interpretation: interpretation,
      };
    },
  };
})(typeof window !== 'undefined' ? window : this);
