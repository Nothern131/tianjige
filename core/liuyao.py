# -*- coding: utf-8 -*-
"""
天机阁 - 六爻纳甲筮法模块
铜钱起卦 → 纳甲装卦 → 世应定位 → 六亲配属 → 六兽安布 → 动爻变化 → 解卦
"""
import random
import logging
from typing import Dict, List, Optional, Tuple, Any

from .constants import (
    GAN, ZHI, GAN_WUXING, ZHI_WUXING, WUXING,
    WUXING_SHENG, WUXING_SHENG_BY, WUXING_KE, WUXING_KE_BY,
    BAGUA_XIANG, BAGUA_WUXING,
    LIUSHISI_GUA_XIANG, LIUSHISI_GUA_NAMES, LIUSHISI_GUA_GUACI,
    LIUSHISI_GUA_SHANGGUA, LIUSHISI_GUA_XIAGUA,
    NAJIA_GAN, NAJIA_ZHI, GUA_SHI_YAO, GUA_YING_YAO, GUA_TO_GONG,
    BAGONG_GUA, LIUSHOU, LIUSHOU_QI, LIUSHOU_ORDER,
    LIUQIN_NAMES,
)

logger = logging.getLogger(__name__)


class LiuYao:
    """六爻纳甲筮法：铜钱起卦，装卦，解卦"""

    def __init__(self):
        """初始化六爻实例"""
        pass

    # ================================================================
    # 一、起卦
    # ================================================================

    def shake_coins(self) -> int:
        """
        模拟铜钱起卦：三枚铜钱抛一次
        三个正面(字) = 老阳 = 9 (动爻 ○)
        两正一反       = 少阳 = 7 (静爻 —)
        一正两反       = 少阴 = 8 (静爻 - -)
        三个反面(背)   = 老阴 = 6 (动爻 ×)

        Returns:
            爻值：6(老阴)、7(少阳)、8(少阴)、9(老阳)
        """
        # 三枚铜钱，每枚正面为3，反面为2
        coins = [random.choice([2, 3]) for _ in range(3)]
        total = sum(coins)
        # 6=老阴(三个背), 7=少阳(两正一反), 8=少阴(一正两反), 9=老阳(三个正)
        return total

    def get_gua_by_coins(self) -> Dict[str, Any]:
        """
        铜钱法起卦：抛六次，从初爻到上爻

        Returns:
            起卦结果字典，包含六爻值、本卦、变卦、动爻等信息
        """
        # 抛六次，从初爻(第1次)到上爻(第6次)
        yao_values = []
        for i in range(6):
            val = self.shake_coins()
            yao_values.append(val)

        return self._build_gua_from_yao(yao_values)

    def get_gua_by_number(self, num1: int, num2: int, num3: int) -> Dict[str, Any]:
        """
        数字法起卦（三数法）
        num1 定上卦，num2 定下卦，num3 定动爻

        Args:
            num1: 第一个数字（定上卦）
            num2: 第二个数字（定下卦）
            num3: 第三个数字（定动爻）

        Returns:
            起卦结果字典
        """
        # 上卦：num1 % 8，余数0为坤(8)
        shang_num = num1 % 8
        if shang_num == 0:
            shang_num = 8
        # 下卦：num2 % 8
        xia_num = num2 % 8
        if xia_num == 0:
            xia_num = 8
        # 动爻：num3 % 6，余数0为6爻
        dong_yao = num3 % 6
        if dong_yao == 0:
            dong_yao = 6

        # 先天八卦数：乾1兑2离3震4巽5坎6艮7坤8
        xiantian = {1: "乾", 2: "兑", 3: "离", 4: "震", 5: "巽", 6: "坎", 7: "艮", 8: "坤"}
        shang_gua = xiantian[shang_num]
        xia_gua = xiantian[xia_num]

        # 构建六爻卦象
        shang_xiang = BAGUA_XIANG[shang_gua]  # 上卦三爻
        xia_xiang = BAGUA_XIANG[xia_gua]      # 下卦三爻
        yao_xiang = list(xia_xiang) + list(shang_xiang)  # 从初爻到上爻

        # 转换为铜钱值（阳爻=7, 阴爻=8, 动爻位置特殊处理）
        yao_values = []
        for i, y in enumerate(yao_xiang):
            if i + 1 == dong_yao:
                # 动爻：阳爻变老阳(9)，阴爻变老阴(6)
                yao_values.append(9 if y == 1 else 6)
            else:
                yao_values.append(7 if y == 1 else 8)

        return self._build_gua_from_yao(yao_values)

    def _build_gua_from_yao(self, yao_values: List[int]) -> Dict[str, Any]:
        """根据六爻值构建卦象数据"""
        # 本卦阴阳爻（阳=1，阴=0）
        original_yao = [(1 if v in (7, 9) else 0) for v in yao_values]
        # 动爻位置（老阳9或老阴6）
        dong_yao_positions = [i + 1 for i, v in enumerate(yao_values) if v in (6, 9)]

        # 变卦阴阳爻（动爻翻转）
        changed_yao = []
        for i, y in enumerate(original_yao):
            if (i + 1) in dong_yao_positions:
                changed_yao.append(1 - y)  # 翻转
            else:
                changed_yao.append(y)

        # 识别本卦名
        original_name = self._identify_gua(original_yao)
        changed_name = self._identify_gua(changed_yao)

        # 纳甲装卦
        najia = self._apply_najia(original_yao, original_name)

        # 世应定位
        shi_yao = GUA_SHI_YAO.get(original_name, 3)
        ying_yao = GUA_YING_YAO.get(original_name, 6)

        # 六亲
        liu_qin = self._get_liuqin(original_name, najia)

        # 六兽（以日干起，此处用默认甲日青龙起）
        liu_shou = self._get_liushou("甲")

        # 解卦
        interpretation = self._interpret(original_name, changed_name, dong_yao_positions, shi_yao, ying_yao, liu_qin)

        return {
            "gua_name": original_name,
            "original_gua": {
                "name": original_name,
                "yao": original_yao,
                "yao_values": yao_values,
            },
            "changed_gua": {
                "name": changed_name,
                "yao": changed_yao,
            } if changed_name != original_name else None,
            "shi_yao": shi_yao,
            "ying_yao": ying_yao,
            "dong_yao": dong_yao_positions,
            "liu_qin": liu_qin,
            "liu_shou": liu_shou,
            "najia": najia,
            "interpretation": interpretation,
        }

    def _identify_gua(self, yao: List[int]) -> str:
        """根据六爻阴阳识别卦名"""
        yao_tuple = tuple(yao)
        for name, xiang in LIUSHISI_GUA_XIANG.items():
            if xiang == yao_tuple:
                return name
        return "未知卦"

    # ================================================================
    # 二、纳甲
    # ================================================================

    def _apply_najia(self, yao: List[int], gua_name: str) -> List[Dict[str, str]]:
        """
        八宫卦纳天干地支

        Returns:
            六爻纳甲列表，每爻包含 {纳干, 纳支, 干支}
        """
        gong_name, idx = GUA_TO_GONG.get(gua_name, (None, None))
        if gong_name is None:
            # 未知卦，返回空
            return [{"纳干": "", "纳支": "", "干支": ""} for _ in range(6)]

        # 获取该宫卦的纳支基准
        zhi_base = NAJIA_ZHI.get(gong_name, ["子", "寅", "辰", "午", "申", "戌"])
        gan_pair = NAJIA_GAN.get(gong_name, ("甲", "壬"))

        # 内卦(初爻到三爻)纳第一个天干，外卦(四爻到上爻)纳第二个天干
        result = []
        for i in range(6):
            zhi = zhi_base[i]
            if i < 3:
                gan = gan_pair[0]
            else:
                gan = gan_pair[1]
            result.append({
                "纳干": gan,
                "纳支": zhi,
                "干支": f"{gan}{zhi}",
            })
        return result

    # ================================================================
    # 三、六亲
    # ================================================================

    def _get_liuqin(self, gua_name: str, najia: List[Dict[str, str]]) -> List[str]:
        """
        以卦宫五行为"我"，各爻纳支五行定六亲

        Returns:
            六亲列表（从初爻到上爻）
        """
        gong_name, _ = GUA_TO_GONG.get(gua_name, (None, None))
        if gong_name is None:
            return ["兄弟"] * 6

        # 卦宫五行 = "我"
        wo_wx = BAGUA_WUXING.get(gong_name, "土")

        liuqin = []
        for yao in najia:
            zhi = yao.get("纳支", "")
            zhi_wx = ZHI_WUXING.get(zhi, "土")

            if zhi_wx == wo_wx:
                liuqin.append("兄弟")
            elif WUXING_SHENG.get(zhi_wx) == wo_wx:
                # 爻生我 → 父母
                liuqin.append("父母")
            elif WUXING_SHENG_BY.get(zhi_wx) == wo_wx:
                # 我生爻 → 子孙
                liuqin.append("子孙")
            elif WUXING_KE.get(zhi_wx) == wo_wx:
                # 爻克我 → 官鬼
                liuqin.append("官鬼")
            elif WUXING_KE_BY.get(zhi_wx) == wo_wx:
                # 我克爻 → 妻财
                liuqin.append("妻财")
            else:
                liuqin.append("兄弟")

        return liuqin

    # ================================================================
    # 四、六兽（六神）
    # ================================================================

    def _get_liushou(self, day_gan: str) -> List[str]:
        """
        以日干起六兽，从初爻到上爻

        甲乙起青龙、丙丁起朱雀、戊起勾陈、己起螣蛇、庚辛起白虎、壬癸起玄武

        Args:
            day_gan: 日干

        Returns:
            六兽列表（从初爻到上爻）
        """
        start_shou = LIUSHOU_QI.get(day_gan, "青龙")
        start_idx = LIUSHOU_ORDER.index(start_shou)
        return [LIUSHOU_ORDER[(start_idx + i) % 6] for i in range(6)]

    # ================================================================
    # 五、动爻变化
    # ================================================================

    def get_changed_yao(self, yao_values: List[int]) -> List[int]:
        """
        动爻变化：老阳(9)变阴，老阴(6)变阳

        Args:
            yao_values: 六爻值列表

        Returns:
            变化后的六爻值列表
        """
        changed = []
        for v in yao_values:
            if v == 9:
                changed.append(8)  # 老阳变少阴
            elif v == 6:
                changed.append(7)  # 老阴变少阳
            else:
                changed.append(v)
        return changed

    # ================================================================
    # 六、解卦
    # ================================================================

    def _interpret(self, original_name: str, changed_name: str,
                   dong_yao: List[int], shi_yao: int, ying_yao: int,
                   liu_qin: List[str]) -> str:
        """生成解卦文字"""
        parts = []

        # 卦名
        parts.append(f"本卦：{original_name}")
        guaci = LIUSHISI_GUA_GUACI.get(original_name, "")
        if guaci:
            parts.append(f"卦辞：{guaci}")

        # 世应
        parts.append(f"世爻：第{shi_yao}爻（{liu_qin[shi_yao - 1] if shi_yao <= len(liu_qin) else '兄弟'}），应爻：第{ying_yao}爻")

        # 动爻
        if dong_yao:
            parts.append(f"动爻：第{'、'.join(str(d) for d in dong_yao)}爻")
            if changed_name and changed_name != original_name:
                parts.append(f"变卦：{changed_name}")
        else:
            parts.append("静卦，无动爻")

        # 六亲分析
        shi_qin = liu_qin[shi_yao - 1] if shi_yao <= len(liu_qin) else "兄弟"
        parts.append(f"世爻六亲为{shi_qin}，代表问卦者自身状态")

        # 用神提示（简略）
        yong_shen_hint = {
            "父母": "文书、长辈、房屋、考试",
            "兄弟": "朋友、同辈、竞争、破财",
            "妻财": "财运、妻子、货物、饮食",
            "官鬼": "官运、疾病、盗贼、丈夫",
            "子孙": "子嗣、医药、宠物、解忧",
        }
        parts.append(f"世爻{shi_qin}主：{yong_shen_hint.get(shi_qin, '')}")

        return "\n".join(parts)

    # ================================================================
    # 七、六十四卦信息查询
    # ================================================================

    def get_gua_info(self, gua_name: str) -> Optional[Dict]:
        """获取指定卦的完整信息"""
        if gua_name not in LIUSHISI_GUA_XIANG:
            return None

        yao = LIUSHISI_GUA_XIANG[gua_name]
        shi_yao = GUA_SHI_YAO.get(gua_name, 0)
        ying_yao = GUA_YING_YAO.get(gua_name, 0)
        gong_name, idx = GUA_TO_GONG.get(gua_name, (None, None))

        return {
            "name": gua_name,
            "yao": yao,
            "shang_gua": LIUSHISI_GUA_SHANGGUA.get(gua_name, ""),
            "xia_gua": LIUSHISI_GUA_XIAGUA.get(gua_name, ""),
            "guaci": LIUSHISI_GUA_GUACI.get(gua_name, ""),
            "gong": gong_name,
            "shi_yao": shi_yao,
            "ying_yao": ying_yao,
            "gong_wuxing": BAGUA_WUXING.get(gong_name, "") if gong_name else "",
        }

    def get_all_gua_names(self) -> List[str]:
        """获取所有六十四卦名"""
        return list(LIUSHISI_GUA_XIANG.keys())


# 便捷函数
_liuyao_instance = LiuYao()


def get_gua_by_number(num1: int, num2: int, num3: int) -> Dict[str, Any]:
    """便捷函数：数字法起卦"""
    return _liuyao_instance.get_gua_by_number(num1, num2, num3)


def get_gua_by_coins() -> Dict[str, Any]:
    """便捷函数：铜钱法起卦"""
    return _liuyao_instance.get_gua_by_coins()