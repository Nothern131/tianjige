"""
天机阁 API 路由
八字排盘 · 诸葛神数 · 大师蒸馏 · 六爻 · 梅花易数 · 奇门遁甲 · 太乙神数
"""
import random
from datetime import datetime
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

from core.constants import (
    GAN, ZHI, WUXING, GAN_WUXING, ZHI_WUXING,
    SIXTY_JIAZI, NAYIN, SHISHEN_RELATION,
    LIUSHISI_GUA_NAMES, LIUSHISI_GUA_GUACI,
)
from core.calendar import get_full_bazi
from core.liuyao import get_gua_by_coins, get_gua_by_number as liuyao_by_number
from core.meihua import gua_by_numbers, gua_by_date_time
from core.qimen import pai_pan as qimen_pai_pan
from core.taiyi import get_taiyi_position
from core.fengshui import pai_pan as fengshui_pai_pan

router = APIRouter()

# ========== 请求模型 ==========
class BaziRequest(BaseModel):
    birth_date: str  # YYYY-MM-DD
    birth_time: str  # 如 "子时"
    gender: str = "male"

class AnalysisRequest(BaseModel):
    bazi: dict
    birth_date: str
    birth_time: str
    gender: str = "male"

class ZhugeRequest(BaseModel):
    method: str = "three_words"  # three_words / single_number / three_numbers
    word1: Optional[str] = None
    word2: Optional[str] = None
    word3: Optional[str] = None
    num1: Optional[int] = None
    num2: Optional[int] = None
    num3: Optional[int] = None

class MasterAnalysisRequest(BaseModel):
    master_id: str
    master_name: str
    analysis_type: str = "full"
    birth_date: str
    birth_time: str
    gender: str = "male"

class LiuyaoRequest(BaseModel):
    method: str = "coins"  # coins / manual
    lines: Optional[list] = None  # 手动输入: [6,7,8,9,6,7]
    question: Optional[str] = None

class MeihuaRequest(BaseModel):
    method: str = "datetime"  # datetime / three_numbers
    num1: Optional[int] = None
    num2: Optional[int] = None
    num3: Optional[int] = None

class QimenRequest(BaseModel):
    method: str = "current"  # current / datetime
    datetime_str: Optional[str] = None

class TaiyiRequest(BaseModel):
    year: Optional[int] = None

class FengshuiRequest(BaseModel):
    sitting: str = "子"      # 坐山（二十四山之一）
    facing: str = "午"       # 朝向（二十四山之一）
    build_year: Optional[int] = None   # 建房年份
    current_year: Optional[int] = None  # 当前年份

# ========== 辅助函数 ==========
def parse_birth_time(birth_time_str: str) -> int:
    """解析时辰字符串为小时索引"""
    time_map = {
        "子时": 0, "丑时": 1, "寅时": 2, "卯时": 3,
        "辰时": 4, "巳时": 5, "午时": 6, "未时": 7,
        "申时": 8, "酉时": 9, "戌时": 10, "亥时": 11,
    }
    return time_map.get(birth_time_str, 0)

def build_bazi_dict(bazi_data: dict) -> dict:
    """构建标准八字字典"""
    pillars = bazi_data.get("pillars", {})
    return {
        "year_pillar": pillars.get("year", ""),
        "month_pillar": pillars.get("month", ""),
        "day_pillar": pillars.get("day", ""),
        "hour_pillar": pillars.get("hour", ""),
        "day_master": bazi_data.get("day_master", ""),
        "day_master_wuxing": bazi_data.get("day_master_wuxing", ""),
        "wuxing_balance": bazi_data.get("wuxing_balance", {}),
        "nayin": bazi_data.get("nayin", ""),
        "shengxiao": bazi_data.get("shengxiao", ""),
        "raw": bazi_data,
    }

# ========== API 端点 ==========

@router.post("/bazi")
async def bazi_paipan(req: BaziRequest):
    """八字排盘"""
    try:
        date_obj = datetime.strptime(req.birth_date, "%Y-%m-%d")
        hour_idx = parse_birth_time(req.birth_time)
        bazi = get_full_bazi(date_obj.year, date_obj.month, date_obj.day, hour_idx)
        return {"success": True, "data": bazi}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"排盘失败: {str(e)}")


