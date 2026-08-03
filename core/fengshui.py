# -*- coding: utf-8 -*-
"""
天机阁 - 风水引擎模块（玄空飞星）
二十四山坐向 → 三元九运 → 运盘 → 山星向星 → 年星 → 九宫吉凶评估
"""
import logging
from datetime import datetime
from typing import Dict, List, Any, Optional

logger = logging.getLogger(__name__)


class FengShui:
    """玄空飞星风水：二十四山坐向、三元九运、九宫飞泊"""

    # ================================================================
    # 一、二十四山
    # ================================================================
    MOUNTAINS_24 = [
        '壬', '子', '癸', '丑', '艮', '寅', '甲', '卯', '乙', '辰', '巽', '巳',
        '丙', '午', '丁', '未', '坤', '申', '庚', '酉', '辛', '戌', '乾', '亥'
    ]

    MOUNTAIN_GUA = {
        '壬': '坎', '子': '坎', '癸': '坎',
        '丑': '艮', '艮': '艮', '寅': '艮',
        '甲': '震', '卯': '震', '乙': '震',
        '辰': '巽', '巽': '巽', '巳': '巽',
        '丙': '离', '午': '离', '丁': '离',
        '未': '坤', '坤': '坤', '申': '坤',
        '庚': '兑', '酉': '兑', '辛': '兑',
        '戌': '乾', '乾': '乾', '亥': '乾'
    }

    MOUNTAIN_YUAN = {
        '子': '天', '午': '天', '卯': '天', '酉': '天', '乾': '天', '坤': '天', '艮': '天', '巽': '天',
        '壬': '地', '甲': '地', '丙': '地', '庚': '地', '辰': '地', '戌': '地', '丑': '地', '未': '地',
        '癸': '人', '乙': '人', '丁': '人', '辛': '人', '寅': '人', '申': '人', '巳': '人', '亥': '人'
    }

    MOUNTAIN_YINYANG = {
        '子': '阳', '丑': '阴', '寅': '阳', '卯': '阴', '辰': '阳', '巳': '阴',
        '午': '阳', '未': '阴', '申': '阳', '酉': '阴', '戌': '阳', '亥': '阴',
        '壬': '阳', '癸': '阴', '甲': '阳', '乙': '阴', '丙': '阳', '丁': '阴',
        '庚': '阳', '辛': '阴', '乾': '阳', '坤': '阴', '艮': '阳', '巽': '阴'
    }

    # ================================================================
    # 二、九宫数据
    # ================================================================
    GONG_NAMES = [
        '坎一宫(北)', '坤二宫(西南)', '震三宫(东)', '巽四宫(东南)',
        '中五宫', '乾六宫(西北)', '兑七宫(西)', '艮八宫(东北)', '离九宫(南)'
    ]
    GONG_WUXING = ['水', '土', '木', '木', '土', '金', '金', '土', '火']
    GONG_GUA = ['坎', '坤', '震', '巽', '中', '乾', '兑', '艮', '离']

    # ================================================================
    # 三、九星数据
    # ================================================================
    STARS = {
        1: {'name': '一白贪狼', 'wuxing': '水', 'color': '#4a9eff', 'ji': '吉', 'desc': '桃花、人缘、智慧、文昌'},
        2: {'name': '二黑巨门', 'wuxing': '土', 'color': '#8b7355', 'ji': '凶', 'desc': '病符、疾病、伤痛、是非'},
        3: {'name': '三碧禄存', 'wuxing': '木', 'color': '#5a8a3c', 'ji': '凶', 'desc': '是非、官非、口舌、争斗'},
        4: {'name': '四绿文曲', 'wuxing': '木', 'color': '#7ec87e', 'ji': '中', 'desc': '文昌、学业、桃花、艺术'},
        5: {'name': '五黄廉贞', 'wuxing': '土', 'color': '#c8a000', 'ji': '大凶', 'desc': '灾祸、疾病、破财、意外'},
        6: {'name': '六白武曲', 'wuxing': '金', 'color': '#d4d4d4', 'ji': '吉', 'desc': '权力、官运、偏财、贵人'},
        7: {'name': '七赤破军', 'wuxing': '金', 'color': '#c04040', 'ji': '凶', 'desc': '破财、盗贼、口舌、手术'},
        8: {'name': '八白左辅', 'wuxing': '土', 'color': '#ffd700', 'ji': '吉', 'desc': '正财、置业、升职、旺丁'},
        9: {'name': '九紫右弼', 'wuxing': '火', 'color': '#ff6b6b', 'ji': '吉', 'desc': '喜庆、桃花、添丁、贵人'}
    }

    # ================================================================
    # 四、三元九运
    # ================================================================
    PERIODS = [
        (1864, 1883, 1), (1884, 1903, 2), (1904, 1923, 3),
        (1924, 1943, 4), (1944, 1963, 5), (1964, 1983, 6),
        (1984, 2003, 7), (2004, 2023, 8), (2024, 2043, 9),
    ]

    # 洛书飞泊轨迹：中→乾→兑→艮→离→坎→坤→震→巽
    FLY_PATH = [4, 5, 6, 7, 8, 0, 1, 2, 3]

    # 五行生克
    WX_SHENG = {'木': '水', '火': '木', '土': '火', '金': '土', '水': '金'}
    WX_KE = {'木': '金', '火': '水', '土': '木', '金': '火', '水': '土'}

    def __init__(self):
        """初始化风水引擎"""
        pass

    # ================================================================
    # 五、核心计算
    # ================================================================

    def get_period(self, year: int) -> int:
        """获取年份对应的元运数字"""
        for start, end, num in reversed(self.PERIODS):
            if start <= year <= end:
                return num
        return 9  # 默认九运

    def get_period_chart(self, period_num: int) -> List[int]:
        """计算某运的运盘（九宫飞星）"""
        chart = [0] * 9
        chart[4] = period_num  # 中宫
        for i in range(9):
            val = period_num + i
            if val > 9:
                val -= 9
            chart[self.FLY_PATH[i]] = val
        return chart

    def calc_mountain_and_facing_stars(
        self, sitting: str, facing: str, period_num: int
    ) -> Dict[str, Any]:
        """计算山星和向星"""
        period_chart = self.get_period_chart(period_num)

        sit_gua = self.MOUNTAIN_GUA.get(sitting, '坎')
        face_gua = self.MOUNTAIN_GUA.get(facing, '离')
        sit_gong_idx = self.GONG_GUA.index(sit_gua)
        face_gong_idx = self.GONG_GUA.index(face_gua)

        sit_period_star = period_chart[sit_gong_idx]
        face_period_star = period_chart[face_gong_idx]

        # 飞泊山星
        mountain_stars = [0] * 9
        mountain_stars[4] = sit_period_star
        for i in range(9):
            val = sit_period_star + i
            if val > 9:
                val -= 9
            mountain_stars[self.FLY_PATH[i]] = val

        # 飞泊向星
        facing_stars = [0] * 9
        facing_stars[4] = face_period_star
        for i in range(9):
            val = face_period_star + i
            if val > 9:
                val -= 9
            facing_stars[self.FLY_PATH[i]] = val

        return {
            'mountain_stars': mountain_stars,
            'facing_stars': facing_stars,
            'sit_gong_idx': sit_gong_idx,
            'face_gong_idx': face_gong_idx,
        }

    def get_annual_stars(self, year: int) -> List[int]:
        """计算年星飞泊"""
        base_year = 1900
        base_star = 1
        diff = year - base_year
        center_star = (base_star - diff) % 9
        if center_star <= 0:
            center_star += 9

        stars = [0] * 9
        stars[4] = center_star
        for i in range(9):
            val = center_star + i
            if val > 9:
                val -= 9
            stars[self.FLY_PATH[i]] = val
        return stars

    def evaluate_palace(
        self, period_star: int, mountain_star: int,
        facing_star: int, annual_star: int, gong_idx: int
    ) -> Dict[str, Any]:
        """评估单个宫位的吉凶"""
        score = 60
        notes = []
        warnings = []

        # 五黄检查
        if period_star == 5:
            score -= 15; warnings.append('运星五黄临宫')
        if mountain_star == 5:
            score -= 15; warnings.append('山星五黄临宫')
        if facing_star == 5:
            score -= 15; warnings.append('向星五黄临宫')
        if annual_star == 5:
            score -= 20; warnings.append('年星五黄临宫——今年此方位大凶')

        # 二黑病符
        if period_star == 2:
            score -= 8; warnings.append('运星二黑病符')
        if mountain_star == 2:
            score -= 8; warnings.append('山星二黑病符')
        if facing_star == 2:
            score -= 8; warnings.append('向星二黑病符')
        if annual_star == 2:
            score -= 10; warnings.append('年星二黑病符——今年注意健康')

        # 吉星加分
        if period_star == 8:
            score += 12; notes.append('运星八白旺财')
        if mountain_star == 8:
            score += 12; notes.append('山星八白旺丁')
        if facing_star == 8:
            score += 12; notes.append('向星八白旺财')
        if annual_star == 8:
            score += 10; notes.append('年星八白——今年财运佳')

        if period_star == 9:
            score += 10; notes.append('运星九紫喜庆')
        if mountain_star == 9:
            score += 10; notes.append('山星九紫旺丁')
        if facing_star == 9:
            score += 10; notes.append('向星九紫喜事')
        if annual_star == 9:
            score += 8; notes.append('年星九紫——今年喜事临门')

        if period_star == 1:
            score += 8; notes.append('运星一白文昌')
        if mountain_star == 1:
            score += 8; notes.append('山星一白旺人缘')
        if facing_star == 1:
            score += 8; notes.append('向星一白旺桃花')
        if annual_star == 1:
            score += 6; notes.append('年星一白——今年人缘桃花旺')

        if period_star == 6:
            score += 8; notes.append('运星六白权贵')
        if mountain_star == 6:
            score += 8; notes.append('山星六白旺官运')
        if facing_star == 6:
            score += 8; notes.append('向星六白旺偏财')
        if annual_star == 6:
            score += 6; notes.append('年星六白——今年官运/偏财佳')

        if period_star == 4:
            score += 5; notes.append('运星四绿文昌')
        if mountain_star == 4:
            score += 5; notes.append('山星四绿利学业')
        if facing_star == 4:
            score += 5; notes.append('向星四绿利考试')
        if annual_star == 4:
            score += 4; notes.append('年星四绿——今年文昌运旺')

        # 凶星减分
        if period_star == 3:
            score -= 5; warnings.append('运星三碧是非')
        if annual_star == 3:
            score -= 6; warnings.append('年星三碧——今年防口舌是非')
        if period_star == 7:
            score -= 5; warnings.append('运星七赤破财')
        if annual_star == 7:
            score -= 6; warnings.append('年星七赤——今年防盗贼破财')

        # 山向合十
        if mountain_star + facing_star == 10:
            score += 10
            notes.append('山向合十——夫妻同心，大局安稳')

        # 宫位五行与星曜五行生克
        gong_wx = self.GONG_WUXING[gong_idx]
        star_info = self.STARS.get(period_star, {})
        period_wx = star_info.get('wuxing', '')
        if period_wx and self.WX_SHENG.get(gong_wx) == period_wx:
            score += 5
            notes.append(f'运星{period_wx}生宫{gong_wx}——宫位得生，根基稳固')
        if period_wx and self.WX_KE.get(gong_wx) == period_wx:
            score -= 5
            warnings.append(f'运星{period_wx}克宫{gong_wx}——宫位受克，根基不稳')

        score = max(10, min(100, round(score)))

        if score >= 80:
            level = '大吉'
        elif score >= 65:
            level = '吉'
        elif score >= 50:
            level = '中平'
        elif score >= 35:
            level = '凶'
        else:
            level = '大凶'

        return {'score': score, 'level': level, 'notes': notes, 'warnings': warnings}

    # ================================================================
    # 六、综合排盘（主入口）
    # ================================================================

    def pai_pan(
        self, sitting: str = '子', facing: str = '午',
        build_year: int = None, current_year: int = None
    ) -> Dict[str, Any]:
        """
        风水排盘主入口

        Args:
            sitting: 坐山（二十四山之一）
            facing: 朝向（二十四山之一）
            build_year: 建房年份
            current_year: 当前年份

        Returns:
            完整风水排盘结果
        """
        if build_year is None:
            build_year = datetime.now().year
        if current_year is None:
            current_year = datetime.now().year

        period_num = self.get_period(build_year)
        period_chart = self.get_period_chart(period_num)
        stars = self.calc_mountain_and_facing_stars(sitting, facing, period_num)
        annual_stars = self.get_annual_stars(current_year)

        palaces = []
        total_score = 0

        for i in range(9):
            eval_result = self.evaluate_palace(
                period_chart[i],
                stars['mountain_stars'][i],
                stars['facing_stars'][i],
                annual_stars[i],
                i
            )
            palaces.append({
                'idx': i,
                'name': self.GONG_NAMES[i],
                'gua': self.GONG_GUA[i],
                'wuxing': self.GONG_WUXING[i],
                'periodStar': period_chart[i],
                'mountainStar': stars['mountain_stars'][i],
                'facingStar': stars['facing_stars'][i],
                'annualStar': annual_stars[i],
                'score': eval_result['score'],
                'level': eval_result['level'],
                'notes': eval_result['notes'],
                'warnings': eval_result['warnings'],
            })
            total_score += eval_result['score']

        overall_score = round(total_score / 9)
        if overall_score >= 75:
            overall_level = '上吉'
        elif overall_score >= 60:
            overall_level = '中吉'
        elif overall_score >= 45:
            overall_level = '中平'
        elif overall_score >= 30:
            overall_level = '凶'
        else:
            overall_level = '大凶'

        # 最佳和最差方位
        best_palace = max(palaces, key=lambda p: p['score'])
        worst_palace = min(palaces, key=lambda p: p['score'])

        return {
            'sitting': sitting,
            'facing': facing,
            'buildYear': build_year,
            'currentYear': current_year,
            'periodNum': period_num,
            'overallScore': overall_score,
            'overallLevel': overall_level,
            'palaces': palaces,
            'bestPalace': best_palace,
            'worstPalace': worst_palace,
            'periodChart': period_chart,
            'annualStars': annual_stars,
            'mountainStars': stars['mountain_stars'],
            'facingStars': stars['facing_stars'],
        }


# 便捷函数
_fengshui_instance = FengShui()


def pai_pan(
    sitting: str = '子', facing: str = '午',
    build_year: int = None, current_year: int = None
) -> Dict[str, Any]:
    """便捷函数：风水排盘"""
    return _fengshui_instance.pai_pan(sitting, facing, build_year, current_year)