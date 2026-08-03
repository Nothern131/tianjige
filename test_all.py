# -*- coding: utf-8 -*-
"""快速验证所有核心模块"""
import sys
sys.path.insert(0, 'e:/天机阁')

print("=" * 50)
print("1. 测试 constants.py")
print("=" * 50)
from core.constants import (
    GAN, ZHI, SIXTY_JIAZI, BAGUA_XIANG, LIUSHISI_GUA_XIANG,
    SHISHEN_RELATION, NAYIN_MAP, GUA_TO_GONG, SHENSHA, JIANCHU,
    WUXING, GAN_WUXING, ZHI_WUXING, WUXING_SHENG, WUXING_KE,
    BAGONG_GUA, GUA_SHI_YAO, GUA_YING_YAO, NAJIA_ZHI, NAJIA_GAN,
    BAMEN, JIUXING, BASHEN_YANG, BASHEN_YIN,
    TAIYI_SHISHEN, TIAOHOU,
    get_shishen, get_nayin_wuxing, get_zhi_canggan,
    get_wuhudun_month_gan, get_wushudun_hour_gan, get_jianchu, get_shensa,
)
print(f"  天干: {GAN}")
print(f"  地支: {ZHI}")
print(f"  六十甲子: {len(SIXTY_JIAZI)}个")
print(f"  六十四卦: {len(LIUSHISI_GUA_XIANG)}个")
print(f"  八宫卦: {len(GUA_TO_GONG)}个宫卦映射")
print(f"  十神(甲→己): {SHISHEN_RELATION['甲']['己']}")
print(f"  纳音(甲子): {NAYIN_MAP['甲子']}")
print(f"  八门: {BAMEN}")
print(f"  九星: {JIUXING}")
print(f"  十六神: {TAIYI_SHISHEN}")
print(f"  五虎遁(甲年正月): {get_wuhudun_month_gan('甲', '寅')}")
print(f"  五鼠遁(甲日子时): {get_wushudun_hour_gan('甲', '子')}")
print(f"  建除(寅月寅日): {get_jianchu('寅', '寅')}")
print(f"  神煞(甲日): {get_shensa('甲', '子')}")
print("  constants.py ✓")

print()
print("=" * 50)
print("2. 测试 calendar.py")
print("=" * 50)
from core.calendar import ChineseCalendar
cal = ChineseCalendar()
ri_ganzhi = cal.get_day_ganzhi(2026, 7, 17)
bazi = cal.get_full_bazi(2026, 7, 17, 14)
print(f"  日干支(2026-07-17): {ri_ganzhi}")
print(f"  八字: {bazi}")
yun = cal.get_yun_info(2000, 1, 1, 8, "男")
print(f"  大运方向: {yun['大运方向']}")
print(f"  起运年龄: {yun['起运年龄']}")
print("  calendar.py ✓")

print()
print("=" * 50)
print("3. 测试 liuyao.py")
print("=" * 50)
from core.liuyao import LiuYao
ly = LiuYao()
# 数字法起卦
gua = ly.get_gua_by_number(5, 8, 3)
print(f"  数字法起卦: {gua['gua_name']}")
print(f"  世爻: {gua['shi_yao']}, 应爻: {gua['ying_yao']}")
print(f"  动爻: {gua['dong_yao']}")
print(f"  六亲: {gua['liu_qin']}")
print(f"  六兽: {gua['liu_shou']}")
# 铜钱法起卦
gua2 = ly.get_gua_by_coins()
print(f"  铜钱法起卦: {gua2['gua_name']}")
print(f"  动爻: {gua2['dong_yao']}")
print("  liuyao.py ✓")

print()
print("=" * 50)
print("4. 测试 meihua.py")
print("=" * 50)
from core.meihua import MeiHua
mh = MeiHua()
# 三数法
result = mh.gua_by_numbers(5, 8, 3)
print(f"  本卦: {result['original_gua']['name']}")
print(f"  互卦: {result['hu_gua']['name']}")
print(f"  变卦: {result['changed_gua']['name']}")
print(f"  体卦: {result['ti_gua']}, 用卦: {result['yong_gua']}")
print(f"  体用关系: {result['sheng_ke']['关系']} ({result['sheng_ke']['吉凶']})")
# 年月日时法
result2 = mh.gua_by_date_time(2026, 7, 17, 14)
print(f"  年月日时法本卦: {result2['original_gua']['name']}")
print("  meihua.py ✓")

print()
print("=" * 50)
print("5. 测试 qimen.py")
print("=" * 50)
from core.qimen import QiMen
qm = QiMen()
pan = qm.pai_pan(2026, 7, 17, 14)
print(f"  时间: {pan['排盘时间']}")
print(f"  局数: {pan['局数']}")
print(f"  阴阳遁: {pan['阴阳遁']}")
print(f"  时干支: {pan['时干支']}")
# 检查九宫格
gong_ge = pan['九宫格']
for gong_num in [1, 3, 5, 7, 9]:
    g = gong_ge.get(gong_num, {})
    print(f"  宫{gong_num}({g.get('宫名', '')}): 地盘{g.get('地盘干', '')} 天盘{g.get('天盘干', '')} {g.get('八门', '')} {g.get('九星', '')} {g.get('八神', '')}")
print("  qimen.py ✓")

print()
print("=" * 50)
print("6. 测试 taiyi.py")
print("=" * 50)
from core.taiyi import TaiYi
ty = TaiYi()
pan = ty.pai_pan(2026)
print(f"  年份: {pan['年份']}")
print(f"  太乙积年: {pan['太乙积年']['太乙积年']}")
print(f"  太乙落宫: {pan['太乙位置']['太乙宫位']}值{pan['太乙位置']['十六神']}({pan['太乙位置']['吉凶']})")
print(f"  十六神: {len(pan['十六神'])}个")
print(f"  五福: {list(pan['五福'].keys())}")
print(f"  三基: {list(pan['三基'].keys())}")
print(f"  计神: {pan['计神']}")
print(f"  始击: {pan['始击']}")
print(f"  文昌: {pan['文昌']}")
print(f"  主大将: {pan['主大将']}")
print(f"  客大将: {pan['客大将']}")
print("  taiyi.py ✓")

print()
print("=" * 50)
print("全部模块验证通过!")
print("=" * 50)