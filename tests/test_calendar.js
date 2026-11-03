/**
 * 历法离线校验 · 紫微引擎农历换算
 * 用例来源：tests/calendar_fixture.json
 *   - 基准数据：lunar_python（6tail，寿星天文历算法）
 *   - 交叉验证：ephem 4.2.1（节气时刻）、.NET ChineseLunisolarCalendar（1933/1906 闰月大小）
 * 用法：node tests/test_calendar.js
 */
(function () {
  'use strict';

  var fs = require('fs');
  var path = require('path');

  var root = path.join(__dirname, '..');
  var fixture = JSON.parse(fs.readFileSync(path.join(__dirname, 'calendar_fixture.json'), 'utf8'));

  var engineCode = fs.readFileSync(path.join(root, 'static/js/ziwei-engine.js'), 'utf8');
  var ctx = new Function('var window = {}; var global = window;\n' + engineCode + '\nreturn window;')();
  var ZiWei = ctx.ZiWeiEngine;
  if (!ZiWei) {
    console.error('ZiWeiEngine 加载失败');
    process.exit(1);
  }

  var groups = {};
  function group(name) {
    if (!groups[name]) groups[name] = { total: 0, bad: 0, samples: [] };
    return groups[name];
  }
  function assertEqual(name, label, actual, expected) {
    var g = group(name);
    g.total++;
    if (actual !== expected) {
      g.bad++;
      if (g.samples.length < 10) g.samples.push(label + ' got ' + actual + ' want ' + expected);
    }
  }

  function lunarOf(solar) {
    var y = solar[0];
    var m = solar[1];
    var d = solar[2];
    var r = ZiWei.paipan({ year: y, month: m, day: d, hour: '子时', gender: '男', isLunar: false });
    return r.农历年 + '-' + r.农历月 + '-' + r.农历日 + '-' + (r.农历闰月 ? 'L' : 'N');
  }
  function expectLunar(row) {
    return row[3] + '-' + Math.abs(row[4]) + '-' + row[5] + '-' + (row[4] < 0 ? 'L' : 'N');
  }

  // 1) 闰月月份
  Object.keys(fixture.leaps).forEach(function (y) {
    assertEqual('闰月月份', y + '年', ZiWei.getLeapMonth(Number(y)), fixture.leaps[y]);
  });

  // 2) 公历 → 农历：全部农历月首、跨年采样、1933 全年逐日（闰五月大小月回归年）
  var solarRows = fixture.monthStarts.concat(fixture.daily1933, fixture.samples);
  solarRows.forEach(function (row) {
    assertEqual('公历→农历', row[0] + '-' + row[1] + '-' + row[2], lunarOf(row), expectLunar(row));
  });

  // 3) 农历 → 公历：每月初一与月末（覆盖闰月大小月差异）
  var monthLen = {};
  fixture.monthLengths.forEach(function (r) {
    monthLen[r[0] + '|' + r[1]] = r[2];
  });
  fixture.monthStarts.forEach(function (row) {
    var len = monthLen[row[3] + '|' + row[4]];
    if (!len) return;
    [1, len].forEach(function (day) {
      var base = Date.UTC(row[0], row[1] - 1, row[2]) + (day - 1) * 86400000;
      var dt = new Date(base);
      var want = dt.getUTCFullYear() + '/' + (dt.getUTCMonth() + 1) + '/' + dt.getUTCDate();
      var params = { year: row[3], month: Math.abs(row[4]), day: day, hour: '子时', gender: '男', isLunar: true };
      if (row[4] < 0) params.leapMonth = Math.abs(row[4]);
      var got;
      try {
        got = ZiWei.paipan(params).公历参考;
      } catch (e) {
        got = 'ERR:' + e.message;
      }
      assertEqual('农历→公历', '农历' + row[3] + '-' + row[4] + '-' + day, got, want);
    });
  });

  // 4) 非法闰月必须抛错，不得静默按普通月排盘
  (function () {
    var cases = [
      { year: 2023, month: 4, leapMonth: 4, label: '2023 不存在闰四月' },
      { year: 2023, month: 1, leapMonth: 1, label: '2023 不存在闰正月' },
    ];
    cases.forEach(function (c) {
      var thrown = false;
      try {
        ZiWei.paipan({ year: c.year, month: c.month, day: 1, leapMonth: c.leapMonth, hour: '子时', gender: '男', isLunar: true });
      } catch (e) {
        thrown = /不存在闰|无闰月/.test(e.message);
      }
      assertEqual('非法闰月校验', c.label, thrown, true);
    });
  })();

  // 汇总
  var failed = 0;
  Object.keys(groups).forEach(function (name) {
    var g = groups[name];
    var ok = g.bad === 0;
    if (!ok) failed++;
    console.log('[' + (ok ? 'PASS' : 'FAIL') + '] ' + name + '  ' + (g.total - g.bad) + '/' + g.total);
    g.samples.forEach(function (s) {
      console.log('   ' + s);
    });
  });

  if (failed) {
    console.log('历法校验未通过：' + failed + ' 组存在差异');
    process.exit(1);
  }
  console.log('历法校验全部通过');
})();
