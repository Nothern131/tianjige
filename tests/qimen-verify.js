/**
 * 奇门遁甲引擎 v2 排盘验证脚本（Node）
 * 验证：地盘、值符落宫、天盘旋转、八门值使、八神排布、天禽寄宫、三元定局
 */
var fs = require('fs');
var path = require('path');
var vm = require('vm');

// 加载引擎（IIFE以this为全局对象挂载，vm沙箱中this指向sandbox）
var enginePath = path.join(__dirname, '..', 'static', 'js', 'qimen-engine.js');
var code = fs.readFileSync(enginePath, 'utf8');
var sandbox = {};
vm.runInNewContext(code, sandbox, { filename: 'qimen-engine.js' });
var Q = sandbox.QimenEngine;

var pass = 0, fail = 0;
function check(name, actual, expected) {
  if (actual === expected) { pass++; console.log('  PASS ' + name); }
  else { fail++; console.log('  FAIL ' + name + ' | 期望: ' + expected + ' | 实际: ' + actual); }
}
function checkTrue(name, cond, detail) {
  if (cond) { pass++; console.log('  PASS ' + name); }
  else { fail++; console.log('  FAIL ' + name + (detail ? ' | ' + detail : '')); }
}

// ============ 测试1：阳遁一局 甲子时（伏吟局） ============
// 1900-02-20 为甲子日，甲日子时=甲子时
console.log('\n[测试1] 阳遁一局 甲子时（伏吟）');
var r1 = Q.divine('1900-02-20', '子时', 'yang-1');
check('日干支', r1.day_gz, '甲子');
check('时干支', r1.time_gz, '甲子');
check('旬首', r1.xun_shou, '甲子');
check('值符星', r1.zhi_fu_star, '天蓬');
check('值符落宫', r1.zhi_fu_gong, 1);
// 伏吟：天盘=地盘，星在原始宫
check('1宫天盘干', r1.cells[1].tian_pan, '戊');
check('1宫星', r1.cells[1].star, '天蓬');
check('2宫星', r1.cells[2].star, '天芮');
check('9宫星', r1.cells[9].star, '天英');
// 八门原始分布
check('1宫门', r1.cells[1].door, '休门');
check('2宫门', r1.cells[2].door, '死门');
check('8宫门', r1.cells[8].door, '生门');
// 八神：值符落1宫，阳遁顺布（环：1→8→3→4→9→2→7→6）
check('1宫神', r1.cells[1].god, '值符');
check('8宫神', r1.cells[8].god, '螣蛇');
check('3宫神', r1.cells[3].god, '太阴');
check('9宫神', r1.cells[9].god, '白虎');
check('2宫神', r1.cells[2].god, '玄武');
// 值使
check('值使门', r1.zhi_shi_door, '休门');
check('值使落宫', r1.zhi_shi_gong, 1);
// 天禽寄宫：伏吟时天芮在2宫，天禽寄2宫携壬
check('天禽寄2宫', r1.cells[2].ji_star, '天禽');
check('天禽携干', r1.cells[2].ji_tian_pan, '壬');
// 中五宫：无门无神无天盘干
checkTrue('中五宫无门', r1.cells[5].door === '', 'door=' + r1.cells[5].door);
checkTrue('中五宫无神', r1.cells[5].god === '', 'god=' + r1.cells[5].god);
check('中五宫地盘干', r1.cells[5].di_pan, '壬');

// ============ 测试2：阳遁一局 乙丑时 ============
console.log('\n[测试2] 阳遁一局 乙丑时（值符随时干、值使数宫）');
var r2 = Q.divine('1900-02-20', '丑时', 'yang-1');
check('时干支', r2.time_gz, '乙丑');
check('值符星', r2.zhi_fu_star, '天蓬');
check('值符落宫(乙在9宫)', r2.zhi_fu_gong, 9);
// 天盘：天蓬携戊落9宫
check('9宫天盘干', r2.cells[9].tian_pan, '戊');
check('9宫星', r2.cells[9].star, '天蓬');
// 环+4：天英携乙落1宫、天芮携己落8宫（天禽寄8）
check('1宫天盘干', r2.cells[1].tian_pan, '乙');
check('1宫星', r2.cells[1].star, '天英');
check('8宫星', r2.cells[8].star, '天芮');
check('天禽寄8宫', r2.cells[8].ji_star, '天禽');
// 值使：休门，n=1，落宫=1+1=2宫
check('值使落宫', r2.zhi_shi_gong, 2);
check('2宫门(休门)', r2.cells[2].door, '休门');
// 门环+5：生门7宫、开门9宫
check('7宫门', r2.cells[7].door, '生门');
check('9宫门', r2.cells[9].door, '开门');
// 八神：值符落9宫，阳遁顺（环序9→2→7→6→1→8→3→4）
check('9宫神', r2.cells[9].god, '值符');
check('2宫神', r2.cells[2].god, '螣蛇');
check('7宫神', r2.cells[7].god, '太阴');
check('1宫神', r2.cells[1].god, '白虎');