@router.post("/wealth")
async def wealth_analysis(req: AnalysisRequest):
    """财富分析"""
    return {
        "success": True,
        "data": {
            "analysis": _generate_wealth_analysis(req.bazi),
            "score": random.randint(60, 95),
            "highlights": ["正财", "偏财", "财库", "财星旺衰"],
        }
    }


@router.post("/talent")
async def talent_analysis(req: AnalysisRequest):
    """天赋分析"""
    return {
        "success": True,
        "data": {
            "analysis": _generate_talent_analysis(req.bazi),
            "score": random.randint(60, 95),
            "highlights": ["食神", "伤官", "印星", "才华方向"],
        }
    }


@router.post("/balance")
async def balance_analysis(req: AnalysisRequest):
    """反内耗分析"""
    return {
        "success": True,
        "data": {
            "analysis": _generate_balance_analysis(req.bazi),
            "score": random.randint(60, 95),
            "highlights": ["五行平衡", "喜用神", "忌神", "调和之道"],
        }
    }


@router.post("/lifeline")
async def lifeline_analysis(req: AnalysisRequest):
    """人生K线"""
    return {
        "success": True,
        "data": {
            "analysis": _generate_lifeline_analysis(req.bazi),
            "lifeline": [
                {"age": 10, "fortune": random.randint(40, 90), "label": "幼年"},
                {"age": 20, "fortune": random.randint(40, 90), "label": "青年"},
                {"age": 30, "fortune": random.randint(40, 90), "label": "而立"},
                {"age": 40, "fortune": random.randint(40, 90), "label": "不惑"},
                {"age": 50, "fortune": random.randint(40, 90), "label": "知天命"},
                {"age": 60, "fortune": random.randint(40, 90), "label": "花甲"},
                {"age": 70, "fortune": random.randint(40, 90), "label": "古稀"},
                {"age": 80, "fortune": random.randint(40, 90), "label": "耄耋"},
            ],
        }
    }


@router.post("/monthly")
async def monthly_analysis(req: AnalysisRequest):
    """流月运势"""
    return {
        "success": True,
        "data": {
            "analysis": _generate_monthly_analysis(req.bazi),
            "months": [
                {"month": f"{i}月", "fortune": random.randint(40, 90), "label": _month_label(i)}
                for i in range(1, 13)
            ],
        }
    }


@router.post("/date-select")
async def date_select(req: AnalysisRequest):
    """择日"""
    return {
        "success": True,
        "data": {
            "analysis": "以日主五行与流日干支相合为原则，择吉避凶。",
            "good_dates": _generate_good_dates(),
            "bad_dates": _generate_bad_dates(),
        }
    }


@router.post("/love")
async def love_analysis(req: AnalysisRequest):
    """正缘分析"""
    return {
        "success": True,
        "data": {
            "analysis": _generate_love_analysis(req.bazi),
            "score": random.randint(60, 95),
        }
    }


@router.post("/zhuge")
async def zhuge_shenshu(req: ZhugeRequest):
    """诸葛神数"""
    try:
        # 计算签号
        if req.method == "three_words" and req.word1 and req.word2 and req.word3:
            num = (len(req.word1) + len(req.word2) + len(req.word3)) % 384 + 1
        elif req.method == "three_numbers" and req.num1 and req.num2 and req.num3:
            num = (req.num1 + req.num2 + req.num3) % 384 + 1
        else:
            num = random.randint(1, 384)

        return {
            "success": True,
            "data": {
                "number": num,
                "verse": _get_zhuge_verse(num),
                "interpretation": _get_zhuge_interpretation(num),
                "level": "auspicious" if num % 3 != 0 else ("neutral" if num % 3 == 1 else "inauspicious"),
            }
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"起卦失败: {str(e)}")


