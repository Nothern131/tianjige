/**
 * 天机阁 · 随机测试生成器
 * 每次运行生成全新随机用例，只验证结构合法性（不预设固定答案）
 * 用于面试演示：证明引擎确实能处理任意输入而非硬编码结果
 */
(function (global) {
  'use strict';

  var GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
  var ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  var WUXING = ['木', '火', '土', '金', '水'];
  var BAGUA_NAMES = ['乾', '兑', '离', '震', '巽', '坎', '艮', '坤'];

  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function randChoice(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  // 随机铜钱爻（六爻引擎需要的格式：{type, changing} 对象数组）
  function randYaoArray() {
    var result = [];
    for (var i = 0; i < 6; i++) {
      result.push({
        type: Math.random() < 0.5 ? 'yin' : 'yang',
        changing: Math.random() < 0.3
      });
    }
    return result;
  }

  function randDate() {
    return [randInt(1950, 2025), randInt(1, 12), randInt(1, 28), randInt(0, 23)];
  }

  function isGanzhi(v) {
    return typeof v === 'string' && v.length === 2 &&
           GAN.indexOf(v[0]) !== -1 && ZHI.indexOf(v[1]) !== -1;
  }

  function randomTests() {
    var tests = [];

    // ── 八字随机 (20组) ──
    // 输入格式：[year, month, day, hour]，test_runner 调用 engine.divine(test.input[0])
    // 但八字 paipan 接收 4 个参数，所以 input = [year, month, day, hour]
    for (var i = 0; i < 20; i++) {
      var date = randDate();
      tests.push({
        id: 'R-B' + String(i + 1).padStart(3, '0'),
        engine: 'bazi',
        method: 'paipan',
        input: date,
        source: '随机出生日期',
        _validator: function(result, input) {
          if (!result || typeof result !== 'object') return '返回非对象';
          if (!result['年柱'] || !result['月柱'] || !result['日柱'] || !result['时柱'])
            return '缺少四柱字段';
          if (!isGanzhi(result['年柱']) || !isGanzhi(result['月柱']) ||
              !isGanzhi(result['日柱']) || !isGanzhi(result['时柱']))
            return '四柱值不是合法干支';
          if (GAN.indexOf(result['日主']) === -1)
            return '日主不在天干中';
          if (WUXING.indexOf(result['日主五行']) === -1)
            return '日主五行不在五行中';
          return null;
        }
      });
    }

    // ── 六爻随机 (15组) ──
    // 输入格式：[[{type, changing}, ...]]，test_runner 调用 engine.divine(test.input[0])
    for (var i = 0; i < 15; i++) {
      var yaoArray = randYaoArray();
      tests.push({
        id: 'R-L' + String(i + 1).padStart(3, '0'),
        engine: 'liuyao',
        method: 'divine',
        input: [yaoArray],
        source: '随机铜钱起卦',
        _validator: function(result, input) {
          if (!result || typeof result !== 'object') return '返回非对象';
          if (!result['gua_name']) return '缺少卦名';
          if (!result['original_gua'] || !result['original_gua']['yao'])
            return '缺少原始卦爻';
          if (!Array.isArray(result['dong_yao'])) return '动爻非数组';
          if (!result['shi_yao'] && result['shi_yao'] !== 0) return '缺少世爻';
          if (!result['interpretation'] || typeof result['interpretation'] !== 'string')
            return '缺少解读文本';
          return null;
        }
      });
    }

    // ── 梅花随机 (15组) ──
    // 输入格式：[{method, upper, lower, moving}]，test_runner 调用 engine.divine(test.input[0])
    for (var i = 0; i < 15; i++) {
      tests.push({
        id: 'R-M' + String(i + 1).padStart(3, '0'),
        engine: 'meihua',
        method: 'divine',
        input: [{
          method: 'number',
          upper: randInt(1, 8),
          lower: randInt(1, 8),
          moving: randInt(1, 6)
        }],
        source: '随机三数起卦',
        _validator: function(result, input) {
          if (!result || typeof result !== 'object') return '返回非对象';
          if (!result['original_gua'] || !result['original_gua']['name'])
            return '缺少本卦名称';
          if (!result['hu_gua'] || !result['hu_gua']['name'])
            return '缺少互卦名称';
          if (!result['changed_gua'] || !result['changed_gua']['name'])
            return '缺少变卦名称';
          if (BAGUA_NAMES.indexOf(result['original_gua']['shang_gua']) === -1)
            return '上卦名不在八卦中';
          if (BAGUA_NAMES.indexOf(result['original_gua']['xia_gua']) === -1)
            return '下卦名不在八卦中';
          if (BAGUA_NAMES.indexOf(result['changed_gua']['shang_gua']) === -1)
            return '变卦上卦名不在八卦中';
          return null;
        }
      });
    }

    // ── 周公解梦随机 (10组) ──
    // 输入格式：[text, question]，test_runner 调用 engine.divine(test.input[0])
    var dreamKeywords = [
      '蛇', '龙', '飞', '水', '火', '鱼', '鸟', '树', '山', '雨',
      '梦到', '鬼', '血', '刀', '车', '电话', '考试', '钱', '牙', '掉',
      '梦蛇', '梦见', '老虎', '狼', '狗', '猫', '猫抓', '被追', '被咬'
    ];
    for (var i = 0; i < 10; i++) {
      var keyword = randChoice(dreamKeywords);
      var sentence = keyword + (Math.random() < 0.5 ? '在天上飞' : '在水里游');
      tests.push({
        id: 'R-Z' + String(i + 1).padStart(3, '0'),
        engine: 'zhougong',
        method: 'divine',
        input: [sentence],
        source: '随机梦境描述',
        _validator: function(result, input) {
          if (!result || typeof result !== 'object') return '返回非对象';
          if (!result['input']) return '缺少input字段';
          if (!result['interpretation'] || result['interpretation'].length === 0)
            return '解读文本为空';
          if (result['ji'] === undefined) return '缺少ji字段';
          return null;
        }
      });
    }

    // ── 常量校验 (3组) ──
    tests.push({
      id: 'R-C001',
      engine: 'constants',
      method: 'validate',
      input: [],
      source: '常量完整性',
      _validator: function(result, input) {
        if (!result || typeof result !== 'object') return '返回非对象';
        if (result['gan_count'] !== 10) return '天干数量不为10';
        if (result['zhi_count'] !== 12) return '地支数量不为12';
        if (result['jiazi_count'] !== 60) return '六十甲子数量不为60';
        return null;
      }
    });
    tests.push({
      id: 'R-C002',
      engine: 'constants',
      method: 'validate_gan_zhi',
      input: [],
      source: '干支首尾校验',
      _validator: function(result, input) {
        if (!result) return '返回为空';
        if (result['gan0'] !== '甲') return '天干首个不是甲';
        if (result['gan9'] !== '癸') return '天干末个不是癸';
        if (result['zhi0'] !== '子') return '地支首个不是子';
        if (result['zhi11'] !== '亥') return '地支末个不是亥';
        return null;
      }
    });
    tests.push({
      id: 'R-C003',
      engine: 'constants',
      method: 'validate_bagua',
      input: [],
      source: '八卦完整性',
      _validator: function(result, input) {
        if (!result || typeof result !== 'object') return '返回非对象';
        if (result['bagua_count'] !== 8) return '八卦数量不为8';
        return null;
      }
    });

    // ── 引擎注册校验 (2组) ──
    tests.push({
      id: 'R-E001',
      engine: 'engine-registry',
      method: 'validate',
      input: [],
      source: '引擎数量校验',
      _validator: function(result, input) {
        if (!result || typeof result !== 'object') return '返回非对象';
        if (result['engine_count'] !== 10) return '引擎数量不为10';
        return null;
      }
    });
    tests.push({
      id: 'R-E002',
      engine: 'engine-registry',
      method: 'check_keys',
      input: [],
      source: '引擎可用性校验',
      _validator: function(result, input) {
        if (!result || typeof result !== 'object') return '返回非对象';
        if (!result['has_bazi']) return '缺少八字引擎';
        if (!result['has_liuyao']) return '缺少六爻引擎';
        if (!result['has_meihua']) return '缺少梅花引擎';
        if (!result['has_qimen']) return '缺少奇门引擎';
        if (!result['has_taiyi']) return '缺少太乙引擎';
        if (!result['has_daliuren']) return '缺少大六壬引擎';
        return null;
      }
    });

    return tests;
  }

  global.RandomTestGenerator = {
    generate: randomTests,
    // 种子化（方便复现）
    generateWithSeed: function(seed) {
      var originalRand = Math.random;
      function mulberry32(a) {
        return function() {
          var t = a += 0x6D2B79F5;
          t = Math.imul(t ^ (t >>> 15), t | 1);
          t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
          return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
      }
      var rng = mulberry32(seed);
      Math.random = rng;
      var tests = randomTests();
      Math.random = originalRand;
      return tests;
    }
  };

})(typeof window !== 'undefined' ? window : this);