// ============ 测试3：阳遁一局 丁卯时 ============
console.log('\n[测试3] 阳遁一局 丁卯时');
var r3 = Q.divine('1900-02-20', '卯时', 'yang-1');
check('时干支', r3.time_gz, '丁卯');
// 丁在7宫 → 值符天蓬携戊落7宫
check('值符落宫', r3.zhi_fu_gong, 7);
check('7宫天盘干', r3.cells[7].tian_pan, '戊');
check('7宫星', r3.cells[7].star, '天蓬');
// 值使：休门，n=3，落宫=1+3=4宫
check('值使落宫', r3.zhi_shi_gong, 4);
check('4宫门', r3.cells[4].door, '休门');

// ============ 测试4：阳遁一局 戊辰时（值使落中五寄坤二） ============
console.log('\n[测试4] 阳遁一局 戊辰时（值使寄坤二）');
var r4 = Q.divine('1900-02-20', '辰时', 'yang-1');
check('时干支', r4.time_gz, '戊辰');
// 值使：休门，n=4，落宫=1+4=5→寄2宫
check('值使落宫(寄坤二)', r4.zhi_shi_gong, 2);
check('2宫门', r4.cells[2].door, '休门');
// 戊在1宫（阳一局），值符天蓬落1宫，伏吟
check('值符落宫', r4.zhi_fu_gong, 1);
check('1宫天盘干', r4.cells[1].tian_pan, '戊');

// ============ 测试5：阳遁五局 甲子时（值符天禽寄坤二） ============
console.log('\n[测试5] 阳遁五局 甲子时（值符天禽）');
var r5 = Q.divine('1900-02-20', '子时', 'yang-5');
// 地盘阳五局：戊5、己6、庚7、辛8、壬9、癸1、丁2、丙3、乙4
check('5宫地盘干', r5.cells[5].di_pan, '戊');
check('6宫地盘干', r5.cells[6].di_pan, '己');
check('9宫地盘干', r5.cells[9].di_pan, '壬');
check('1宫地盘干', r5.cells[1].di_pan, '癸');
check('4宫地盘干', r5.cells[4].di_pan, '乙');
// 甲子旬遁戊在5宫 → 值符天禽，寄坤二执行，落2宫（时干甲→戊→5→寄2）
check('值符星(天禽)', r5.zhi_fu_star, '天禽');
check('值符落宫(寄坤二)', r5.zhi_fu_gong, 2);
// 值使：中五宫寄坤二取死门，n=0落2宫
check('值使门(死门)', r5.zhi_shi_door, '死门');
check('值使落宫', r5.zhi_shi_gong, 2);
// 天禽寄天芮：天芮在2宫携丁（阳五局2宫丁），天禽携中五宫干戊寄2宫
check('2宫星', r5.cells[2].star, '天芮');
check('2宫天盘干', r5.cells[2].tian_pan, '丁');
check('天禽寄2宫', r5.cells[2].ji_star, '天禽');
check('天禽携干(戊)', r5.cells[2].ji_tian_pan, '戊');

