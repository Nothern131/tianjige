# -*- coding: utf-8 -*-
"""
天机阁 - 农历日历模块
封装 lunar-python 库，提供农历、干支、节气、大运等查询功能
"""
import logging
from typing import Dict, List, Optional, Tuple

from .constants import (
    GAN, ZHI, SIXTY_JIAZI, JIAZI_INDEX,
    JIEQI, SHICHEN_ZHI, WUHUDUN, WUSHUDUN,
    GAN_INDEX, ZHI_INDEX,
    get_wuhudun_month_gan, get_wushudun_hour_gan,
)

logger = logging.getLogger(__name__)

# 尝试导入 lunar_python 库
try:
    from lunar_python import Lunar, Solar, HolidayUtil
    LUNAR_AVAILABLE = True
except ImportError:
    logger.warning("lunar-python 库未安装，将使用简化算法替代")
    LUNAR_AVAILABLE = False


class ChineseCalendar:
    """中文农历日历类，封装 lunar-python 库的核心功能"""

    def __init__(self):
        """初始化日历实例"""
        self._lunar_available = LUNAR_AVAILABLE

    # ---- 基础干支推算（不依赖 lunar-python） ----

    def _get_year_ganzhi(self, year: int) -> str:
        """根据公历年份推算年干支（简化算法，以立春为界）"""
        # 1900年立春后为庚子年，以此推算
        base_year = 1900
        base_ganzhi = "庚子"
        base_idx = JIAZI_INDEX.get(base_ganzhi, 0)
        offset = year - base_year
        idx = (base_idx + offset) % 60
        return SIXTY_JIAZI[idx]

    def _get_month_ganzhi(self, year_gan: str, month_zhi: str) -> str:
        """根据年干和月支（寅月为正月）推算月干支，使用五虎遁算法"""
        gan = get_wuhudun_month_gan(year_gan, month_zhi)
        if not gan:
            return ""
        return f"{gan}{month_zhi}"

    def _get_day_ganzhi_simple(self, year: int, month: int, day: int) -> str:
        """根据公历日期推算日干支（简化算法，基于已知基准日）"""
        # 以1900年1月1日（甲戌日）为基准
        base_year, base_month, base_day = 1900, 1, 1
        base_ganzhi = "甲戌"
        base_idx = JIAZI_INDEX.get(base_ganzhi, 0)

        # 计算总天数（简化：不考虑闰年细节，只做近似）
        days = (year - base_year) * 365
        # 加上闰年多出的天数
        for y in range(base_year, year):
            if (y % 4 == 0 and y % 100 != 0) or (y % 400 == 0):
                days += 1
        # 加上当年已过天数
        month_days = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
        if (year % 4 == 0 and year % 100 != 0) or (year % 400 == 0):
            month_days[2] = 29
        for m in range(1, month):
            days += month_days[m]
        days += day - 1

        idx = (base_idx + days) % 60
        return SIXTY_JIAZI[idx]

    def _get_hour_ganzhi(self, day_gan: str, hour: int) -> str:
        """根据日干和小时数推算时干支，使用五鼠遁算法"""
        hour_zhi = SHICHEN_ZHI.get(hour, "子")
        gan = get_wushudun_hour_gan(day_gan, hour_zhi)
        if not gan:
            return ""
        return f"{gan}{hour_zhi}"

    # ---- 公开接口 ----

    def get_day_ganzhi(self, year: int, month: int, day: int) -> str:
        """
        获取指定公历日期的日干支

        Args:
            year: 公历年
            month: 公历月
            day: 公历日

        Returns:
            日干支字符串，如 "甲子"
        """
        if self._lunar_available:
            try:
                solar = Solar.fromYmd(year, month, day)
                lunar = solar.getLunar()
                return lunar.getDayInGanZhi()
            except Exception as e:
                logger.warning("lunar-python 获取日干支失败: %s，使用简化算法", e)

        return self._get_day_ganzhi_simple(year, month, day)

    def get_year_ganzhi(self, year: int) -> str:
        """
        获取年干支

        Args:
            year: 公历年

        Returns:
            年干支字符串
        """
        if self._lunar_available:
            try:
                solar = Solar.fromYmd(year, 6, 15)
                lunar = solar.getLunar()
                return lunar.getYearInGanZhi()
            except Exception as e:
                logger.warning("lunar-python 获取年干支失败: %s", e)

        return self._get_year_ganzhi(year)

    def get_month_ganzhi(self, year: int, month: int, day: int) -> str:
        """
        获取月干支（以节气为界）

        Args:
            year: 公历年
            month: 公历月
            day: 公历日

        Returns:
            月干支字符串
        """
        if self._lunar_available:
            try:
                solar = Solar.fromYmd(year, month, day)
                lunar = solar.getLunar()
                return lunar.getMonthInGanZhi()
            except Exception as e:
                logger.warning("lunar-python 获取月干支失败: %s", e)

        # 简化算法：以节气为界
        year_gan = self._get_year_ganzhi(year)[0]
        # 确定月支
        month_zhi = self._get_month_zhi_by_solar_term(year, month, day)
        return self._get_month_ganzhi(year_gan, month_zhi)

    def _get_month_zhi_by_solar_term(self, year: int, month: int, day: int) -> str:
        """根据日期近似确定月支（简化：按公历月份近似）"""
        # 简化规则：公历2月≈寅月...1月≈丑月
        # 立春约在2月4日，以此为界
        month_zhi_map = {
            2: "寅", 3: "卯", 4: "辰", 5: "巳", 6: "午",
            7: "未", 8: "申", 9: "酉", 10: "戌", 11: "亥", 12: "子", 1: "丑",
        }
        # 立春前仍属上年丑月
        if month == 2 and day < 4:
            return "丑"
        if month == 1:
            return "丑"
        return month_zhi_map.get(month, "寅")

    def get_hour_ganzhi(self, year: int, month: int, day: int, hour: int) -> str:
        """
        获取时干支

        Args:
            year: 公历年
            month: 公历月
            day: 公历日
            hour: 小时（0-23）

        Returns:
            时干支字符串
        """
        if self._lunar_available:
            try:
                solar = Solar.fromYmdHms(year, month, day, hour, 0, 0)
                lunar = solar.getLunar()
                return lunar.getTimeInGanZhi()
            except Exception as e:
                logger.warning("lunar-python 获取时干支失败: %s", e)

        day_ganzhi = self._get_day_ganzhi_simple(year, month, day)
        day_gan = day_ganzhi[0] if day_ganzhi else "甲"
        return self._get_hour_ganzhi(day_gan, hour)

    def get_full_bazi(self, year: int, month: int, day: int, hour: int) -> Dict[str, str]:
        """
        获取完整八字（四柱）

        Args:
            year: 公历年
            month: 公历月
            day: 公历日
            hour: 小时（0-23）

        Returns:
            包含年柱、月柱、日柱、时柱的字典
        """
        return {
            "年柱": self.get_year_ganzhi(year),
            "月柱": self.get_month_ganzhi(year, month, day),
            "日柱": self.get_day_ganzhi(year, month, day),
            "时柱": self.get_hour_ganzhi(year, month, day, hour),
        }

    def get_solar_term(self, year: int) -> List[Dict]:
        """
        获取指定年份的所有节气

        Args:
            year: 公历年

        Returns:
            节气列表，每项包含名称、日期等信息
        """
        if self._lunar_available:
            try:
                terms = []
                for jq_info in JIEQI:
                    jq_name = jq_info[0]
                    jq_month = jq_info[1]
                    jq_type = jq_info[2]
                    # 使用 lunar-python 获取精确节气日期
                    jq = Solar.fromYmd(year, jq_month, 1)
                    lunar_jq = jq.getLunar()
                    jie_qi = lunar_jq.getJieQi()
                    # 在节气表中查找
                    for jq_item in jie_qi.values():
                        if jq_name in str(jq_item):
                            # 提取日期
                            terms.append({
                                "name": jq_name,
                                "type": jq_type,
                                "solar": str(jq_item),
                            })
                            break
                return terms
            except Exception as e:
                logger.warning("lunar-python 获取节气失败: %s", e)

        # 返回简化节气信息
        return [{"name": jq[0], "type": jq[2], "month": jq[1]} for jq in JIEQI]

    def get_lunar_date(self, year: int, month: int, day: int) -> Dict:
        """
        获取农历日期信息

        Args:
            year: 公历年
            month: 公历月
            day: 公历日

        Returns:
            农历日期信息字典
        """
        if self._lunar_available:
            try:
                solar = Solar.fromYmd(year, month, day)
                lunar = solar.getLunar()
                return {
                    "农历年": lunar.getYear(),
                    "农历月": lunar.getMonth(),
                    "农历日": lunar.getDay(),
                    "是否闰月": lunar.isLeap(),
                    "农历月名": lunar.getMonthInChinese(),
                    "农历日名": lunar.getDayInChinese(),
                    "年干支": lunar.getYearInGanZhi(),
                    "月干支": lunar.getMonthInGanZhi(),
                    "日干支": lunar.getDayInGanZhi(),
                    "生肖": lunar.getYearShengXiao(),
                    "星座": solar.getXingZuo(),
                }
            except Exception as e:
                logger.warning("lunar-python 获取农历信息失败: %s", e)

        # 简化返回
        return {
            "农历年": year,
            "农历月": month,
            "农历日": day,
            "年干支": self._get_year_ganzhi(year),
            "日干支": self._get_day_ganzhi_simple(year, month, day),
        }

    def get_yun_info(self, year: int, month: int, day: int, hour: int,
                     gender: str) -> Dict:
        """
        获取大运信息（起运方向和起运年龄）

        Args:
            year: 公历年（出生年）
            month: 公历月（出生月）
            day: 公历日（出生日）
            hour: 出生小时（0-23）
            gender: 性别，"男"或"女"

        Returns:
            大运信息字典，包含起运方向、起运年龄等
        """
        # 获取年柱
        year_ganzhi = self.get_year_ganzhi(year)
        year_gan = year_ganzhi[0] if year_ganzhi else "甲"
        year_zhi = year_ganzhi[1] if len(year_ganzhi) > 1 else "子"

        # 判断年干阴阳：甲丙戊庚壬为阳年
        yang_gan = {"甲", "丙", "戊", "庚", "壬"}
        is_yang_year = year_gan in yang_gan

        # 阳年男/阴年女 → 顺排；阳年女/阴年男 → 逆排
        is_male = gender == "男"
        if (is_yang_year and is_male) or (not is_yang_year and not is_male):
            direction = "顺排"  # 大运顺行
        else:
            direction = "逆排"  # 大运逆行

        # 获取月柱，确定起运点
        month_ganzhi = self.get_month_ganzhi(year, month, day)
        month_zhi = month_ganzhi[1] if len(month_ganzhi) > 1 else "寅"

        # 计算起运年龄（简化：按出生日到最近节气的天数÷3）
        # 此处使用简化算法，精确计算需用 lunar-python 获取节气精确日期
        start_age = 1  # 默认起运年龄
        if self._lunar_available:
            try:
                solar = Solar.fromYmdHms(year, month, day, hour, 0, 0)
                lunar = solar.getLunar()
                # 八字运程信息
                yun = lunar.getEightChar().getYun(gender == "男" and 1 or 0)
                start_age = yun.getStartYear()
                dayun_list = [yun.getDaYun()[i].getGanZhi() for i in range(min(8, len(yun.getDaYun())))]
            except Exception as e:
                logger.warning("lunar-python 获取大运信息失败: %s", e)
                dayun_list = []
        else:
            dayun_list = []

        return {
            "出生年月日时": f"{year}年{month}月{day}日{hour}时",
            "性别": gender,
            "年柱": year_ganzhi,
            "年干阴阳": "阳" if is_yang_year else "阴",
            "大运方向": direction,
            "起运年龄": start_age,
            "大运列表": dayun_list,
        }

    def get_ri_zhu(self, year: int, month: int, day: int) -> str:
        """获取日柱（别名）"""
        return self.get_day_ganzhi(year, month, day)


# 便捷函数
_calendar_instance = ChineseCalendar()


def get_day_ganzhi(year: int, month: int, day: int) -> str:
    """便捷函数：获取日干支"""
    return _calendar_instance.get_day_ganzhi(year, month, day)


def get_full_bazi(year: int, month: int, day: int, hour: int) -> Dict[str, str]:
    """便捷函数：获取完整八字"""
    return _calendar_instance.get_full_bazi(year, month, day, hour)