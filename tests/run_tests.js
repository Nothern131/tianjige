/**
 * 天机阁引擎测试 - Node.js 运行入口
 * 用法: node tests/run_tests.js
 *       node tests/run_tests.js --random
 */
(function () {
  'use strict';

  var fs = require('fs');
  var path = require('path');

  var engineFiles = [
    'constants.js', 'bazi-engine.js', 'liuyao-engine.js', 'meihua-engine.js',
    'qimen-engine.js', 'taiyi-engine.js', 'zhuge-engine.js', 'zhougong-engine.js',
    'daliuren-engine.js', 'ziwei-engine.js', 'fengshui-engine.js', 'engine-registry.js'
  ];

  var combined = '// 天机阁引擎测试临时加载文件\n';
  combined += 'var global = typeof global !== "undefined" ? global : this;\n\n';

  engineFiles.forEach(function (file) {
    var code = fs.readFileSync(path.join(__dirname, '../static/js', file), 'utf8');
    combined += '/* ' + file + ' */\n';
    combined += code + '\n\n';
  });

  var fn = new Function(combined + 'return this;');
  var ctx = fn();

  // 加载测试运行器
  var runnerCode = fs.readFileSync(path.join(__dirname, 'test_runner.js'), 'utf8');
  var runnerFn = new Function(runnerCode + 'return this.EngineTestRunner;');
  var runner = runnerFn();

  var isRandom = process.argv.indexOf('--random') !== -1;

  // 注册引擎
  runner.registerEngine('bazi', ctx.BaziEngine);
  runner.registerEngine('liuyao', ctx.LiuyaoEngine);
  runner.registerEngine('meihua', ctx.MeihuaEngine);
  runner.registerEngine('qimen', ctx.QimenEngine);
  runner.registerEngine('taiyi', ctx.TaiyiEngine);
  runner.registerEngine('zhuge', ctx.ZhugeEngine);
  runner.registerEngine('zhougong', ctx.ZhougongEngine);
  runner.registerEngine('daliuren', ctx.DaLiuRenEngine);
  runner.registerEngine('ziwei', ctx.ZiWeiEngine);
  runner.registerEngine('fengshui', ctx.FengShuiEngine);
  runner.registerEngine('constants', ctx.Tianjige && ctx.Tianjige.Const);
  runner.registerEngine('engine-registry', ctx.EngineRegistry);

  var tests, testLabel;

  if (isRandom) {
    // 随机测试
    var randomCode = fs.readFileSync(path.join(__dirname, 'random_tests.js'), 'utf8');
    new Function(randomCode + 'return this.RandomTestGenerator;')();
    var generator = ctx.RandomTestGenerator;
    var seed = process.argv[2];
    tests = seed
      ? generator.generateWithSeed(parseInt(seed, 10))
      : generator.generate();
    testLabel = '随机测试';
  } else {
    // 固定黄金测试
    tests = JSON.parse(fs.readFileSync(path.join(__dirname, 'golden_set.json'), 'utf8'));
    testLabel = '黄金测试';
  }

  runner.registerTests(tests);
  var results = runner.run();
  var summary = runner.getSummary();

  console.log('');
  console.log('=== 天机阁引擎测试 [' + testLabel + '] ===');
  console.log('总计: ' + summary.total);
  console.log('通过: ' + summary.passed + ' 失败: ' + summary.failed + ' 跳过: ' + summary.skipped);
  console.log('得分: ' + summary.score + '%');
  console.log('');

  if (summary.failed > 0) {
    console.log('失败用例:');
    runner.getFailed().forEach(function (r) {
      console.log('  [' + r.id + '] ' + r.engine + '/' + r.method + ' - ' + (r.error || '验证失败'));
    });
    process.exit(1);
  }

  if (summary.skipped > 0) {
    console.log('跳过用例:');
    results.filter(function (r) { return r.error; }).forEach(function (r) {
      console.log('  [' + r.id + '] ' + r.engine + '/' + r.method + ' - ' + r.error);
    });
    console.log('');
  }

  console.log('全部通过!');
})();
