(function(global) {
  'use strict';

  var EngineTestRunner = {
    _engines: {},
    _tests: [],
    _passed: 0,
    _failed: 0,
    _skipped: 0,
    _results: [],

    registerEngine: function(name, engine) {
      this._engines[name] = engine;
      return this;
    },

    registerTests: function(tests) {
      this._tests = tests;
      return this;
    },

    run: function(tests) {
      if (tests) this._tests = tests;
      this._passed = 0;
      this._failed = 0;
      this._skipped = 0;
      this._results = [];

      for (var i = 0; i < this._tests.length; i++) {
        var test = this._tests[i];
        var result = this._runTest(test);
        this._results.push(result);
      }

      return this._results;
    },

    _runTest: function(test) {
      var startTime = Date.now();
      var result = {
        id: test.id,
        engine: test.engine,
        method: test.method,
        input: test.input,
        expected: test.expected,
        source: test.source,
        passed: false,
        actual: null,
        error: null,
        duration: 0
      };

      try {
        var engine = this._engines[test.engine];
        if (!engine) {
          result.error = '引擎未注册: ' + test.engine;
          this._skipped++;
          result.duration = Date.now() - startTime;
          return result;
        }

        var actual;
        if (test.method === 'paipan') {
          actual = engine.paipan(test.input[0], test.input[1], test.input[2], test.input[3]);
        } else if (test.method === 'divine') {
          actual = engine.divine(test.input[0]);
          // meihua 返回 original_gua.name，规范化为 gua_name 供测试使用
          if (test.engine === 'meihua' && actual && actual.original_gua && actual.original_gua.name) {
            actual = Object.assign({}, actual, { gua_name: actual.original_gua.name });
          }
        } else if (test.method === 'interpret') {
          actual = engine.interpret(test.input[0]);
        } else if (test.method === 'analyze') {
          actual = engine.analyze(test.input[0]);
        } else if (test.method === 'validate' || test.method === 'validate_gan_zhi' || test.method === 'validate_bagua' || test.method === 'check_keys') {
          if (test.engine === 'constants') {
            actual = this._runConstantsTest(test);
          } else if (test.engine === 'engine-registry') {
            actual = this._runRegistryTest(test);
          } else {
            actual = engine[test.method] ? engine[test.method]() : {};
          }
        } else {
          result.error = '未知方法: ' + test.method;
          this._skipped++;
          result.duration = Date.now() - startTime;
          return result;
        }

        result.actual = actual;

        if (test._validator) {
          var err = test._validator(actual, test.input);
          if (err) {
            result.passed = false;
            result.error = '结构校验失败: ' + err;
          } else {
            result.passed = true;
          }
        } else if (test.expected) {
          var pass = this._validate(test.expected, actual);
          result.passed = pass;
          if (!pass) {
            result.error = '验证失败: 期望与actual不匹配';
          }
        } else {
          result.passed = true;
        }

        if (result.passed) {
          this._passed++;
        } else {
          this._failed++;
        }

      } catch (e) {
        result.error = e.message;
        result.passed = false;
        this._failed++;
      }

      result.duration = Date.now() - startTime;
      return result;
    },

    _validate: function(expected, actual) {
      if (!actual) return false;
      for (var key in expected) {
        if (expected.hasOwnProperty(key)) {
          if (expected[key] === true) {
            if (!actual[key]) return false;
          } else if (actual[key] !== expected[key]) {
            return false;
          }
        }
      }
      return true;
    },

    _runConstantsTest: function(test) {
      var Const = global.Tianjige ? global.Tianjige.Const : null;
      if (!Const) return {};
      if (test.method === 'validate') {
        return {
          gan_count: Const.GAN ? Const.GAN.length : 0,
          zhi_count: Const.ZHI ? Const.ZHI.length : 0,
          jiazi_count: Const.SIXTY_JIAZI ? Const.SIXTY_JIAZI.length : 0,
          nayin_count: Const.NAYIN_ARR ? Const.NAYIN_ARR.length : 0
        };
      } else if (test.method === 'validate_gan_zhi') {
        return {
          gan0: Const.GAN && Const.GAN[0],
          gan9: Const.GAN && Const.GAN[9],
          zhi0: Const.ZHI && Const.ZHI[0],
          zhi11: Const.ZHI && Const.ZHI[11]
        };
      } else if (test.method === 'validate_bagua') {
        return {
          bagua_count: Const.BAGUA ? Object.keys(Const.BAGUA).length : 0
        };
      }
      return {};
    },

    _runRegistryTest: function(test) {
      var reg = global.EngineRegistry;
      if (!reg) return {};
      if (test.method === 'validate') {
        return {
          engine_count: reg.REGISTRY ? Object.keys(reg.REGISTRY).length : 0
        };
      } else if (test.method === 'check_keys') {
        var keys = reg.getAllKeys ? reg.getAllKeys() : (reg.REGISTRY ? Object.keys(reg.REGISTRY) : []);
        return {
          has_bazi: keys.indexOf('bazi') !== -1,
          has_liuyao: keys.indexOf('liuyao') !== -1,
          has_meihua: keys.indexOf('meihua') !== -1,
          has_qimen: keys.indexOf('qimen') !== -1,
          has_taiyi: keys.indexOf('taiyi') !== -1,
          has_zhuge: keys.indexOf('zhuge') !== -1,
          has_zhougong: keys.indexOf('zhougong') !== -1,
          has_daliuren: keys.indexOf('daliuren') !== -1,
          has_ziwei: keys.indexOf('ziwei') !== -1,
          has_fengshui: keys.indexOf('fengshui') !== -1
        };
      }
      return {};
    },

    getSummary: function() {
      return {
        total: this._tests.length,
        passed: this._passed,
        failed: this._failed,
        skipped: this._skipped,
        score: this._tests.length > 0 ? Math.round(this._passed / this._tests.length * 100) : 0
      };
    },

    getFailed: function() {
      return this._results.filter(function(r) { return !r.passed; });
    },

    getPassed: function() {
      return this._results.filter(function(r) { return r.passed; });
    }
  };

  global.EngineTestRunner = EngineTestRunner;

})(typeof global !== 'undefined' ? global : window);
