var fs = require('fs');
var path = require('path');
var engineFiles = ['constants.js', 'bazi-engine.js', 'liuyao-engine.js', 'meihua-engine.js', 'qimen-engine.js', 'taiyi-engine.js', 'zhuge-engine.js', 'zhougong-engine.js', 'daliuren-engine.js', 'ziwei-engine.js', 'fengshui-engine.js', 'engine-registry.js'];
var combined = 'var global=typeof global!=="undefined"?global:this;\n';
engineFiles.forEach(function(f) {
  combined += '/* ' + f + ' */\n' + fs.readFileSync(path.join('static/js', f), 'utf8') + '\n';
});
var ctx = (new Function(combined + 'return this;'))();

// Constants
console.log('=== Constants ===');
console.log('validate:', JSON.stringify(ctx.Tianjige.Const.validate()));
console.log('validate_gan_zhi:', JSON.stringify(ctx.Tianjige.Const.validate_gan_zhi()));
console.log('validateBagua:', JSON.stringify(ctx.Tianjige.Const.validateBagua()));

// Registry
console.log('=== Registry ===');
console.log('validate:', JSON.stringify(ctx.EngineRegistry.validate()));
console.log('check_engines:', JSON.stringify(ctx.EngineRegistry.checkEngines()));
console.log('getAllKeys:', JSON.stringify(ctx.EngineRegistry.getAllKeys()));
