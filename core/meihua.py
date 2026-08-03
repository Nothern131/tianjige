# -*- coding: utf-8 -*-
"""
天机阁 - 梅花易数模块
年月日时数字法 / 三数法起卦 → 本卦互卦变卦 → 体用生克 → 万物类象 → 解卦
"""
import logging
from datetime import datetime
from typing import Dict, List, Optional, Tuple, Any

from .constants import (
    BAGUA_XIANG, BAGUA_XIANTIAN, BAGUA_HOUTIAN,
    BAGUA_WUXING, BAGUA_DIRECTION, BAGUA_RENSHI,
    BAGUA_SHENTI, BAGUA_COLOR, BAGUA_SEASON,
    WUXING_SHENG, WUXING_SHENG_BY, WUXING_KE, WUXING_KE_BY,
    WUXING,
    LIUSHISI_GUA_XIANG, LIUSHISI_GUA_GUACI,
    LIUSHISI_GUA_SHANGGUA, LIUSHISI_GUA_XIAGUA,
)

logger = logging.getLogger(__name__)


class MeiHua:
    """梅花易数：数字起卦、体用分析、万物类象"""

    # 先天八卦数：乾1兑2离3震4巽5坎6艮7坤8
    XIAN_TIAN_NUM = {1: "乾", 2: "兑", 3: "离", 4: "震", 5: "巽", 6: "坎", 7: "艮", 8: "坤"}
    XIAN_TIAN_NUM_REVERSE = {v: k for k, v in XIAN_TIAN_NUM.items()}

    def __init__(self):
        """初始化梅花易数实例"""
        pass

    # ================================================================
    # 一、起卦方法
    # ================================================================

    def gua_by_numbers(self, num1: int, num2: int, num3: int) -> Dict[str, Any]:
        """
        三数法起卦
        - 上卦 = num1 % 8（余数0为8坤卦）
        - 下卦 = num2 % 8
        - 动爻 = num3 % 6（余数0为6爻）

        Args:
            num1: 上卦数
            num2: 下卦数
            num3: 动爻数

        Returns:
            起卦结果字典
        """
        shang_num = num1 % 8
        if shang_num == 0:
            shang_num = 8
        xia_num = num2 % 8
        if xia_num == 0:
            xia_num = 8
        dong_yao = num3 % 6
        if dong_yao == 0:
            dong_yao = 6

        shang_gua = self.XIAN_TIAN_NUM[shang_num]
        xia_gua = self.XIAN_TIAN_NUM[xia_num]

        return self._build_meihua_gua(shang_gua, xia_gua, dong_yao)

    def gua_by_date_time(self, year: int, month: int, day: int,
                         hour: int = 0) -> Dict[str, Any]:
        """
        年月日时数字法起卦

        上卦 = (年 + 月 + 日) % 8
        下卦 = (年 + 月 + 日 + 时) % 8
        动爻 = (年 + 月 + 日 + 时) % 6

        Args:
            year: 年
            month: 月
            day: 日
            hour: 时（0-23）

        Returns:
            起卦结果字典
        """
        # 时辰转换为地支序号（子=1, 丑=2, ..., 亥=12）
        shichen_num = (hour + 1) // 2 % 12 + 1  # 简化：子时=1

        num1 = year + month + day
        num2 = year + month + day + shichen_num
        num3 = year + month + day + shichen_num

        shang_num = num1 % 8
        if shang_num == 0:
            shang_num = 8
        xia_num = num2 % 8
        if xia_num == 0:
            xia_num = 8
        dong_yao = num3 % 6
        if dong_yao == 0:
            dong_yao = 6

        shang_gua = self.XIAN_TIAN_NUM[shang_num]
        xia_gua = self.XIAN_TIAN_NUM[xia_num]

        return self._build_meihua_gua(shang_gua, xia_gua, dong_yao)

    def gua_by_two_numbers(self, num1: int, num2: int) -> Dict[str, Any]:
        """
        两数法起卦（动爻用两数之和）

        Args:
            num1: 上卦数
            num2: 下卦数

        Returns:
            起卦结果字典
        """
        dong = (num1 + num2) % 6
        if dong == 0:
            dong = 6
        return self.gua_by_numbers(num1, num2, dong)

    def _build_meihua_gua(self, shang_gua: str, xia_gua: str,
                          dong_yao: int) -> Dict[str, Any]:
        """
        构建梅花易数卦象

        Args:
            shang_gua: 上卦名
            xia_gua: 下卦名
            dong_yao: 动爻位置（1-6）

        Returns:
            完整卦象数据
        """
        # 上卦三爻 + 下卦三爻 = 本卦六爻
        shang_xiang = BAGUA_XIANG[shang_gua]
        xia_xiang = BAGUA_XIANG[xia_gua]
        original_yao = list(xia_xiang) + list(shang_xiang)  # 初爻到上爻

        # 识别本卦名
        original_name = self._identify_gua_name(original_yao)

        # 互卦：二三四爻为下卦，三四五爻为上卦
        hu_xia = tuple(original_yao[1:4])  # 二三四爻
        hu_shang = tuple(original_yao[2:5])  # 三四五爻
        hu_xia_name = self._identify_bagua(hu_xia)
        hu_shang_name = self._identify_bagua(hu_shang)
        hu_yao = list(hu_xia) + list(hu_shang)
        hu_name = self._identify_gua_name(hu_yao)

        # 变卦：动爻翻转
        changed_yao = list(original_yao)
        changed_yao[dong_yao - 1] = 1 - changed_yao[dong_yao - 1]
        changed_name = self._identify_gua_name(changed_yao)

        # 体用：动爻所在卦为用，不动卦为体
        # 动爻1-3→下卦为用，上卦为体；动爻4-6→上卦为用，下卦为体
        if dong_yao <= 3:
            yong_gua = xia_gua  # 下卦为用
            ti_gua = shang_gua   # 上卦为体
        else:
            yong_gua = shang_gua  # 上卦为用
            ti_gua = xia_gua      # 下卦为体

        # 体用生克分析
        sheng_ke = self._analyze_shengke(ti_gua, yong_gua)

        # 万物类象
        wanwu = self._get_wanwu_leixiang(ti_gua, yong_gua)

        # 解卦
        interpretation = self._interpret(original_name, hu_name, changed_name,
                                         ti_gua, yong_gua, sheng_ke, dong_yao, wanwu)

        return {
            "original_gua": {
                "name": original_name,
                "yao": original_yao,
                "shang_gua": shang_gua,
                "xia_gua": xia_gua,
            },
            "hu_gua": {
                "name": hu_name,
                "yao": hu_yao,
                "shang_gua": hu_shang_name,
                "xia_gua": hu_xia_name,
            },
            "changed_gua": {
                "name": changed_name,
                "yao": changed_yao,
            },
            "ti_gua": ti_gua,
            "yong_gua": yong_gua,
            "dong_yao": dong_yao,
            "sheng_ke": sheng_ke,
            "wanwu_leixiang": wanwu,
            "interpretation": interpretation,
        }

    def _identify_gua_name(self, yao: List[int]) -> str:
        """根据六爻识别六十四卦名"""
        yao_tuple = tuple(yao)
        for name, xiang in LIUSHISI_GUA_XIANG.items():
            if xiang == yao_tuple:
                return name
        return "未知卦"

    def _identify_bagua(self, yao: Tuple[int, ...]) -> str:
        """根据三爻识别八卦名"""
        for name, xiang in BAGUA_XIANG.items():
            if xiang == yao:
                return name
        return "未知"

    # ================================================================
    # 二、体用生克分析
    # ================================================================

    def _analyze_shengke(self, ti_gua: str, yong_gua: str) -> Dict[str, str]:
        """
        体用生克分析

        体生用 → 泄气（小凶，耗损）
        用生体 → 吉利（大吉，得助）
        体克用 → 费力（小吉，可成但辛苦）
        用克体 → 凶险（大凶，事难成）
        体用同五行 → 比和（吉，顺遂）

        Args:
            ti_gua: 体卦名
            yong_gua: 用卦名

        Returns:
            生克分析结果
        """
        ti_wx = BAGUA_WUXING.get(ti_gua, "土")
        yong_wx = BAGUA_WUXING.get(yong_gua, "土")

        if ti_wx == yong_wx:
            return {
                "关系": "体用比和",
                "吉凶": "吉",
                "说明": "体用五行相同，互相生旺，诸事顺遂，谋事易成",
                "等级": 1,
            }
        elif WUXING_SHENG_BY.get(ti_wx) == yong_wx:
            # 体生用 → 泄气
            return {
                "关系": "体生用",
                "吉凶": "小凶",
                "说明": "体卦生用卦，泄气耗损，事虽可成但费力，需付出较多",
                "等级": 3,
            }
        elif WUXING_SHENG.get(ti_wx) == yong_wx:
            # 用生体 → 吉利
            return {
                "关系": "用生体",
                "吉凶": "大吉",
                "说明": "用卦生体卦，得外力相助，事半功倍，谋事易成",
                "等级": 0,
            }
        elif WUXING_KE_BY.get(ti_wx) == yong_wx:
            # 体克用 → 费力
            return {
                "关系": "体克用",
                "吉凶": "小吉",
                "说明": "体卦克用卦，事可成但需付出努力，需主动争取",
                "等级": 2,
            }
        elif WUXING_KE.get(ti_wx) == yong_wx:
            # 用克体 → 凶险
            return {
                "关系": "用克体",
                "吉凶": "大凶",
                "说明": "用卦克体卦，外力压制，事难成，宜静不宜动，须谨慎",
                "等级": 4,
            }

        return {"关系": "未知", "吉凶": "未知", "说明": "无法判断", "等级": -1}

    # ================================================================
    # 三、万物类象
    # ================================================================

    def _get_wanwu_leixiang(self, ti_gua: str, yong_gua: str) -> Dict[str, Dict[str, str]]:
        """
        获取体用卦的万物类象

        Args:
            ti_gua: 体卦名
            yong_gua: 用卦名

        Returns:
            体用卦的类象信息
        """
        result = {}
        for name, gua in [("体卦", ti_gua), ("用卦", yong_gua)]:
            result[name] = {
                "卦名": gua,
                "五行": BAGUA_WUXING.get(gua, ""),
                "方位": BAGUA_DIRECTION.get(gua, ""),
                "人事": BAGUA_RENSHI.get(gua, ""),
                "身体": BAGUA_SHENTI.get(gua, ""),
                "颜色": BAGUA_COLOR.get(gua, ""),
                "季节": BAGUA_SEASON.get(gua, ""),
            }
        return result

    # ================================================================
    # 四、解卦
    # ================================================================

    def _interpret(self, original_name: str, hu_name: str, changed_name: str,
                   ti_gua: str, yong_gua: str, sheng_ke: Dict[str, str],
                   dong_yao: int, wanwu: Dict) -> str:
        """生成解卦文字"""
        parts = []

        # 卦名信息
        parts.append(f"本卦：{original_name}（上{LIUSHISI_GUA_SHANGGUA.get(original_name, '')}下{LIUSHISI_GUA_XIAGUA.get(original_name, '')}）")
        guaci = LIUSHISI_GUA_GUACI.get(original_name, "")
        if guaci:
            parts.append(f"卦辞：{guaci}")

        parts.append(f"互卦：{hu_name}（过程之象）")
        parts.append(f"变卦：{changed_name}（结果之象）")

        # 体用
        parts.append(f"体卦：{ti_gua}（{BAGUA_WUXING.get(ti_gua, '')}），用卦：{yong_gua}（{BAGUA_WUXING.get(yong_gua, '')}）")
        parts.append(f"动爻：第{dong_yao}爻")

        # 生克分析
        sk = sheng_ke
        parts.append(f"体用关系：{sk.get('关系', '')}（{sk.get('吉凶', '')}）")
        parts.append(f"生克解读：{sk.get('说明', '')}")

        # 万物类象提示
        ti_info = wanwu.get("体卦", {})
        yong_info = wanwu.get("用卦", {})
        parts.append(f"体卦类象：{ti_info.get('人事', '')}")
        parts.append(f"用卦类象：{yong_info.get('人事', '')}")

        # 综合判断
        ji_level = sk.get("等级", -1)
        if ji_level == 0:
            parts.append("综合判断：大吉之象，事必成，宜主动进取")
        elif ji_level == 1:
            parts.append("综合判断：比和之象，顺势而为，无需强求")
        elif ji_level == 2:
            parts.append("综合判断：小吉之象，事可成但需克服困难，宜坚持")
        elif ji_level == 3:
            parts.append("综合判断：小凶之象，泄气耗损，宜守不宜攻，或调整策略")
        elif ji_level == 4:
            parts.append("综合判断：大凶之象，外力压制，宜静观其变，不宜轻举妄动")

        return "\n".join(parts)

    # ================================================================
    # 五、辅助方法
    # ================================================================

    def get_bagua_wuxing(self, gua_name: str) -> str:
        """获取八卦五行"""
        return BAGUA_WUXING.get(gua_name, "")

    def get_bagua_xiang(self, gua_name: str) -> Optional[Tuple[int, ...]]:
        """获取八卦卦象"""
        return BAGUA_XIANG.get(gua_name)

    def get_xian_tian_num(self, gua_name: str) -> int:
        """获取八卦先天数"""
        return self.XIAN_TIAN_NUM_REVERSE.get(gua_name, 0)


# 便捷函数
_meihua_instance = MeiHua()


def gua_by_numbers(num1: int, num2: int, num3: int) -> Dict[str, Any]:
    """便捷函数：三数法起卦"""
    return _meihua_instance.gua_by_numbers(num1, num2, num3)


def gua_by_date_time(year: int, month: int, day: int, hour: int = 0) -> Dict[str, Any]:
    """便捷函数：年月日时法起卦"""
    return _meihua_instance.gua_by_date_time(year, month, day, hour)