@router.get("/masters")
async def get_masters():
    """获取大师列表"""
    return {
        "success": True,
        "data": {
            "masters": [
                {"id": "guiguzi", "name": "鬼谷子", "title": "纵横家鼻祖", "era": "战国", "specialty": "六爻"},
                {"id": "jingfang", "name": "京房", "title": "纳甲筮法之祖", "era": "汉", "specialty": "六爻"},
                {"id": "zhugeliang", "name": "诸葛亮", "title": "卧龙先生", "era": "三国", "specialty": "奇门"},
                {"id": "yuanli", "name": "袁天罡", "title": "相术大师", "era": "唐", "specialty": "八字"},
                {"id": "lichunfeng", "name": "李淳风", "title": "天文学家", "era": "唐", "specialty": "八字"},
                {"id": "wangpu", "name": "王朴", "title": "太乙神数大师", "era": "五代", "specialty": "太乙"},
                {"id": "chenxizai", "name": "陈希夷", "title": "紫微斗数之祖", "era": "宋", "specialty": "紫微"},
                {"id": "shaoyong", "name": "邵雍", "title": "梅花易数之祖", "era": "宋", "specialty": "梅花"},
                {"id": "xuzile", "name": "徐子平", "title": "子平八字之祖", "era": "宋", "specialty": "八字"},
                {"id": "liuzhitong", "name": "刘伯温", "title": "诚意伯", "era": "明", "specialty": "奇门"},
                {"id": "wanminying", "name": "万民英", "title": "三命通会", "era": "明", "specialty": "八字"},
                {"id": "zhangnan", "name": "张楠", "title": "神峰通考", "era": "明", "specialty": "八字"},
                {"id": "yelan", "name": "叶兰", "title": "命理正宗", "era": "明", "specialty": "八字"},
                {"id": "shenxiao", "name": "沈孝瞻", "title": "子平真诠", "era": "清", "specialty": "八字"},
                {"id": "renqiao", "name": "任铁樵", "title": "滴天髓阐微", "era": "清", "specialty": "八字"},
                {"id": "zhenguan", "name": "陈素庵", "title": "命理约言", "era": "清", "specialty": "八字"},
                {"id": "shutong", "name": "舒继英", "title": "星平会海", "era": "清", "specialty": "八字"},
                {"id": "weixian", "name": "韦千里", "title": "千里命稿", "era": "民国", "specialty": "八字"},
                {"id": "yuanshu", "name": "袁树珊", "title": "命理探源", "era": "民国", "specialty": "八字"},
                {"id": "linxuan", "name": "林庚白", "title": "人鉴命理", "era": "民国", "specialty": "八字"},
                {"id": "songhuibin", "name": "宋惠彬", "title": "奇门学术化奠基人", "era": "当代", "specialty": "奇门"},
                {"id": "zhangziye", "name": "张子业", "title": "综合术数专家", "era": "当代", "specialty": "综合"},
            ]
        }
    }


@router.post("/master-analysis")
async def master_analysis(req: MasterAnalysisRequest):
    """大师风格分析"""
    return {
        "success": True,
        "data": {
            "master_id": req.master_id,
            "master_name": req.master_name,
            "analysis_type": req.analysis_type,
            "opening": _master_opening(req.master_name),
            "overview": _master_overview(req.master_name, req.birth_date),
            "specialty": _master_specialty(req.master_name, req.analysis_type),
            "quote": _master_quote(req.master_name),
            "closing": _master_closing(req.master_name),
        }
    }


@router.post("/liuyao")
async def liuyao_gua(req: LiuyaoRequest):
    """六爻占卜"""
    try:
        if req.method == "coins":
            result = get_gua_by_coins()
        elif req.method == "manual" and req.lines and len(req.lines) == 6:
            # 手动输入：将6个爻值转为数字起卦
            result = liuyao_by_number(sum(req.lines[:3]), sum(req.lines[3:]), 0)
        else:
            result = get_gua_by_coins()
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"起卦失败: {str(e)}")


@router.post("/meihua")
async def meihua_gua(req: MeihuaRequest):
    """梅花易数"""
    try:
        if req.method == "three_numbers" and req.num1 and req.num2 and req.num3:
            result = gua_by_numbers(req.num1, req.num2, req.num3)
        else:
            now = datetime.now()
            result = gua_by_date_time(now.year, now.month, now.day, now.hour)
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"起卦失败: {str(e)}")


@router.post("/qimen")
async def qimen_ju(req: QimenRequest):
    """奇门遁甲"""
    try:
        if req.datetime_str:
            dt = datetime.strptime(req.datetime_str, "%Y-%m-%d %H:%M")
            result = qimen_pai_pan(dt.year, dt.month, dt.day, dt.hour)
        else:
            now = datetime.now()
            result = qimen_pai_pan(now.year, now.month, now.day, now.hour)
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"排盘失败: {str(e)}")


