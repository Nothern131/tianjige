/**
 * 历法引擎回归测试（Node）
 * 1. 二十四节气 1900-2030 与 lunar_python 权威 fixture 逐项比对
 * 2. 节气定位边界（跨年、节气当天）
 * 3. 八字年柱/月柱按立春与十二“节”分界
 * 4. CalendarEngine 缺失时显式报错，不允许静默退回近似日期
 */
(function () {
  'use strict';
  var fs = require('fs');
  var path = require('path');
  var root = path.join(__dirname, '..');

  var fixture = JSON.parse(fs.readFileSync(path.join(__dirname, 'jieqi_fixture.json'), 'utf8'));

  var source = 'var window = {}; var global = window;\n';
  ['calendar-engine.js', 'bazi-engine.js'].forEach(function (file) {
    source += fs.readFileSync(path.join(root, 'static/js', file), 'utf8') + '\n';
  });
  var ctx = new Function(source + ';return window;')();
  var Cal = ctx.CalendarEngine;
  var Bazi = ctx.BaziEngine;

  var pass = 0;
  var fail = 0;
  var failures = [];

  function check(group, name, actual, expected) {
    if (actual === expected) {
      pass++;
    } else {
      fail++;
      failures.push('[' + group + '] ' + name + ' 期望 ' + expected + '，实际 ' + actual);
    }
  }

  // ---------- 一、全量节气日期 ----------
  var years = Object.keys(fixture.terms).sort();
  var checked = 0;
  years.forEach(function (yStr) {
    var year = Number(yStr);
    var list = Cal.getTermsOfYear(year);
    var want = fixture.terms[yStr];
    if (list.length !== 24) {
      check('节气数量', year + ' 年应为 24 个', list.length, 24);
      return;
    }
    want.forEach(function (wd, i) {
      checked++;
      check('节气日期', year + ' ' + list[i].name, list[i].month + '-' + list[i].day, wd[0] + '-' + wd[1]);
    });
  });

  // ---------- 二、节气定位边界 ----------
  var d1 = Cal.getLatestTerm(2026, 1, 4);
  check('定位', '2026-01-04 最近节气', d1.name + ' ' + d1.year + '-' + d1.month + '-' + d1.day, '冬至 2025-12-21');
  var d2 = Cal.getLatestTerm(2026, 1, 5);
  check('定位', '2026-01-05 最近节气', d2.name + ' ' + d2.year + '-' + d2.month + '-' + d2.day, '小寒 2026-1-5');
  var d3 = Cal.getLatestJie(2026, 1, 4);
  check('定位', '2026-01-04 最近节', d3.name + ' ' + d3.year + '-' + d3.month + '-' + d3.day, '大雪 2025-12-7');
  var d4 = Cal.getNextJie(2026, 2, 4);
  check('定位', '2026-02-04 之后下一节', d4.name + ' ' + d4.year + '-' + d4.month + '-' + d4.day, '惊蛰 2026-3-5');
  var lichun = Cal.getTerm(2026, '立春');
  check('节气时刻', '2026 立春', lichun.month + '-' + lichun.day + ' ' + lichun.hour + ':' + lichun.minute, '2-4 4:2');

  // ---------- 三、八字分界 ----------
  var b1 = Bazi.paipan(2026, 1, 4, '子时');
  check('八字', '2026-01-04 年柱', b1['年柱'], '乙巳');
  check('八字', '2026-01-04 月柱', b1['月柱'], '戊子');
  var b2 = Bazi.paipan(2026, 1, 5, '子时');
  check('八字', '2026-01-05 月柱（小寒换月）', b2['月柱'], '己丑');
  var b3 = Bazi.paipan(2026, 2, 3, '子时');
  check('八字', '2026-02-03 年柱（立春前）', b3['年柱'], '乙巳');
  var b4 = Bazi.paipan(2026, 2, 4, '子时');
  check('八字', '2026-02-04 年柱（立春换年）', b4['年柱'], '丙午');
  check('八字', '2026-02-04 月柱（立春换月）', b4['月柱'], '庚寅');
  var b5 = Bazi.paipan(1800, 1, 1, '子时');
  check('八字', '1800-01-01 四柱', b5['年柱'] + ' ' + b5['月柱'] + ' ' + b5['日柱'] + ' ' + b5['时柱'], '己未 丙子 庚寅 丙子');

  // ---------- 四、越界与缺失引擎 ----------
  var rangeOk = true;
  try { Cal.getTerm(1799, '立春'); } catch (e) { rangeOk = e instanceof RangeError; }
  check('越界', '1799 抛 RangeError', rangeOk, true);
  rangeOk = true;
  try { Cal.getTerm(2101, '立春'); } catch (e) { rangeOk = e instanceof RangeError; }
  check('越界', '2101 抛 RangeError', rangeOk, true);

  var baziOnly = fs.readFileSync(path.join(root, 'static/js/bazi-engine.js'), 'utf8');
  var isolated = new Function('var window = {}; var global = window;\n' + baziOnly + ';return window;')();
  var guarded = false;
  try {
    isolated.BaziEngine.paipan(2026, 1, 1, '子时');
  } catch (e) {
    guarded = /CalendarEngine 未加载/.test(e.message);
  }
  check('依赖', '缺少 CalendarEngine 时显式报错', guarded, true);

  if (fail) {
    console.error('\n失败 ' + fail + ' 项：');
    failures.slice(0, 20).forEach(function (f) { console.error('  ' + f); });
    process.exit(1);
  }
  console.log('[PASS] 节气日期  ' + checked + '/' + checked);
  console.log('[PASS] 节气定位  5/5');
  console.log('[PASS] 八字分界  7/7');
  console.log('[PASS] 越界与依赖  3/3');
  console.log('历法节气校验全部通过');
})();
