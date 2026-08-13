var fs = require('fs');
var path = require('path');
var engineFiles = ['constants.js', 'bazi-engine.js', 'liuyao-engine.js', 'meihua-engine.js', 'qimen-engine.js', 'taiyi-engine.js', 'zhuge-engine.js', 'zhougong-engine.js', 'daliuren-engine.js', 'ziwei-engine.js', 'fengshui-engine.js', 'engine-registry.js'];
var combined = 'var global=typeof global!=="undefined"?global:this;\n';
engineFiles.forEach(function(f) {
  combined += '/* ' + f + ' */\n' + fs.readFileSync(path.join('static/js', f), 'utf8') + '\n';
});
var ctx = (new Function(combined + 'return this;'))();

console.log('=== Tianjige.Const ===');
var keys = Object.keys(ctx.Tianjige.Const);
console.log('Keys:', keys);
keys.forEach(function(k) {
  console.log(k + ':', typeof ctx.Tianjige.Const[k]);
});

console.log('\n=== EngineRegistry ===');
var rkeys = Object.keys(ctx.EngineRegistry);
console.log('Keys:', rkeys);
rkeys.forEach(function(k) {
  console.log(k + ':', typeof ctx.EngineRegistry[k]);
});