@router.post("/taiyi")
async def taiyi_shu(req: TaiyiRequest):
    """太乙神数"""
    try:
        year = req.year if req.year else datetime.now().year
        result = get_taiyi_position(year)
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"推算失败: {str(e)}")


@router.post("/fengshui")
async def fengshui_pan(req: FengshuiRequest):
    """风水格局（玄空飞星）"""
    try:
        result = fengshui_pai_pan(
            sitting=req.sitting,
            facing=req.facing,
            build_year=req.build_year,
            current_year=req.current_year,
        )
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"排盘失败: {str(e)}")


# ========== 分析生成函数（占位，连接前端演示） ==========

def _generate_wealth_analysis(bazi: dict) -> str:
    dm = bazi.get("day_master", "甲")
    wx = bazi.get("day_master_wuxing", "木")
    return f"""日主{bazi.get('day_master', '甲')}，五行属{wx}。

以日主为太极点，观财星之旺衰、财库之开合、食伤之生财力度。

财星为日主所克者，正财为稳定收入，偏财为意外之财。若财星得令得地，又有食伤生扶，则财源滚滚，一生不愁。若财星衰弱，被比劫分夺，则需守财为先，不宜冒进。

财库为财之归宿，辰戌丑未四库各有所藏。财库逢冲则开，财库逢合则闭。开库之时，财运亨通；闭库之时，宜积蓄待时。

观君命局，财星有根，食伤得力，中年后财运渐入佳境。宜守正出奇，以专业技能为根基，偏财为辅，方能财源广进。"""


def _generate_talent_analysis(bazi: dict) -> str:
    dm = bazi.get("day_master", "甲")
    return f"""日主{dm}，以食神伤官为才华之星，以印星为学识之根。

食神主创造、艺术、口才，伤官主技术、发明、突破。印星主学习、研究、深度思考。

若食伤得令，印星有根，则才华横溢，学以致用，必有所成。若食伤过旺而无制，则才华外露而无实；若印星过重而食伤弱，则学富五车而难施展。

观君命局，才华方向宜以技术研究为主，辅以创意表达，方能发挥最大潜力。"""


def _generate_balance_analysis(bazi: dict) -> str:
    return """五行贵在平衡，过犹不及。

日主强弱，以得令、得地、得生、得助四者为判断标准。日主过强则需克泄耗，日主过弱则需生扶助。

观君命局，喜用神为水木，忌神为火土。日常宜多亲近水木之气，居北方或东方，衣青黑之色，食清淡之味，方能平衡五行，身心调和。

内耗之源，在于五行失衡。调候得宜，用神得力，则心气平和，诸事顺遂。"""


def _generate_lifeline_analysis(bazi: dict) -> str:
    return """人生如棋，命局如盘。大运十年一转，流年一年一变。

幼年看月柱，青年看日柱，中年看时柱，晚年看大运。

观君命局，早年根基稳固，中年渐入佳境，晚年福禄双全。人生起伏如K线，有峰有谷，方显精彩。顺势而为，逆势则守，此乃智者之道。"""


def _generate_monthly_analysis(bazi: dict) -> str:
    return """流月如溪，汇入大运之河。每月干支不同，吉凶各异。

以日主五行与流月干支的生克关系判断当月运势。相生则顺，相克则逆，比和则平。

正月建寅，二月建卯，依此类推。每月宜忌不同，顺势而为则事半功倍。"""


def _month_label(month: int) -> str:
    labels = ["", "正月·建寅", "二月·建卯", "三月·建辰", "四月·建巳", "五月·建午", "六月·建未",
              "七月·建申", "八月·建酉", "九月·建戌", "十月·建亥", "十一月·建子", "十二月·建丑"]
    return labels[month] if month < len(labels) else ""


def _generate_good_dates() -> list:
    return [
        {"date": "2026-07-20", "reason": "天德合日，宜婚嫁"},
        {"date": "2026-07-25", "reason": "月德日，宜出行"},
        {"date": "2026-08-01", "reason": "天赦日，诸事皆宜"},
        {"date": "2026-08-08", "reason": "黄道吉日，宜开业"},
        {"date": "2026-08-15", "reason": "驿马日，宜远行"},
    ]


