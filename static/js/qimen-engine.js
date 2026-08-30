/**
 * 天机阁 · 奇门遁甲引擎 v2 — 纯前端算法，零API调用
 * 时家奇门 · 转盘法 · 拆补法定元
 * 排盘规则：
 *   1. 地盘：六仪三奇，戊起局宫，阳遁顺布、阴遁逆布
 *   2. 值符星 = 旬首遁干所在地盘宫的原始九星；值符随时干落宫
 *   3. 值使门 = 旬首遁干所在地盘宫的原始八门；值使随时辰，阳遁顺数、阴遁逆数
 *   4. 天盘/门盘/神盘沿九宫外围环（1→8→3→4→9→2→7→6）整体旋转
 *   5. 天禽星永远寄于天芮星（随天芮落宫），携中五宫地盘干
 *   6. 中五宫无门无神无星，地盘干寄坤二宫显示
 */
(function (global) {
  'use strict';

  /* ========== 一、基础常量 ========== */

  /** 二十四节气（按公历时间顺序排列，冬至作为年末节点；日期为近似值，误差约±1天） */
  var SOLAR_TERMS = [
    { name: '小寒', month: 1, day: 6 },
    { name: '大寒', month: 1, day: 20 },
    { name: '立春', month: 2, day: 4 },
    { name: '雨水', month: 2, day: 19 },
    { name: '惊蛰', month: 3, day: 6 },
    { name: '春分', month: 3, day: 21 },
    { name: '清明', month: 4, day: 5 },
    { name: '谷雨', month: 4, day: 20 },
    { name: '立夏', month: 5, day: 6 },
    { name: '小满', month: 5, day: 21 },
    { name: '芒种', month: 6, day: 6 },
    { name: '夏至', month: 6, day: 21 },
    { name: '小暑', month: 7, day: 7 },
    { name: '大暑', month: 7, day: 23 },
    { name: '立秋', month: 8, day: 7 },
    { name: '处暑', month: 8, day: 23 },
    { name: '白露', month: 9, day: 8 },
    { name: '秋分', month: 9, day: 23 },
    { name: '寒露', month: 10, day: 8 },
    { name: '霜降', month: 10, day: 23 },
    { name: '立冬', month: 11, day: 7 },
    { name: '小雪', month: 11, day: 22 },
    { name: '大雪', month: 12, day: 7 },
    { name: '冬至', month: 12, day: 22 },
  ];

  /** 二十四节气三元局数表（拆补法）：[上元, 中元, 下元] */
  var JU_TABLE = {
    冬至: [1, 7, 4],
    小寒: [2, 8, 5],
    大寒: [3, 9, 6],
    立春: [8, 5, 2],
    雨水: [9, 6, 3],
    惊蛰: [1, 7, 4],
    春分: [3, 9, 6],
    清明: [4, 1, 7],
    谷雨: [5, 2, 8],
    立夏: [4, 1, 7],
    小满: [5, 2, 8],
    芒种: [6, 3, 9],
    夏至: [9, 3, 6],
    小暑: [8, 2, 5],
    大暑: [7, 1, 4],
    立秋: [2, 5, 8],
    处暑: [1, 4, 7],
    白露: [9, 3, 6],
    秋分: [7, 1, 4],
    寒露: [6, 9, 3],
    霜降: [5, 8, 2],
    立冬: [6, 9, 3],
    小雪: [5, 8, 2],
    大雪: [4, 7, 1],
  };

  /** 天干 */
  var GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
  /** 地支 */
  var ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

  /** 六十甲子 */
  var SIXTY_JIAZI = [];
  var JIAZI_INDEX = {};
  for (var i = 0; i < 60; i++) {
    var jz = GAN[i % 10] + ZHI[i % 12];
    SIXTY_JIAZI.push(jz);
    JIAZI_INDEX[jz] = i;
  }

  /** 五鼠遁（日上起时）：日干 → 子时时干 */
  var WUSHUDUN = {
    甲: '甲', 己: '甲',
    乙: '丙', 庚: '丙',
    丙: '戊', 辛: '戊',
    丁: '庚', 壬: '庚',
    戊: '壬', 癸: '壬',
  };

  /** 时辰名称 → 地支 */
  var SHICHEN_MAP = {
    子时: '子', 丑时: '丑', 寅时: '寅', 卯时: '卯', 辰时: '辰', 巳时: '巳',
    午时: '午', 未时: '未', 申时: '申', 酉时: '酉', 戌时: '戌', 亥时: '亥',
  };

  /** 九宫外围环（顺时针方位序，转盘旋转轨道）：坎1→艮8→震3→巽4→离9→坤2→兑7→乾6 */
  var RING = [1, 8, 3, 4, 9, 2, 7, 6];
  var RING_IDX = { 1: 0, 8: 1, 3: 2, 4: 3, 9: 4, 2: 5, 7: 6, 6: 7 };

  /** 九宫顺序：4 9 2 / 3 5 7 / 8 1 6（洛书序，用于九宫格渲染） */
  var GONG_ORDER = [4, 9, 2, 3, 5, 7, 8, 1, 6];

  /** 九宫名称 */
  var GONG_NAMES = {
    1: '坎一宫', 2: '坤二宫', 3: '震三宫', 4: '巽四宫', 5: '中五宫',
    6: '乾六宫', 7: '兑七宫', 8: '艮八宫', 9: '离九宫',
  };

  /** 九宫方位 */
  var GONG_FANGWEI = {
    1: '北方', 2: '西南', 3: '东方', 4: '东南', 5: '中宫',
    6: '西北', 7: '西方', 8: '东北', 9: '南方',
  };

  /** 九宫五行 */
  var GONG_WUXING = {
    1: '水', 2: '土', 3: '木', 4: '木', 5: '土', 6: '金', 7: '金', 8: '土', 9: '火',
  };

  /** 九星原始宫位（转盘初始位） */
  var STAR_HOME = {
    天蓬: 1, 天芮: 2, 天冲: 3, 天辅: 4, 天禽: 5,
    天心: 6, 天柱: 7, 天任: 8, 天英: 9,
  };

  /** 八门原始宫位（转盘初始位） */
  var DOOR_HOME = {
    休门: 1, 生门: 8, 伤门: 3, 杜门: 4,
    景门: 9, 死门: 2, 惊门: 7, 开门: 6,
  };

  /** 宫位 → 原始门 */
  var GONG_TO_DOOR = {
    1: '休门', 8: '生门', 3: '伤门', 4: '杜门',
    9: '景门', 2: '死门', 7: '惊门', 6: '开门',
  };

  /** 宫位 → 原始星 */
  var GONG_TO_STAR = {
    1: '天蓬', 2: '天芮', 3: '天冲', 4: '天辅', 5: '天禽',
    6: '天心', 7: '天柱', 8: '天任', 9: '天英',
  };

  /** 八神（环序）：阳遁顺布、阴遁逆布 */
  var GODS = ['值符', '螣蛇', '太阴', '六合', '白虎', '玄武', '九地', '九天'];

  /** 六甲旬首遁干：甲子戊、甲戌己、甲申庚、甲午辛、甲辰壬、甲寅癸 */
  var XUNSHOU_DUN = {
    甲子: '戊', 甲戌: '己', 甲申: '庚',
    甲午: '辛', 甲辰: '壬', 甲寅: '癸',
  };

  /** 天干五行 */
  var GAN_WUXING = {
    甲: '木', 乙: '木', 丙: '火', 丁: '火', 戊: '土',
    己: '土', 庚: '金', 辛: '金', 壬: '水', 癸: '水',
  };

  /* ========== 二、日期计算工具 ========== */

  /**
   * 根据公历日期确定节气
   * 正序遍历：找到第一个 startDate > (month, day) 的节气，返回其前一个
   * 若所有节气 startDate 都 <= (month, day)，返回最后一个（冬至）
   */
  function getCurrentJieqi(month, day) {
    for (var i = 0; i < SOLAR_TERMS.length; i++) {
      var t = SOLAR_TERMS[i];
      if (month < t.month || (month === t.month && day < t.day)) {
        return i > 0 ? SOLAR_TERMS[i - 1].name : SOLAR_TERMS[SOLAR_TERMS.length - 1].name;
      }
    }
    return SOLAR_TERMS[SOLAR_TERMS.length - 1].name;
  }

  /** 节气 → 阴阳遁（冬至到芒种为阳遁，夏至到大雪为阴遁） */
  function getPeriod(jieqi) {
    var yang = ['冬至', '小寒', '大寒', '立春', '雨水', '惊蛰', '春分', '清明', '谷雨', '立夏', '小满', '芒种'];
    return yang.indexOf(jieqi) >= 0 ? '阳遁' : '阴遁';
  }

  /**
   * 拆补法定三元：以日干支符头（甲/己日）的地支定元
   * 符头支为 子午卯酉 → 上元；寅申巳亥 → 中元；辰戌丑未 → 下元
   * @returns {number} 0上元 / 1中元 / 2下元
   */
  function getSanYuan(dayGZ) {
    var idx = JIAZI_INDEX[dayGZ];
    if (idx === undefined) return 0;
    var k = idx % 5;               // 距符头天数（0-4）
    var futouIdx = idx - k;        // 符头日六十甲子序
    var futouZhi = futouIdx % 12;  // 符头地支序
    if (futouZhi === 0 || futouZhi === 3 || futouZhi === 6 || futouZhi === 9) return 0; // 子午卯酉
    if (futouZhi === 2 || futouZhi === 5 || futouZhi === 8 || futouZhi === 11) return 1; // 寅申巳亥
    return 2; // 辰戌丑未
  }

  /**
   * 计算日干支（以1900年1月1日甲戌日为基准）
   */
  function calcDayGZ(year, month, day) {
    var baseDate = new Date(1900, 0, 1);
    var targetDate = new Date(year, month - 1, day);
    var diffDays = Math.floor((targetDate - baseDate) / (1000 * 60 * 60 * 24));
    var baseIdx = JIAZI_INDEX['甲戌'] !== undefined ? JIAZI_INDEX['甲戌'] : 11;
    var idx = (((baseIdx + diffDays) % 60) + 60) % 60;
    return SIXTY_JIAZI[idx];
  }

  /** 五鼠遁计算时干支 */
  function calcTimeGZ(dayGan, shichen) {
    var ziGan = WUSHUDUN[dayGan] || '甲';
    var ziIdx = GAN.indexOf(ziGan);
    var zhiIdx = ZHI.indexOf(SHICHEN_MAP[shichen] || '子');
    var ganIdx = (ziIdx + zhiIdx) % 10;
    return GAN[ganIdx] + (SHICHEN_MAP[shichen] || '子');
  }

  /* ========== 三、排盘核心（转盘法） ========== */

  /**
   * 排地盘：六仪三奇布九宫
   * 阳遁顺布（宫序1→2→…→9）、阴遁逆布（1→9→8→…→2）
   * 顺序：戊、己、庚、辛、壬、癸、丁、丙、乙（旬首六仪在前，三奇在后）
   */
  function arrangeDiPan(ju, period) {
    var diPan = {};
    var ganOrder = ['戊', '己', '庚', '辛', '壬', '癸', '丁', '丙', '乙'];
    var gongSeq = period === '阴遁'
      ? [1, 9, 8, 7, 6, 5, 4, 3, 2]   // 阴遁宫序递减
      : [1, 2, 3, 4, 5, 6, 7, 8, 9];  // 阳遁宫序递增

    var startIdx = gongSeq.indexOf(ju);
    if (startIdx < 0) startIdx = 0;

    for (var j = 0; j < ganOrder.length; j++) {
      var gong = gongSeq[(startIdx + j) % 9];
      diPan[gong] = ganOrder[j];
    }
    return diPan;
  }

  /** 找某天干在地盘中的宫位（地盘九干各居一宫，唯一） */
  function findGanGong(diPan, gan) {
    for (var gong in diPan) {
      if (diPan.hasOwnProperty(gong) && diPan[gong] === gan) {
        return parseInt(gong, 10);
      }
    }
    return null;
  }

  /**
   * 排天盘（九星 + 天盘干）：值符随时干
   * 1. 值符星 = 旬首遁干所在宫的原始星（中五宫时为天禽，寄天芮执行）
   * 2. 值符星携九星沿外围环旋转，落至时干所在宫（时干甲时看旬首遁干；落中五寄坤二）
   * 3. 各星携其原始宫的地盘干同步旋转；天禽寄天芮，携中五宫干
   */
  function arrangeTianPan(diPan, timeGZ) {
    var timeGan = timeGZ[0];
    var timeJiaziIdx = JIAZI_INDEX[timeGZ];

    // 旬首（时辰所在六旬的甲X）
    var xunIdx = Math.floor(timeJiaziIdx / 10);
    var xunShou = SIXTY_JIAZI[xunIdx * 10];
    var dunGan = XUNSHOU_DUN[xunShou]; // 旬首遁干（戊己庚辛壬癸）

    // 旬首遁干在地盘宫位 → 值符星原始宫
    var zhiFuHomeGong = findGanGong(diPan, dunGan); // 1-9
    var zhiFuStar = GONG_TO_STAR[zhiFuHomeGong];    // 值符星名

    // 时干（甲遁于旬首干下）在地盘宫位 → 值符落宫
    var shiGan = timeGan === '甲' ? dunGan : timeGan;
    var zhiFuGong = findGanGong(diPan, shiGan);
    if (zhiFuGong === 5) zhiFuGong = 2; // 值符落中五宫寄坤二

    // 中五宫值符（天禽）寄天芮，以坤二为执行宫
    var exeHomeGong = zhiFuHomeGong === 5 ? 2 : zhiFuHomeGong;

    // 天盘旋转量：值符星从原始宫沿环转到落宫
    var offset = (RING_IDX[zhiFuGong] - RING_IDX[exeHomeGong] + 8) % 8;

    // 沿环平移：星环（蓬任冲辅英芮柱心，对应环位0-7）
    var tianPan = {}; // 宫位 → 天盘干
    var starPan = {}; // 宫位 → 九星
    var ringStars = ['天蓬', '天任', '天冲', '天辅', '天英', '天芮', '天柱', '天心'];
    for (var p = 0; p < 8; p++) {
      var dstGong = RING[(p + offset) % 8];
      var srcGong = RING[p];               // 该星原始宫
      starPan[dstGong] = ringStars[p];
      tianPan[dstGong] = diPan[srcGong];  // 星携原始宫地盘干
    }
    // 天禽寄天芮，携中五宫地盘干（转盘法天禽不入独立宫位）
    var ruiGong = null;
    for (var q in starPan) {
      if (starPan.hasOwnProperty(q) && starPan[q] === '天芮') { ruiGong = parseInt(q, 10); break; }
    }

    return {
      tianPan: tianPan,
      starPan: starPan,
      zhiFuStar: zhiFuStar,
      zhiFuHomeGong: zhiFuHomeGong,
      zhiFuGong: zhiFuGong,
      xunShou: xunShou,
      dunGan: dunGan,
      offset: offset,
      qinGong: ruiGong, // 天禽寄宫（=天芮落宫）
    };
  }

  /**
   * 排八门：值使随时辰
   * 1. 值使门 = 旬首遁干所在宫的原始门（中五宫寄坤二取死门）
   * 2. 值使落宫：从值使门原始宫起按九宫数字序数n步（阳遁顺数1→2→…→9、阴遁逆数1→9→…→2），
   *    落中五宫时寄坤二宫（故有"值使寄坤"之说）
   * 3. 门盘排布：值使门落于其宫，其余七门沿外围环保持相对位置（转盘式）
   */
  function arrangeDoors(diPan, timeGZ, tianInfo, period) {
    var timeJiaziIdx = JIAZI_INDEX[timeGZ];
    var n = timeJiaziIdx % 10; // 旬内时辰序数（甲X时=0）

    // 值使门原始宫 = 旬首遁干宫（中五宫寄坤二）
    var homeGong = tianInfo.zhiFuHomeGong === 5 ? 2 : tianInfo.zhiFuHomeGong;
    var zhiShiDoor = GONG_TO_DOOR[homeGong];

    // 值使落宫：按九宫数字序数宫，遇中五寄坤二
    var t;
    if (period === '阳遁') {
      t = ((homeGong - 1 + n) % 9) + 1;
    } else {
      t = (((homeGong - 1 - n) % 9) + 9) % 9 + 1;
    }
    if (t === 5) t = 2; // 落中五宫寄坤二
    var zhiShiGong = t;

    // 门盘沿外围环平移量：值使门从原始宫到落宫
    var offset = (RING_IDX[zhiShiGong] - RING_IDX[homeGong] + 8) % 8;

    // 门环（休生伤杜景死惊开，对应环位0-7）
    var doorPan = {};
    var ringDoors = ['休门', '生门', '伤门', '杜门', '景门', '死门', '惊门', '开门'];
    for (var p = 0; p < 8; p++) {
      var dstGong = RING[(p + offset) % 8];
      doorPan[dstGong] = ringDoors[p];
    }

    return {
      doorPan: doorPan,
      zhiShiDoor: zhiShiDoor,
      zhiShiGong: zhiShiGong,
      offset: offset,
    };
  }

  /**
   * 排八神：值符神落天盘值符星落宫，其余七神沿环排布
   * 阳遁顺布（环+）、阴遁逆布（环-）
   */
  function arrangeGods(zhiFuGong, period) {
    var godPan = {};
    var base = RING_IDX[zhiFuGong];
    for (var i = 0; i < GODS.length; i++) {
      var idx = period === '阳遁' ? (base + i) % 8 : (base - i + 80) % 8;
      godPan[RING[idx]] = GODS[i];
    }
    return godPan;
  }

  /* ========== 四、解读数据 ========== */

  /** 八门含义 */
  var DOOR_MEANING = {
    休门: '吉门，主休养、和合。宜求财、婚姻、谒贵、休整，忌兴兵',
    生门: '大吉之门，主生机。宜求财、开业、建造、治病、远行谋事',
    伤门: '凶门，主损伤。宜讨债、捕猎、博弈，忌出行、经商、嫁娶',
    杜门: '小凶，主闭塞。宜躲避、藏匿、保密、断绝，忌诸事出行',
    景门: '中平，主文书。宜考试、宴会、献策、文书往来，防口舌火烛',
    死门: '大凶之门，主死丧。宜吊丧、刑狱、渔猎，余事勿用',
    惊门: '凶门，主惊恐。宜诉讼、捕盗、惊疑之事，忌出行谈判',
    开门: '吉门，主开创。宜开业、出征、求职、诉讼、放贷，百事吉',
  };

  /** 九星含义 */
  var STAR_MEANING = {
    天蓬: '凶星（水），主盗贼水患。宜安抚边疆、屯守，忌嫁娶远行',
    天芮: '凶星（土），主疾病。宜拜师求学、交友，忌嫁娶迁徙',
    天冲: '半吉（木），主征伐。宜出战、复仇、竞争、建功',
    天辅: '大吉星（木），主文昌。宜求学、应试、嫁娶、修道、迁宅',
    天禽: '大吉星（土），中宫之主。宜祭祀、祈福、遣将、诸事皆吉',
    天心: '大吉星（金），主医药贵人。宜求医、治病、见贵、书符',
    天柱: '凶星（金），主破坏。宜隐迹守株、藏兵，忌远行嫁娶',
    天任: '吉星（土），主富足。宜求财、种植、见贵、纳财',
    天英: '中平（火），主急躁血光。宜献策求财，忌嫁娶饮酒',
  };

  /** 八神含义 */
  var GOD_MEANING = {
    值符: '大吉之神，主贵人权威。所临之宫百事可为',
    螣蛇: '凶神，主惊恐怪异、虚诈不实。防小人欺诈',
    太阴: '吉神，主荫庇。宜暗中谋划、私事、贵人暗助',
    六合: '吉神，主婚姻交易。宜合作、谈判、婚姻、中介',
    白虎: '凶神，主道路凶伤。防疾病、交通事故、刑伤',
    玄武: '凶神，主盗贼暗昧。防失窃、欺骗、口舌是非',
    九地: '吉神（静），主隐藏固守。宜屯兵、藏匿、守成',
    九天: '吉神（动），主扬威进取。宜出征、远行、上进',
  };

  /** 十干克应精选（天盘干+地盘干 → 断语） */
  var GAN_KE_YING = {
    '戊丙': '青龙返首，大吉之格，所求遂意，动作皆成',
    '丙戊': '飞鸟跌穴，大吉之格，谋事易成，时机可乘',
    '乙辛': '青龙逃走，凶格，人财两伤，防破财走失',
    '辛乙': '白虎猖狂，凶格，事多反复，防争斗刑伤',
    '庚丙': '太白入荧，主贼必来，防暗中算计、占我便宜之人',
    '丙庚': '荧入太白，主贼即去，凶事将退，宜趁势解决',
    '乙庚': '日奇被刑，主争讼不平，合作中有纠纷',
    '丁癸': '朱雀投江，主文书口舌、信息受阻',
    '癸丁': '螣蛇夭矫，主惊恐怪异、事多反复难定',
    '丁壬': '人遁吉格，贵人暗助，宜暗中行事',
    '戊庚': '值符飞宫，主事有变动迁移，吉凶看所临之门',
    '乙戊': '利阴害阳，事利于暗中、女性，公开则阻',
    '丙辛': '月奇相合，谋事可成，有和合之象',
    '丁乙': '星奇相佐，文书吉庆，贵人相助成事',
    '戊乙': '青龙合灵，门吉则事吉，谋为可成',
    '丙丁': '星奇并行，文书大吉，宜考试献策',
    '壬癸': '罗网四张，诸事受困，宜守不宜进',
    '庚癸': '大格，行人不至，事多阻隔延迟',
    '庚壬': '小格，主远行受阻、音信迟滞',
    '戊戊': '伏吟，凡事迟滞拖延，宜静不宜动',
    '己己': '伏吟，地户不明，宜守旧不宜谋新',
    '庚庚': '太白同宫，官灾横祸，主争斗刑讼',
    '辛辛': '伏吟天庭，公废私就，反复自缚',
    '癸癸': '天网四张，行人失约，病讼缠身',
  };

  /** 十干克应查表（去除键中空格） */
  function lookUpKeYing(tianGan, diGan) {
    if (tianGan === diGan) {
      var self = GAN_KE_YING[tianGan + tianGan];
      if (self) return self;
    }
    return GAN_KE_YING[tianGan + diGan] || null;
  }

  /** 通用五行生克断 */
  function wuxingDuan(tianGan, diGan) {
    var tw = GAN_WUXING[tianGan];
    var dw = GAN_WUXING[diGan];
    if (tw === dw) return '干支比和，主平稳，事可续行';
    var sheng = { 木: '火', 火: '土', 土: '金', 金: '水', 水: '木' };
    var ke = { 木: '土', 土: '水', 水: '火', 火: '金', 金: '木' };
    if (sheng[tw] === dw) return '天盘生地盘，主泄气付出，利他利事';
    if (sheng[dw] === tw) return '地盘生天盘，主得助力，进财进益';
    if (ke[tw] === dw) return '天盘克地盘，主得势制胜，事可谋为';
    if (ke[dw] === tw) return '地盘克天盘，主受制受阻，事多磨折';
    return '';
  }

  /* ========== 五、解读生成 ========== */

  /**
   * 生成局象解读文本
   */
  function generateInterpretation(cells, ctx) {
    var lines = [];
    var period = ctx.period;
    var ju = ctx.ju;
    var jieqi = ctx.jieqi;
    var sanYuanName = ['上元', '中元', '下元'][ctx.sanYuan] || '上元';

    // 一、局象概述
    lines.push('【局象概述】');
    lines.push(
      '时值' + jieqi + '节气，' + period + ju + '局（' + sanYuanName + '，拆补法定局）。' +
        '日柱' + ctx.dayGZ + '，时柱' + ctx.timeGZ + '，' + ctx.xunShou + '旬首遁于' + ctx.dunGan + '下。'
    );

    // 二、值符值使
    lines.push('');
    lines.push('【值符值使】');
    lines.push(
      '值符' + ctx.zhiFuStar + '落' + GONG_NAMES[ctx.zhiFuGong] + '，值使' + ctx.zhiShiDoor + '落' +
        GONG_NAMES[ctx.zhiShiGong] + '。值符所临之处为全局枢纽，值使为事之门户。'
    );

    // 三、格局判断
    lines.push('');
    lines.push('【格局判断】');
    var geJu = [];
    if (ctx.tianOffset === 0 && ctx.doorOffset === 0) {
      geJu.push('星门伏吟——天盘与地盘重叠，主静守拖延、事难推进，宜守不宜攻');
    } else if (ctx.tianOffset === 4) {
      geJu.push('星盘反吟——天盘与地盘对冲，主事态反复、内外相违、变动剧烈');
    }
    if (ctx.zhiFuStar === '天禽') {
      geJu.push('值符天禽——中宫之主寄于坤二，主贵人居中调和、宜托人斡旋');
    }
    var sanQi = [];
    for (var pos in cells) {
      if (!cells.hasOwnProperty(pos)) continue;
      var c = cells[pos];
      if (c.tian_pan === '乙') sanQi.push('日奇乙落' + GONG_NAMES[pos]);
      if (c.tian_pan === '丙') sanQi.push('月奇丙落' + GONG_NAMES[pos]);
      if (c.tian_pan === '丁') sanQi.push('星奇丁落' + GONG_NAMES[pos]);
    }
    if (sanQi.length) {
      geJu.push('三奇' + sanQi.join('，') + '。乙奇主贵人调解、丙奇主威权破局、丁奇主文书许诺');
    }
    if (geJu.length) {
      lines.push(geJu.join('。') + '。');
    } else {
      lines.push('此局无特殊大格，以门星神之吉凶参断。');
    }

    // 四、十干克应（值符宫与吉门宫）
    lines.push('');
    lines.push('【十干克应】');
    var keyGongs = [ctx.zhiFuGong];
    // 加入三吉门所在宫
    var auspiciousDoors = ['休门', '生门', '开门'];
    for (var p2 in cells) {
      if (!cells.hasOwnProperty(p2)) continue;
      if (auspiciousDoors.indexOf(cells[p2].door) >= 0) keyGongs.push(parseInt(p2, 10));
    }
    var seen = {};
    var keyDuanCount = 0;
    for (var k = 0; k < keyGongs.length; k++) {
      var gp = keyGongs[k];
      if (gp === 5 || seen[gp]) continue;
      seen[gp] = true;
      var cell2 = cells[gp];
      if (!cell2 || !cell2.tian_pan || !cell2.di_pan) continue;
      var duan = lookUpKeYing(cell2.tian_pan, cell2.di_pan) || wuxingDuan(cell2.tian_pan, cell2.di_pan);
      if (duan && keyDuanCount < 3) {
        lines.push(GONG_NAMES[gp] + '天盘' + cell2.tian_pan + '加地盘' + cell2.di_pan + '：' + duan + '。');
        keyDuanCount++;
      }
    }
    if (keyDuanCount === 0) {
      lines.push('各宫天盘地盘干以生克论之：相生则事顺，相克则事阻，比和则平稳。');
    }

    // 五、八门吉凶
    lines.push('');
    lines.push('【八门吉凶】');
    var doorLines = [];
    for (var d = 0; d < RING.length; d++) {
      var dp = RING[d];
      var dc = cells[dp];
      if (!dc || !dc.door) continue;
      var tag = auspiciousDoors.indexOf(dc.door) >= 0 ? '（吉）' :
        (dc.door === '死门' || dc.door === '惊门' || dc.door === '伤门' ? '（凶）' : '（平）');
      doorLines.push(dc.door + '临' + GONG_NAMES[dp] + tag);
    }
    lines.push(doorLines.join('，') + '。');
    lines.push('休生开为三吉门，死惊伤为三凶门，杜景为中平。吉门所临之方，宜行事宜谋事。');

    // 六、九星旺衰
    lines.push('');
    lines.push('【九星要断】');
    var starLines = [];
    starLines.push('值符' + ctx.zhiFuStar + '（' + (STAR_MEANING[ctx.zhiFuStar] || '').split('。')[0] + '）');
    // 找三吉门所在宫的星
    for (var s = 0; s < RING.length; s++) {
      var sp = RING[s];
      var sc = cells[sp];
      if (sc && sc.star && auspiciousDoors.indexOf(sc.door) >= 0 && sc.star !== ctx.zhiFuStar) {
        starLines.push(sc.star + '临' + GONG_NAMES[sp]);
        if (starLines.length >= 4) break;
      }
    }
    lines.push(starLines.join('；') + '。吉星临吉门之宫，为得位；凶星临凶门，其凶愈甚。');

    // 七、八神格局
    lines.push('');
    lines.push('【八神格局】');
    var godLines = [];
    var goodGods = ['值符', '太阴', '六合', '九天', '九地'];
    var badGods = ['螣蛇', '白虎', '玄武'];
    for (var g = 0; g < RING.length; g++) {
      var gp2 = RING[g];
      var gc = cells[gp2];
      if (!gc || !gc.god) continue;
      if (goodGods.indexOf(gc.god) >= 0) {
        godLines.push(gc.god + '临' + GONG_NAMES[gp2] + '（吉，' + (GOD_MEANING[gc.god] || '').split('，')[1] + '）');
      }
    }
    var badLine = [];
    for (var g2 = 0; g2 < RING.length; g2++) {
      var gp3 = RING[g2];
      var gc2 = cells[gp3];
      if (gc2 && badGods.indexOf(gc2.god) >= 0 && gc2.door && auspiciousDoors.indexOf(gc2.door) < 0) {
        badLine.push(gc2.god + '临' + GONG_NAMES[gp3]);
      }
    }
    if (godLines.length) lines.push('吉神：' + godLines.join('；') + '。');
    if (badLine.length) lines.push('凶神压凶门：' + badLine.join('，') + '，此方不宜谋事出行。');
    if (!godLines.length && !badLine.length) lines.push('八神以值符所临之宫为尊，各宫吉凶参断门星。');

    // 八、综合判断
    lines.push('');
    lines.push('【综合判断】');
    var auspiciousCount = 0;
    var inauspiciousCount = 0;
    for (var g3 = 0; g3 < RING.length; g3++) {
      var pos3 = RING[g3];
      var cell3 = cells[pos3] || {};
      var isGood = false;
      if (auspiciousDoors.indexOf(cell3.door) >= 0) isGood = true;
      if (isGood) auspiciousCount++;
      else inauspiciousCount++;
    }
    if (auspiciousCount > inauspiciousCount) {
      lines.push(
        '此局吉多凶少，' + auspiciousCount + '宫得吉门，' + inauspiciousCount + '宫不吉。' +
          '总体运势向好，宜把握时机、积极进取，重要事务可在此局时段内推进。'
      );
    } else if (auspiciousCount < inauspiciousCount) {
      lines.push(
        '此局凶多吉少，' + inauspiciousCount + '宫不吉，' + auspiciousCount + '宫得吉门。' +
          '宜守不宜攻，谨慎行事，重大决策宜暂缓，待吉门旺时再动。'
      );
    } else {
      lines.push('此局吉凶参半，宜权衡利弊、取吉避凶。可参考各宫门星神之吉凶，择吉方而动。');
    }

    // 九、趋避建议
    lines.push('');
    lines.push('【趋避建议】');
    var bestPos = null;
    for (var g4 = 0; g4 < RING.length; g4++) {
      var pos4 = RING[g4];
      var cell4 = cells[pos4] || {};
      if (auspiciousDoors.indexOf(cell4.door) >= 0 && goodGods.indexOf(cell4.god) >= 0) {
        bestPos = pos4;
        break;
      }
    }
    if (!bestPos) {
      for (var g5 = 0; g5 < RING.length; g5++) {
        var pos5 = RING[g5];
        var cell5 = cells[pos5] || {};
        if (auspiciousDoors.indexOf(cell5.door) >= 0) { bestPos = pos5; break; }
      }
    }
    if (bestPos) {
      lines.push(
        GONG_NAMES[bestPos] + '（' + GONG_FANGWEI[bestPos] + '）三吉门与吉神相会，为全局最佳方位，' +
          '宜向此方出行、谈判、谋事。'
      );
    }
    // 凶方
    var worstPos = null;
    for (var g6 = 0; g6 < RING.length; g6++) {
      var pos6 = RING[g6];
      var cell6 = cells[pos6] || {};
      if (badGods.indexOf(cell6.god) >= 0 && (cell6.door === '死门' || cell6.door === '惊门' || cell6.door === '伤门')) {
        worstPos = pos6;
        break;
      }
    }
    if (worstPos) {
      lines.push('慎往' + GONG_NAMES[worstPos] + '（' + GONG_FANGWEI[worstPos] + '），凶神凶门汇聚，此方谋事多阻、出行慎防口舌病伤。');
    }

    return lines.join('\n');
  }

  /* ========== 六、公开API ========== */

  /**
   * 奇门遁甲起局
   * @param {string} dateStr - 日期 YYYY-MM-DD（默认今天）
   * @param {string} shichen - 时辰名（如'子时'，默认当前时辰）
   * @param {string} juStr - 局数 'auto' | 'yang-1'~'yang-9' | 'yin-1'~'yin-9'
   * @returns {object} 完整奇门盘
   */
  function divine(dateStr, shichen, juStr) {
    // 解析日期
    var year, month, day;
    if (dateStr) {
      var parts = dateStr.split('-');
      year = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10);
      day = parseInt(parts[2], 10);
    } else {
      var now = new Date();
      year = now.getFullYear();
      month = now.getMonth() + 1;
      day = now.getDate();
    }

    // 解析时辰
    if (!shichen) {
      var nowHour = new Date().getHours();
      var shichenNames = [
        '子时', '丑时', '丑时', '寅时', '寅时', '卯时', '卯时', '辰时', '辰时', '巳时', '巳时', '午时',
        '午时', '未时', '未时', '申时', '申时', '酉时', '酉时', '戌时', '戌时', '亥时', '亥时', '子时',
      ];
      shichen = shichenNames[nowHour] || '子时';
    }

    // 节气、阴阳遁、三元定局
    var jieqi = getCurrentJieqi(month, day);
    var period = getPeriod(jieqi);
    var dayGZ = calcDayGZ(year, month, day);
    var sanYuan = getSanYuan(dayGZ);
    var ju = JU_TABLE[jieqi] ? JU_TABLE[jieqi][sanYuan] : 1;

    // 手动指定局数
    if (juStr && juStr !== 'auto') {
      var juParts = juStr.split('-');
      if (juParts[0] === 'yang') {
        period = '阳遁';
        ju = parseInt(juParts[1], 10) || 1;
      } else if (juParts[0] === 'yin') {
        period = '阴遁';
        ju = parseInt(juParts[1], 10) || 1;
      }
    }

    // 时干支
    var dayGan = dayGZ[0];
    var timeGZ = calcTimeGZ(dayGan, shichen);

    // ===== 排盘 =====
    // 1. 地盘
    var diPan = arrangeDiPan(ju, period);

    // 2. 天盘（含值符星、旬首信息）
    var tianInfo = arrangeTianPan(diPan, timeGZ);
    var tianPan = tianInfo.tianPan;
    var starPan = tianInfo.starPan;

    // 3. 八门（值使随时辰）
    var doorInfo = arrangeDoors(diPan, timeGZ, tianInfo, period);
    var doorPan = doorInfo.doorPan;

    // 4. 八神（值符落宫起排）
    var godPan = arrangeGods(tianInfo.zhiFuGong, period);

    // ===== 组装九宫 cells =====
    var cells = {};
    for (var g = 0; g < GONG_ORDER.length; g++) {
      var pos = GONG_ORDER[g];
      var cell = {
        di_pan: diPan[pos] || '',
        tian_pan: tianPan[pos] || '',
        star: starPan[pos] || '',
      };
      if (pos === 5) {
        // 中五宫：无门无神无星（转盘法中不入此宫），仅地盘干
        cell.door = '';
        cell.god = '';
        cell.star = '';
        cell.tian_pan = '';
      } else {
        cell.door = doorPan[pos] || '';
        cell.god = godPan[pos] || '';
        // 天禽寄宫：天芮落宫附加显示天禽星+中五宫地盘干
        if (pos === tianInfo.qinGong && tianInfo.qinGong !== null) {
          cell.ji_star = '天禽';
          cell.ji_tian_pan = diPan[5] || '';
        }
      }
      cells[pos] = cell;
    }

    // ===== 解读 =====
    var ctx = {
      period: period,
      ju: ju,
      jieqi: jieqi,
      dayGZ: dayGZ,
      timeGZ: timeGZ,
      sanYuan: sanYuan,
      xunShou: tianInfo.xunShou,
      dunGan: tianInfo.dunGan,
      zhiFuStar: tianInfo.zhiFuStar,
      zhiFuGong: tianInfo.zhiFuGong,
      zhiShiDoor: doorInfo.zhiShiDoor,
      zhiShiGong: doorInfo.zhiShiGong,
      tianOffset: tianInfo.offset,
      doorOffset: doorInfo.offset,
    };
    var interpretation = generateInterpretation(cells, ctx);

    return {
      period: period,
      ju: period + ju + '局',
      ju_num: ju,
      jieqi: jieqi,
      san_yuan: ['上元', '中元', '下元'][sanYuan],
      day_gz: dayGZ,
      time_gz: timeGZ,
      shichen: shichen,
      xun_shou: tianInfo.xunShou,
      zhi_fu_star: tianInfo.zhiFuStar,
      zhi_fu_gong: tianInfo.zhiFuGong,
      zhi_shi_door: doorInfo.zhiShiDoor,
      zhi_shi_gong: doorInfo.zhiShiGong,
      cells: cells,
      interpretation: interpretation,
    };
  }

  // 暴露到全局
  global.QimenEngine = {
    divine: divine,
    SOLAR_TERMS: SOLAR_TERMS,
    JU_TABLE: JU_TABLE,
  };
})(typeof window !== 'undefined' ? window : this);