// ============ 测试6：阴遁九局 甲子时 ============
console.log('\n[测试6] 阴遁九局 甲子时');
var r6 = Q.divine('1900-02-20', '子时', 'yin-9');
// 地盘阴九局：戊9、己8、庚7、辛6、壬5、癸4、丁3、丙2、乙1
check('9宫地盘干', r6.cells[9].di_pan, '戊');
check('8宫地盘干', r6.cells[8].di_pan, '己');
check('1宫地盘干', r6.cells[1].di_pan, '乙');
// 甲子旬遁戊在9宫 → 值符天英落9宫（伏吟）
check('值符星', r6.zhi_fu_star, '天英');
check('值符落宫', r6.zhi_fu_gong, 9);
check('9宫天盘干', r6.cells[9].tian_pan, '戊');
check('9宫星', r6.cells[9].star, '天英');
// 值使：9宫门=景门，n=0
check('值使门', r6.zhi_shi_door, '景门');
check('值使落宫', r6.zhi_shi_gong, 9);
// 八神：值符落9宫，阴遁逆布（环逆：9→4→3→8→1→6→7→2）
check('9宫神', r6.cells[9].god, '值符');
check('4宫神(螣蛇)', r6.cells[4].god, '螣蛇');
check('3宫神(太阴)', r6.cells[3].god, '太阴');
check('8宫神(六合)', r6.cells[8].god, '六合');
check('1宫神(白虎)', r6.cells[1].god, '白虎');

// ============ 测试7：阴遁九局 己巳时 ============
console.log('\n[测试7] 阴遁九局 己巳时');
var r7 = Q.divine('1900-02-20', '巳时', 'yin-9');
check('时干支', r7.time_gz, '己巳');
// 己在8宫 → 值符天英携戊落8宫
check('值符落宫', r7.zhi_fu_gong, 8);
check('8宫天盘干', r7.cells[8].tian_pan, '戊');
check('8宫星', r7.cells[8].star, '天英');
// 值使：景门原始9宫，n=5，阴遁落宫=9-5=4宫
check('值使落宫', r7.zhi_shi_gong, 4);
check('4宫门', r7.cells[4].door, '景门');

// ============ 测试8：节气与三元 ============
console.log('\n[测试8] 节气与三元定局');
var r8a = Q.divine('2026-01-10', '子时', 'auto');
check('1月10日节气(小寒)', r8a.jieqi, '小寒');
var r8b = Q.divine('2026-06-22', '子时', 'auto');
check('6月22日节气(夏至)', r8b.jieqi, '夏至');
var r8c = Q.divine('2026-12-25', '子时', 'auto');
check('12月25日节气(冬至)', r8c.jieqi, '冬至');
check('冬至为阳遁', r8c.period, '阳遁');
var r8d = Q.divine('2026-07-10', '子时', 'auto');
check('7月10日节气(小暑)', r8d.jieqi, '小暑');
check('小暑为阴遁', r8d.period, '阴遁');

// 三元：2026-01-10日干支 → 符头定元
var dayGZ_0110 = Q.divine('2026-01-10', '子时', 'yang-1').day_gz;
console.log('  2026-01-10 日干支: ' + dayGZ_0110 + ', 三元: ' + r8a.san_yuan);
// 小寒上元=2局，中元=8局，下元=5局
var juExpected = { '上元': 2, '中元': 8, '下元': 5 }[r8a.san_yuan];
check('小寒' + r8a.san_yuan + '局数', r8a.ju_num, juExpected);

// 2026-08-30（今天）自动局
var r8e = Q.divine('2026-08-30', '午时', 'auto');
console.log('  2026-08-30: ' + r8e.jieqi + ' ' + r8e.period + r8e.ju_num + '局(' + r8e.san_yuan + ') 日' + r8e.day_gz + ' 时' + r8e.time_gz);
checkTrue('处暑阴遁', r8e.period === '阴遁');
// 2026-09-03 庚辰日，符头己卯（卯=上元），处暑上元
check('处暑上元局数', Q.divine('2026-09-03', '子时', 'auto').ju_num, Q.JU_TABLE['处暑'][0]);

// ============ 测试9：解读完整性 ============
console.log('\n[测试9] 解读完整性');
var interp = r8e.interpretation;
var sections = ['局象概述', '值符值使', '格局判断', '十干克应', '八门吉凶', '九星要断', '八神格局', '综合判断', '趋避建议'];
sections.forEach(function (s) {
  checkTrue('解读含【' + s + '】', interp.indexOf('【' + s + '】') >= 0);
});
checkTrue('解读无undefined', interp.indexOf('undefined') < 0 && interp.indexOf('null') < 0);
checkTrue('解读无NaN', interp.indexOf('NaN') < 0);

// ============ 汇总 ============
console.log('\n========== 结果: ' + pass + ' 通过 / ' + fail + ' 失败 ==========');
process.exit(fail > 0 ? 1 : 0);