def _generate_bad_dates() -> list:
    return [
        {"date": "2026-07-22", "reason": "月破日，大事不宜"},
        {"date": "2026-07-28", "reason": "四废日，百事不举"},
        {"date": "2026-08-05", "reason": "杨公忌日，诸事不宜"},
    ]


def _generate_love_analysis(bazi: dict) -> str:
    return """正缘者，命中所定之良缘也。

以日支为配偶宫，以财官为配偶星。男命以正财为妻，偏财为妾；女命以正官为夫，七杀为偏夫。

配偶宫得位，配偶星有根，则婚姻美满，夫妻和谐。若配偶宫逢冲，配偶星受伤，则婚姻多波折，需耐心经营。

观君命局，正缘在东南方，相貌清秀，性格温和，宜在水木旺的年份相遇。缘分天定，但经营在人，珍惜眼前人，方能白头偕老。"""


def _get_zhuge_verse(num: int) -> str:
    verses = {
        1: "天门一挂榜，预定夺标人。马嘶芳草地，秋高听鹿鸣。",
        8: "不是有心人，不解其中意。一叶落而知秋，一花开而知春。",
        64: "烈火烹油，鲜花着锦。盛极必衰，月满则亏。",
        128: "船到江心补漏迟，事到临头悔已迟。未雨绸缪方为上。",
        192: "山重水复疑无路，柳暗花明又一村。莫愁前路无知己。",
        256: "春风得意马蹄疾，一日看尽长安花。功名只在眼前。",
        320: "种瓜得瓜，种豆得豆。因果不虚，福祸自招。",
        384: "否极泰来，周而复始。天道循环，生生不息。",
    }
    return verses.get(num, f"第{num}签：天机玄妙，不可尽言。心诚则灵，意正自明。")


def _get_zhuge_interpretation(num: int) -> str:
    interpretations = {
        1: "此签大吉，主功名成就，事业有成。如骏马奔腾于芳草地，前程似锦。宜把握时机，勇往直前。",
        8: "此签暗示需有心人方能领悟。表面平静之处，暗藏玄机。宜细心观察，不可大意。",
        64: "此签警示盛极必衰之理。当前虽有成就，但需居安思危，不可得意忘形。",
        128: "此签提醒未雨绸缪。事到临头再补救已然太迟，凡事需提前规划准备。",
        192: "此签鼓励莫灰心。困境之中必有转机，坚持到底必见光明。",
        256: "此签大吉，主春风得意。当前运势正旺，宜趁势而上，不可错失良机。",
        320: "此签讲因果之理。种善因得善果，种恶因得恶果。宜多行善事，积德累功。",
        384: "此签讲天道循环。坏运到头便是好运，好运过后便是平淡。顺应自然，宠辱不惊。",
    }
    return interpretations.get(num, f"此签寓意深远，需结合具体情境分析。心诚则灵，多思有益。")


def _master_opening(name: str) -> str:
    openings = {
        "鬼谷子": "贫道观此命局，阴阳五行，经纬分明。纵横捭阖，皆在卦中。",
        "京房": "余观此造，纳甲分明，八宫有序。六爻动静，吉凶可辨。",
        "诸葛亮": "亮观此局，天时地利人和，三才具备。且看九宫之中，八门开阖。",
        "邵雍": "余观此象，先天后天，一以贯之。物物皆太极，事事有卦象。",
        "刘伯温": "伯温观此命盘，阴阳消长，五行流转。时势如棋，步步为营。",
        "王朴": "余推此数，太乙行宫，十六神定。天象人事，皆在数中。",
        "宋惠彬": "以学术视野观此局，传统与现代结合，实证与理论并重。",
        "张子业": "余以多术交叉验证，奇门六壬八字，综合分析此命。",
    }
    return openings.get(name, f"余观此命局，{name}之心法，尽在其中。且听我道来。")


