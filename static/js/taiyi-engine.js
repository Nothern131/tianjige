/**
 * 天机阁 · 太乙神数引擎 v2 — 纯前端算法，零API调用
 *
 * 古籍口径：唐·王希明《太乙金镜式经》
 *   卷一《推上元积年》《推太乙所在法》《推入六纪三元法》
 *   卷二《推九宫所主法》《推十六神所主法》
 *   卷五《推君基太乙法》《推臣基太乙法》《推民基太乙法》
 *        《推五福太乙法》《推四神太乙法》《推天乙太乙法》
 *        《推直符太乙法》《四神三元五纪立成》
 *
 * 说明：
 * 1. 太乙年计只行八宫，不游中五宫，三年移一宫，二十四年一周。
 * 2. 十六神固定在十二支与四维上，不随局数旋转。
 * 3. 五福、三基、四神各有自己的上元纪元，古籍原文分别给出，不能混用一个积年。
 */
(function (global) {
  'use strict';

  /* ========== 一、基础常量 ========== */

  /** 太乙九宫：宫数 → 宫名（《金镜式经》卷二：一宫在乾、二宫在离、三宫在艮、四宫在震、六宫在兑、七宫在坤、八宫在坎、九宫在巽） */
  var GONG_BY_NUM = {
    1: '乾',
    2: '离',
    3: '艮',
    4: '震',
    5: '中',
    6: '兑',
    7: '坤',
    8: '坎',
    9: '巽',
  };

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

  /** 太乙年计行宫次序：一、二、三、四、六、七、八、九，不游中五 */
  var TAIYI_GONG_SEQ = ['乾', '离', '艮', '震', '兑', '坤', '坎', '巽'];
  var TAIYI_GONG_NUM_SEQ = [1, 2, 3, 4, 6, 7, 8, 9];

  /** 古籍纪元：公元 724 年（唐开元十二年甲子）为各神上元积年基准 */
  var EPOCH_YEAR = 724;
  /** 太乙（混沌上元甲子）：开元十二年积 1937281 算（卷一） */
  var EPOCH_TAIYI = 1937281;
  /** 五福（上元甲寅）：开元十二年积 13331 岁（卷五，原文自证“开元十二年在辽东十一年”） */
  var EPOCH_WUFU = 13331;
  /** 三基（上元甲寅）：开元十二年积 285011 算（卷五《推积年法》） */
  var EPOCH_SANJI = 285011;
  /** 四神、天乙、地乙、直符（上元甲子）：与太乙同用混沌上元甲子纪年 */
  var EPOCH_SISHEN = 1937281;

  /** 十二地支 */
  var ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  /** 地支方位（十二邦取地支方位） */
  var ZHI_DIR = {
    子: '北',
    丑: '东北',
    寅: '东北',
    卯: '东',
    辰: '东南',
    巳: '东南',
    午: '南',
    未: '西南',
    申: '西南',
    酉: '西',
    戌: '西北',
    亥: '西北',
  };

  /**
   * 太乙十六神：固定于十二支与四维，不随局数移动
   * 《金镜式经》卷二：子地主、丑阳德、艮和德、寅吕申、卯高丛、辰太阳、
   * 巽大炅、巳大神、午大威、未天道、坤大武、申武德、酉太簇、戌阴主、乾阴德、亥大义
   * 吉凶：子至巳八神为吉，午至亥八神为凶（阳长阴消、阴长阳消之义）
   */
  var GODS_16 = [
    { name: '地主', zhi: '子', dir: '北', gong: '坎', wuxing: '水', auspicious: '吉' },
    { name: '阳德', zhi: '丑', dir: '东北', gong: '', wuxing: '土', auspicious: '吉' },
    { name: '和德', zhi: '艮', dir: '东北', gong: '艮', wuxing: '土', auspicious: '吉' },
    { name: '吕申', zhi: '寅', dir: '东北', gong: '', wuxing: '木', auspicious: '吉' },
    { name: '高丛', zhi: '卯', dir: '东', gong: '震', wuxing: '木', auspicious: '吉' },
    { name: '太阳', zhi: '辰', dir: '东南', gong: '', wuxing: '土', auspicious: '吉' },
    { name: '大炅', zhi: '巽', dir: '东南', gong: '巽', wuxing: '木', auspicious: '吉' },
    { name: '大神', zhi: '巳', dir: '东南', gong: '', wuxing: '火', auspicious: '吉' },
    { name: '大威', zhi: '午', dir: '南', gong: '离', wuxing: '火', auspicious: '凶' },
    { name: '天道', zhi: '未', dir: '西南', gong: '', wuxing: '土', auspicious: '凶' },
    { name: '大武', zhi: '坤', dir: '西南', gong: '坤', wuxing: '土', auspicious: '凶' },
    { name: '武德', zhi: '申', dir: '西南', gong: '', wuxing: '金', auspicious: '凶' },
    { name: '太簇', zhi: '酉', dir: '西', gong: '兑', wuxing: '金', auspicious: '凶' },
    { name: '阴主', zhi: '戌', dir: '西北', gong: '', wuxing: '土', auspicious: '凶' },
    { name: '阴德', zhi: '乾', dir: '西北', gong: '乾', wuxing: '金', auspicious: '凶' },
    { name: '大义', zhi: '亥', dir: '西北', gong: '', wuxing: '水', auspicious: '凶' },
  ];

  /** 五福五宫：《金镜式经》卷五：黄秘宫乾、黄始宫艮、黄室宫巽、黄庭宫坤、玄师宫中 */
  var WUFU_GONGS = [
    { gong: '乾', palace: '黄秘宫', dir: '西北' },
    { gong: '艮', palace: '黄始宫', dir: '东北' },
    { gong: '巽', palace: '黄室宫', dir: '东南' },
    { gong: '坤', palace: '黄庭宫', dir: '西南' },
    { gong: '中', palace: '玄师宫', dir: '中' },
  ];

  /** 四神十二宫：九宫之后接绛宫、明堂、玉堂 */
  var PALACE_12 = [
    { name: '乾', dir: '西北', num: 1 },
    { name: '离', dir: '南', num: 2 },
    { name: '艮', dir: '东北', num: 3 },
    { name: '震', dir: '东', num: 4 },
    { name: '中', dir: '中', num: 5 },
    { name: '兑', dir: '西', num: 6 },
    { name: '坤', dir: '西南', num: 7 },
    { name: '坎', dir: '北', num: 8 },
    { name: '巽', dir: '东南', num: 9 },
    { name: '绛', dir: '天外', num: 0 },
    { name: '明堂', dir: '天外', num: 0 },
    { name: '玉堂', dir: '天外', num: 0 },
  ];

  /**
   * 四神三元起宫（《金镜式经》卷五《四神三元五纪立成》）
   * 每元六十年，三年移一宫，十二宫一周三十六年
   * 上元甲子：四神一宫、天乙六宫、地乙九宫、直符五宫
   * 中元甲子：四神九宫、天乙二宫、地乙五宫、直符一宫
   * 下元甲子：四神五宫、天乙绛宫、地乙一宫、直符九宫
   */
  var SISHEN_STARTS = {
    sishen: [0, 8, 4],
    tianyi: [5, 1, 9],
    diyi: [8, 4, 0],
    zhifu: [4, 0, 8],
  };

  /** 十六神释义（依《金镜式经》卷二“推十六神所主法”节义） */
  var GOD_MEANING = {
    地主: '建子之月阳气初发，主土地根基、万物归藏。',
    阳德: '建丑之月二阳用事，布育万物，主施恩布德。',
    和德: '冬春将交，阴阳气合，群物方生，主和合成就。',
    吕申: '建寅之月阳气大申，草木甲拆，主条达申明。',
    高丛: '建卯之月万物自地丛生，主生发繁茂。',
    太阳: '建辰之月雷出震势，阳气大盛，主光明威盛。',
    大炅: '春夏将交，盛暑方至，阳气炎酷，主炎热显耀。',
    大神: '建巳之月少阴用事，阴阳不测，主神变难测。',
    大威: '建午之月阳附阴生，刑暴始行，主威严刑杀。',
    天道: '建未之月火能生土，土王于未，主天道循环。',
    大武: '夏秋将交，阴气施令，杀伤万物，主肃杀武备。',
    武德: '建申之月万物欲死，荠麦将生，主武德收敛。',
    太簇: '建酉之月万物皆成，有大品簇，主收成法度。',
    阴主: '建戌之月阳气不长，阴气用事，主阴私暗动。',
    阴德: '秋冬将交，阴前生阳，大有其情，主暗助阴庇。',
    大义: '建亥之月万物怀垢，群阳欲尽，主名分大义。',
  };

  /** 九宫太乙释义 */
  var GONG_INTERPRETATION = {
    乾: {
      gua: '乾为天',
      meaning: '天道运行，刚健中正，为太乙行宫之首。',
      action: '宜开拓进取、决断要务；忌优柔寡断、瞻前顾后。',
      why: '乾为纯阳之卦，太乙一宫在乾，象征天时在我、大势可借。',
    },
    离: {
      gua: '离为火',
      meaning: '文明昭著，礼乐昌盛，文教兴隆。',
      action: '宜文化教育、修德明志；忌虚浮不实、好高骛远。',
      why: '离为光明附丽之卦，太乙二宫在离，功在教化文明。',
    },
    艮: {
      gua: '艮为山',
      meaning: '静止蓄势，厚积薄发，内省修身。',
      action: '宜闭关修养、整理旧务；忌冒进躁动、强攻硬上。',
      why: '艮为山，一阳止于二阴之上，主止。太乙三宫在艮，宜以静制动。',
    },
    震: {
      gua: '震为雷',
      meaning: '震动变革，万象更新，破旧立新。',
      action: '宜改革创新、启动新计划；忌因循守旧、畏缩不前。',
      why: '震为一阳动于下，阳气勃发。太乙四宫在震，旧局将破、新机已现。',
    },
    兑: {
      gua: '兑为泽',
      meaning: '喜悦沟通，口舌是非并存，外交谈判。',
      action: '宜沟通协调、缔结盟约；忌口无遮拦、言辞失当。',
      why: '兑为口舌喜悦之卦，太乙六宫在兑，以言语通达事物，亦防祸从口出。',
    },
    坤: {
      gua: '坤为地',
      meaning: '厚德载物，包容万象，积蓄力量。',
      action: '宜积蓄力量、以柔克刚；忌锋芒毕露、强争硬抢。',
      why: '坤为纯阴至顺之卦，太乙七宫在坤，宜顺势而为、以退为进。',
    },
    坎: {
      gua: '坎为水',
      meaning: '险陷暗流，危机潜伏，内省反思。',
      action: '宜谨言慎行、韬光养晦；忌冒险冲动、正面强攻。',
      why: '坎为水流险陷之卦，太乙八宫在坎，表面平静之下暗藏危机。',
    },
    巽: {
      gua: '巽为风',
      meaning: '风行天下，政令畅通，传播推广。',
      action: '宜发布政令、宣传推广；忌朝令夕改、信令不一。',
      why: '巽为风，无孔不入。太乙九宫在巽，顺势传播，影响可及远方。',
    },
  };

  /* ========== 二、工具函数 ========== */

  /** 取模，保证非负 */
  function mod(n, m) {
    return ((n % m) + m) % m;
  }

  /** 按公元年份换算某神的上元积年 */
  function jiNianOf(base, year) {
    return base + (year - EPOCH_YEAR);
  }

  /** 宫名 → 宫数 */
  function gongNumOf(gong) {
    for (var n = 1; n <= 9; n++) {
      if (GONG_BY_NUM[n] === gong) return n;
    }
    return 0;
  }

  /** 十六神按宫名取值神 */
  function godOfGong(gong) {
    for (var i = 0; i < GODS_16.length; i++) {
      if (GODS_16[i].gong === gong) return GODS_16[i];
    }
    return null;
  }

  /* ========== 三、太乙年计核心 ========== */

  /**
   * 太乙积年（混沌上元甲子）
   * 《金镜式经》卷一：开元十二年甲子积 1937281 算，上考往古每年减一，下检将来每年加一
   */
  function calcJiNian(year) {
    return jiNianOf(EPOCH_TAIYI, year);
  }

  /**
   * 推太乙所在
   * 《金镜式经》卷一：置上元积年，以周纪法 360 去之；不尽，以元法 72 去之；
   * 又不尽，以太乙小周法 24 除之；又不尽，以三约之为宫数，不满为入宫以来年数。
   * 宫数命起一宫，顺行八宫，不游中五。
   */
  function calcTaiyi(jiNian) {
    var r360 = mod(jiNian, 360);
    var r72 = r360 % 72;
    var r24 = r72 % 24;
    var idx = Math.floor(r24 / 3);
    var gong = TAIYI_GONG_SEQ[idx];
    var yearIn = (r24 % 3) + 1;
    return {
      gong: gong,
      gong_num: TAIYI_GONG_NUM_SEQ[idx],
      dir: GONG_DIR[gong],
      year_in_gong: yearIn,
      god: godOfGong(gong),
    };
  }

  /**
   * 入六纪三元（《金镜式经》卷一）
   * 置积年以周纪法 360 去之，不尽，以纪法 60 去之，所得为纪数，不尽为入纪年数。
   */
  function calcEpoch(jiNian) {
    var rem = mod(jiNian, 360);
    var ji = Math.floor(rem / 60) + 1;
    var yearIn = (rem % 60) + 1;
    return '第' + ji + '纪·第' + yearIn + '年';
  }

  /* ========== 四、五福 ========== */

  /**
   * 推五福太乙
   * 《金镜式经》卷五：置积年以大周法 225 去之，不尽为入周以来年数；
   * 又以四十五约之为宫数，不满为入宫以来年数。命起乾、艮、巽、坤、中宫。
   */
  function calcWufu(year) {
    var ji = jiNianOf(EPOCH_WUFU, year);
    var rem = mod(ji, 225);
    var idx = Math.floor(rem / 45) % 5;
    var item = WUFU_GONGS[idx];
    var yearIn = rem % 45 || 45;
    return {
      gong: item.gong,
      palace: item.palace,
      dir: item.dir,
      year_in_gong: yearIn,
      ji_nian: ji,
      text:
        '五福入' +
        item.gong +
        '宫（' +
        item.dir +
        '）' +
        item.palace +
        '，入宫第' +
        yearIn +
        '年',
    };
  }

  /* ========== 五、三基 ========== */

  /**
   * 推三基
   * 《金镜式经》卷五：
   * 君基：积年以 360 去之，余以 30 除之为邦数，命起戌邦顺行十二邦。
   * 臣基：360 去之，余以 36 除之，再以三约之为邦数，命起戌邦顺行。
   * 民基：360 去之，余以 12 去之，命起戌邦顺行。
   */
  function calcSanji(year) {
    var ji = jiNianOf(EPOCH_SANJI, year);
    var rem = mod(ji, 360);

    var junBang = Math.floor(rem / 30) % 12;
    var junYear = rem % 30;

    var rem36 = rem % 36;
    var chenBang = Math.floor(rem36 / 3) % 12;
    var chenYear = rem36 % 3;

    var minBang = rem % 12;

    function make(name, bang, yearIn, span) {
      var zhi = ZHI[(10 + bang) % 12]; // 起戌邦（戌为地支第 10 位）
      return {
        name: name,
        bang: bang,
        zhi: zhi,
        dir: ZHI_DIR[zhi],
        year_in_bang: yearIn,
        span: span,
        text: name + '在' + zhi + '邦（' + ZHI_DIR[zhi] + '）',
      };
    }

    var jun = make('君基', junBang, junYear, 30);
    var chen = make('臣基', chenBang, chenYear, 3);
    var min = make('民基', minBang, 0, 1);

    return {
      jun: jun,
      chen: chen,
      min: min,
      ji_nian: ji,
      text: jun.text + '，' + chen.text + '，' + min.text,
    };
  }

  /* ========== 六、四神（天乙、地乙、直符、四神） ========== */

  /**
   * 推四神十二宫
   * 《金镜式经》卷五：置上元甲子积年以 180 去之，分上、中、下三元，每元 60 年；
   * 入元后每 3 年移一宫，起宫依《四神三元五纪立成》：
   * 上元 四神一、天乙六、地乙九、直符五；
   * 中元 四神九、天乙二、地乙五、直符一；
   * 下元 四神五、天乙绛、地乙一、直符九。
   * 九宫尽后接绛宫、明堂、玉堂，共十二宫。
   */
  function calcSishen(year) {
    var ji = jiNianOf(EPOCH_SISHEN, year);
    var rem = mod(ji, 180);
    var yuanIdx = Math.floor(rem / 60); // 0 上元、1 中元、2 下元
    var yearInYuan = rem % 60;
    var steps = Math.floor(yearInYuan / 3);
    var yuanNames = ['上元', '中元', '下元'];

    function palaceOf(key, label) {
      var start = SISHEN_STARTS[key][yuanIdx];
      var pos = PALACE_12[(start + steps) % 12];
      var position =
        pos.num > 0
          ? pos.name + '宫（' + pos.dir + '）'
          : pos.name + '宫（天外）';
      return {
        name: label,
        gong: pos.num > 0 ? pos.name : '',
        palace: pos.name + '宫',
        dir: pos.dir,
        position: position,
      };
    }

    return {
      yuan: yuanNames[yuanIdx],
      year_in_yuan: yearInYuan + 1,
      ji_nian: ji,
      tianyi: palaceOf('tianyi', '天乙'),
      diyi: palaceOf('diyi', '地乙'),
      zhifu: palaceOf('zhifu', '直符'),
      sishen: palaceOf('sishen', '四神'),
    };
  }

  /* ========== 七、解读生成 ========== */

  function godLine(g) {
    var tag = g.auspicious === '吉' ? '【吉】' : '【凶】';
    return (
      tag +
      ' ' +
      g.name +
      '·' +
      g.zhi +
      '位（' +
      g.dir +
      '）：' +
      (GOD_MEANING[g.name] || '') +
      ' ' +
      g.wuxing +
      '行。'
    );
  }

  function generateInterpretation(taiyi, gods, wufu, sanji, sishen, epoch, jiNian) {
    var lines = [];
    var gongInfo = GONG_INTERPRETATION[taiyi.gong] || {};
    var taiyiGod = taiyi.god || {};

    // 一、局象概述
    lines.push('【局象概述】');
    lines.push(
      '结论：太乙积年' + jiNian + '，' + epoch + '，太乙在' +
        taiyi.gong + '宫（' + taiyi.dir + '），入宫第' + taiyi.year_in_gong +
        '年，值神' + (taiyiGod.name || '—') + '（' + (taiyiGod.auspicious || '—') + '）。'
    );
    lines.push(
      '依据：《太乙金镜式经》卷一“推太乙所在法”：置上元积年，以周纪法三百六十去之，' +
        '不尽，以元法七十二去之，又不尽，以太乙小周法二十四除之，又以三约之为宫数；' +
        '命起一宫，顺行八宫，不游中五。'
    );
    lines.push(
      '白话解释：太乙年计只行乾、离、艮、震、兑、坤、坎、巽八宫，每宫住三年，二十四年一周。' +
        '当前太乙落' + taiyi.gong + '宫（' + taiyi.dir + '方），为本轮天时的核心方位。'
    );

    // 二、太乙落宫
    lines.push('');
    lines.push('【太乙落宫】');
    lines.push('结论：太乙入' + taiyi.gong + '宫，' + (gongInfo.meaning || '') + '');
    lines.push('依据：' + (gongInfo.gua || '') + '。' + (gongInfo.why || ''));
    lines.push('具体做法：' + (gongInfo.action || ''));
    if (taiyiGod.name) {
      lines.push(
        '值神：太乙在' + taiyi.gong + '宫，值' + taiyiGod.name + '神（' +
          taiyiGod.auspicious + '）。' + (GOD_MEANING[taiyiGod.name] || '')
      );
    }

    // 三、十六神
    lines.push('');
    lines.push('【十六神】');
    lines.push(
      '结论：十六神固定于十二支与四维，不随局数旋转。子至巳八神为吉，午至亥八神为凶。'
    );
    lines.push(
      '依据：《太乙金镜式经》卷二“推十六神所主法”：子地主、丑阳德、艮和德、寅吕申、' +
        '卯高丛、辰太阳、巽大炅、巳大神、午大威、未天道、坤大武、申武德、酉太簇、戌阴主、乾阴德、亥大义。'
    );
    lines.push(
      '白话解释：吉神所临之方为阳气生发之地，宜谋为进取；凶神所临之方为阴气用事之地，宜谨慎回避。'
    );
    for (var i = 0; i < gods.length; i++) {
      lines.push(godLine(gods[i]));
    }

    // 四、五福
    lines.push('');
    lines.push('【五福】');
    lines.push('结论：' + wufu.text + '。');
    lines.push(
      '依据：《太乙金镜式经》卷五“推五福太乙法”：以周法二百二十五去积年，' +
        '以四十五约之为宫数，命起乾、艮、巽、坤、中宫。'
    );
    lines.push(
      '白话解释：五福所临之分，古籍称“无兵革疾疫饥荒水旱之灾”，为求福求禄、谋事求成可借势之方。'
    );

    // 五、三基
    lines.push('');
    lines.push('【三基】');
    lines.push(
      '结论：君基在' + sanji.jun.zhi + '邦（' + sanji.jun.dir + '），臣基在' +
        sanji.chen.zhi + '邦（' + sanji.chen.dir + '），民基在' + sanji.min.zhi +
        '邦（' + sanji.min.dir + '）。'
    );
    lines.push(
      '依据：《太乙金镜式经》卷五：君基三十年移一邦，臣基三年移一邦，民基一年移一邦，' +
        '各以三百六十为大周，俱起戌邦顺行十二邦。'
    );
    lines.push(
      '白话解释：君基主国运决策，臣基主臣道执行，民基主民生基础。三基所临之邦，' +
        '即对应层面当前气运所聚之地。'
    );

    // 六、四神
    lines.push('');
    lines.push('【四神】');
    lines.push(
      '结论：' + sishen.yuan + '，天乙' + sishen.tianyi.position + '，地乙' +
        sishen.diyi.position + '，直符' + sishen.zhifu.position + '，四神' +
        sishen.sishen.position + '。'
    );
    lines.push(
      '依据：《太乙金镜式经》卷五：四神以太乙上元甲子积年，一百八十分上、中、下三元，' +
        '每元六十年，三年移一宫；九宫尽后接绛宫、明堂、玉堂，共十二宫。'
    );
    lines.push(
      '白话解释：四神、天乙、地乙、直符各主水、金、土、火之性，其落宫反映天时、地利、' +
        '人和、神助四个维度的气运分布。'
    );

    // 七、方位指南
    lines.push('');
    lines.push('【方位指南】');
    var jiDirs = [], xiongDirs = [];
    for (var j = 0; j < gods.length; j++) {
      if (gods[j].auspicious === '吉') jiDirs.push(gods[j].zhi + '（' + gods[j].dir + '）');
      else xiongDirs.push(gods[j].zhi + '（' + gods[j].dir + '）');
    }
    lines.push('吉神方位：' + jiDirs.join('、') + '。');
    lines.push('凶神方位：' + xiongDirs.join('、') + '。');
    lines.push('太乙落' + taiyi.gong + '（' + taiyi.dir + '），五福落' + wufu.gong + '（' + wufu.dir + '）。');
    lines.push('白话解释：吉神方位宜谋为进取，凶神方位宜谨慎回避；太乙、五福所落之方为本轮重点。');

    // 八、总体断语
    lines.push('');
    lines.push('【总体断语】');
    var isJi = taiyiGod.auspicious === '吉';
    lines.push(
      '太乙值' + (taiyiGod.name || '—') + '神，' + (isJi ? '为吉神当值，天时偏向生发进取。' : '为凶神当值，天时偏向收敛戒惧。') +
        '五福在' + wufu.gong + '宫（' + wufu.dir + '），三基分布见上。'
    );
    lines.push(
      '具体做法：' + (isJi
        ? '可借太乙、五福所落之方推进要事，同时避开八凶神方位；盛时须防过刚。'
        : '宜守成固本，避开太乙所落之方与八凶神方位，待太乙转入吉宫再图进取。')
    );

    return lines.join('\n');
  }

  /* ========== 八、公开 API ========== */

  global.TaiyiEngine = {
    GONG_DIR: GONG_DIR,
    GONG_BY_NUM: GONG_BY_NUM,
    GODS_16: GODS_16,
    /**
     * 太乙神数年计起盘
     * @param {string} date - 日期字符串 YYYY-MM-DD
     * @param {string} time - 时辰名称（年计以积年为准，时辰仅作记录）
     * @returns {object} 太乙盘结果
     */
    divine: function (date, time) {
      var parts = String(date || '').split('-');
      var year = parseInt(parts[0], 10);
      if (isNaN(year)) {
        throw new Error('日期格式无效，应为 YYYY-MM-DD');
      }

      var jiNian = calcJiNian(year);
      var taiyi = calcTaiyi(jiNian);
      var epoch = calcEpoch(jiNian);
      var wufu = calcWufu(year);
      var sanji = calcSanji(year);
      var sishen = calcSishen(year);

      var gods = GODS_16.map(function (g) {
        return {
          name: g.name,
          position: g.zhi + '·' + g.dir,
          zhi: g.zhi,
          dir: g.dir,
          gong: g.gong,
          wuxing: g.wuxing,
          auspicious: g.auspicious,
          meaning: GOD_MEANING[g.name] || '',
        };
      });

      var interpretation = generateInterpretation(
        taiyi,
        gods,
        wufu,
        sanji,
        sishen,
        epoch,
        jiNian
      );

      return {
        epoch: epoch,
        ji_nian: jiNian,
        ju_shu: taiyi.gong_num,
        taiyi_gong: taiyi.gong,
        taiyi_gong_num: taiyi.gong_num,
        taiyi_dir: taiyi.dir,
        taiyi_year_in: taiyi.year_in_gong,
        taiyi_god: taiyi.god
          ? { name: taiyi.god.name, auspicious: taiyi.god.auspicious, wuxing: taiyi.god.wuxing }
          : null,
        gods: gods,
        wufu: wufu.text,
        wufu_detail: wufu,
        sanji: sanji.text,
        sanji_detail: sanji,
        sishen: sishen,
        taiyi_position: taiyi.gong + '宫（' + taiyi.dir + '）',
        time_note: time ? '年计以太乙积年为准，' + time + '仅作记录' : '年计以太乙积年为准',
        source: '《太乙金镜式经》卷一、卷二、卷五',
        interpretation: interpretation,
      };
    },
  };
})(typeof window !== 'undefined' ? window : this);
