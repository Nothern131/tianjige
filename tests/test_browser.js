(function(global) {
  'use strict';

  /**
   * 天机阁引擎测试 - 浏览器端入口
   * 支持两种模式：
   *   __runTests()           — 固定黄金测试集（预定义输入输出）
   *   __runRandomTests()     — 随机测试（随机输入 + 结构校验）
   */

  function _setupRunner() {
    var runner = window.EngineTestRunner;
    runner.registerEngine('bazi', window.BaziEngine);
    runner.registerEngine('liuyao', window.LiuyaoEngine);
    runner.registerEngine('meihua', window.MeihuaEngine);
    runner.registerEngine('qimen', window.QimenEngine);
    runner.registerEngine('taiyi', window.TaiyiEngine);
    runner.registerEngine('zhuge', window.ZhugeEngine);
    runner.registerEngine('zhougong', window.ZhougongEngine);
    runner.registerEngine('daliuren', window.DaLiuRenEngine);
    runner.registerEngine('ziwei', window.ZiWeiEngine);
    runner.registerEngine('fengshui', window.FengShuiEngine);
    runner.registerEngine('constants', window.Tianjige && window.Tianjige.Const);
    runner.registerEngine('engine-registry', window.EngineRegistry);
    return runner;
  }

  function _computeSummary(results) {
    var summary = { total: 0, passed: 0, failed: 0, skipped: 0, score: 0 };
    summary.total = results.length;
    results.forEach(function(r) {
      if (r.passed) summary.passed++;
      else if (r.error) summary.skipped++;
      else summary.failed++;
    });
    summary.score = results.length > 0
      ? Math.round(summary.passed / results.length * 100)
      : 0;
    return summary;
  }

  /** 固定黄金测试集 */
  window.__runTests = function() {
    var runner = _setupRunner();
    var tests = window.__GOLDEN_TESTS__ || [];
    var results = runner.run(tests);
    var summary = _computeSummary(results);
    return { summary: summary, results: results };
  };

  /** 随机测试（每次生成全新输入，验证结构合法性） */
  window.__runRandomTests = function(seed) {
    var runner = _setupRunner();
    var generator = window.RandomTestGenerator;
    if (!generator) {
      return { summary: { total: 0, passed: 0, failed: 0, skipped: 0, score: 0 }, results: [], error: 'RandomTestGenerator 未加载' };
    }
    var tests = seed !== undefined
      ? generator.generateWithSeed(seed)
      : generator.generate();
    var results = runner.run(tests);
    var summary = _computeSummary(results);
    return { summary: summary, results: results };
  };

  window.__getRunner = function() {
    return window.EngineTestRunner;
  };

})(window);
