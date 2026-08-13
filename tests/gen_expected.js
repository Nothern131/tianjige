var fs = require('fs');
var path = require('path');
var engineFiles = ['constants.js', 'bazi-engine.js', 'liuyao-engine.js', 'meihua-engine.js', 'qimen-engine.js', 'taiyi-engine.js', 'zhuge-engine.js', 'zhougong-engine.js', 'daliuren-engine.js', 'ziwei-engine.js', 'fengshui-engine.js', 'engine-registry.js'];
var combined = 'var global=typeof global!=="undefined"?global:this;\n';
engineFiles.forEach(function(f) {
  combined += '/* ' + f + ' */\n' + fs.readFileSync(path.join('static/js', f), 'utf8') + '\n';
});
var ctx = (new Function(combined + 'return this;'))();

// Bazi fixes
console.log('B030:', JSON.stringify({ year: ctx.BaziEngine.paipan(2024,11,11,12)['年柱'], month: ctx.BaziEngine.paipan(2024,11,11,12)['月柱'], day: ctx.BaziEngine.paipan(2024,11,11,12)['日柱'], hour: ctx.BaziEngine.paipan(2024,11,11,12)['时柱'], dayMain: ctx.BaziEngine.paipan(2024,11,11,12)['日主'], dayBranch: ctx.BaziEngine.paipan(2024,11,11,12)['日支'], dayWx: ctx.BaziEngine.paipan(2024,11,11,12)['日主五行'], zodiac: ctx.BaziEngine.paipan(2024,11,11,12)['生肖'] }));
console.log('B033:', JSON.stringify({ year: ctx.BaziEngine.paipan(2026,8,11,23)['年柱'], month: ctx.BaziEngine.paipan(2026,8,11,23)['月柱'], day: ctx.BaziEngine.paipan(2026,8,11,23)['日柱'], hour: ctx.BaziEngine.paipan(2026,8,11,23)['时柱'], dayMain: ctx.BaziEngine.paipan(2026,8,11,23)['日主'], dayBranch: ctx.BaziEngine.paipan(2026,8,11,23)['日支'], dayWx: ctx.BaziEngine.paipan(2026,8,11,23)['日主五行'], zodiac: ctx.BaziEngine.paipan(2026,8,11,23)['生肖'] }));
console.log('B037:', JSON.stringify({ year: ctx.BaziEngine.paipan(2026,7,15,12)['年柱'], month: ctx.BaziEngine.paipan(2026,7,15,12)['月柱'], day: ctx.BaziEngine.paipan(2026,7,15,12)['日柱'], hour: ctx.BaziEngine.paipan(2026,7,15,12)['时柱'], dayMain: ctx.BaziEngine.paipan(2026,7,15,12)['日主'], dayBranch: ctx.BaziEngine.paipan(2026,7,15,12)['日支'], dayWx: ctx.BaziEngine.paipan(2026,7,15,12)['日主五行'], zodiac: ctx.BaziEngine.paipan(2026,7,15,12)['生肖'] }));

// Meihua
var mtests = [
  ['M001', 3, 1, 2], ['M002', 1, 3, 3], ['M003', 8, 8, 1], ['M004', 1, 1, 4],
  ['M005', 6, 6, 3], ['M006', 4, 4, 5], ['M007', 2, 2, 6], ['M008', 7, 7, 2],
  ['M009', 3, 5, 1], ['M010', 5, 3, 4], ['M011', 4, 6, 2], ['M012', 2, 4, 3],
  ['M013', 6, 1, 1], ['M014', 1, 6, 6], ['M015', 3, 6, 4], ['M016', 6, 3, 5],
  ['M017', 7, 1, 2], ['M018', 1, 7, 3], ['M019', 2, 7, 1], ['M020', 7, 2, 6],
  ['M021', 4, 6, 2], ['M022', 6, 4, 5], ['M023', 5, 2, 1], ['M024', 2, 5, 3],
  ['M025', 1, 2, 6], ['M026', 2, 1, 4], ['M027', 3, 2, 1], ['M028', 2, 3, 5],
  ['M029', 7, 5, 3], ['M030', 5, 7, 2]
];
mtests.forEach(function(t) {
  var r = ctx.MeihuaEngine.divine({ method: 'number', upper: t[1], lower: t[2], moving: t[3] });
  console.log(t[0] + ': ' + r.original_gua.name);
});

// Constants
console.log('=== Constants ===');
console.log('validate:', JSON.stringify(ctx.Tianjige.Const.validate()));
console.log('validate_gan_zhi:', JSON.stringify(ctx.Tianjige.Const.validate_gan_zhi()));
console.log('validate_bagua:', JSON.stringify(ctx.Tianjige.Const.validateBagua()));

// Registry
console.log('=== Registry ===');
console.log('validate:', JSON.stringify(ctx.EngineRegistry.validate()));
console.log('check_engines:', JSON.stringify(ctx.EngineRegistry.checkEngines()));