def _master_overview(name: str, birth_date: str) -> str:
    overviews = {
        "鬼谷子": f"此命生于{birth_date}，五行之气，各有所归。阴阳消长，如环无端。观其大势，有龙蛇之变，风云际会之象。",
        "京房": f"此造{birth_date}，以八宫纳甲推之，卦气升降，灾异可察。五行生克，六亲显象。",
        "诸葛亮": f"此局{birth_date}，奇门推之，九天九地，各有其位。八门之中，吉凶可辨。",
        "邵雍": f"此象{birth_date}，以先天易数观之，天地定位，山泽通气。万物皆备于我，反身而诚。",
        "刘伯温": f"此盘{birth_date}，天盘地盘，四层交错。八门开阖，九星流转。如排兵布阵，步步为营。",
        "王朴": f"此数{birth_date}，以太乙积年推之，天行有常，不为尧存，不为桀亡。五福三基，皆有定数。",
        "宋惠彬": f"此命{birth_date}，以现代学术方法分析，结合传统奇门理论，既有经典依据，又有创新视角。",
        "张子业": f"此命{birth_date}，以奇门为主，六壬为辅，八字为基，姓名补之，四术交叉验证。",
    }
    return overviews.get(name, f"此命生于{birth_date}，{name}之法观之，五行流转，吉凶可辨。")


def _master_specialty(name: str, analysis_type: str) -> str:
    type_labels = {
        "full": "全盘分析", "wealth": "财富分析", "talent": "天赋分析",
        "balance": "反内耗指南", "love": "正缘分析"
    }
    label = type_labels.get(analysis_type, "全盘分析")

    specialties = {
        "鬼谷子": f"此命以{label}论之，捭阖之道，贵在知人。知人者智，自知者明。观其五行生克，财官印食，各有其位。",
        "京房": f"此命以{label}论之，纳甲推演，六爻动静。飞伏互体，卦气升降。五行生克之中，自有玄机。",
        "诸葛亮": f"此局以{label}论之，奇门九宫，八门开阖。天时不如地利，地利不如人和。",
        "邵雍": f"此象以{label}论之，先天为体，后天为用。体用生克，万物之理。以物观物，不杂私意。",
        "刘伯温": f"此盘以{label}论之，如棋局布阵，先观大势，再定方略。知己知彼，百战不殆。",
        "王朴": f"此数以{label}论之，太乙行宫，十六神定。天象人事，皆在数中。数理精微，不可不察。",
        "宋惠彬": f"此命以{label}论之，学术化分析，既有传统根基，又有现代视角。数据与经验并重。",
        "张子业": f"此命以{label}论之，多术交叉验证，奇门观其大势，六壬察其细节，八字定其根基。",
    }
    return specialties.get(name, f"此命以{label}论之，{name}之法，自有其妙。")


def _master_quote(name: str) -> str:
    quotes = {
        "鬼谷子": "《鬼谷子·捭阖》：'粤若稽古，圣人之在天地间也，为众生之先。观阴阳之开阖以名命物，知存亡之门户。'",
        "京房": "《京氏易传》：'八卦分阴阳，六位配五行。光明四通，变易立节。'",
        "诸葛亮": "《诫子书》：'非淡泊无以明志，非宁静无以致远。'",
        "邵雍": "《皇极经世》：'以物观物，性也；以我观物，情也。性公而明，情偏而暗。'",
        "刘伯温": "《郁离子》：'天道无常，惟德是辅。'",
        "王朴": "《太乙金镜式经》：'太乙者，天帝之神也。主使十六神，知风雨水旱、兵革饥馑、疾疫灾害。'",
        "宋惠彬": "奇门之学，不在玄虚，而在实证。以现代学术之眼，观古代智慧之光。",
        "张子业": "术数之道，贵在融会贯通。单术有偏，多术交叉，方得真谛。",
    }
    return quotes.get(name, f"{name}曰：'天机玄妙，不可尽言。心诚则灵，意正自明。'")


def _master_closing(name: str) -> str:
    closings = {
        "鬼谷子": "此乃捭阖之道，阴阳之理。天机已泄三分，余者自悟。",
        "京房": "此乃纳甲之妙，八宫之序。卦气已明，吉凶可辨。",
        "诸葛亮": "此乃奇门之要，九宫之法。亮已尽言，望君善用。",
        "邵雍": "此乃先天之易，观物之学。物物皆太极，事事有卦象。",
        "刘伯温": "此乃用兵之道，奇门之术。伯温言尽于此，望君自悟。",
        "王朴": "此乃太乙之数，天道之常。数理精微，不可尽泄。",
        "宋惠彬": "此乃学术之见，一家之言。学无止境，共勉之。",
        "张子业": "此乃综合之术，多法并用。术数之道，贵在用心。",
    }
    return closings.get(name, f"{name}言尽于此，天机不可尽泄，留三分与造化。")