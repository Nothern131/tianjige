/**
 * 天机阁 · 紫微斗数引擎 v1 — 纯前端算法，零API调用
 * 安命宫 + 十二宫 + 十四主星 + 辅星 + 四化 + 解读
 * 参考：陈希夷《紫微斗数全书》体系
 */
(function (global) {
  'use strict';

  /* ========== 一、基础常量 ========== */
  var GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
  var ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  var ZHI_NUM = { 子: 0, 丑: 1, 寅: 2, 卯: 3, 辰: 4, 巳: 5, 午: 6, 未: 7, 申: 8, 酉: 9, 戌: 10, 亥: 11 };

  // 十二宫名称
  var GONG_NAMES = ['命宫', '兄弟', '夫妻', '子女', '财帛', '疾厄', '迁移', '交友', '官禄', '田宅', '福德', '父母'];

  // 地支五行
  var ZHI_WX = {
    子: '水',
    丑: '土',
    寅: '木',
    卯: '木',
    辰: '土',
    巳: '火',
    午: '火',
    未: '土',
    申: '金',
    酉: '金',
    戌: '土',
    亥: '水',
  };

  // 天干五行
  var GAN_WX = { 甲: '木', 乙: '木', 丙: '火', 丁: '火', 戊: '土', 己: '土', 庚: '金', 辛: '金', 壬: '水', 癸: '水' };

  // 六十甲子
  var SIXTY_JIAZI = [];
  var JIAZI_INDEX = {};
  for (var i = 0; i < 60; i++) {
    var jz = GAN[i % 10] + ZHI[i % 12];
    SIXTY_JIAZI.push(jz);
    JIAZI_INDEX[jz] = i;
  }

  /* ========== 二、农历转换（精确版，1900-2100） ========== */
  // 权威数据表（solarlunar v3.1.0 同源，已修复 1996/2060/2097 三处数据错误）
  var LUNAR_INFO = [
    0x04bd8, 0x04ae0, 0x0a570, 0x054d5, 0x0d260, 0x0d950, 0x16554, 0x056a0, 0x09ad0, 0x055d2,
    0x04ae0, 0x0a5b6, 0x0a4d0, 0x0d250, 0x1d255, 0x0b540, 0x0d6a0, 0x0ada2, 0x095b0, 0x14977,
    0x04970, 0x0a4b0, 0x0b4b5, 0x06a50, 0x06d40, 0x1ab54, 0x02b60, 0x09570, 0x052f2, 0x04970,
    0x06566, 0x0d4a0, 0x0ea50, 0x06e95, 0x05ad0, 0x02b60, 0x186e3, 0x092e0, 0x1c8d7, 0x0c950,
    0x0d4a0, 0x1d8a6, 0x0b550, 0x056a0, 0x1a5b4, 0x025d0, 0x092d0, 0x0d2b2, 0x0a950, 0x0b557,
    0x06ca0, 0x0b550, 0x15355, 0x04da0, 0x0a5b0, 0x14573, 0x052b0, 0x0a9a8, 0x0e950, 0x06aa0,
    0x0aea6, 0x0ab50, 0x04b60, 0x0aae4, 0x0a570, 0x05260, 0x0f263, 0x0d950, 0x05b57, 0x056a0,
    0x096d0, 0x04dd5, 0x04ad0, 0x0a4d0, 0x0d4d4, 0x0d250, 0x0d558, 0x0b540, 0x0b6a0, 0x195a6,
    0x095b0, 0x049b0, 0x0a974, 0x0a4b0, 0x0b27a, 0x06a50, 0x06d40, 0x0af46, 0x0ab60, 0x09570,
    0x04af5, 0x04970, 0x064b0, 0x074a3, 0x0ea50, 0x06b58, 0x05ac0, 0x0ab60, 0x096d5, 0x092e0,
    0x0c960, 0x0d954, 0x0d4a0, 0x0da50, 0x07552, 0x056a0, 0x0abb7, 0x025d0, 0x092d0, 0x0cab5,
    0x0a950, 0x0b4a0, 0x0baa4, 0x0ad50, 0x055d9, 0x04ba0, 0x0a5b0, 0x15176, 0x052b0, 0x0a930,
    0x07954, 0x06aa0, 0x0ad50, 0x05b52, 0x04b60, 0x0a6e6, 0x0a4e0, 0x0d260, 0x0ea65, 0x0d530,
    0x05aa0, 0x076a3, 0x096d0, 0x04afb, 0x04ad0, 0x0a4d0, 0x1d0b6, 0x0d250, 0x0d520, 0x0dd45,
    0x0b5a0, 0x056d0, 0x055b2, 0x049b0, 0x0a577, 0x0a4b0, 0x0aa50, 0x1b255, 0x06d20, 0x0ada0,
    0x14b63, 0x09370, 0x049f8, 0x04970, 0x064b0, 0x168a6, 0x0ea50, 0x06b20, 0x1a6c4, 0x0aae0,
    0x092e0, 0x0d2e3, 0x0c960, 0x0d557, 0x0d4a0, 0x0da50, 0x05d55, 0x056a0, 0x0a6d0, 0x055d4,
    0x052d0, 0x0a9b8, 0x0a950, 0x0b4a0, 0x0b6a6, 0x0ad50, 0x055a0, 0x0aba4, 0x0a5b0, 0x052b0,
    0x0b273, 0x06930, 0x07337, 0x06aa0, 0x0ad50, 0x14b55, 0x04b60, 0x0a570, 0x054e4, 0x0d160,
    0x0e968, 0x0d520, 0x0daa0, 0x16aa6, 0x056d0, 0x04ae0, 0x0a9d4, 0x0a4d0, 0x0d150, 0x0f252,
    0x0d520
  ];

  // 取农历第 m 月（1-based）天数
  function lMonthDays(year, m) {
    return (LUNAR_INFO[year - 1900] & (0x10000 >> m)) ? 30 : 29;
  }
  // 取闰月月份（0=不闰）
  function lLeapMonth(year) {
    return LUNAR_INFO[year - 1900] & 0xf;
  }
  // 取闰月天数（不闰返回 0）
  function lLeapDays(year) {
    if (lLeapMonth(year)) {
      return (LUNAR_INFO[year - 1900] & 0x10000) ? 30 : 29;
    }
    return 0;
  }
  // 取农历整年总天数
  function lYearDays(year) {
    var sum = 348;
    var info = LUNAR_INFO[year - 1900];
    sum += info & 0x8000 ? 1 : 0;
    sum += info & 0x4000 ? 1 : 0;
    sum += info & 0x2000 ? 1 : 0;
    sum += info & 0x1000 ? 1 : 0;
    sum += info & 0x0800 ? 1 : 0;
    sum += info & 0x0400 ? 1 : 0;
    sum += info & 0x0200 ? 1 : 0;
    sum += info & 0x0100 ? 1 : 0;
    sum += info & 0x0080 ? 1 : 0;
    sum += info & 0x0040 ? 1 : 0;
    sum += info & 0x0020 ? 1 : 0;
    sum += info & 0x0010 ? 1 : 0;
    return sum + lLeapDays(year);
  }

  /** 精确公历 → 农历（基于 Date.UTC 偏移 + 数据表逐月扣除，与 solarlunar 库同源算法） */
  function solarToLunarExact(year, month, day) {
    // 以 1900-01-31（农历 1900 正月初一）为基准累计偏移天数
    var offset = Math.floor(
      (Date.UTC(year, month - 1, day) - Date.UTC(1900, 0, 31)) / 86400000
    );
    var lunarYear = 1900;
    var tempDays = lYearDays(lunarYear);
    while (tempDays <= offset) {
      offset -= tempDays;
      lunarYear++;
      tempDays = lYearDays(lunarYear);
      if (lunarYear > 2100) break;
    }
    if (offset < 0) { offset += tempDays; lunarYear--; }
    // 在 lunarYear 内逐月扣除
    var leap = lLeapMonth(lunarYear);
    var isLeapMonth = false;
    var lunarMonth = 1;
    for (; lunarMonth <= 12; lunarMonth++) {
      var mDays = lMonthDays(lunarYear, lunarMonth);
      if (offset < mDays) break;
      offset -= mDays;
      if (lunarMonth === leap) {
        var lDays = lLeapDays(lunarYear);
        if (offset < lDays) { isLeapMonth = true; break; }
        offset -= lDays;
      }
    }
    var lunarDay = offset + 1;
    return { year: lunarYear, month: lunarMonth, day: lunarDay, isLeap: isLeapMonth };
  }

  /** 农历 → 公历（用于排盘结果回显） */
  function lunarToSolarExact(year, month, day, isLeap) {
    var offset = 0;
    for (var y = 1900; y < year; y++) offset += lYearDays(y);
    var leap = lLeapMonth(year);
    // 逐月累加到 month
    for (var m = 1; m < month; m++) {
      offset += lMonthDays(year, m);
      // 非闰月查询时，若 m === 闰月月份需加上闰月天数
      if (m === leap && !isLeap) {
        offset += lLeapDays(year);
      }
    }
    // 闰月查询：先加 month 本月 + 闰月天数
    if (isLeap && leap > 0) {
      offset += lMonthDays(year, month) + lLeapDays(year) + day - 1;
    } else {
      offset += day - 1;
    }
    var d = new Date(Date.UTC(1900, 0, 31) + offset * 86400000);
    return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, day: d.getUTCDate() };
  }

  /** 兼容旧调用：保留估算接口名，内部委托精确版 */
  function solarToLunarApprox(year, month, day) {
    return solarToLunarExact(year, month, day);
  }

  /* ========== 三、安命宫/身宫 ========== */
  /**
   * 安命宫：从寅宫起正月，顺数至生月，再从该宫起子时，逆数至生时
   * 安身宫：从寅宫起正月，顺数至生月，再从该宫起子时，顺数至生时
   */
  function anMingGong(lunarMonth, shichen) {
    // 生月起寅宫，顺数
    var startPos = (2 + lunarMonth - 1) % 12; // 寅=2
    // 从该宫起子时，逆数至生时
    var shichenNum = ZHI_NUM[shichen];
    var mingGong = (startPos - shichenNum + 12) % 12;
    return ZHI[mingGong];
  }

  function anShenGong(lunarMonth, shichen) {
    // 生月起寅宫，顺数
    var startPos = (2 + lunarMonth - 1) % 12;
    // 从该宫起子时，顺数至生时
    var shichenNum = ZHI_NUM[shichen];
    var shenGong = (startPos + shichenNum) % 12;
    return ZHI[shenGong];
  }

  /* ========== 四、定十二宫天干 ========== */
  /**
   * 生年干定寅首天干：
   * 甲己→丙寅，乙庚→戊寅，丙辛→庚寅，丁壬→壬寅，戊癸→甲寅
   */
  var YIN_SHOU_GAN = {
    甲: '丙',
    己: '丙',
    乙: '戊',
    庚: '戊',
    丙: '庚',
    辛: '庚',
    丁: '壬',
    壬: '壬',
    戊: '甲',
    癸: '甲',
  };

  function buildGongGan(yearGan) {
    var yinGan = YIN_SHOU_GAN[yearGan] || '甲';
    var yinIdx = GAN.indexOf(yinGan);
    var gongGan = {};
    for (var i = 0; i < 12; i++) {
      gongGan[ZHI[i]] = GAN[(yinIdx + i) % 10];
    }
    return gongGan;
  }

  /* ========== 五、定五行局 ========== */
  /**
   * 五行局由命宫干支决定（纳音五行）
   * 简化版：直接用命宫天干地支查表
   */
  var NAYIN_WX = [
    '金',
    '金',
    '火',
    '火',
    '木',
    '木',
    '土',
    '土',
    '金',
    '金',
    '火',
    '火',
    '水',
    '水',
    '土',
    '土',
    '金',
    '金',
    '木',
    '木',
    '水',
    '水',
    '土',
    '土',
    '火',
    '火',
    '木',
    '木',
    '水',
    '水',
    '火',
    '火',
    '土',
    '土',
    '木',
    '木',
    '水',
    '水',
    '金',
    '金',
    '土',
    '土',
    '木',
    '木',
    '水',
    '水',
    '金',
    '金',
    '火',
    '火',
    '木',
    '木',
    '水',
    '水',
    '金',
    '金',
    '火',
    '火',
    '土',
    '土',
  ];

  var WX_JU_NUM = { 金: 4, 木: 3, 水: 2, 火: 6, 土: 5 };

  function getWuxingJu(mingGongGanZhi) {
    var idx = JIAZI_INDEX[mingGongGanZhi];
    if (idx === undefined) return { wx: '木', ju: 3 };
    var wx = NAYIN_WX[idx % 60];
    return { wx: wx, ju: WX_JU_NUM[wx] || 3 };
  }

  /* ========== 六、安紫微星 ========== */
  /**
   * 根据五行局数和农历生日安紫微星
   * 简化公式法
   */
  function anZiWei(juNum, lunarDay) {
    // 紫微星定位表（简化算法）
    // 公式：紫微星位置 = 生日除以局数的商和余数决定
    var quotient = Math.floor(lunarDay / juNum);
    var remainder = lunarDay % juNum;

    var ziWeiPos;
    if (remainder === 0) {
      ziWeiPos = quotient;
    } else {
      // 奇余数加，偶余数减
      if (remainder % 2 === 1) {
        ziWeiPos = quotient + remainder;
      } else {
        ziWeiPos = quotient - remainder;
      }
    }

    // 确保在1-12范围内，对应寅1到丑12
    // 紫微星从寅宫(2)开始安
    ziWeiPos = (((ziWeiPos - 1) % 12) + 12) % 12;
    return ZHI[ziWeiPos];
  }

  /* ========== 七、安十四主星 ========== */
  /**
   * 紫微系：紫微→天机(隔一)→(空)→太阳(隔一)→武曲(隔一)→天同(隔一)→(空)→廉贞(隔一)
   * 天府系：天府→太阴(隔一)→贪狼(隔一)→巨门(隔一)→天相(隔一)→天梁(隔一)→七杀(隔一)→(空)→破军(隔一)
   */

  // 紫微→天府位置映射
  var ZIWEI_TO_TIANFU = {
    子: '辰',
    丑: '卯',
    寅: '辰',
    卯: '丑',
    辰: '子',
    巳: '亥',
    午: '戌',
    未: '酉',
    申: '申',
    酉: '未',
    戌: '午',
    亥: '巳',
  };

  function anShiSiZhuXing(ziWeiZhi) {
    var ziWeiPos = ZHI_NUM[ziWeiZhi];
    var stars = {};

    // 紫微
    stars[ziWeiZhi] = (stars[ziWeiZhi] || []).concat(['紫微']);

    // 紫微系（逆时针隔一格安一星）
    // 天机：紫微隔一（逆数=减1）
    var tianJiPos = (ziWeiPos - 1 + 12) % 12;
    stars[ZHI[tianJiPos]] = (stars[ZHI[tianJiPos]] || []).concat(['天机']);

    // 跳过一格（空）
    // 太阳：再隔一
    var taiYangPos = (ziWeiPos - 3 + 12) % 12;
    stars[ZHI[taiYangPos]] = (stars[ZHI[taiYangPos]] || []).concat(['太阳']);

    // 武曲：再隔一
    var wuQuPos = (ziWeiPos - 4 + 12) % 12;
    stars[ZHI[wuQuPos]] = (stars[ZHI[wuQuPos]] || []).concat(['武曲']);

    // 天同：再隔一
    var tianTongPos = (ziWeiPos - 5 + 12) % 12;
    stars[ZHI[tianTongPos]] = (stars[ZHI[tianTongPos]] || []).concat(['天同']);

    // 跳过一格（空）
    // 廉贞：再隔一
    var lianZhenPos = (ziWeiPos - 7 + 12) % 12;
    stars[ZHI[lianZhenPos]] = (stars[ZHI[lianZhenPos]] || []).concat(['廉贞']);

    // 天府系
    var tianFuZhi = ZIWEI_TO_TIANFU[ziWeiZhi] || '辰';
    var tianFuPos = ZHI_NUM[tianFuZhi];

    stars[tianFuZhi] = (stars[tianFuZhi] || []).concat(['天府']);

    // 太阴：天府隔一（顺数=加1）
    var taiYinPos = (tianFuPos + 1) % 12;
    stars[ZHI[taiYinPos]] = (stars[ZHI[taiYinPos]] || []).concat(['太阴']);

    // 贪狼：再隔一
    var tanLangPos = (tianFuPos + 2) % 12;
    stars[ZHI[tanLangPos]] = (stars[ZHI[tanLangPos]] || []).concat(['贪狼']);

    // 巨门：再隔一
    var juMenPos = (tianFuPos + 3) % 12;
    stars[ZHI[juMenPos]] = (stars[ZHI[juMenPos]] || []).concat(['巨门']);

    // 天相：再隔一
    var tianXiangPos = (tianFuPos + 4) % 12;
    stars[ZHI[tianXiangPos]] = (stars[ZHI[tianXiangPos]] || []).concat(['天相']);

    // 天梁：再隔一
    var tianLiangPos = (tianFuPos + 5) % 12;
    stars[ZHI[tianLiangPos]] = (stars[ZHI[tianLiangPos]] || []).concat(['天梁']);

    // 七杀：再隔一
    var qiShaPos = (tianFuPos + 6) % 12;
    stars[ZHI[qiShaPos]] = (stars[ZHI[qiShaPos]] || []).concat(['七杀']);

    // 跳过一格（空）
    // 破军：再隔一
    var poJunPos = (tianFuPos + 8) % 12;
    stars[ZHI[poJunPos]] = (stars[ZHI[poJunPos]] || []).concat(['破军']);

    return stars;
  }

  /* ========== 八、安辅星 ========== */
  function anFuXing(yearZhi, lunarMonth, shichen, yearGan) {
    var fuXing = {};

    // 左辅：辰宫起正月，顺数至生月
    var zuoFuPos = (4 + lunarMonth - 1) % 12;
    fuXing[ZHI[zuoFuPos]] = (fuXing[ZHI[zuoFuPos]] || []).concat(['左辅']);

    // 右弼：戌宫起正月，逆数至生月
    var youBiPos = (10 - lunarMonth + 1 + 12) % 12;
    fuXing[ZHI[youBiPos]] = (fuXing[ZHI[youBiPos]] || []).concat(['右弼']);

    // 文昌：戌宫起子时，逆数至生时
    var wenChangPos = (10 - ZHI_NUM[shichen] + 12) % 12;
    fuXing[ZHI[wenChangPos]] = (fuXing[ZHI[wenChangPos]] || []).concat(['文昌']);

    // 文曲：辰宫起子时，顺数至生时
    var wenQuPos = (4 + ZHI_NUM[shichen]) % 12;
    fuXing[ZHI[wenQuPos]] = (fuXing[ZHI[wenQuPos]] || []).concat(['文曲']);

    // 天魁：甲戊庚→丑未，乙己→子申，丙丁→亥酉，壬癸→卯巳，辛→午寅
    var tianKuiMap = {
      甲: '丑',
      戊: '丑',
      庚: '丑',
      乙: '子',
      己: '子',
      丙: '亥',
      丁: '亥',
      壬: '卯',
      癸: '卯',
      辛: '午',
    };
    var tianKui = tianKuiMap[yearGan] || '丑';
    fuXing[tianKui] = (fuXing[tianKui] || []).concat(['天魁']);

    // 天钺
    var tianYueMap = {
      甲: '未',
      戊: '未',
      庚: '未',
      乙: '申',
      己: '申',
      丙: '酉',
      丁: '酉',
      壬: '巳',
      癸: '巳',
      辛: '寅',
    };
    var tianYue = tianYueMap[yearGan] || '未';
    fuXing[tianYue] = (fuXing[tianYue] || []).concat(['天钺']);

    // 禄存：甲→寅，乙→卯，丙戊→巳，丁己→午，庚→申，辛→酉，壬→亥，癸→子
    var luCunMap = {
      甲: '寅',
      乙: '卯',
      丙: '巳',
      丁: '午',
      戊: '巳',
      己: '午',
      庚: '申',
      辛: '酉',
      壬: '亥',
      癸: '子',
    };
    var luCun = luCunMap[yearGan] || '寅';
    fuXing[luCun] = (fuXing[luCun] || []).concat(['禄存']);

    // 擎羊：禄存前一宫
    var luCunPos = ZHI_NUM[luCun];
    var qingYangPos = (luCunPos + 1) % 12;
    fuXing[ZHI[qingYangPos]] = (fuXing[ZHI[qingYangPos]] || []).concat(['擎羊']);

    // 陀罗：禄存前一宫（逆）
    var tuoLuoPos = (luCunPos - 1 + 12) % 12;
    fuXing[ZHI[tuoLuoPos]] = (fuXing[ZHI[tuoLuoPos]] || []).concat(['陀罗']);

    // 火星：寅午戌→丑，申子辰→寅，巳酉丑→卯，亥卯未→酉
    var huoXingMap = {
      寅: '丑',
      午: '丑',
      戌: '丑',
      申: '寅',
      子: '寅',
      辰: '寅',
      巳: '卯',
      酉: '卯',
      丑: '卯',
      亥: '酉',
      卯: '酉',
      未: '酉',
    };
    var huoXing = huoXingMap[yearZhi] || '寅';
    fuXing[huoXing] = (fuXing[huoXing] || []).concat(['火星']);

    // 铃星：寅午戌→卯，申子辰→戌，巳酉丑→戌，亥卯未→戌
    var lingXingMap = {
      寅: '卯',
      午: '卯',
      戌: '卯',
      申: '戌',
      子: '戌',
      辰: '戌',
      巳: '戌',
      酉: '戌',
      丑: '戌',
      亥: '戌',
      卯: '戌',
      未: '戌',
    };
    var lingXing = lingXingMap[yearZhi] || '戌';
    fuXing[lingXing] = (fuXing[lingXing] || []).concat(['铃星']);

    // 地空：亥宫起子时，逆数至生时
    var diKongPos = (11 - ZHI_NUM[shichen] + 12) % 12;
    fuXing[ZHI[diKongPos]] = (fuXing[ZHI[diKongPos]] || []).concat(['地空']);

    // 地劫：亥宫起子时，顺数至生时
    var diJiePos = (11 + ZHI_NUM[shichen]) % 12;
    fuXing[ZHI[diJiePos]] = (fuXing[ZHI[diJiePos]] || []).concat(['地劫']);

    // 天马：按生年支三合局（申子辰→寅、寅午戌→申、巳酉丑→亥、亥卯未→巳）
    var tianMaMap = { 申: '寅', 子: '寅', 辰: '寅', 寅: '申', 午: '申', 戌: '申', 巳: '亥', 酉: '亥', 丑: '亥', 亥: '巳', 卯: '巳', 未: '巳' };
    var tianMa = tianMaMap[yearZhi] || '寅';
    fuXing[tianMa] = (fuXing[tianMa] || []).concat(['天马']);

    // 天刑：酉宫起正月，顺数至生月
    var tianXingPos = (9 + lunarMonth - 1) % 12;
    fuXing[ZHI[tianXingPos]] = (fuXing[ZHI[tianXingPos]] || []).concat(['天刑']);

    // 红鸾：卯宫起子年，逆数至生年支；天喜 = 红鸾对宫
    var hongLuanPos = (3 - ZHI_NUM[yearZhi] + 12) % 12;
    fuXing[ZHI[hongLuanPos]] = (fuXing[ZHI[hongLuanPos]] || []).concat(['红鸾']);
    var tianXiPos = (hongLuanPos + 6) % 12;
    fuXing[ZHI[tianXiPos]] = (fuXing[ZHI[tianXiPos]] || []).concat(['天喜']);

    // 天姚：丑宫起正月，顺数至生月
    var tianYaoPos = (1 + lunarMonth - 1) % 12;
    fuXing[ZHI[tianYaoPos]] = (fuXing[ZHI[tianYaoPos]] || []).concat(['天姚']);

    // 孤辰：按生年支（亥子丑→寅、寅卯辰→巳、巳午未→申、申酉戌→亥）
    var guChenMap = { 亥: '寅', 子: '寅', 丑: '寅', 寅: '巳', 卯: '巳', 辰: '巳', 巳: '申', 午: '申', 未: '申', 申: '亥', 酉: '亥', 戌: '亥' };
    var guChen = guChenMap[yearZhi] || '寅';
    fuXing[guChen] = (fuXing[guChen] || []).concat(['孤辰']);

    // 寡宿：按生年支（亥子丑→戌、寅卯辰→丑、巳午未→辰、申酉戌→未），与孤辰对冲
    var guaSuMap = { 亥: '戌', 子: '戌', 丑: '戌', 寅: '丑', 卯: '丑', 辰: '丑', 巳: '辰', 午: '辰', 未: '辰', 申: '未', 酉: '未', 戌: '未' };
    var guaSu = guaSuMap[yearZhi] || '戌';
    fuXing[guaSu] = (fuXing[guaSu] || []).concat(['寡宿']);

    // 咸池（桃花）：按生年支三合局（亥卯未在子、寅午戌在卯、巳酉丑在午、申子辰在酉）
    var xianChiMap = { 亥: '子', 卯: '子', 未: '子', 寅: '卯', 午: '卯', 戌: '卯', 巳: '午', 酉: '午', 丑: '午', 申: '酉', 子: '酉', 辰: '酉' };
    var xianChi = xianChiMap[yearZhi] || '子';
    fuXing[xianChi] = (fuXing[xianChi] || []).concat(['咸池']);

    // 破碎：午宫起子时，顺数至生时（神煞式，按生时）
    var poSuiPos = (6 + ZHI_NUM[shichen]) % 12;
    fuXing[ZHI[poSuiPos]] = (fuXing[ZHI[poSuiPos]] || []).concat(['破碎']);

    return fuXing;
  }

  /** 主星集合（用于区分主星/小星，避免辅星被误判为小星） */
  var ZHU_STAR_SET = {
    '紫微':1,'天机':1,'太阳':1,'武曲':1,'天同':1,'廉贞':1,
    '天府':1,'太阴':1,'贪狼':1,'巨门':1,'天相':1,'天梁':1,'七杀':1,'破军':1
  };

  /** 古籍权威小星辅曜集合（用于大师点评喂料） */
  var SMALL_STAR_SET = { 天马:1, 天刑:1, 红鸾:1, 天喜:1, 天姚:1, 孤辰:1, 寡宿:1, 咸池:1, 破碎:1 };

  /** 提取命盘中的小星辅曜分布 + 四化落宫，供大师点评使用 */
  function collectSmallStarContext(result) {
    var gongs = result['十二宫'] || [];
    var siHua = result['四化'] || {};
    var lines = [];

    var smallLines = [];
    for (var i = 0; i < gongs.length; i++) {
      var g = gongs[i];
      var smalls = (g.stars || []).filter(function (s) { return SMALL_STAR_SET[s]; });
      if (smalls.length) smallLines.push('  ' + g.name + '(' + g.zhi + ')：' + smalls.join('、'));
    }
    if (smallLines.length) {
      lines.push('【小星辅曜分布】（古籍安星诀）');
      lines = lines.concat(smallLines);
    }

    var marks = { lu: '禄', quan: '权', ke: '科', ji: '忌' };
    var siHuaLines = [];
    for (var m in marks) {
      var star = siHua[m];
      if (!star) continue;
      var gongNames = [];
      for (var j = 0; j < gongs.length; j++) {
        var gg = gongs[j];
        if ((gg.stars || []).indexOf(star) !== -1) gongNames.push(gg.name);
      }
      siHuaLines.push('  ' + star + '化' + marks[m] + ' → ' + (gongNames.length ? gongNames.join('、') : '三方/对宫'));
    }
    if (siHuaLines.length) {
      lines.push('【生年四化落宫】');
      lines = lines.concat(siHuaLines);
    }

    return lines.join('\n');
  }

  /* ========== 八-B、命主/身主计算 ========== */
  var MING_ZHU_MAP = {
    子: '贪狼', 丑: '巨门', 寅: '禄存', 卯: '文曲', 辰: '廉贞', 巳: '武曲',
    午: '破军', 未: '天机', 申: '紫微', 酉: '天同', 戌: '文昌', 亥: '武曲'
  };
  var SHEN_ZHU_MAP = {
    子: '文曲', 丑: '禄存', 寅: '巨门', 卯: '贪狼', 辰: '武曲', 巳: '廉贞',
    午: '天同', 未: '破军', 申: '天机', 酉: '紫微', 戌: '武曲', 亥: '文昌'
  };

  function getMingZhu(mingGongZhi) {
    return MING_ZHU_MAP[mingGongZhi] || '贪狼';
  }

  function getShenZhu(shenGongZhi) {
    return SHEN_ZHU_MAP[shenGongZhi] || '文曲';
  }

  /** 给十二宫叠加生年四化标注：宫.sihua = ['禄','权','科','忌']（仅命主星所在宫） */
  function attachSiHua(gongs, siHua) {
    if (!siHua) return;
    var marks = { lu: '禄', quan: '权', ke: '科', ji: '忌' };
    for (var i = 0; i < gongs.length; i++) {
      var g = gongs[i];
      g.sihua = [];
      for (var k in marks) {
        if (siHua[k] && g.stars.indexOf(siHua[k]) !== -1 && ZHU_STAR_SET[siHua[k]]) {
          g.sihua.push(marks[k]);
        }
      }
    }
  }

  /* ========== 九、四化 ========== */
  /**
   * 生年干定四化
   * 甲：廉贞化禄、破军化权、武曲化科、太阳化忌
   * 乙：天机化禄、天梁化权、紫微化科、太阴化忌
   * 丙：天同化禄、天机化权、文昌化科、廉贞化忌
   * 丁：太阴化禄、天同化权、天机化科、巨门化忌
   * 戊：贪狼化禄、太阴化权、右弼化科、天机化忌
   * 己：武曲化禄、贪狼化权、天梁化科、文曲化忌
   * 庚：太阳化禄、武曲化权、太阴化科、天同化忌
   * 辛：巨门化禄、太阳化权、文曲化科、文昌化忌
   * 壬：天梁化禄、紫微化权、左辅化科、武曲化忌
   * 癸：破军化禄、巨门化权、太阴化科、贪狼化忌
   */
  var SI_HUA = {
    甲: { lu: '廉贞', quan: '破军', ke: '武曲', ji: '太阳' },
    乙: { lu: '天机', quan: '天梁', ke: '紫微', ji: '太阴' },
    丙: { lu: '天同', quan: '天机', ke: '文昌', ji: '廉贞' },
    丁: { lu: '太阴', quan: '天同', ke: '天机', ji: '巨门' },
    戊: { lu: '贪狼', quan: '太阴', ke: '右弼', ji: '天机' },
    己: { lu: '武曲', quan: '贪狼', ke: '天梁', ji: '文曲' },
    庚: { lu: '太阳', quan: '武曲', ke: '太阴', ji: '天同' },
    辛: { lu: '巨门', quan: '太阳', ke: '文曲', ji: '文昌' },
    壬: { lu: '天梁', quan: '紫微', ke: '左辅', ji: '武曲' },
    癸: { lu: '破军', quan: '巨门', ke: '太阴', ji: '贪狼' },
  };

  /* ========== 十、十二宫构建 ========== */
  function buildShiErGong(mingGongZhi, gongGan) {
    var mingGongPos = ZHI_NUM[mingGongZhi];
    var gongs = [];
    for (var i = 0; i < 12; i++) {
      var zhiPos = (mingGongPos + i) % 12;
      var zhi = ZHI[zhiPos];
      gongs.push({
        name: GONG_NAMES[i],
        zhi: zhi,
        gan: gongGan[zhi],
        ganZhi: gongGan[zhi] + zhi,
      });
    }
    return gongs;
  }

  /* ========== 十一、主入口 ========== */
  /**
   * 紫微斗数排盘
   * @param {object} params - { year, month, day, hour, gender, isLunar }
   *   hour: 时辰名称如 '子时'
   *   gender: '男' 或 '女'
   * @returns {object} 紫微斗数排盘结果
   */
  function paipan(params) {
    params = params || {};
    var year = params.year || 2000;
    var month = params.month || 1;
    var day = params.day || 1;
    var hour = params.hour || '子时';
    var gender = params.gender || '男';
    var isLunar = params.isLunar || false;

    // 时辰地支
    var shichenMap = {
      子时: '子',
      丑时: '丑',
      寅时: '寅',
      卯时: '卯',
      辰时: '辰',
      巳时: '巳',
      午时: '午',
      未时: '未',
      申时: '申',
      酉时: '酉',
      戌时: '戌',
      亥时: '亥',
    };
    var shichen = shichenMap[hour] || '子';

    // 农历转换
    var leapMonth = params.leapMonth || 0;
    var lunar;
    if (isLunar) {
      // 闰月排盘：闰月按该月本身的月份计算，但加一天偏移（传统习惯）
      lunar = { year: year, month: leapMonth > 0 ? leapMonth : month, day: day, isLeap: leapMonth > 0 };
    } else {
      lunar = solarToLunarApprox(year, month, day);
    }

    // 年干支
    var baseYear = 1900;
    var yearOffset = lunar.year - baseYear;
    var baseIdx = JIAZI_INDEX['庚子'] || 0;
    var yearGzIdx = (((baseIdx + yearOffset) % 60) + 60) % 60;
    var yearGan = GAN[yearGzIdx % 10];
    var yearZhi = ZHI[yearGzIdx % 12];

    // 安命宫
    var mingGongZhi = anMingGong(lunar.month, shichen);

    // 安身宫
    var shenGongZhi = anShenGong(lunar.month, shichen);

    // 十二宫天干
    var gongGan = buildGongGan(yearGan);

    // 五行局
    var mingGongGanZhi = gongGan[mingGongZhi] + mingGongZhi;
    var wuxingJu = getWuxingJu(mingGongGanZhi);

    // 安紫微星
    var ziWeiZhi = anZiWei(wuxingJu.ju, lunar.day);

    // 安十四主星
    var zhuXing = anShiSiZhuXing(ziWeiZhi);

    // 安辅星
    var fuXing = anFuXing(yearZhi, lunar.month, shichen, yearGan);

    // 四化
    var siHua = SI_HUA[yearGan] || SI_HUA['甲'];

    // 合并所有星曜
    var allStars = {};
    for (var zhi in zhuXing) {
      if (zhuXing.hasOwnProperty(zhi)) {
        allStars[zhi] = (allStars[zhi] || []).concat(zhuXing[zhi]);
      }
    }
    for (var zhi2 in fuXing) {
      if (fuXing.hasOwnProperty(zhi2)) {
        allStars[zhi2] = (allStars[zhi2] || []).concat(fuXing[zhi2]);
      }
    }

    // 构建十二宫
    var gongs = buildShiErGong(mingGongZhi, gongGan);

    // 为每宫分配星曜
    for (var i = 0; i < gongs.length; i++) {
      var gong = gongs[i];
      gong.stars = allStars[gong.zhi] || [];
      gong.isMingGong = gong.zhi === mingGongZhi;
      gong.isShenGong = gong.zhi === shenGongZhi;
    }

    // 生年四化标注落到每宫（仅主星所在宫）
    attachSiHua(gongs, siHua);

    // 命宫主星
    var mingGongStars = allStars[mingGongZhi] || [];
    var mingGongZhuXing = [];
    for (var si = 0; si < mingGongStars.length; si++) {
      var s = mingGongStars[si];
      if (
        [
          '紫微',
          '天机',
          '太阳',
          '武曲',
          '天同',
          '廉贞',
          '天府',
          '太阴',
          '贪狼',
          '巨门',
          '天相',
          '天梁',
          '七杀',
          '破军',
        ].indexOf(s) !== -1
      ) {
        mingGongZhuXing.push(s);
      }
    }

    // 生成解读
    var interpretation = generateZiWeiInterpretation(gongs, mingGongZhi, shenGongZhi, siHua, wuxingJu, yearGan, gender);

    // 总体运势判断
    var overallVerdict = judgeOverall(mingGongZhuXing, mingGongZhi, allStars);

    // 公历参考：公历模式直接显示输入；农历模式反向转换显示对应公历
    var solarRef = null;
    if (!isLunar) {
      solarRef = year + '/' + month + '/' + day;
    } else {
      var ls = lunarToSolarExact(lunar.year, lunar.month, lunar.day, lunar.isLeap);
      solarRef = ls.year + '/' + ls.month + '/' + ls.day;
    }

    // 命主 / 身主（按命宫/身宫所在支查古籍诀）
    var mingZhu = getMingZhu(mingGongZhi);
    var shenZhu = getShenZhu(shenGongZhi);

    return {
      农历年: lunar.year,
      农历月: lunar.month,
      农历日: lunar.day,
      农历闰月: lunar.isLeap || false,
      公历参考: solarRef,
      性别: gender,
      年干: yearGan,
      年支: yearZhi,
      年干支: yearGan + yearZhi,
      命宫: mingGongZhi,
      命宫干支: gongGan[mingGongZhi] + mingGongZhi,
      命宫主星: mingGongZhuXing.join('、') || '无主星',
      身宫: shenGongZhi,
      命主: mingZhu,
      身主: shenZhu,
      五行局: wuxingJu.wx + wuxingJu.ju + '局',
      十二宫: gongs,
      四化: siHua,
      gongGan: gongGan,
      紫微星落: ziWeiZhi,
      所有星曜: allStars,
      interpretation: interpretation,
      总体运势: overallVerdict,
    };
  }

  /* ========== 十二、解读 ========== */
  function generateZiWeiInterpretation(gongs, mingGongZhi, shenGongZhi, siHua, wuxingJu, yearGan, gender) {
    var lines = [];

    lines.push('【紫微斗数排盘】');

    // 命宫分析
    var mingGong = findGong(gongs, mingGongZhi);
    var mingStars = mingGong ? mingGong.stars : [];
    lines.push(
      '命宫在' + mingGongZhi + '（' + (mingGong ? mingGong.ganZhi : '') + '），' + wuxingJu.wx + wuxingJu.ju + '局。'
    );

    if (mingStars.length > 0) {
      lines.push('命宫主星：' + mingStars.join('、'));
    } else {
      lines.push('命宫无主星，借对宫（迁移宫）星曜为用。');
    }

    // 身宫
    var shenGong = findGong(gongs, shenGongZhi);
    lines.push('身宫在' + shenGongZhi + '（' + (shenGong ? shenGong.name : '') + '），主后天发展重心所在。');

    // 四化
    lines.push(
      '四化：' + yearGan + '干→化禄' + siHua.lu + '、化权' + siHua.quan + '、化科' + siHua.ke + '、化忌' + siHua.ji
    );

    // 十二宫概况
    lines.push('【十二宫星曜分布】');
    for (var i = 0; i < gongs.length; i++) {
      var g = gongs[i];
      var marker = '';
      if (g.isMingGong) marker = ' ←命宫';
      if (g.isShenGong) marker += ' ←身宫';
      var starStr = g.stars.length > 0 ? g.stars.join('、') : '无主星';
      lines.push('  ' + g.name + '（' + g.ganZhi + '）：' + starStr + marker);
    }

    // 命宫解读
    lines.push('【命宫解读】');
    var mingInterpret = interpretMingGong(mingStars, mingGongZhi, siHua, gender);
    lines.push(mingInterpret);

    return lines.join('\n');
  }

  function findGong(gongs, zhi) {
    for (var i = 0; i < gongs.length; i++) {
      if (gongs[i].zhi === zhi) return gongs[i];
    }
    return null;
  }

  function interpretMingGong(stars, mingGongZhi, siHua, gender) {
    var lines = [];

    // 主星特质
    var starTraits = {
      紫微: '帝星坐命，天生有领导气质，自尊心强，好面子，有管理才能。',
      天机: '智星坐命，思维敏捷，善于谋划，但有时想太多而行动不足。',
      太阳: '日星坐命，热情开朗，光明磊落，乐于助人，但有时过于主观。',
      武曲: '财星坐命，刚毅果断，执行力强，善于理财，但有时过于刚硬。',
      天同: '福星坐命，性情温和，知足常乐，人缘好，但有时缺乏进取心。',
      廉贞: '囚星坐命，心思细腻，有艺术天赋，但有时情绪化，易纠结。',
      天府: '库星坐命，稳重踏实，有包容心，善于守成，但有时过于保守。',
      太阴: '月星坐命，温柔细腻，有审美品味，善于理财，但有时过于内敛。',
      贪狼: '桃花星坐命，多才多艺，交际广泛，欲望强，但有时过于贪心。',
      巨门: '暗星坐命，口才好，善辩论，但有时言语犀利，易得罪人。',
      天相: '印星坐命，公正无私，乐于助人，有服务精神，但有时过于刻板。',
      天梁: '荫星坐命，有长者风范，乐于提携后辈，但有时过于清高。',
      七杀: '将星坐命，勇敢果断，有开拓精神，但有时过于冲动，缺乏耐心。',
      破军: '耗星坐命，敢作敢为，有创新精神，但有时破坏力强，不按常理出牌。',
    };

    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      if (starTraits[s]) {
        lines.push('  ' + s + '：' + starTraits[s]);
      }
    }

    if (lines.length === 0) {
      lines.push('  命宫无主星，需看对宫（迁移宫）星曜来定格局。');
    }

    // 四化影响
    lines.push(
      '  四化影响：' +
        siHua.lu +
        '化禄（财禄之喜）、' +
        siHua.quan +
        '化权（权力之增）、' +
        siHua.ke +
        '化科（名声之显）、' +
        siHua.ji +
        '化忌（波折之象）。'
    );

    return lines.join('\n');
  }

  function judgeOverall(mingGongZhuXing, mingGongZhi, allStars) {
    var jiStars = ['紫微', '天府', '太阳', '天相', '天梁', '天同', '太阴'];
    var xiongStars = ['七杀', '破军', '贪狼', '巨门', '廉贞'];
    var jiCount = 0,
      xiongCount = 0;

    for (var i = 0; i < mingGongZhuXing.length; i++) {
      if (jiStars.indexOf(mingGongZhuXing[i]) !== -1) jiCount++;
      if (xiongStars.indexOf(mingGongZhuXing[i]) !== -1) xiongCount++;
    }

    if (jiCount > xiongCount) return '命宫吉星汇聚，格局中上，一生运势平稳向好。';
    if (xiongCount > jiCount) return '命宫煞星较重，早年多波折，中晚年可望转好。';
    return '命宫格局中平，吉凶参半，需后天努力辅助。';
  }

  /* ========== 十三、大限运程 ========== */
  /**
   * 计算某支（地支）的干支
   * 通过六十甲子定位 + 偏移取
   */
  function calcGanZhiOfZhi(targetZhi, anchorZhi, anchorGan) {
    var anchorPos = ZHI_NUM[anchorZhi];
    var targetPos = ZHI_NUM[targetZhi];
    var offset = (targetPos - anchorPos + 12) % 12;
    var anchorGanIdx = GAN.indexOf(anchorGan);
    var targetGan = GAN[(anchorGanIdx + offset) % 10];
    return targetGan + targetZhi;
  }

  /** 大限排盘：每10年一限，大限命宫 = 本宫大限的宫位 */
  function calcDaXian(result, currentAge) {
    var gender = result.gender || '男';
    var isMale = gender === '男' || gender === 'male' || gender === 1;
    var mingGongZhi = result.命宫;
    var isYangNian = '甲丙戊庚壬'.indexOf(result.年干) !== -1;

    // 男命顺行（阳年），女命逆行（阴年）为顺；反之则逆
    var isShun = (isMale === isYangNian);

    var mingPos = ZHI_NUM[mingGongZhi];

    // 大限起宫：命宫起1-10岁，第2宫11-20岁，...
    var startAge = 1;
    if (!isShun) startAge = 10; // 简化：逆行时第10-1岁

    var daXian = [];
    var maxLimit = 60;
    for (var age = startAge; age < maxLimit; age += 10) {
      var limitIdx = Math.floor((age - startAge) / 10);
      var pos;
      if (isShun) {
        pos = (mingPos + limitIdx) % 12;
      } else {
        pos = (mingPos - limitIdx + 12) % 12;
      }
      var zhi = ZHI[pos];
      var gongGan = result.gongGan || {};
      var zhiGan = gongGan[zhi] || (function(){
        // 若 result 未含 gongGan，从年干重建
        var yinGan = YIN_SHOU_GAN[result.年干] || '甲';
        var yinIdx = GAN.indexOf(yinGan);
        return GAN[(yinIdx + ZHI_NUM[zhi]) % 10];
      })();
      var ganZhi = zhiGan + zhi;
      var jzIdx = JIAZI_INDEX[ganZhi];
      var gan = ganZhi[0];

      // 大限四化
      var dxSiHua = SI_HUA[gan] || SI_HUA['甲'];

      // 大限命宫位置（相对本宫命宫）
      var relPos = pos;
      var gong = result.十二宫[relPos] || {};

      daXian.push({
        startAge: age,
        endAge: age + 9,
        ganZhi: ganZhi,
        siHua: dxSiHua,
        gongZhi: zhi,
        gongName: GONG_NAMES[relPos] || '未知',
        stars: gong.stars || [],
      });
    }

    return { list: daXian, isShun: isShun, currentLimit: (function(){
      var idx = -1;
      for (var i = 0; i < daXian.length; i++) {
        if (currentAge >= daXian[i].startAge && currentAge <= daXian[i].endAge) {
          idx = i;
          break;
        }
      }
      return idx;
    })() };
  }

  /** 流年：当年干支 → 流年命宫（流年地支所在宫）+ 流年四化 */
  function calcLiuNian(result, targetYear) {
    // 目标年的年干
    var baseYear = 1900;
    var offset = targetYear - baseYear;
    var yearGzIdx = (((JIAZI_INDEX['庚子'] || 0) + offset) % 60 + 60) % 60;
    var yearGan = GAN[yearGzIdx % 10];
    var yearZhi = ZHI[yearGzIdx % 12];
    var ganZhi = yearGan + yearZhi;
    var siHua = SI_HUA[yearGan] || SI_HUA['甲'];

    // 流年命宫：以流年地支所在宫
    var liuNianMingGong = ZHI_NUM[yearZhi];
    var gong = result.十二宫[liuNianMingGong] || {};

    return {
      year: targetYear,
      ganZhi: ganZhi,
      gan: yearGan,
      zhi: yearZhi,
      siHua: siHua,
      mingGongZhi: ZHI[liuNianMingGong],
      gongName: GONG_NAMES[liuNianMingGong] || '未知',
      stars: gong.stars || [],
      公历年: targetYear,
      标注: '流年（按公历年/太岁）',
    };
  }

  /** 流月：该年某月的月干 → 流月命宫 + 流月四化 */
  function calcLiuYue(result, targetYear, targetMonth) {
    // 月干：五虎遁（年干定寅月，顺数至该月）
    var WUHU_DUN = { 甲: '丙', 己: '丙', 乙: '戊', 庚: '戊', 丙: '庚', 辛: '庚', 丁: '壬', 壬: '壬', 戊: '甲', 癸: '甲' };
    var baseYear = 1900;
    var offset = targetYear - baseYear;
    var yearGzIdx = (((JIAZI_INDEX['庚子'] || 0) + offset) % 60 + 60) % 60;
    var yearGan = GAN[yearGzIdx % 10];
    var yinGan = WUHU_DUN[yearGan] || '甲';
    var yinIdx = GAN.indexOf(yinGan);
    var monthGan = GAN[(yinIdx + targetMonth - 1) % 10];

    // 月支：寅月起寅宫，逐月顺数
    var monthZhi = ZHI[(2 + targetMonth - 1) % 12];
    var ganZhi = monthGan + monthZhi;
    var siHua = SI_HUA[monthGan] || SI_HUA['甲'];

    var liuYueMingGong = ZHI_NUM[monthZhi];
    var gong = result.十二宫[liuYueMingGong] || {};

    return {
      year: targetYear,
      month: targetMonth,
      ganZhi: ganZhi,
      gan: monthGan,
      zhi: monthZhi,
      siHua: siHua,
      mingGongZhi: ZHI[liuYueMingGong],
      gongName: GONG_NAMES[liuYueMingGong] || '未知',
      stars: gong.stars || [],
      农历月: targetMonth,
      标注: '流月（按农历月）',
    };
  }

  /** 流日：某年某月某日 → 流日干支所在宫 + 日干定四化 */
  function calcLiuRi(result, targetYear, targetMonth, targetDay) {
    // 用基础年 1900-01-01（甲戌）推算目标日的日干支
    // 日干支以 1900-01-01 为甲子基准（实际 1900/1/1 为甲戌，此处用统一 60 甲子循环）
    var ref = Date.UTC(1900, 0, 1);
    var target = Date.UTC(targetYear, targetMonth - 1, targetDay);
    var daysBetween = Math.round((target - ref) / 86400000);
    // 1900-01-01 的日干支：甲戌（六十甲子序 10），作为基准
    var dayGzIdx = (((JIAZI_INDEX['甲戌'] || 10) + daysBetween) % 60 + 60) % 60;
    var dayGan = GAN[dayGzIdx % 10];
    var dayZhi = ZHI[dayGzIdx % 12];
    var ganZhi = dayGan + dayZhi;
    var siHua = SI_HUA[dayGan] || SI_HUA['甲'];
    var liuRiMingGong = ZHI_NUM[dayZhi];
    var gong = result['十二宫'][liuRiMingGong] || {};
    return {
      year: targetYear,
      month: targetMonth,
      day: targetDay,
      ganZhi: ganZhi,
      gan: dayGan,
      zhi: dayZhi,
      siHua: siHua,
      mingGongZhi: ZHI[liuRiMingGong],
      gongName: GONG_NAMES[liuRiMingGong] || '未知',
      stars: gong.stars || [],
      标注: '流日（按公历日）',
    };
  }

  /* ========== 十四、深度解读（对齐八字丰富度） ========== */

  // 主星性情速查
  var STAR_TRAITS = {
    紫微: '帝星，主领导与管理，具统御之才',
    天机: '智星，主谋略与机变，思路敏捷',
    太阳: '日星，主光明与发散，热情利他',
    武曲: '财星，主刚毅与执行，理财果断',
    天同: '福星，主温和与知足，性情圆融',
    廉贞: '囚星，主细腻与艺术，情绪丰沛',
    天府: '库星，主稳重与守成，包容厚实',
    太阴: '月星，主柔婉与审美，心思细腻',
    贪狼: '桃花星，主多才与欲望，交际广泛',
    巨门: '暗星，主口才与辩论，思辨犀利',
    天相: '印星，主公正与服务，循规有序',
    天梁: '荫星，主长者风范与提携，清高孤介',
    七杀: '将星，主开拓与果决，行动迅猛',
    破军: '耗星，主创新与破坏，敢破敢立',
  };

  // 宫位职司速查（用于三方四正与事域研判）
  var GONG_DUTY = {
    命宫: '本命性格与一生基调',
    兄弟: '手足缘分与兄弟助力',
    夫妻: '婚姻感情与配偶特质',
    子女: '子嗣缘分与晚辈关系',
    财帛: '财富来源与理财能力',
    疾厄: '健康状况与体质弱点',
    迁移: '外出运势与社会活动',
    交友: '朋友贵人与同事关系',
    官禄: '事业成就与职业方向',
    田宅: '家宅不动产与家庭资产',
    福德: '精神享受与福报厚薄',
    父母: '父母缘分与长辈关系',
  };

  /** 三方四正：命宫 + 冲对宫 + 三合宫 */
  function sanFangSiZheng(result) {
    var mingPos = ZHI_NUM[result.命宫];
    var chong = ZHI[(mingPos + 6) % 12];
    var he1 = ZHI[(mingPos + 4) % 12];
    var he2 = ZHI[(mingPos + 8) % 12];
    return [result.命宫, chong, he1, he2];
  }

  /**
   * 紫微深度解读（多段结构化文本，对齐八字大师分析的丰富度）
   * @param {object} result - ZiWeiEngine.paipan 返回结果
   * @param {string} analysisType - full/minggong/career/wealth/love/health
   * @returns {string} 多段文本
   */
  function analyzeDeep(result, analysisType) {
    var lines = [];
    var gongs = result.十二宫 || [];
    var siHua = result.四化 || {};
    var mingGong = findGong(gongs, result.命宫);
    var mingStars = (mingGong && mingGong.stars) || [];
    var zhuXing = result.命宫主星 || '无主星';

    // 【第一段】命造全貌
    lines.push('【命造全貌】');
    lines.push(
      '此造年干支为' + (result.年干 || '?') + (result.年支 || '?') +
      '，命宫落' + result.命宫 + '，' + (result.五行局 || '?') +
      '，身宫落' + result.身宫 + '。紫微帝星安于' + (result.紫微星落 || '?') + '宫。'
    );
    lines.push('命宫主星为「' + zhuXing + '」。' + starNatureDesc(mingStars) + '。');

    // 【第二段】旺衰与格局
    lines.push('');
    lines.push('【星曜庙旺】');
    var mingJudge = judgeOverall([zhuXing.indexOf('、') === -1 ? zhuXing : zhuXing], result.命宫, result.所有星曜 || {});
    lines.push(mingJudge);
    var starList = zhuXing.split('、');
    for (var si = 0; si < starList.length; si++) {
      var sName = starList[si];
      if (STAR_TRAITS[sName]) lines.push('  ' + sName + '：' + STAR_TRAITS[sName] + '。');
    }

    // 【第三段】三方四正
    lines.push('');
    lines.push('【三方四正】');
    var sfz = sanFangSiZheng(result);
    var sfzDesc = [];
    for (var fz = 0; fz < sfz.length; fz++) {
      var g = findGong(gongs, sfz[fz]);
      if (g) {
        var gStars = (g.stars || []).filter(function (x) { return STAR_TRAITS[x]; });
        sfzDesc.push(g.name + '（' + sfz[fz] + '）' + (gStars.length > 0 ? gStars.join('、') : '空宫'));
      }
    }
    lines.push('命宫三方四正汇聚：' + sfzDesc.join('，') + '。四宫星曜互参，共定格局高低。');

    // 【第四段】四化飞星
    lines.push('');
    lines.push('【四化飞星】');
    if (siHua.lu) lines.push('  ' + siHua.lu + '化禄——主财禄丰盈，所得之宫为一生进财之钥。');
    if (siHua.quan) lines.push('  ' + siHua.quan + '化权——主权柄加重，掌事之宫得主导之力。');
    if (siHua.ke) lines.push('  ' + siHua.ke + '化科——主声名显达，得贵人之宫添文章之誉。');
    if (siHua.ji) lines.push('  ' + siHua.ji + '化忌——主阻滞波折，受克之宫须防耗损之患。');

    // 【第五段】事域专论（按类型）
    lines.push('');
    lines.push('【' + (analysisTypeLabel(analysisType) || '事域专论') + '】');
    lines.push(domainAnalysisDeep(result, analysisType));

    // 【第六段】因果推演
    lines.push('');
    lines.push('【因果推演】');
    lines.push(causalChain(result, analysisType));

    // 【第七段】吉凶总断
    lines.push('');
    lines.push('【吉凶总断】');
    lines.push(
      result.总体运势 || '命途平顺' +
      '。命宫与三方四正星曜互参，四化飞星定吉凶之向，顺势而运则吉，逆势而执则凶。'
    );

    return lines.join('\n');
  }

  function starNatureDesc(stars) {
    if (!stars || stars.length === 0) return '命宫空宫，借对宫迁移之星曜为用';
    var desc = [];
    for (var i = 0; i < stars.length; i++) {
      if (STAR_TRAITS[stars[i]]) desc.push(stars[i] + '之性');
    }
    return desc.length > 0 ? desc.join('、') + '为命宫基调' : '';
  }

  function analysisTypeLabel(type) {
    var map = {
      full: '全盘研判',
      minggong: '命宫专论',
      career: '事业研判',
      wealth: '财运研判',
      love: '感情研判',
      health: '健康研判',
    };
    return map[type] || null;
  }

  /** 事域深度分析：取相关宫位星曜 + 四化交互 */
  function domainAnalysisDeep(result, analysisType) {
    var gongs = result.十二宫 || [];
    var siHua = result.四化 || {};
    // 事域 → 相关宫位映射
    var domainGong = {
      career: ['官禄', '迁移', '命宫'],
      wealth: ['财帛', '田宅', '命宫'],
      love: ['夫妻', '福德', '命宫'],
      health: ['疾厄', '身宫', '命宫'],
      minggong: ['命宫', '身宫'],
      full: ['命宫', '官禄', '财帛', '夫妻'],
    };
    var targetGongs = domainGong[analysisType] || domainGong.full;
    var lines = [];
    for (var i = 0; i < targetGongs.length; i++) {
      var g = null;
      for (var j = 0; j < gongs.length; j++) {
        if (gongs[j].name === targetGongs[i]) { g = gongs[j]; break; }
      }
      if (g) {
        var gStars = (g.stars || []).filter(function (x) { return STAR_TRAITS[x]; });
        var duty = GONG_DUTY[g.name] || '';
        lines.push(
          '  ' + g.name + '宫（' + g.zhi + '）主' + duty + '，' +
          (gStars.length > 0 ? '主星' + gStars.join('、') + '坐此，' + gStars.map(function(s){return STAR_TRAITS[s].split('，')[0];}).join('；') + '。' : '此宫无主星，借三方四正参看。')
        );
        // 四化落入此宫
        var siHuaHere = [];
        if (siHua.lu && gStars.indexOf(siHua.lu) !== -1) siHuaHere.push(siHua.lu + '化禄');
        if (siHua.quan && gStars.indexOf(siHua.quan) !== -1) siHuaHere.push(siHua.quan + '化权');
        if (siHua.ke && gStars.indexOf(siHua.ke) !== -1) siHuaHere.push(siHua.ke + '化科');
        if (siHua.ji && gStars.indexOf(siHua.ji) !== -1) siHuaHere.push(siHua.ji + '化忌');
        if (siHuaHere.length > 0) lines.push('  → 四化' + siHuaHere.join('、') + '同落此宫，' + GONG_DUTY[g.name] + '方面吉凶加剧。');
      }
    }
    return lines.join('\n');
  }

  /** 因果链：解释为何得出以上结论 */
  function causalChain(result, analysisType) {
    var mingJudge = judgeOverall([result.命宫主星], result.命宫, result.所有星曜 || {});
    var siHua = result.四化 || {};
    return [
      '命宫主星定一生基调，' + (result.命宫主星 || '空宫') + '居' + result.命宫 + '，',
      '三方四正之星曜共参格局高低；四化飞星以' + (siHua.lu || '—') + '禄、' + (siHua.ji || '—') + '忌为进退之枢。',
      '吉星汇聚则运途向明，煞星重叠则早年多舛。'
    ].join('');
  }

  /* ========== 格局解析库 ========== */
  /**
   * 吉凶格局判定（基于古籍口诀 + 中州派通行判定）
   * @param {object} result - paipan 返回
   * @returns {object} { 命格: string[], 命格说明: string[], 整体格局: string }
   */
  function analyzeGegu(result) {
    var gongs = result['十二宫'] || [];
    var siHua = result['四化'] || {};
    var mingGong = findGong(gongs, result['命宫']);
    var mingStars = (mingGong && mingGong.stars) || [];
    var mingGongZhi = result['命宫'];
    var mingPos = ZHI_NUM[mingGongZhi];
    // 三方四正地支
    var sfz = sanFangSiZheng(result);
    var sfzStars = [];
    sfz.forEach(function(z) {
      var g = findGong(gongs, z);
      if (g && g.stars) sfzStars = sfzStars.concat(g.stars);
    });

    var 格局 = [];
    var 说明 = [];

    // 紫微在午（紫府朝垣/紫府在午）
    if (result['紫微星落'] === '午') {
      格局.push('紫府在午');
      说明.push('紫微天府同宫在午，帝王之尊，主大富大贵，格局清高。');
    }
    // 机月同梁格
    if (mingStars.indexOf('天机') !== -1 || mingStars.indexOf('太阴') !== -1 || mingStars.indexOf('天同') !== -1 || mingStars.indexOf('天梁') !== -1) {
      var hasJiYueTongLiang = ['天机','太阴','天同','天梁'].filter(function(s){ return mingStars.indexOf(s)!==-1 || sfzStars.indexOf(s)!==-1; });
      if (hasJiYueTongLiang.length >= 3) {
        格局.push('机月同梁');
        说明.push('机月同梁格：天机、太阴、天同、天梁会聚三方，主文职、学术、清贵之命。');
      }
    }
    // 杀破狼格
    var 杀破狼 = ['七杀','破军','贪狼'];
    var killCount = mingStars.filter(function(s){ return 杀破狼.indexOf(s)!==-1; }).length;
    var sfzKillCount = sfzStars.filter(function(s){ return 杀破狼.indexOf(s)!==-1; }).length;
    if (killCount + sfzKillCount >= 2) {
      格局.push('杀破狼');
      说明.push('杀破狼格：七杀、破军、贪狼三方会聚，主一生变动多，先破后立，大器晚成。');
    }
    // 阳火格（太阳在午）
    if (mingGongZhi === '午' && mingStars.indexOf('太阳') !== -1) {
      格局.push('阳火格');
      说明.push('太阳在午，日丽中天，主大富大贵，光明磊落。');
    }
    // 月朗天门格（太阴在子）
    if (mingGongZhi === '子' && mingStars.indexOf('太阴') !== -1) {
      格局.push('月朗天门');
      说明.push('太阴在子，水澄桂萼，主清贵贤能，文章显达。');
    }
    // 紫府朝垣
    var tianFu = result['紫微星落'];
    if (tianFu === '午' || tianFu === '子') {
      if (格局.indexOf('紫府在午') === -1 && tianFu === '午') {
        格局.push('紫府朝垣');
        说明.push('紫微天府在午，帝星会天府，主富贵双全。');
      }
    }
    // 禄文拱命
    if (mingStars.indexOf('文昌') !== -1 && siHua.lu && mingStars.indexOf(siHua.lu) !== -1) {
      格局.push('禄文拱命');
      说明.push('化禄与文昌同拱命宫，主科甲有名，贵且贤。');
    }
    // 马头带箭（擎羊在午 + 同宫太阳）
    var qingYangGong = findGong(gongs, '午');
    if (qingYangGong && qingYangGong.stars.indexOf('擎羊') !== -1 && qingYangGong.stars.indexOf('太阳') !== -1) {
      格局.push('马头带箭');
      说明.push('擎羊与太阳同在午宫，主武职显达，有边疆之功。');
    }
    // 刑囚夹印（天刑夹印星天相）
    var tianXingGong = gongs.filter(function(g){ return g.stars && g.stars.indexOf('天刑')!==-1; })[0];
    var tianXiangGong = gongs.filter(function(g){ return g.stars && g.stars.indexOf('天相')!==-1; })[0];
    if (tianXingGong && tianXiangGong) {
      var txNum = ZHI_NUM[tianXingGong.zhi];
      var xxNum = ZHI_NUM[tianXiangGong.zhi];
      if (Math.abs(txNum - xxNum) === 1 || (txNum===0&&xxNum===11)||(txNum===11&&xxNum===0)) {
        格局.push('刑囚夹印');
        说明.push('天刑与天相相夹，主刑杖之职或司法之命。');
      }
    }
    // 化忌冲命
    if (siHua.ji) {
      var jiGong = gongs.filter(function(g){ return g.stars && g.stars.indexOf(siHua.ji)!==-1; })[0];
      if (jiGong) {
        var jiNum = ZHI_NUM[jiGong.zhi];
        if ((jiNum+6)%12 === mingPos || (jiNum-mingPos+12)%12===6) {
          格局.push('化忌冲命');
          说明.push('化忌冲克命宫，主一生多波折，早年辛苦。');
        }
      }
    }
    // 无格局时的基础判定
    if (格局.length === 0) {
      if (killCount + sfzKillCount >= 1) {
        格局.push('带煞之命');
        说明.push('命宫三方带煞星，一生多动多变化，宜稳扎稳打。');
      } else {
        格局.push('中平之格');
        说明.push('星曜组合中规中矩，吉凶随四化与运限流转。');
      }
    }

    return { 命格: 格局, 命格说明: 说明, 整体格局: 格局.length>0 ? 格局.join('、') : '中平' };
  }

  /* ========== 十二宫逐宫完整解读 ========== */
  var GONG_DESC = {
    命宫: '主一生性格、命运基调、身体容貌。命宫星曜定格局高低，为全盘之纲。',
    兄弟: '主手足缘分、兄弟姐妹助力、朋友关系。星吉则手足和睦，星凶则缘薄早失。',
    夫妻: '主婚姻感情、配偶特质、男女宫。星吉则婚姻美满，星凶则多波折离异。',
    子女: '主子嗣缘分、晚辈关系、学生运。星吉则子女聪慧孝顺，星凶则缘薄。',
    财帛: '主财富来源、理财能力、进财之道。星吉则财源广进，星凶则财来财去。',
    疾厄: '主健康状况、体质弱点、疾病隐患。星吉则身体强健，星凶则多病弱。',
    迁移: '主外出运势、社会活动、人际交游。星吉则出门遇贵，星凶则远行多险。',
    交友: '主朋友贵人、同事关系、下属缘分。星吉则贵人相助，星凶则小人环绕。',
    官禄: '主事业成就、职业方向、官运高低。星吉则仕途顺利，星凶则劳碌无功。',
    田宅: '主家宅不动产、家庭资产、祖荫有无。星吉则家业丰厚，星凶则漂泊无根。',
    福德: '主精神享受、福报厚薄、内心安宁。星吉则福缘深厚，星凶则心多劳碌。',
    父母: '主父母缘分、长辈关系、上司运。星吉则父母慈爱，星凶则缘薄早失。',
  };

  /**
   * 12 宫逐宫完整解读（供 S6 使用）
   * @param {object} result - paipan 返回
   * @returns {string[]} 每宫一段解读
   */
  function interpretAllGongs(result) {
    var gongs = result['十二宫'] || [];
    var siHua = result['四化'] || {};
    var out = [];
    for (var i = 0; i < gongs.length; i++) {
      var g = gongs[i];
      var stars = g.stars || [];
      var mains = stars.filter(function(s){ return ZHU_STAR_SET[s]; });
      var siHuaHere = [];
      var marks = { lu:'禄', quan:'权', ke:'科', ji:'忌' };
      for (var k in marks) {
        if (siHua[k] && stars.indexOf(siHua[k]) !== -1) siHuaHere.push(siHua[k]+'化'+marks[k]);
      }
      var line = '【' + g.name + '宫（' + g.ganZhi + '）】';
      if (mains.length > 0) {
        line += '主星' + mains.join('、') + '坐' + g.zhi + '，';
        var trait = STAR_TRAITS[mains[0]] || '';
        if (trait) line += trait + '。';
      } else {
        line += '此宫无主星，借对宫星曜参看。';
      }
      if (siHuaHere.length) line += ' ' + siHuaHere.join('、') + '落此宫。';
      line += ' ' + (GONG_DESC[g.name] || '');
      out.push(line);
    }
    return out;
  }

  /* ========== 公开 API ========== */
  global.ZiWeiEngine = {
    paipan: paipan,
    GONG_NAMES: GONG_NAMES,
    calcDaXian: calcDaXian,
    calcLiuNian: calcLiuNian,
    calcLiuYue: calcLiuYue,
    calcLiuRi: calcLiuRi,
    analyzeDeep: analyzeDeep,
    collectSmallStarContext: collectSmallStarContext,
    SMALL_STAR_SET: SMALL_STAR_SET,
    analyzeGegu: analyzeGegu,
    interpretAllGongs: interpretAllGongs,
  };
})(typeof window !== 'undefined' ? window : this);
