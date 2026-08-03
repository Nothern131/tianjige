# -*- coding: utf-8 -*-
"""
天机阁 - 太乙神数模块
太乙积年 → 太乙十六神定位 → 五福三基 → 计神始击 → 太乙格局
"""
import logging
from typing import Dict, List, Optional, Tuple, Any

from .constants import (
    GAN, ZHI, ZHI_INDEX,
    TAIYI_SHISHEN, TAIYI_SHISHEN_ZHI, TAIYI_SHISHEN_JIXIONG,
    BAGUA_HOUTIAN, JIUGONG, JIUGONG_DIRECTION,
)

logger = logging.getLogger(__name__)


class TaiYi:
    """太乙神数：太乙积年计算、十六神定位、五福三基"""

    # 太乙积年基准：公元0年为太乙积年第10153937年
    # 简化：以公元1900年为基准，积年约10155837
    TAIYI_BASE_YEAR = 1900
    TAIYI_BASE_JI = 10155837

    # 太乙运行周期：72年一周期，满72年入下一纪
    TAIYI_CYCLE = 72

    # 十六神与地支的映射顺序
    SHISHEN_DIZHI_ORDER = [
        ("子", "地主"), ("丑", "阳德"), ("艮", "和德"), ("寅", "吕申"),
        ("卯", "高丛"), ("辰", "太阳"), ("巽", "大炅"), ("巳", "大神"),
        ("午", "大威"), ("未", "天道"), ("坤", "大武"), ("申", "武德"),
        ("酉", "太簇"), ("戌", "阴主"), ("乾", "阴德"), ("亥", "大义"),
    ]

    def __init__(self):
        """初始化太乙神数实例"""
        pass

    # ================================================================
    # 一、太乙积年计算
    # ================================================================

    def get_taiyi_ji_nian(self, year: int) -> int:
        """
        计算太乙积年数

        太乙积年 = 基准积年 + (当前年 - 基准年)

        Args:
            year: 公历年

        Returns:
            太乙积年数
        """
        return self.TAIYI_BASE_JI + (year - self.TAIYI_BASE_YEAR)

    def get_taiyi_cycle_info(self, year: int) -> Dict[str, int]:
        """
        计算太乙周期信息

        Args:
            year: 公历年

        Returns:
            周期信息字典
        """
        ji_nian = self.get_taiyi_ji_nian(year)
        # 入纪元数（72年一周期）
        cycle_num = ji_nian // self.TAIYI_CYCLE
        # 入纪年数（当前周期内的第几年，1-72）
        cycle_year = ji_nian % self.TAIYI_CYCLE
        if cycle_year == 0:
            cycle_year = self.TAIYI_CYCLE

        return {
            "太乙积年": ji_nian,
            "入纪元数": cycle_num,
            "入纪年数": cycle_year,
        }

    # ================================================================
    # 二、太乙十六神定位
    # ================================================================

    def get_taiyi_position(self, year: int) -> Dict[str, Any]:
        """
        计算太乙所在宫位和对应的十六神

        太乙行宫：从乾宫起，每3年移一宫，24年一周
        简化算法：太乙积年 % 24 定宫位

        Args:
            year: 公历年

        Returns:
            太乙位置信息
        """
        ji_nian = self.get_taiyi_ji_nian(year)

        # 太乙24年周期：乾→午→艮→卯→子→酉→坤→戌...（简化）
        # 太乙行宫次序：乾1→午2→艮3→卯4→子5→酉6→坤7→戌8...
        # 此处用简化算法：积年 % 24 确定宫位
        pos = ji_nian % 24
        if pos == 0:
            pos = 24

        # 太乙行宫表（24宫，每宫对应一个卦位/地支）
        taiyi_gong_table = [
            "乾", "午", "艮", "卯", "子", "酉", "坤", "戌",
            "巽", "辰", "亥", "巳", "乾", "午", "艮", "卯",
            "子", "酉", "坤", "戌", "巽", "辰", "亥", "巳",
        ]
        gong_name = taiyi_gong_table[pos - 1]

        # 确定十六神
        # 太乙在乾宫 → 阴德，在午宫 → 大威，在艮宫 → 和德 等
        gong_to_shishen = {
            "乾": "阴德", "午": "大威", "艮": "和德", "卯": "高丛",
            "子": "地主", "酉": "太簇", "坤": "大武", "戌": "阴主",
            "巽": "大炅", "辰": "太阳", "亥": "大义", "巳": "大神",
        }
        shishen = gong_to_shishen.get(gong_name, "地主")

        jixiong = TAIYI_SHISHEN_JIXIONG.get(shishen, "")

        return {
            "太乙宫位": gong_name,
            "十六神": shishen,
            "吉凶": jixiong,
            "太乙积年": ji_nian,
        }

    def get_shishen_positions(self, year: int) -> List[Dict[str, str]]:
        """
        计算十六神在当年各宫位的位置

        Args:
            year: 公历年

        Returns:
            十六神位置列表
        """
        ji_nian = self.get_taiyi_ji_nian(year)
        # 文昌起始位置（简化：积年 % 16 定起始）
        offset = ji_nian % 16

        positions = []
        for i in range(16):
            idx = (offset + i) % 16
            zhi_name, shen_name = self.SHISHEN_DIZHI_ORDER[idx]
            jixiong = TAIYI_SHISHEN_JIXIONG.get(shen_name, "")
            positions.append({
                "地支": zhi_name,
                "十六神": shen_name,
                "吉凶": jixiong,
            })

        return positions

    # ================================================================
    # 三、五福（君基、臣基、民基、五福、大游）
    # ================================================================

    def get_wufu(self, year: int) -> Dict[str, Dict[str, str]]:
        """
        计算五福位置

        五福包括：
        - 君基：主帝王气运
        - 臣基：主臣子气运
        - 民基：主百姓气运
        - 五福：主福禄
        - 大游：主灾祥

        Args:
            year: 公历年

        Returns:
            五福位置字典
        """
        ji_nian = self.get_taiyi_ji_nian(year)

        # 简化算法：各以不同周期计算
        # 君基：30年一周
        jun_ji = ji_nian % 30
        if jun_ji == 0:
            jun_ji = 30
        # 臣基：3年一周
        chen_ji = ji_nian % 3
        if chen_ji == 0:
            chen_ji = 3
        # 民基：12年一周
        min_ji = ji_nian % 12
        if min_ji == 0:
            min_ji = 12
        # 五福：45年一周
        wu_fu = ji_nian % 45
        if wu_fu == 0:
            wu_fu = 45
        # 大游：36年一周
        da_you = ji_nian % 36
        if da_you == 0:
            da_you = 36

        # 映射到地支（简化）
        zhi_list = ZHI

        return {
            "君基": {
                "地支": zhi_list[jun_ji % 12],
                "说明": "主帝王气运",
            },
            "臣基": {
                "地支": zhi_list[chen_ji % 12],
                "说明": "主臣子气运",
            },
            "民基": {
                "地支": zhi_list[min_ji % 12],
                "说明": "主百姓气运",
            },
            "五福": {
                "地支": zhi_list[wu_fu % 12],
                "说明": "主福禄吉祥",
            },
            "大游": {
                "地支": zhi_list[da_you % 12],
                "说明": "主灾祥变化",
            },
        }

    # ================================================================
    # 四、三基（君基、臣基、民基）
    # ================================================================

    def get_sanji(self, year: int) -> Dict[str, Dict[str, str]]:
        """
        计算三基位置

        Args:
            year: 公历年

        Returns:
            三基位置字典
        """
        ji_nian = self.get_taiyi_ji_nian(year)

        # 君基：30年移一宫，移宫方向为顺行
        # 臣基：3年移一宫
        # 民基：1年移一宫

        zhi_list = ZHI

        # 君基（30年一周）
        jun_ji_idx = (ji_nian // 30) % 12
        # 臣基（3年一周）
        chen_ji_idx = (ji_nian // 3) % 12
        # 民基（1年一周）
        min_ji_idx = ji_nian % 12

        return {
            "君基": {
                "地支": zhi_list[jun_ji_idx],
                "周期": "30年",
                "说明": "主帝王、国家气运",
            },
            "臣基": {
                "地支": zhi_list[chen_ji_idx],
                "周期": "3年",
                "说明": "主臣子、官员气运",
            },
            "民基": {
                "地支": zhi_list[min_ji_idx],
                "周期": "1年",
                "说明": "主百姓、民生气运",
            },
        }

    # ================================================================
    # 五、其他太乙神煞
    # ================================================================

    def get_jishen(self, year: int) -> Dict[str, str]:
        """
        计算计神位置

        计神：主计算、谋划，与太乙同宫则吉

        Args:
            year: 公历年

        Returns:
            计神位置
        """
        ji_nian = self.get_taiyi_ji_nian(year)
        zhi_idx = (ji_nian * 3) % 12
        return {
            "计神": ZHI[zhi_idx],
            "说明": "主计算谋划，与太乙同宫则吉",
        }

    def get_shiji(self, year: int) -> Dict[str, str]:
        """
        计算始击位置

        始击：主军事、攻击，与太乙相冲则不吉

        Args:
            year: 公历年

        Returns:
            始击位置
        """
        ji_nian = self.get_taiyi_ji_nian(year)
        zhi_idx = (ji_nian * 7) % 12
        return {
            "始击": ZHI[zhi_idx],
            "说明": "主军事攻击，与太乙相冲则凶",
        }

    def get_wenchang(self, year: int) -> Dict[str, str]:
        """
        计算文昌位置

        文昌：主文运、科举

        Args:
            year: 公历年

        Returns:
            文昌位置
        """
        ji_nian = self.get_taiyi_ji_nian(year)
        zhi_idx = (ji_nian * 5) % 12
        return {
            "文昌": ZHI[zhi_idx],
            "说明": "主文运昌盛、科举功名",
        }

    def get_zhudajiang(self, year: int) -> Dict[str, str]:
        """
        计算主大将位置

        主大将：主我方军事力量

        Args:
            year: 公历年

        Returns:
            主大将位置
        """
        ji_nian = self.get_taiyi_ji_nian(year)
        zhi_idx = (ji_nian * 4) % 12
        return {
            "主大将": ZHI[zhi_idx],
            "说明": "主我方军力，旺相则军力强盛",
        }

    def get_kedajiang(self, year: int) -> Dict[str, str]:
        """
        计算客大将位置

        客大将：主敌方军事力量

        Args:
            year: 公历年

        Returns:
            客大将位置
        """
        ji_nian = self.get_taiyi_ji_nian(year)
        zhi_idx = (ji_nian * 6) % 12
        return {
            "客大将": ZHI[zhi_idx],
            "说明": "主敌方军力，旺相则敌势强大",
        }

    # ================================================================
    # 六、完整太乙排盘
    # ================================================================

    def pai_pan(self, year: int) -> Dict[str, Any]:
        """
        太乙神数完整排盘

        Args:
            year: 公历年

        Returns:
            太乙排盘完整数据
        """
        # 太乙积年
        cycle_info = self.get_taiyi_cycle_info(year)

        # 太乙位置
        taiyi_pos = self.get_taiyi_position(year)

        # 十六神
        shishen = self.get_shishen_positions(year)

        # 五福
        wufu = self.get_wufu(year)

        # 三基
        sanji = self.get_sanji(year)

        # 计神
        jishen = self.get_jishen(year)

        # 始击
        shiji = self.get_shiji(year)

        # 文昌
        wenchang = self.get_wenchang(year)

        # 主大将
        zhu_dajiang = self.get_zhudajiang(year)

        # 客大将
        ke_dajiang = self.get_kedajiang(year)

        # 解读
        interpretation = self._interpret(taiyi_pos, cycle_info, wufu, sanji)

        return {
            "年份": year,
            "太乙积年": cycle_info,
            "太乙位置": taiyi_pos,
            "十六神": shishen,
            "五福": wufu,
            "三基": sanji,
            "计神": jishen,
            "始击": shiji,
            "文昌": wenchang,
            "主大将": zhu_dajiang,
            "客大将": ke_dajiang,
            "interpretation": interpretation,
        }

    # ================================================================
    # 七、解读
    # ================================================================

    def _interpret(self, taiyi_pos: Dict, cycle_info: Dict,
                   wufu: Dict, sanji: Dict) -> str:
        """生成太乙神数解读"""
        parts = []

        parts.append(f"太乙积年：{cycle_info.get('太乙积年', 0)}")
        parts.append(f"入纪元数：{cycle_info.get('入纪元数', 0)}，入纪年数：{cycle_info.get('入纪年数', 0)}")

        shishen = taiyi_pos.get("十六神", "")
        jixiong = taiyi_pos.get("吉凶", "")
        parts.append(f"太乙落宫：{taiyi_pos.get('太乙宫位', '')}，值{shishen}（{jixiong}）")

        if jixiong == "吉":
            parts.append("太乙值吉神，主天时顺遂，国运昌隆")
        else:
            parts.append("太乙值凶神，主天时有变，宜谨慎行事")

        # 五福简析
        wufu_zhi = {k: v.get("地支", "") for k, v in wufu.items()}
        parts.append(f"五福落宫：君基({wufu_zhi.get('君基', '')})、臣基({wufu_zhi.get('臣基', '')})、民基({wufu_zhi.get('民基', '')})、五福({wufu_zhi.get('五福', '')})、大游({wufu_zhi.get('大游', '')})")

        return "\n".join(parts)


# 便捷函数
_taiyi_instance = TaiYi()


def pai_pan(year: int) -> Dict[str, Any]:
    """便捷函数：太乙神数排盘"""
    return _taiyi_instance.pai_pan(year)


def get_taiyi_position(year: int) -> Dict[str, Any]:
    """便捷函数：获取太乙位置"""
    return _taiyi_instance.get_taiyi_position(year)