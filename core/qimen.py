# -*- coding: utf-8 -*-
"""
天机阁 - 奇门遁甲排盘模块
时家奇门排盘：阴阳遁 → 地盘 → 天盘 → 人盘 → 神盘 → 九宫格输出
"""
import logging
from typing import Dict, List, Optional, Tuple, Any

from .constants import (
    GAN, ZHI, GAN_INDEX, ZHI_INDEX,
    BAMEN, BAMEN_WUXING, BAMEN_JIXIONG,
    JIUXING, JIUXING_WUXING, JIUXING_JIXIONG, JIUXING_GONG,
    BASHEN_YANG, BASHEN_YIN, BASHEN_JIXIONG,
    JIUGONG, JIUGONG_DIRECTION,
    SANQI, LIUYI, YANGDUN_SHUN, YINDUN_NI,
    SIXTY_JIAZI, JIAZI_INDEX,
    SHICHEN_INDEX, SHICHEN_ZHI,
    BAGUA_HOUTIAN,
)

logger = logging.getLogger(__name__)


class QiMen:
    """时家奇门遁甲排盘"""

    # 九宫格后天八卦排布：坎1坤2震3巽4中5乾6兑7艮8离9
    # 九宫顺序（用于排盘）
    GONG_ORDER = [1, 2, 3, 4, 5, 6, 7, 8, 9]

    # 冬至-夏至间为阳遁局，夏至-冬至为阴遁局
    YANGDUN_MONTHS = [11, 12, 1, 2, 3, 4, 5]  # 冬至到夏至（约11月-5月）
    YINDUN_MONTHS = [5, 6, 7, 8, 9, 10]  # 夏至到冬至（约5月-10月）

    # 值符星对应：根据天干确定
    # 甲子戊 → 天蓬星值符，甲戌己 → 天芮星值符...以此类推
    ZHI_FU_MAP = {
        "戊": "天蓬", "己": "天芮", "庚": "天冲", "辛": "天辅",
        "壬": "天禽", "癸": "天心", "丁": "天柱", "丙": "天任", "乙": "天英",
    }

    def __init__(self):
        """初始化奇门遁甲排盘实例"""
        pass

    # ================================================================
    # 一、确定阴阳遁和局数
    # ================================================================

    def _get_dun_type(self, month: int, day: int) -> str:
        """
        判断当前是阳遁还是阴遁

        冬至（约12月22日）后阳遁，夏至（约6月22日）后阴遁

        Args:
            month: 公历月
            day: 公历日

        Returns:
            "阳遁" 或 "阴遁"
        """
        # 简化判断：以日期近似判断
        if (month == 12 and day >= 22) or month in (1, 2, 3, 4, 5) or (month == 6 and day < 22):
            return "阳遁"
        else:
            return "阴遁"

    def _get_ju_shu(self, year: int, month: int, day: int, hour: int) -> int:
        """
        根据年月日时确定局数（时家奇门）

        简化算法：根据日干支确定局数
        精确算法需查《奇门万年历》

        Args:
            year: 年
            month: 月
            day: 日
            hour: 时

        Returns:
            局数（1-9）
        """
        # 简化算法：用日干支序号确定局数
        # 日干支序号 % 9 取余，余数0为9局
        from .calendar import ChineseCalendar
        cal = ChineseCalendar()
        day_ganzhi = cal.get_day_ganzhi(year, month, day)
        ganzhi_idx = JIAZI_INDEX.get(day_ganzhi, 0)

        ju = (ganzhi_idx % 9) + 1
        if ju > 9:
            ju = ju % 9
            if ju == 0:
                ju = 9
        return ju

    # ================================================================
    # 二、排地盘（九宫八卦 + 三奇六仪）
    # ================================================================

    def _pai_di_pan(self, ju_shu: int, dun_type: str) -> Dict[int, str]:
        """
        排地盘：将三奇六仪按阴阳遁排入九宫

        阳遁顺排：戊1己2庚3辛4壬5癸6丁7丙8乙9
        阴遁逆排：戊1己9庚8辛7壬6癸5丁4丙3乙2

        Args:
            ju_shu: 局数
            dun_type: 阳遁/阴遁

        Returns:
            {宫数: 地盘干}
        """
        di_pan = {}
        if dun_type == "阳遁":
            order = YANGDUN_SHUN
        else:
            order = YINDUN_NI

        # 戊在局数对应的宫
        start_gong = ju_shu
        for i, gan in enumerate(order):
            gong = ((start_gong - 1 + i) % 9) + 1
            di_pan[gong] = gan

        return di_pan

    # ================================================================
    # 三、排天盘（九星 + 天盘干）
    # ================================================================

    def _pai_tian_pan(self, di_pan: Dict[int, str], hour_ganzhi: str,
                      ju_shu: int, dun_type: str) -> Dict[int, Dict[str, str]]:
        """
        排天盘：确定值符星，按九星顺序排布

        Args:
            di_pan: 地盘数据
            hour_ganzhi: 时干支
            ju_shu: 局数
            dun_type: 阳遁/阴遁

        Returns:
            {宫数: {天盘干, 九星}}
        """
        # 确定时干对应的地盘宫位（值符所在宫）
        hour_gan = hour_ganzhi[0] if hour_ganzhi else "甲"
        zhi_fu_gong = None
        for gong, gan in di_pan.items():
            if gan == hour_gan:
                zhi_fu_gong = gong
                break

        if zhi_fu_gong is None:
            zhi_fu_gong = ju_shu

        # 确定值符星
        di_pan_gan = di_pan.get(zhi_fu_gong, "戊")
        zhi_fu_xing = self.ZHI_FU_MAP.get(di_pan_gan, "天蓬")

        # 九星顺序（固定）：天蓬→天芮→天冲→天辅→天禽→天心→天柱→天任→天英
        xing_order = ["天蓬", "天芮", "天冲", "天辅", "天禽", "天心", "天柱", "天任", "天英"]
        zhi_fu_idx = xing_order.index(zhi_fu_xing)

        tian_pan = {}
        # 天盘干：值符星所在宫的天盘干=时干，其他宫按顺序排
        tian_gan_order = GAN  # 天干顺序
        hour_gan_idx = tian_gan_order.index(hour_gan)

        for i in range(9):
            if dun_type == "阳遁":
                gong = ((zhi_fu_gong - 1 + i) % 9) + 1
            else:
                gong = ((zhi_fu_gong - 1 - i) % 9 + 9) % 9 + 1

            xing = xing_order[(zhi_fu_idx + i) % 9]
            tian_gan = tian_gan_order[(hour_gan_idx + i) % 10]

            tian_pan[gong] = {
                "天盘干": tian_gan,
                "九星": xing,
            }

        return tian_pan

    # ================================================================
    # 四、排人盘（八门）
    # ================================================================

    def _pai_ren_pan(self, di_pan: Dict[int, str], hour_ganzhi: str,
                     dun_type: str) -> Dict[int, str]:
        """
        排人盘：八门以值使门为基准分布

        Args:
            di_pan: 地盘
            hour_ganzhi: 时干支
            dun_type: 阳遁/阴遁

        Returns:
            {宫数: 八门名}
        """
        # 确定值使门：时支对应的地盘宫
        hour_zhi = hour_ganzhi[1] if len(hour_ganzhi) > 1 else "子"
        hour_zhi_idx = SHICHEN_INDEX.get(hour_zhi, 0)

        # 值使门所在宫（简化：用时支序号映射到九宫）
        zhi_shi_gong = (hour_zhi_idx % 9) + 1

        # 八门顺序（固定）：休→生→伤→杜→景→死→惊→开
        men_order = ["休", "生", "伤", "杜", "景", "死", "惊", "开"]

        ren_pan = {}
        for i in range(8):
            if dun_type == "阳遁":
                gong = ((zhi_shi_gong - 1 + i) % 9) + 1
            else:
                gong = ((zhi_shi_gong - 1 - i) % 9 + 9) % 9 + 1

            # 中宫(5)寄坤宫(2)
            if gong == 5:
                gong = 2

            ren_pan[gong] = men_order[i]

        return ren_pan

    # ================================================================
    # 五、排神盘（八神）
    # ================================================================

    def _pai_shen_pan(self, zhi_fu_gong: int, dun_type: str) -> Dict[int, str]:
        """
        排神盘：八神以值符所在宫为起点

        Args:
            zhi_fu_gong: 值符星所在宫
            dun_type: 阳遁/阴遁

        Returns:
            {宫数: 八神名}
        """
        shen_order = BASHEN_YANG if dun_type == "阳遁" else BASHEN_YIN

        shen_pan = {}
        for i in range(8):
            if dun_type == "阳遁":
                gong = ((zhi_fu_gong - 1 + i) % 9) + 1
            else:
                gong = ((zhi_fu_gong - 1 - i) % 9 + 9) % 9 + 1

            if gong == 5:
                gong = 2  # 中宫寄坤宫

            shen_pan[gong] = shen_order[i]

        return shen_pan

    # ================================================================
    # 六、完整排盘
    # ================================================================

    def pai_pan(self, year: int, month: int, day: int, hour: int) -> Dict[str, Any]:
        """
        时家奇门遁甲完整排盘

        Args:
            year: 公历年
            month: 公历月
            day: 公历日
            hour: 小时（0-23）

        Returns:
            九宫格排盘数据
        """
        # 1. 确定阴阳遁
        dun_type = self._get_dun_type(month, day)

        # 2. 确定局数
        ju_shu = self._get_ju_shu(year, month, day, hour)

        # 3. 获取时干支
        from .calendar import ChineseCalendar
        cal = ChineseCalendar()
        hour_ganzhi = cal.get_hour_ganzhi(year, month, day, hour)

        # 4. 排地盘
        di_pan = self._pai_di_pan(ju_shu, dun_type)

        # 5. 排天盘
        tian_pan = self._pai_tian_pan(di_pan, hour_ganzhi, ju_shu, dun_type)

        # 6. 排人盘
        ren_pan = self._pai_ren_pan(di_pan, hour_ganzhi, dun_type)

        # 7. 排神盘（值符星所在宫）
        hour_gan = hour_ganzhi[0] if hour_ganzhi else "甲"
        zhi_fu_gong = ju_shu
        for gong, gan in di_pan.items():
            if gan == hour_gan:
                zhi_fu_gong = gong
                break
        shen_pan = self._pai_shen_pan(zhi_fu_gong, dun_type)

        # 8. 组装九宫格数据
        gong_ge = {}
        for gong in range(1, 10):
            gong_name = JIUGONG.get(gong, "中")
            direction = JIUGONG_DIRECTION.get(gong, "")

            di_gan = di_pan.get(gong, "")
            tp = tian_pan.get(gong, {})
            tian_gan = tp.get("天盘干", "")
            jiu_xing = tp.get("九星", "")
            ba_men = ren_pan.get(gong, "")
            ba_shen = shen_pan.get(gong, "")

            # 中宫寄坤宫
            if gong == 5:
                ba_men = ren_pan.get(2, "")
                ba_shen = shen_pan.get(2, "")

            xing_jx = JIUXING_JIXIONG.get(jiu_xing, "")
            men_jx = BAMEN_JIXIONG.get(ba_men, "")
            shen_jx = BASHEN_JIXIONG.get(ba_shen, "")

            gong_ge[gong] = {
                "宫名": gong_name,
                "方位": direction,
                "地盘干": di_gan,
                "天盘干": tian_gan,
                "八门": ba_men,
                "八门吉凶": men_jx,
                "九星": jiu_xing,
                "九星吉凶": xing_jx,
                "八神": ba_shen,
                "八神吉凶": shen_jx,
            }

        # 9. 生成解读
        interpretation = self._interpret(dun_type, ju_shu, hour_ganzhi, gong_ge)

        return {
            "排盘时间": f"{year}年{month}月{day}日{hour}时",
            "阴阳遁": dun_type,
            "局数": f"{dun_type}{ju_shu}局",
            "时干支": hour_ganzhi,
            "九宫格": gong_ge,
            "interpretation": interpretation,
        }

    # ================================================================
    # 七、解读
    # ================================================================

    def _interpret(self, dun_type: str, ju_shu: int,
                   hour_ganzhi: str, gong_ge: Dict) -> str:
        """生成排盘解读"""
        parts = []
        parts.append(f"时家奇门：{dun_type}{ju_shu}局")
        parts.append(f"时干支：{hour_ganzhi}")

        # 检查各宫吉凶
        ji_gong = []
        xiong_gong = []
        for gong, data in gong_ge.items():
            if gong == 5:
                continue
            men_jx = data.get("八门吉凶", "")
            shen_jx = data.get("八神吉凶", "")
            if men_jx == "吉" and shen_jx == "吉":
                ji_gong.append(f"{data['宫名']}({data['方位']})")
            elif men_jx == "凶" and shen_jx == "凶":
                xiong_gong.append(f"{data['宫名']}({data['方位']})")

        if ji_gong:
            parts.append(f"吉门吉神所在宫位：{'、'.join(ji_gong)}")
        if xiong_gong:
            parts.append(f"凶门凶神所在宫位：{'、'.join(xiong_gong)}")

        return "\n".join(parts)

    # ================================================================
    # 八、辅助查询
    # ================================================================

    def get_gong_info(self, gong_num: int) -> Optional[Dict]:
        """获取指定九宫信息"""
        if gong_num < 1 or gong_num > 9:
            return None
        return {
            "宫数": gong_num,
            "卦名": JIUGONG.get(gong_num, ""),
            "方位": JIUGONG_DIRECTION.get(gong_num, ""),
        }

    def get_bamen_info(self) -> List[Dict]:
        """获取八门信息"""
        return [
            {"name": m, "wuxing": BAMEN_WUXING.get(m, ""), "jixiong": BAMEN_JIXIONG.get(m, "")}
            for m in BAMEN
        ]

    def get_jiuxing_info(self) -> List[Dict]:
        """获取九星信息"""
        return [
            {
                "name": x, "wuxing": JIUXING_WUXING.get(x, ""),
                "jixiong": JIUXING_JIXIONG.get(x, ""), "gong": JIUXING_GONG.get(x, 0)
            }
            for x in JIUXING
        ]


# 便捷函数
_qimen_instance = QiMen()


def pai_pan(year: int, month: int, day: int, hour: int) -> Dict[str, Any]:
    """便捷函数：奇门遁甲排盘"""
    return _qimen_instance.pai_pan(year, month, day, hour)