/**
 * 天机阁 · 大师蒸馏引擎 v1 — 纯前端算法，零API调用
 * 31位古今命理大师 · AI 复刻断命风格 · 五段式分析
 */
(function (global) {
  'use strict';

  /* ========== 一、五行与天干地支基础 ========== */

  var GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
  var ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
  var WUXING = ['木', '火', '土', '金', '水'];

  var GAN_WUXING = { 甲: '木', 乙: '木', 丙: '火', 丁: '火', 戊: '土', 己: '土', 庚: '金', 辛: '金', 壬: '水', 癸: '水' };
  var ZHI_WUXING = { 子: '水', 丑: '土', 寅: '木', 卯: '木', 辰: '土', 巳: '火', 午: '火', 未: '土', 申: '金', 酉: '金', 戌: '土', 亥: '水' };
  var GAN_YINYANG = { 甲: '阳', 乙: '阴', 丙: '阳', 丁: '阴', 戊: '阳', 己: '阴', 庚: '阳', 辛: '阴', 壬: '阳', 癸: '阴' };

  var WX_SHENG = { 木: '水', 火: '木', 土: '火', 金: '土', 水: '金' };
  var WX_SHENG_BY = { 木: '火', 火: '土', 土: '金', 金: '水', 水: '木' };
  var WX_KE = { 木: '金', 火: '水', 土: '木', 金: '火', 水: '土' };
  var WX_KE_BY = { 木: '土', 火: '金', 土: '水', 金: '木', 水: '火' };

  // 十神映射 — 基于日主与各天干的关系
  // 格式：{ 日主五行: { 关系方向: { 同性: 十神名, 异性: 十神名 } } }
  // 关系方向：shengWo(生我), woSheng(我生), keWo(克我), woKe(我克), tongWo(同我)
  var SHISHEN_MAP = {
    木: { shengWo: { yin: '正印', yang: '偏印' }, woSheng: { yin: '食神', yang: '伤官' }, keWo: { yin: '正官', yang: '七杀' }, woKe: { yin: '正财', yang: '偏财' }, tongWo: { yin: '劫财', yang: '比肩' } },
    火: { shengWo: { yin: '偏印', yang: '正印' }, woSheng: { yin: '伤官', yang: '食神' }, keWo: { yin: '七杀', yang: '正官' }, woKe: { yin: '偏财', yang: '正财' }, tongWo: { yin: '劫财', yang: '比肩' } },
    土: { shengWo: { yin: '正印', yang: '偏印' }, woSheng: { yin: '食神', yang: '伤官' }, keWo: { yin: '正官', yang: '七杀' }, woKe: { yin: '正财', yang: '偏财' }, tongWo: { yin: '劫财', yang: '比肩' } },
    金: { shengWo: { yin: '偏印', yang: '正印' }, woSheng: { yin: '伤官', yang: '食神' }, keWo: { yin: '七杀', yang: '正官' }, woKe: { yin: '偏财', yang: '正财' }, tongWo: { yin: '劫财', yang: '比肩' } },
    水: { shengWo: { yin: '正印', yang: '偏印' }, woSheng: { yin: '食神', yang: '伤官' }, keWo: { yin: '正官', yang: '七杀' }, woKe: { yin: '正财', yang: '偏财' }, tongWo: { yin: '劫财', yang: '比肩' } }
  };

  // 十神详细解读
  var SHISHEN_DESC = {
    '正印': '仁慈善良，聪慧好学，有贵人相助，主学识、名誉、母亲、长辈',
    '偏印': '领悟力强，独辟蹊径，有特殊才能，主偏门学问、继母、非正统',
    '比肩': '独立自主，自尊心强，朋友多助，主兄弟姐妹、同辈、竞争',
    '劫财': '热情豪爽，社交能力强，但易破财，主朋友、合作、花费',
    '食神': '温和宽厚，有口福，才艺出众，主饮食、艺术、子女、享受',
    '伤官': '聪明机智，才华横溢，但锋芒毕露，主技艺、口才、创新、叛逆',
    '正财': '勤俭务实，财运稳定，主正职收入、妻子、固定资产',
    '偏财': '慷慨大方，财运起伏，主副业收入、意外之财、父亲、投资',
    '正官': '正直守法，有责任感，主事业、官职、丈夫、纪律',
    '七杀': '果断刚毅，有魄力，但压力大，主竞争、权力、挑战、小人'
  };

  // 十神吉凶分类
  var SHISHEN_JIXIONG = {
    '正印': '吉', '偏印': '平', '比肩': '平', '劫财': '平',
    '食神': '吉', '伤官': '平', '正财': '吉', '偏财': '吉',
    '正官': '吉', '七杀': '凶'
  };

  // 月令人元司事（简化：按月支取本气）
  var YUELING_BENQI = {
    寅: '甲', 卯: '乙', 辰: '戊', 巳: '丙', 午: '丁',
    未: '己', 申: '庚', 酉: '辛', 戌: '戊', 亥: '壬',
    子: '癸', 丑: '己'
  };

  /* ========== 二、34位大师数据 ========== */

  /**
   * 每位大师包含：id、名称、称号、朝代、流派、风格描述、语言特征
   */
  var MASTERS = {
    'guiguzi': {
      id: 'guiguzi', name: '鬼谷子', title: '纵横家鼻祖', era: '战国', category: '六爻', avatar: '🧙',
      style: '纵横捭阖，言简意赅，多用比喻，以阴阳开阖之理喻人事',
      pronouns: '老夫', phrase: '捭阖之道，阴阳之机',
      openingTemplates: [
        '捭之者，开也，言也，阳也。今观此命，{日主}居{日主五行}位，其气{旺衰}，当以捭阖之道论之。',
        '阖之者，闭也，默也，阴也。汝命{日主}为{日主五行}，{旺衰}之势，须审阴阳之变。'
      ],
      quoteTemplates: [
        '《鬼谷子·捭阖》云："观阴阳之开阖以命物，知存亡之门户。"',
        '《鬼谷子·反应》曰："反以观往，复以验来。"'
      ],
      closingTemplates: [
        '总而言之，捭阖有度，阴阳相济。汝命之道，当{建议}。老夫言尽于此，善自珍重。',
        '阴阳消长，自有定数。汝当{建议}，方能趋吉避凶。'
      ]
    },
    'jingfang': {
      id: 'jingfang', name: '京房', title: '纳甲筮法之祖', era: '汉', category: '六爻', avatar: '☯️',
      style: '纳甲体系，天人感应，灾异说，以卦象配干支论吉凶',
      pronouns: '吾', phrase: '纳甲之妙，天人相应',
      openingTemplates: [
        '纳甲之法，以八卦配十天干，各有所主。今观汝命{日主}为{日主五行}，纳于{纳甲}，其象{吉凶}。',
        '天人感应，卦象与干支相配。汝命造{日主}居{日主五行}，当以纳甲推之。'
      ],
      quoteTemplates: [
        '《京氏易传》云："八卦分阴阳，六位配五行，光明四通，变易立节。"',
        '京房曰："阴阳运行，一寒一暑，五行互用，一吉一凶。"'
      ],
      closingTemplates: [
        '纳甲推之，{结论}。天人相应，不可不慎。吾言至此，汝当自省。',
        '卦象干支，皆有所应。{结论}，望汝明之。'
      ]
    },
    'zhugeliang': {
      id: 'zhugeliang', name: '诸葛亮', title: '卧龙先生', era: '三国', category: '奇门', avatar: '🐉',
      style: '运筹帷幄，谋略深远，以天下大势喻个人命途',
      pronouns: '亮', phrase: '鞠躬尽瘁，知天达命',
      openingTemplates: [
        '亮观天象，察地理，今推汝命：{日主}为{日主五行}，其气{旺衰}。夫运筹帷幄之中，决胜千里之外，命理亦如是。',
        '天下大势，分久必合，合久必分。汝命造{日主}属{日主五行}，{旺衰}之势，当审时度势。'
      ],
      quoteTemplates: [
        '《诫子书》云："夫君子之行，静以修身，俭以养德。非淡泊无以明志，非宁静无以致远。"',
        '亮尝言："谋事在人，成事在天。不可强也。"'
      ],
      closingTemplates: [
        '亮观汝命，{结论}。此乃天数，然人力亦可为。宜{建议}，则大事可成。',
        '综上所述，{结论}。亮之见如此，汝当好自为之。'
      ]
    },
    'yuanli': {
      id: 'yuanli', name: '袁天罡', title: '相术大师', era: '唐', category: '八字', avatar: '⭐',
      style: '骨相与命理结合，重视五行流通，论断精准果断',
      pronouns: '某', phrase: '五行流通，命自不凡',
      openingTemplates: [
        '某观汝八字，{日主}为{日主五行}，其势{旺衰}。五行之气，贵在流通；命格之贵，重在平衡。',
        '推命之法，首重五行。汝命{日主}居{日主五行}，{旺衰}，当以流通论之。'
      ],
      quoteTemplates: [
        '《五行大义》云："五行者，往来乎天地之间而不穷者也。"',
        '袁天罡曰："命之贵贱，不在五行之多寡，而在五行之流通。"'
      ],
      closingTemplates: [
        '某断之：{结论}。命虽有定，运可改之。{建议}，则吉无不利。',
        '此命{结论}。某观之已明，汝当{建议}，方得善终。'
      ]
    },
    'lichunfeng': {
      id: 'lichunfeng', name: '李淳风', title: '天文学家', era: '唐', category: '八字', avatar: '🌠',
      style: '天文历法入命理，重视星象与干支配合，科学理性',
      pronouns: '淳风', phrase: '天象人事，理出一源',
      openingTemplates: [
        '淳风推演天象，以历法入命理。汝命{日主}为{日主五行}，值{旺衰}之运。天星有象，人事有应。',
        '天地之道，历数而已。汝命造{日主}属{日主五行}，{旺衰}之势，当以天象验之。'
      ],
      quoteTemplates: [
        '《乙巳占》云："天垂象，见吉凶，圣人象之。"',
        '李淳风曰："日月运行，五星列宿，皆与人事相应。"'
      ],
      closingTemplates: [
        '淳风推之：{结论}。星象历数，皆有定则。{建议}，则天道可循。',
        '综上所述，{结论}。淳风以为，{建议}为上。'
      ]
    },
    'wangpu': {
      id: 'wangpu', name: '王朴', title: '太乙神数大师', era: '五代', category: '太乙', avatar: '🔭',
      style: '太乙神数，重数理推算，以历法验证命理',
      pronouns: '朴', phrase: '太乙神数，穷极天地',
      openingTemplates: [
        '太乙神数，源于上古，推天道以明人事。汝命{日主}为{日主五行}，{旺衰}之势，当以太乙之数推之。',
        '朴以钦天监之职，精研历算。今推汝命：{日主}居{日主五行}，其数{旺衰}。'
      ],
      quoteTemplates: [
        '《太乙金镜式经》云："太乙者，天地之神也，运行于九宫之间。"',
        '王朴曰："数者，天地之纪也。明数则明天道，明天道则知人事。"'
      ],
      closingTemplates: [
        '朴以数推之：{结论}。数有定而运无常，{建议}，则吉凶可辨。',
        '太乙之数，如是而已。{结论}。汝当{建议}，方得善果。'
      ]
    },
    'chenxizai': {
      id: 'chenxizai', name: '陈希夷', title: '紫微斗数之祖', era: '宋', category: '紫微', avatar: '🏔️',
      style: '紫微斗数，星曜为纲，重视命宫与三方四正',
      pronouns: '希夷', phrase: '紫微帝星，照临命宫',
      openingTemplates: [
        '希夷观紫微星盘，帝星所临，吉凶自现。汝命{日主}为{日主五行}，{旺衰}之势，当以星曜论之。',
        '紫微斗数，以星曜为纲，宫垣为目。汝命造{日主}属{日主五行}，{旺衰}，当推其命宫之曜。'
      ],
      quoteTemplates: [
        '《紫微斗数全书》云："紫微帝座，乃众星之主，万曜之尊。"',
        '陈希夷曰："星有吉凶，宫有庙旺。得吉星庙旺者，富贵可期。"'
      ],
      closingTemplates: [
        '希夷断之：{结论}。星曜流转，命亦随之。{建议}，则吉星高照。',
        '紫微所示，{结论}。希夷以为，{建议}，方为正道。'
      ]
    },
    'shaoyong': {
      id: 'shaoyong', name: '邵雍', title: '梅花易数之祖', era: '宋', category: '梅花', avatar: '🌸',
      style: '先天易学，象数理占，以数起卦，观象玩辞，言语富有哲理',
      pronouns: '雍', phrase: '先天后天，象数理占',
      openingTemplates: [
        '雍观天地之数，万物皆数也。汝命{日主}为{日主五行}，其数{旺衰}。以先天之数推之，象在其中矣。',
        '物物有一太极，人人有一天地。汝命造{日主}属{日主五行}，{旺衰}之势，当以象数求之。'
      ],
      quoteTemplates: [
        '《皇极经世》云："以物观物，性也；以我观物，情也。"',
        '邵雍曰："一物其来有一身，一身还有一乾坤。"'
      ],
      closingTemplates: [
        '雍以数推之，以象验之：{结论}。天地之道，尽在数中。{建议}，则乾坤自顺。',
        '象数之妙，至矣尽矣。{结论}。雍以为，{建议}，大道可期。'
      ]
    },
    'xuzile': {
      id: 'xuzile', name: '徐子平', title: '子平八字之祖', era: '宋', category: '八字', avatar: '📜',
      style: '子平术，以日为主，重视十神，格局分明',
      pronouns: '子平', phrase: '以日为主，十神为用',
      openingTemplates: [
        '子平之法，以日为主，年为本，月为提纲，时为辅。汝命{日主}为{日主五行}，{旺衰}，当以十神推之。',
        '四柱八字，各有其用。汝命造{日主}居{日主五行}，{旺衰}之势，格局如何，待子平细论。'
      ],
      quoteTemplates: [
        '《渊海子平》云："以日为主，而取年月时之干支，配以十神，论其生克制化。"',
        '徐子平曰："用神者，日主所喜之神也。得用神则吉，失用神则凶。"'
      ],
      closingTemplates: [
        '子平断之：{结论}。格局已成，用神已明。{建议}，则命途亨通。',
        '综上所述，{结论}。子平之术，尽在于此。{建议}，则吉无不利。'
      ]
    },
    'liuzhitong': {
      id: 'liuzhitong', name: '刘伯温', title: '诚意伯', era: '明', category: '奇门', avatar: '🔥',
      style: '奇门遁甲兼通命理，格局宏大，以天下兴亡喻个人命运',
      pronouns: '基', phrase: '奇门遁甲，帝王之学',
      openingTemplates: [
        '基以奇门之术，推演天命。汝命{日主}为{日主五行}，{旺衰}之势。夫奇门者，帝王之学也，今以之论汝命。',
        '天地如盘，人命如棋。汝命造{日主}属{日主五行}，{旺衰}，当以奇门遁甲之局推之。'
      ],
      quoteTemplates: [
        '《烧饼歌》云："未来之事，尽在卦中。明者自明，昧者自昧。"',
        '刘伯温曰："天时不如地利，地利不如人和。命理亦然。"'
      ],
      closingTemplates: [
        '基断之：{结论}。天命有常，人事无常。{建议}，则天助人助。',
        '奇门所示，{结论}。基以为，{建议}，方能趋吉避凶。'
      ]
    },
    'wanminying': {
      id: 'wanminying', name: '万民英', title: '三命通会', era: '明', category: '八字', avatar: '📚',
      style: '博采众长，体系完备，重视格局与神煞结合',
      pronouns: '民英', phrase: '三命通会，万法归宗',
      openingTemplates: [
        '民英遍览古今命书，汇通三命之学。汝命{日主}为{日主五行}，{旺衰}之势。三命之法，各有所长，今合而论之。',
        '三命之道，禄命、子平、星宗，各有所重。汝命造{日主}属{日主五行}，{旺衰}，当以三命通会之。'
      ],
      quoteTemplates: [
        '《三命通会》云："命者，天之令也；运者，地之期也。天命不可违，而地运可改。"',
        '万民英曰："论命不可执一，当以格局、神煞、五行、十神，合而观之。"'
      ],
      closingTemplates: [
        '民英合三命而断之：{结论}。万法归宗，一理贯通。{建议}，则命途坦荡。',
        '三命通会，尽在于此。{结论}。民英以为，{建议}，方为上策。'
      ]
    },
    'zhangnan': {
      id: 'zhangnan', name: '张楠', title: '神峰通考', era: '明', category: '八字', avatar: '⛰️',
      style: '神峰通考，重视病药说，以中和为贵',
      pronouns: '楠', phrase: '病药相济，中和为贵',
      openingTemplates: [
        '楠以神峰之法，考汝命造。{日主}为{日主五行}，{旺衰}之势。命有病者，必有药；知病知药，方为良医。',
        '命理如医理，有病则用药。汝命造{日主}属{日主五行}，{旺衰}，当求其病之所在。'
      ],
      quoteTemplates: [
        '《神峰通考》云："有病方为贵，无伤不是奇。格中如去病，财禄两相随。"',
        '张楠曰："命之病者，太过不及是也。得其药者，用神是也。"'
      ],
      closingTemplates: [
        '楠以病药之法断之：{结论}。病在{病}，药在{药}。{建议}，则药到病除。',
        '神峰之术，病药而已。{结论}。楠以为，{建议}，则中和可致。'
      ]
    },
    'yelan': {
      id: 'yelan', name: '叶兰', title: '命理正宗', era: '明', category: '八字', avatar: '🍂',
      style: '命理正宗，重视格局清浊，以清为贵',
      pronouns: '兰', phrase: '格局清浊，贵贱自分',
      openingTemplates: [
        '兰以正宗之法，辨汝格局。{日主}为{日主五行}，{旺衰}之势。格局有清浊，清者贵，浊者贱。',
        '命理正宗，首重格局。汝命造{日主}属{日主五行}，{旺衰}，当辨其清浊。'
      ],
      quoteTemplates: [
        '《命理正宗》云："一清到底有精神，管取生平富贵真。"',
        '叶兰曰："格局清者，如月印寒潭，一望可知；格局浊者，如雾里看花，难以分辨。"'
      ],
      closingTemplates: [
        '兰辨之：{结论}。清浊已分，贵贱已明。{建议}，则清者愈清。',
        '正宗之法，格局为先。{结论}。兰以为，{建议}，方为正道。'
      ]
    },
    'shenxiao': {
      id: 'shenxiao', name: '沈孝瞻', title: '子平真诠', era: '清', category: '八字', avatar: '🖋️',
      style: '子平真诠，条理分明，重视格局顺逆，论述精辟',
      pronouns: '孝瞻', phrase: '格局顺逆，真假分明',
      openingTemplates: [
        '孝瞻以子平真诠之法，论汝命造。{日主}为{日主五行}，{旺衰}之势。格局有顺用逆用，顺者吉，逆者亦吉，在其当否。',
        '子平真诠，以格局为纲。汝命造{日主}属{日主五行}，{旺衰}，当论其格局之顺逆。'
      ],
      quoteTemplates: [
        '《子平真诠》云："格局者，八字之枢机也。格局不成，虽有财官印食，亦不足贵。"',
        '沈孝瞻曰："顺用者，财官印食，生之护之；逆用者，杀伤枭刃，制之化之。"'
      ],
      closingTemplates: [
        '孝瞻断之：{结论}。格局顺逆，已辨分明。{建议}，则命途顺遂。',
        '子平真诠，尽在于此。{结论}。孝瞻以为，{建议}，方得善果。'
      ]
    },
    'renqiao': {
      id: 'renqiao', name: '任铁樵', title: '滴天髓阐微', era: '清', category: '八字', avatar: '💧',
      style: '滴天髓风格，注重用神，以日主喜忌为核心，语言精炼有力',
      pronouns: '铁樵', phrase: '滴天髓阐微，用神为要',
      openingTemplates: [
        '铁樵以滴天髓之旨，阐汝命微。{日主}为{日主五行}，{旺衰}之势。欲识三元万法宗，先观帝载与神功。',
        '滴天髓云："欲知贵贱，先观月令提纲。"汝命造{日主}属{日主五行}，{旺衰}，当以用神为要。'
      ],
      quoteTemplates: [
        '《滴天髓》云："何知其人富，财气通门户。何知其人贵，官星有理会。"',
        '任铁樵曰："用神者，日主所喜之神也。得用神之助，则如虎添翼；失用神之助，则如龙困浅滩。"'
      ],
      closingTemplates: [
        '铁樵断之：{结论}。用神已明，喜忌已辨。{建议}，则如鱼得水。',
        '滴天髓之旨，尽在于此。{结论}。铁樵以为，{建议}，方得上乘。'
      ]
    },
    'zhenguan': {
      id: 'zhenguan', name: '陈素庵', title: '命理约言', era: '清', category: '八字', avatar: '🎋',
      style: '命理约言，简洁精要，重视五行生克制化',
      pronouns: '素庵', phrase: '命理约言，简而精要',
      openingTemplates: [
        '素庵以约言之法，论汝命造。{日主}为{日主五行}，{旺衰}之势。命理千言万语，约之不过五行生克而已。',
        '命理之学，不在繁复，而在精要。汝命造{日主}属{日主五行}，{旺衰}，当以约言括之。'
      ],
      quoteTemplates: [
        '《命理约言》云："五行生克，命理之根本也。舍此而论命，犹舍舟而求渡。"',
        '陈素庵曰："论命如观棋，不在多看，而在看准关键一着。"'
      ],
      closingTemplates: [
        '素庵以约言断之：{结论}。大道至简，命理亦然。{建议}，则简明易行。',
        '约言至此，命理已明。{结论}。素庵以为，{建议}，方为至要。'
      ]
    },
    'shutong': {
      id: 'shutong', name: '舒继英', title: '星平会海', era: '清', category: '八字', avatar: '🌊',
      style: '星平会海，兼通星宗与子平，重视星命合参',
      pronouns: '继英', phrase: '星平会海，合参为妙',
      openingTemplates: [
        '继英以星平会海之法，合参汝命。{日主}为{日主五行}，{旺衰}之势。星宗与子平，各有所长，合而参之，方得全貌。',
        '星平会海，星宗子平，一炉共冶。汝命造{日主}属{日主五行}，{旺衰}，当以星命合参。'
      ],
      quoteTemplates: [
        '《星平会海》云："星平二家，各有渊源。合而参之，如日月同辉。"',
        '舒继英曰："星宗以星曜为纲，子平以干支为目。纲举目张，方为全璧。"'
      ],
      closingTemplates: [
        '继英以星平合参断之：{结论}。星命相合，其理自明。{建议}，则星命两利。',
        '星平会海，合参已毕。{结论}。继英以为，{建议}，方为正解。'
      ]
    },
    'weixian': {
      id: 'weixian', name: '韦千里', title: '千里命稿', era: '民国', category: '八字', avatar: '🌿',
      style: '现代命理，通俗易懂，重视实际验证，结合时代背景',
      pronouns: '千里', phrase: '千里命稿，验之于实',
      openingTemplates: [
        '千里以现代眼光，论汝命造。{日主}为{日主五行}，{旺衰}之势。命理非玄虚之学，乃人生经验之总结也。',
        '千里命稿，以实证为宗。汝命造{日主}属{日主五行}，{旺衰}，当以实事验之。'
      ],
      quoteTemplates: [
        '《千里命稿》云："命理之学，贵在验证。不验于实，则空谈而已。"',
        '韦千里曰："论命当以事实为据，不可空谈理论。命理之妙，在验不在玄。"'
      ],
      closingTemplates: [
        '千里断之：{结论}。以实为验，以理为据。{建议}，则行之有效。',
        '千里命稿，验之于实。{结论}。千里以为，{建议}，方为实用。'
      ]
    },
    'yuanshu': {
      id: 'yuanshu', name: '袁树珊', title: '命理探源', era: '民国', category: '八字', avatar: '🏮',
      style: '命理探源，追本溯源，重视经典与历史案例',
      pronouns: '树珊', phrase: '命理探源，追本穷源',
      openingTemplates: [
        '树珊以探源之法，溯汝命之本。{日主}为{日主五行}，{旺衰}之势。命理之源，在于五行，流于干支，分于十神。',
        '探源者，穷其根本也。汝命造{日主}属{日主五行}，{旺衰}，当溯其源头。'
      ],
      quoteTemplates: [
        '《命理探源》云："命理之学，源远流长。始于黄帝，成于汉唐，盛于宋明。"',
        '袁树珊曰："论命如考古，须层层深入，方见真相。"'
      ],
      closingTemplates: [
        '树珊探源已毕：{结论}。源清则流洁，本固则枝荣。{建议}，则根深叶茂。',
        '命理之源，至此已明。{结论}。树珊以为，{建议}，方为正本清源。'
      ]
    },
    'linxuan': {
      id: 'linxuan', name: '林庚白', title: '人鉴命理', era: '民国', category: '八字', avatar: '🪶',
      style: '人鉴命理，以人鉴命，重视名人命例对比，犀利精准',
      pronouns: '庚白', phrase: '人鉴命理，以人为镜',
      openingTemplates: [
        '庚白以人鉴之法，鉴汝命造。{日主}为{日主五行}，{旺衰}之势。以人为镜，可以知命；以史为鉴，可以知运。',
        '人鉴者，以古今名人之命，鉴汝之命也。汝命造{日主}属{日主五行}，{旺衰}，当以人鉴之。'
      ],
      quoteTemplates: [
        '《人鉴·命理》云："以人为鉴，可知命之得失；以史为鉴，可知运之兴衰。"',
        '林庚白曰："命如指纹，人各有异。然类而推之，亦有迹可循。"'
      ],
      closingTemplates: [
        '庚白以人鉴断之：{结论}。以人为镜，得失自明。{建议}，则取长补短。',
        '人鉴命理，至此已明。{结论}。庚白以为，{建议}，方为善鉴。'
      ]
    },
    'songhuibin': {
      id: 'songhuibin', name: '宋惠彬', title: '奇门学术化奠基人', era: '当代', category: '奇门', avatar: '🎓',
      style: '奇门学术化，体系严谨，重视逻辑推导与实证',
      pronouns: '惠彬', phrase: '奇门学术，逻辑为先',
      openingTemplates: [
        '惠彬以学术化奇门，推演汝命。{日主}为{日主五行}，{旺衰}之势。奇门非玄虚之学，乃时空能量之模型也。',
        '奇门学术化，以逻辑推演为纲。汝命造{日主}属{日主五行}，{旺衰}，当以模型推之。'
      ],
      quoteTemplates: [
        '宋惠彬曰："奇门遁甲，是古人对时空能量场的数学建模，不应神秘化，而应学术化。"',
        '宋惠彬云："九宫八卦，是坐标系；八门九星，是变量。奇门之妙，在逻辑推演。"'
      ],
      closingTemplates: [
        '惠彬以学术模型推之：{结论}。逻辑为纲，实证为据。{建议}，则科学合理。',
        '奇门学术，逻辑推演已毕。{结论}。惠彬以为，{建议}，方为理性之选。'
      ]
    },
    'zhougong': {
      id: 'zhougong', name: '周公', title: '解梦之祖', era: '西周', category: '解梦', avatar: '🌙',
      style: '梦兆解析，以象喻理，言简意深，以梦境之象推人事之变',
      pronouns: '周公', phrase: '梦者，魂之游也，象者，事之兆也',
      openingTemplates: [
        '周公观汝梦境，{日主}为{日主五行}，其气{旺衰}。梦乃魂之所游，象乃事之所兆，今以梦理推之。',
        '梦者，心之影也；象者，命之兆也。汝命{日主}属{日主五行}，{旺衰}，当以梦象合参。'
      ],
      quoteTemplates: [
        '《周公解梦》云："梦死得生，梦粪得财。梦象之反，自古有之。"',
        '周公曰："梦者，魂魄之游也。吉梦兆福，凶梦示警，不可不察。"'
      ],
      closingTemplates: [
        '周公解之：{结论}。梦虽有象，事在人为。{建议}，则吉梦成真，凶梦化吉。',
        '梦象已明，命理已显。{结论}。周公以为，{建议}，方得善果。'
      ]
    },
    'zhangziye': {
      id: 'zhangziye', name: '张子业', title: '综合术数专家', era: '当代', category: '综合', avatar: '🔮',
      style: '综合各家，融会贯通，以实用为导向，通俗易懂',
      pronouns: '子业', phrase: '综合术数，融会贯通',
      openingTemplates: [
        '子业综合各家之术，融会贯通，论汝命造。{日主}为{日主五行}，{旺衰}之势。八字、奇门、六爻、梅花，各有所长，合而用之，方得全貌。',
        '术数之道，不可拘于一派。汝命造{日主}属{日主五行}，{旺衰}，当以综合之法论之。'
      ],
      quoteTemplates: [
        '张子业曰："术数各派，如盲人摸象。合而观之，方见全象。"',
        '张子业云："命理之妙，在实用。不能指导人生的命理，只是纸上谈兵。"'
      ],
      closingTemplates: [
        '子业综合各家，断之如下：{结论}。融会贯通，方得真知。{建议}，则诸事顺遂。',
        '综合术数，至此已明。{结论}。子业以为，{建议}，方为实用之道。'
      ]
    },
    'shaoyanhe': {
      id: 'shaoyanhe', name: '邵彦和', title: '六壬断案之祖', era: '宋', category: '大六壬', avatar: '🌊',
      style: '六壬神课，天地盘推演，四课三传，以象断事，精微入里',
      pronouns: '彦和', phrase: '天地盘开，鬼神莫逃',
      openingTemplates: [
        '彦和以六壬神课，推演汝事。{日主}为{日主五行}，其气{旺衰}。天地盘开，四课既成，三传已定，吉凶自现。',
        '六壬者，天地之机也。汝命{日主}属{日主五行}，{旺衰}之势，当以天地盘推之。'
      ],
      quoteTemplates: [
        '《六壬断案》云："壬者，任也，万物之根。课者，象也，万事之兆。"',
        '邵彦和曰："六壬之妙，在象不在辞。观象知机，方为上乘。"'
      ],
      closingTemplates: [
        '彦和以六壬断之：{结论}。天地有象，人事有应。{建议}，则吉凶可避。',
        '六壬所示，{结论}。彦和以为，{建议}，方得天道。'
      ]
    },
    'chengongxian': {
      id: 'chengongxian', name: '陈公献', title: '大六壬指南', era: '明', category: '大六壬', avatar: '🧭',
      style: '六壬指南，条理分明，重视课体分类与占断法式，理法兼备',
      pronouns: '公献', phrase: '六壬指南，理法兼备',
      openingTemplates: [
        '公献以六壬指南之法，推演汝课。{日主}为{日主五行}，{旺衰}之势。凡六壬占断，先定课体，次察类神，再观三传。',
        '六壬之道，理法为先。汝命{日主}属{日主五行}，{旺衰}，当以六壬指南之法推之。'
      ],
      quoteTemplates: [
        '《大六壬指南》云："课体既定，吉凶立判。类神既明，事理自现。"',
        '陈公献曰："六壬占断，贵在明理。理不明则象乱，象乱则断不中。"'
      ],
      closingTemplates: [
        '公献以六壬指南断之：{结论}。理法已明，象数已定。{建议}，则大事可成。',
        '六壬指南，至此已明。{结论}。公献以为，{建议}，方为正法。'
      ]
    },
    'nihaihsia': {
      id: 'nihaihsia', name: '倪海厦', title: '天纪紫微', era: '当代', category: '紫微', avatar: '🏥',
      style: '天纪紫微，铁板神数，流年算法，以医入命，重视星曜组合与宫位互动',
      pronouns: '海厦', phrase: '天纪紫微，医命同源',
      openingTemplates: [
        '海厦以天纪紫微，推演汝命。{日主}为{日主五行}，{旺衰}之势。紫微斗数，以星曜为纲，以宫位为目，铁板神数，算无遗策。',
        '天纪者，天地之纪也。汝命{日主}属{日主五行}，{旺衰}，当以天纪紫微推之。'
      ],
      quoteTemplates: [
        '倪海厦曰："紫微斗数，非算命之术，乃知命之学。知命而后改命，方为大道。"',
        '倪海厦云："命如医理，有病则治，有偏则调。紫微斗数，便是人生之诊断书。"'
      ],
      closingTemplates: [
        '海厦以天纪紫微断之：{结论}。命虽有定，运可改之。{建议}，则命由己造。',
        '天纪所示，{结论}。海厦以为，{建议}，方为知命改运之道。'
      ]
    },
    'wangtingzhi': {
      id: 'wangtingzhi', name: '王亭之', title: '中州派紫微', era: '当代', category: '紫微', avatar: '📖',
      style: '中州派紫微斗数，重视星曜庙旺利陷与四化飞星，体系完整，论述精辟',
      pronouns: '亭之', phrase: '中州正统，星曜为宗',
      openingTemplates: [
        '亭之以中州派紫微斗数，排演汝盘。{日主}为{日主五行}，{旺衰}之势。中州正传，以星曜庙旺为纲，以四化飞星为用。',
        '紫微斗数，中州为正。汝命{日主}属{日主五行}，{旺衰}，当以中州法推之。'
      ],
      quoteTemplates: [
        '王亭之曰："星曜有庙旺利陷，四化有吉凶顺逆。明此二者，紫微过半矣。"',
        '王亭之云："紫微斗数，重在星曜组合。单星无吉凶，组合见真章。"'
      ],
      closingTemplates: [
        '亭之以中州法断之：{结论}。星曜已明，四化已定。{建议}，则命途可期。',
        '中州紫微，至此已明。{结论}。亭之以为，{建议}，方为正道。'
      ]
    },
    'guoyuqing': {
      id: 'guoyuqing', name: '郭御青', title: '六壬大全', era: '明', category: '大六壬', avatar: '📕',
      style: '六壬大全，集古法之大成，重视课经与毕法赋，系统严谨，条理分明',
      pronouns: '御青', phrase: '六壬大全，集古法之大成',
      openingTemplates: [
        '御青以六壬大全之法，推演汝课。{日主}为{日主五行}，{旺衰}之势。六壬之妙，课经为体，毕法为用，诸法合参，方得全貌。',
        '六壬大全者，集历代壬书之精华也。汝命{日主}属{日主五行}，{旺衰}，当以课经之法推之。'
      ],
      quoteTemplates: [
        '《六壬大全》云："课经者，六壬之纲也；毕法者，六壬之目也。纲举则目张。"',
        '郭御青曰："六壬之法，不在多而在精。课经一百零八，毕法一百条，熟此二者，六壬过半。"'
      ],
      closingTemplates: [
        '御青以六壬大法断之：{结论}。课经已明，毕法已验。{建议}，则吉凶可辨。',
        '六壬大全，至此已明。{结论}。御青以为，{建议}，方为正法。'
      ]
    },
    'chengshuxun': {
      id: 'chengshuxun', name: '程树勋', title: '壬学琐记', era: '清', category: '大六壬', avatar: '📝',
      style: '壬学琐记，重视一字诀与玉连环，以简驭繁，断法精妙，注重实战验证',
      pronouns: '树勋', phrase: '一字诀妙，玉连环通',
      openingTemplates: [
        '树勋以壬学琐记之法，推演汝课。{日主}为{日主五行}，{旺衰}之势。六壬之道，贵在精微。一字可定吉凶，一诀可通万象。',
        '壬学琐记，积数十年心得而成。汝命{日主}属{日主五行}，{旺衰}，当以一字诀推之。'
      ],
      quoteTemplates: [
        '《壬学琐记》云："一字诀者，六壬之秘钥也。得其诀者，一课可断万事。"',
        '程树勋曰："玉连环者，课体之锁链也。一环通，则百环通；一窍开，则万窍开。"'
      ],
      closingTemplates: [
        '树勋以一字诀断之：{结论}。精微之处，已见分晓。{建议}，则吉无不利。',
        '壬学琐记，精要已传。{结论}。树勋以为，{建议}，方得真谛。'
      ]
    },
    'luohongxian': {
      id: 'luohongxian', name: '罗洪先', title: '紫微斗数全集', era: '明', category: '紫微', avatar: '📜',
      style: '紫微斗数全集，集明代斗数之大成，重视星曜性情与宫位互动，以星论命，以宫断事',
      pronouns: '洪先', phrase: '星曜性情，宫位断事',
      openingTemplates: [
        '洪先以紫微斗数全集之法，排演汝盘。{日主}为{日主五行}，{旺衰}之势。星有性情，宫有职司。明其性情，知其职司，则命可断矣。',
        '紫微斗数全集，明代斗数之集大成者也。汝命{日主}属{日主五行}，{旺衰}，当以星宫合参。'
      ],
      quoteTemplates: [
        '《紫微斗数全集》云："星有庙旺利陷，宫有强弱虚实。星宫相配，吉凶自见。"',
        '罗洪先曰："斗数之妙，在星宫相应。星吉而宫强，如虎添翼；星凶而宫弱，雪上加霜。"'
      ],
      closingTemplates: [
        '洪先以全集之法断之：{结论}。星宫已明，吉凶已判。{建议}，则知命而行。',
        '紫微全集，至此已明。{结论}。洪先以为，{建议}，方为正道。'
      ]
    },
    'lubinzao': {
      id: 'lubinzao', name: '陆斌兆', title: '紫微斗数讲义', era: '当代', category: '紫微', avatar: '🎓',
      style: '紫微斗数讲义，学院派风格，体系化教学，重视基础理论与逻辑推导，深入浅出',
      pronouns: '斌兆', phrase: '体系为纲，逻辑为用',
      openingTemplates: [
        '斌兆以紫微斗数讲义之法，推演汝盘。{日主}为{日主五行}，{旺衰}之势。斗数非玄虚之学，乃逻辑推演之体系也。循序渐进，自然明了。',
        '紫微斗数讲义，以体系化教学为本。汝命{日主}属{日主五行}，{旺衰}，当以逻辑推之。'
      ],
      quoteTemplates: [
        '陆斌兆曰："紫微斗数，是一门可以系统学习的学问。星曜、宫位、四化，三者不可偏废。"',
        '陆斌兆云："斗数之妙，在逻辑推演。命盘如棋局，星曜如棋子，宫位如棋盘，四化如棋路。"'
      ],
      closingTemplates: [
        '斌兆以讲义之法断之：{结论}。逻辑为纲，推演已毕。{建议}，则条理分明。',
        '紫微讲义，至此已明。{结论}。斌兆以为，{建议}，方为科学之道。'
      ]
    },
    'yangyunsong': {
      id: 'yangyunsong', name: '杨筠松', title: '风水祖师·救贫仙人', era: '唐', category: '风水', avatar: '⛰️',
      style: '峦头派宗师，寻龙点穴，以山水形势论吉凶，重视龙穴砂水向五诀',
      pronouns: '筠松', phrase: '寻龙点穴，救贫济世',
      openingTemplates: [
        '筠松以峦头之法，观汝宅之形势。龙脉走势，砂水环抱，吉凶自在山水之间。',
        '风水之道，首重峦头。汝宅形势如何，待筠松细察龙穴砂水。'
      ],
      quoteTemplates: [
        '《撼龙经》云："寻龙分九势，九势各有形。形者，气之聚也。"',
        '杨筠松曰："山管人丁水管财，山水有情福自来。"'
      ],
      closingTemplates: [
        '筠松以峦头之法断之：{结论}。山水有情，福泽绵长。{建议}，则丁财两旺。',
        '峦头所示，{结论}。筠松以为，{建议}，方得山水之助。'
      ]
    },
    'laibuyi': {
      id: 'laibuyi', name: '赖布衣', title: '理气派宗师', era: '宋', category: '风水', avatar: '🧭',
      style: '理气派宗师，重视罗盘分金与卦气方位，以天星催官，以卦理断吉凶',
      pronouns: '布衣', phrase: '天星催官，卦气通神',
      openingTemplates: [
        '布衣以理气之法，推演汝宅之卦气。罗盘分金，卦位吉凶，天星照临，自有定数。',
        '理气者，以卦气推方位之吉凶也。汝宅坐向既定，当以卦气论之。'
      ],
      quoteTemplates: [
        '《催官篇》云："天星照临，地脉相应。得吉星照临者，富贵可期。"',
        '赖布衣曰："罗盘一度之差，祸福千里之遥。分金不可不慎。"'
      ],
      closingTemplates: [
        '布衣以理气之法断之：{结论}。卦气已明，方位已定。{建议}，则天星催官，福禄自来。',
        '理气所示，{结论}。布衣以为，{建议}，方为趋吉避凶之道。'
      ]
    },
    'jiangdahong': {
      id: 'jiangdahong', name: '蒋大鸿', title: '玄空飞星宗师', era: '清', category: '风水', avatar: '🌟',
      style: '玄空飞星派宗师，以三元九运推演时空吉凶，重视山向飞星与旺衰生死',
      pronouns: '大鸿', phrase: '三元九运，飞星断吉凶',
      openingTemplates: [
        '大鸿以玄空飞星之法，推演汝宅之星盘。三元九运，山向飞星，旺衰生死，尽在盘中。',
        '玄空者，时空之飞星也。汝宅建于何年，运星何在，山向何方，当以飞星论之。'
      ],
      quoteTemplates: [
        '《地理辨正》云："三元九运，周而复始。旺星当令者吉，衰星失令者凶。"',
        '蒋大鸿曰："山上龙神不下水，水里龙神不上山。山向合局，方为吉宅。"'
      ],
      closingTemplates: [
        '大鸿以玄空飞星断之：{结论}。飞星已排，吉凶已判。{建议}，则旺星得位，衰星退避。',
        '玄空所示，{结论}。大鸿以为，{建议}，方得三元旺气。'
      ]
    }
  };

  /* ========== 三、分析类型配置 ========== */

  var ANALYSIS_TYPES = {
    'full': { label: '全盘分析', focus: '整体命局', aspect: '日主旺衰、格局高低、五行流通、大运走势' },
    'wealth': { label: '财富分析', focus: '财运', aspect: '财星旺衰、财库有无、食伤生财、比劫夺财' },
    'talent': { label: '天赋分析', focus: '天赋', aspect: '印星文采、食伤才华、官星领导力、七杀魄力' },
    'balance': { label: '反内耗', focus: '精神内耗', aspect: '五行平衡、官杀压力、印星庇护、食伤宣泄' },
    'love': { label: '正缘分析', focus: '姻缘', aspect: '配偶星旺衰、日支夫妻宫、桃花、红鸾天喜' }
  };

  /* ========== 四、辅助函数 ========== */

  /**
   * 生成模拟八字数据（当bazi参数为空时使用）
   */
  function generateMockBazi(gender) {
    var now = new Date();
    var year = now.getFullYear();
    var month = now.getMonth() + 1;
    var day = now.getDate();
    var hour = now.getHours();

    // 用当前时间生成八字（简化版）
    // 年干支
    var baseYear = 1900;
    var ganIdx = (year - baseYear) % 10;
    var zhiIdx = (year - baseYear) % 12;
    ganIdx = ((ganIdx % 10) + 10) % 10;
    zhiIdx = ((zhiIdx % 12) + 12) % 12;

    var yearGan = GAN[(ganIdx + 6) % 10];
    var yearZhi = ZHI[(zhiIdx + 0) % 12];

    // 月干支（简化：五虎遁）
    var wuhudun = { 甲: '丙', 己: '丙', 乙: '戊', 庚: '戊', 丙: '庚', 辛: '庚', 丁: '壬', 壬: '壬', 戊: '甲', 癸: '甲' };
    var yinGan = wuhudun[yearGan] || '甲';
    var yinGanIdx = GAN.indexOf(yinGan);
    var monthGanIdx = (yinGanIdx + month - 1) % 10;
    var monthGan = GAN[monthGanIdx];
    var monthZhi = ZHI[(month + 1) % 12]; // 寅月为正月

    // 日干支（简化：以1900-01-01甲戌为基准）
    var baseDate = new Date(1900, 0, 1);
    var targetDate = new Date(year, month - 1, day);
    var diffDays = Math.floor((targetDate - baseDate) / (1000 * 60 * 60 * 24));
    var baseIdx = 11; // 甲戌
    var dayIdx = ((baseIdx + diffDays) % 60 + 60) % 60;
    var dayGan = GAN[dayIdx % 10];
    var dayZhi = ZHI[dayIdx % 12];

    // 时干支（五鼠遁）
    var wushudun = { 甲: '甲', 己: '甲', 乙: '丙', 庚: '丙', 丙: '戊', 辛: '戊', 丁: '庚', 壬: '庚', 戊: '壬', 癸: '壬' };
    var ziGan = wushudun[dayGan] || '甲';
    var ziGanIdx = GAN.indexOf(ziGan);
    var shichenIdx = hour >= 23 ? 0 : Math.floor((hour + 1) / 2);
    var hourGanIdx = (ziGanIdx + shichenIdx) % 10;
    var hourGan = GAN[hourGanIdx];
    var hourZhi = ZHI[shichenIdx];

    var dayWuxing = GAN_WUXING[dayGan];

    return {
      year_pillar: yearGan + yearZhi,
      month_pillar: monthGan + monthZhi,
      day_pillar: dayGan + dayZhi,
      hour_pillar: hourGan + hourZhi,
      ri_zhu: dayGan,
      ri_zhu_wuxing: dayWuxing,
      gender: gender || 'male',
      bazi_str: yearGan + yearZhi + ' ' + monthGan + monthZhi + ' ' + dayGan + dayZhi + ' ' + hourGan + hourZhi
    };
  }

  /**
   * 计算单个天干相对于日主的十神
   */
  function computeShiShen(riZhu, riWuxing, targetGan) {
    if (!targetGan) return '—';
    var targetWuxing = GAN_WUXING[targetGan];
    var riYinYang = GAN_YINYANG[riZhu]; // 日主阴阳
    var targetYinYang = GAN_YINYANG[targetGan]; // 目标天干阴阳
    var sameYinYang = (riYinYang === targetYinYang);

    var relation, yinYangKey;
    if (targetWuxing === riWuxing) {
      relation = 'tongWo';
      yinYangKey = sameYinYang ? 'yang' : 'yin'; // 同我者：同性为比肩(阳), 异性为劫财(阴)
    } else if (WX_SHENG[riWuxing] === targetWuxing) {
      relation = 'shengWo';
      // 生我者：同性为偏印, 异性为正印。但木日主见水：水为印，同性(壬阳水-甲阳木)为偏印，异性(癸阴水-甲阳木)为正印
      yinYangKey = sameYinYang ? 'yang' : 'yin';
    } else if (WX_SHENG_BY[riWuxing] === targetWuxing) {
      relation = 'woSheng';
      yinYangKey = sameYinYang ? 'yang' : 'yin';
    } else if (WX_KE[riWuxing] === targetWuxing) {
      relation = 'keWo';
      yinYangKey = sameYinYang ? 'yang' : 'yin';
    } else if (WX_KE_BY[riWuxing] === targetWuxing) {
      relation = 'woKe';
      yinYangKey = sameYinYang ? 'yang' : 'yin';
    } else {
      return '—';
    }

    var map = SHISHEN_MAP[riWuxing];
    if (!map || !map[relation]) return '—';
    return map[relation][yinYangKey] || '—';
  }

  /**
   * 计算八字中所有天干的十神
   */
  function computeAllShiShen(bazi, riZhu, riWuxing) {
    var pillars = ['year_pillar', 'month_pillar', 'day_pillar', 'hour_pillar'];
    var result = {};
    for (var i = 0; i < pillars.length; i++) {
      var pillar = bazi[pillars[i]] || '';
      if (pillar.length >= 2) {
        result[pillars[i]] = computeShiShen(riZhu, riWuxing, pillar[0]);
      } else {
        result[pillars[i]] = '—';
      }
    }
    return result;
  }

  /**
   * 判断格局 — 以月令透干取格
   */
  function analyzePattern(bazi, riZhu, riWuxing, allShiShen) {
    var monthPillar = bazi.month_pillar || '';
    var monthZhi = monthPillar.length >= 2 ? monthPillar[1] : '';
    var monthGan = monthPillar.length >= 2 ? monthPillar[0] : '';
    var yuelingBenQi = YUELING_BENQI[monthZhi] || '';

    // 月令本气天干对应的十神即格局
    var yuelingGan = yuelingBenQi;
    var yuelingWuxing = GAN_WUXING[yuelingGan] || '';
    var yuelingShiShen = computeShiShen(riZhu, riWuxing, yuelingGan);

    // 检查是否透干（月令本气在年/月/时干出现）
    var pillars = ['year_pillar', 'month_pillar', 'hour_pillar'];
    var touGan = false;
    for (var i = 0; i < pillars.length; i++) {
      var p = bazi[pillars[i]] || '';
      if (p.length >= 2 && GAN_WUXING[p[0]] === yuelingWuxing) {
        touGan = true;
        break;
      }
    }

    // 确定格局名称
    var patternName = yuelingShiShen + '格';
    if (!touGan) {
      patternName = yuelingShiShen + '格（不透）';
    }

    // 格局成败简判
    var patternQuality = '中平';
    var patternAnalysis = '';

    if (yuelingShiShen === '正官' || yuelingShiShen === '七杀') {
      // 官杀格：喜印化、食伤制，忌财生、混杂
      patternAnalysis = '官杀为用，贵在制化。得印星化之则贵，得食伤制之则显。';
      patternQuality = touGan ? '上等' : '中等';
    } else if (yuelingShiShen === '正财' || yuelingShiShen === '偏财') {
      patternAnalysis = '财星为用，贵在身强。日主能任则富，身弱财多则贫。';
      patternQuality = touGan ? '上等' : '中等';
    } else if (yuelingShiShen === '正印' || yuelingShiShen === '偏印') {
      patternAnalysis = '印星为用，贵在清纯。印绶生身，聪慧有学，但忌财星破印。';
      patternQuality = '上等';
    } else if (yuelingShiShen === '食神' || yuelingShiShen === '伤官') {
      patternAnalysis = '食伤为用，贵在泄秀。才华横溢，但需印星制衡，忌官杀混杂。';
      patternQuality = touGan ? '上等' : '中等';
    } else if (yuelingShiShen === '比肩' || yuelingShiShen === '劫财') {
      patternAnalysis = '建禄月劫，贵在官杀为用。身旺需克泄，身弱赖帮扶。';
      patternQuality = '中等';
    }

    return {
      name: patternName,
      shiShen: yuelingShiShen,
      touGan: touGan,
      quality: patternQuality,
      analysis: patternAnalysis,
      yuelingBenQi: yuelingBenQi
    };
  }

  /**
   * 判断用神和喜忌
   * 原则：身旺用克泄耗，身弱用生扶，结合格局调整
   */
  function determineYongShen(info, pattern) {
    var riWuxing = info.riWuxing;
    var isWang = info.wangShuai.indexOf('旺') >= 0 || info.wangShuai.indexOf('相') >= 0;
    var isStrong = info.powerScore >= 60;

    var yongShen = []; // 用神
    var xiShen = [];  // 喜神
    var jiShen = [];  // 忌神

    // 基本判断：身旺用克泄耗，身弱用生扶
    if (isStrong) {
      // 身旺：克泄耗为用
      yongShen.push(WX_KE[riWuxing]);  // 克我者（官杀）
      yongShen.push(WX_SHENG_BY[riWuxing]); // 我生者（食伤）
      yongShen.push(WX_KE_BY[riWuxing]); // 我克者（财）
      jiShen.push(WX_SHENG[riWuxing]); // 生我者（印）
      jiShen.push(riWuxing); // 同我者（比劫）
    } else {
      // 身弱：生扶为用
      yongShen.push(WX_SHENG[riWuxing]); // 生我者（印）
      yongShen.push(riWuxing); // 同我者（比劫）
      jiShen.push(WX_KE[riWuxing]); // 克我者（官杀）
      jiShen.push(WX_KE_BY[riWuxing]); // 我克者（财）
      jiShen.push(WX_SHENG_BY[riWuxing]); // 我生者（食伤）
    }

    xiShen.push(yongShen[0]); // 喜神：生用神者

    return {
      yongShen: yongShen,
      xiShen: xiShen,
      jiShen: jiShen,
      advice: isStrong ?
        '宜行' + yongShen.join('、') + '之运，忌' + jiShen.join('、') + '之运。' :
        '宜行' + yongShen.join('、') + '之运，忌' + jiShen.join('、') + '之运。'
    };
  }

  /**
   * 从八字数据中提取日主、旺衰、十神、格局等信息
   */
  function extractBaziInfo(bazi) {
    var riZhu = bazi.ri_zhu || '甲';
    var riWuxing = bazi.ri_zhu_wuxing || GAN_WUXING[riZhu] || '木';
    var gender = bazi.gender || 'male';

    // 计算所有天干的十神
    var allShiShen = computeAllShiShen(bazi, riZhu, riWuxing);

    // 计算四柱各天干的力量分数
    var yearGan = (bazi.year_pillar || '甲')[0];
    var monthGan = (bazi.month_pillar || '甲')[0];
    var dayGan = riZhu;
    var hourGan = (bazi.hour_pillar || '甲')[0];
    var yearZhi = (bazi.year_pillar || '甲子')[1] || '子';
    var monthZhi = (bazi.month_pillar || '甲子')[1] || '子';
    var dayZhi = (bazi.day_pillar || '甲子')[1] || '子';
    var hourZhi = (bazi.hour_pillar || '甲子')[1] || '子';

    // 力量评分：月令权重最大(40)，日支(20)，时干(15)，年干(10)，年支(8)，时支(7)
    var powerScore = 0;
    var wuxingCount = { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 };

    function addPower(gan, zhi, weightGan, weightZhi) {
      if (gan) {
        var wx = GAN_WUXING[gan];
        if (wx === riWuxing) powerScore += weightGan;
        else if (WX_SHENG[riWuxing] === wx) powerScore += weightGan * 0.7;
        if (wx) wuxingCount[wx] = (wuxingCount[wx] || 0) + weightGan;
      }
      if (zhi) {
        var zWx = ZHI_WUXING[zhi];
        if (zWx === riWuxing) powerScore += weightZhi;
        else if (WX_SHENG[riWuxing] === zWx) powerScore += weightZhi * 0.5;
        if (zWx) wuxingCount[zWx] = (wuxingCount[zWx] || 0) + weightZhi;
      }
    }

    addPower(yearGan, yearZhi, 10, 8);
    addPower(monthGan, monthZhi, 25, 40);
    addPower(dayGan, dayZhi, 0, 20); // 日干不算入自身力量
    addPower(hourGan, hourZhi, 15, 7);

    // 日主自身基础分
    powerScore += 15;

    // 判断旺衰（综合力量评分）
    var monthWuxing = ZHI_WUXING[monthZhi] || '水';
    var wangShuai;
    var wangShuaiDetail;
    if (powerScore >= 65) {
      wangShuai = '身旺';
      wangShuaiDetail = '身旺，力量评分' + powerScore + '，日主得令得地，气势旺盛。';
    } else if (powerScore >= 45) {
      wangShuai = '中和偏旺';
      wangShuaiDetail = '中和偏旺，力量评分' + powerScore + '，日主有根有助，尚可任财官。';
    } else if (powerScore >= 30) {
      wangShuai = '中和偏弱';
      wangShuaiDetail = '中和偏弱，力量评分' + powerScore + '，日主根基不深，需印比生扶。';
    } else {
      wangShuai = '身弱';
      wangShuaiDetail = '身弱，力量评分' + powerScore + '，日主失令失地，需大运帮扶。';
    }

    // 判断格局
    var pattern = analyzePattern(bazi, riZhu, riWuxing, allShiShen);

    // 判断用神
    var yongShenInfo = determineYongShen({ riWuxing: riWuxing, wangShuai: wangShuai, powerScore: powerScore }, pattern);

    return {
      riZhu: riZhu,
      riWuxing: riWuxing,
      wangShuai: wangShuai,
      wangShuaiDetail: wangShuaiDetail,
      powerScore: powerScore,
      wuxingCount: wuxingCount,
      gender: gender,
      baziStr: bazi.bazi_str || '',
      yearPillar: bazi.year_pillar || '',
      monthPillar: bazi.month_pillar || '',
      dayPillar: bazi.day_pillar || '',
      hourPillar: bazi.hour_pillar || '',
      yearGan: yearGan,
      monthGan: monthGan,
      dayGan: dayGan,
      hourGan: hourGan,
      yearZhi: yearZhi,
      monthZhi: monthZhi,
      dayZhi: dayZhi,
      hourZhi: hourZhi,
      allShiShen: allShiShen,
      pattern: pattern,
      yongShenInfo: yongShenInfo
    };
  }

  /**
   * 根据分析类型生成对应的内容
   */
  function generateContentByType(info, analysisType) {
    var typeConfig = ANALYSIS_TYPES[analysisType] || ANALYSIS_TYPES['full'];
    var riWuxing = info.riWuxing;
    var wangShuai = info.wangShuai;

    var content = {
      focus: typeConfig.focus,
      aspect: typeConfig.aspect,
      riWuxing: riWuxing,
      wangShuai: wangShuai
    };

    // 根据分析类型生成具体的分析要点
    switch (analysisType) {
      case 'wealth':
        var caiWuxing = WX_KE_BY[riWuxing]; // 我克者为财
        content.caiXing = caiWuxing;
        content.caiYun = wangShuai.indexOf('旺') >= 0 ? '财星有力，求财易得' : '财星乏力，求财辛苦';
        break;
      case 'talent':
        var shiShangWuxing = WX_SHENG_BY[riWuxing]; // 我生者为食伤
        var yinShouWuxing = WX_SHENG[riWuxing]; // 生我者为印
        content.shiShang = shiShangWuxing;
        content.yinShou = yinShouWuxing;
        break;
      case 'balance':
        var keWoWuxing = WX_KE[riWuxing]; // 克我者为官杀
        content.guanSha = keWoWuxing;
        content.neiHao = wangShuai.indexOf('旺') >= 0 ? '精力充沛，但需注意劳逸结合' : '易感疲惫，需加强自我调养';
        break;
      case 'love':
        var keWoWuxing2 = WX_KE[riWuxing];
        content.peiOuXing = keWoWuxing2;
        content.taoHua = '日支为夫妻宫，需结合具体地支分析';
        break;
    }

    return content;
  }

  /**
   * 填充模板中的占位符
   */
  function fillTemplate(template, info, content) {
    return template
      .replace(/\{日主\}/g, info.riZhu)
      .replace(/\{日主五行\}/g, info.riWuxing)
      .replace(/\{旺衰\}/g, info.wangShuai)
      .replace(/\{建议\}/g, '顺势而为，守正待时')
      .replace(/\{结论\}/g, '此命有可为之机，亦有当避之险')
      .replace(/\{病\}/g, '五行失衡')
      .replace(/\{药\}/g, '用神调和')
      .replace(/\{纳甲\}/g, info.riWuxing + '纳' + info.riZhu)
      .replace(/\{吉凶\}/g, info.wangShuai.indexOf('旺') >= 0 ? '吉多凶少' : '凶多吉少');
  }

  /**
   * 生成分析专论段落（根据分析类型）
   */
  function generateSpecialtyParagraph(master, info, content, analysisType) {
    var riWuxing = info.riWuxing;
    var riZhu = info.riZhu;
    var wangShuai = info.wangShuai;
    var paragraphs = [];

    switch (analysisType) {
      case 'full':
        paragraphs = [
          '日主' + riZhu + '为' + riWuxing + '，生于' + (info.monthPillar || '') + '月，' + wangShuai + '。' +
          '五行之中，' + riWuxing + '为其本气，' + WX_SHENG[riWuxing] + '生之，' + WX_KE[riWuxing] + '克之，' +
          WX_SHENG_BY[riWuxing] + '为其所生，' + WX_KE_BY[riWuxing] + '为其所克。' +
          '观其全局，' + (wangShuai.indexOf('旺') >= 0 ? '日主强旺，能任财官，格局不低。' : '日主偏弱，需印比生扶，待时而发。'),

          '大运流转，十年一换。' + (wangShuai.indexOf('旺') >= 0 ?
            '旺者宜行克泄耗之运，使五行趋于平衡。' :
            '弱者宜行生扶之运，使日主得势而起。') +
          '命虽有定，运可改之。把握当运之年，顺势而为，则事半功倍。'
        ];
        break;
      case 'wealth':
        var caiWuxing = WX_KE_BY[riWuxing];
        paragraphs = [
          riZhu + '日主为' + riWuxing + '，我克者为财，财星为' + caiWuxing + '。' +
          (wangShuai.indexOf('旺') >= 0 ?
            '日主强旺，足以任财，' + caiWuxing + '财可得。求财之道，宜以' + WX_KE_BY[riWuxing] + '为方向，' +
            '如' + caiWuxing + '相关行业，多有财利。' :
            '日主偏弱，不堪任财，' + caiWuxing + '财虽美而难求。需先固本培元，待日主得势，方可求财。'),

          '财运起伏，各有其时。' + (wangShuai.indexOf('旺') >= 0 ?
            '旺者逢财星之运，财源广进；逢比劫之运，需防破财。' :
            '弱者逢印比之运，根基渐固，求财有望；逢财官之运，需量力而行。') +
          '守财之道，在于知止。知止不殆，可以长久。'
        ];
        break;
      case 'talent':
        var shiShang = WX_SHENG_BY[riWuxing];
        var yinShou = WX_SHENG[riWuxing];
        paragraphs = [
          riZhu + '日主为' + riWuxing + '，我生者为食伤（' + shiShang + '），主才华技艺；生我者为印星（' + yinShou + '），主学识文采。' +
          (wangShuai.indexOf('旺') >= 0 ?
            '日主旺盛，食伤有力，才华外露，技艺精湛。宜发挥' + shiShang + '之创造力，在艺术、技术领域有所建树。' :
            '日主虽弱，印星' + yinShou + '生扶，学识渊博，内秀深藏。宜以学问立身，厚积薄发。'),

          '天赋之发掘，需顺其自然。' + (wangShuai.indexOf('旺') >= 0 ?
            '旺者宜泄不宜克，以' + shiShang + '为用，发挥创造力，则天赋尽显。' :
            '弱者宜补不宜泄，以' + yinShou + '为用，潜心学习，则后发制人。') +
          '天赋如种子，需合适土壤方能发芽。知命而后用命，方为明智。'
        ];
        break;
      case 'balance':
        var guanSha = WX_KE[riWuxing];
        paragraphs = [
          riZhu + '日主为' + riWuxing + '，克我者为官杀（' + guanSha + '），主压力与责任。' +
          (wangShuai.indexOf('旺') >= 0 ?
            '日主旺盛，能抗官杀，压力化为动力，责任心强，可担重任。' +
            '但需注意' + guanSha + '过旺则易焦虑，需以' + WX_SHENG_BY[riWuxing] + '（食伤）泄之，或以' + WX_SHENG[riWuxing] + '（印星）化之。' :
            '日主偏弱，官杀' + guanSha + '来克，压力山大，易陷入精神内耗。' +
            '需以' + WX_SHENG[riWuxing] + '（印星）化官杀，以' + WX_SHENG[WX_SHENG[riWuxing]] + '（比劫）助身，方能缓解。'),

          '内耗之源，在于五行失衡。' + (wangShuai.indexOf('旺') >= 0 ?
            '旺者宜泄，多运动、多表达、多创作，以' + WX_SHENG_BY[riWuxing] + '为出口，则身心舒畅。' :
            '弱者宜补，多休息、多学习、多亲近自然，以' + WX_SHENG[riWuxing] + '为滋养，则元气渐复。') +
          '反内耗之道，不在于对抗，而在于调和。阴阳平衡，则百病不生。'
        ];
        break;
      case 'love':
        var peiOu = WX_KE[riWuxing];
        paragraphs = [
          riZhu + '日主为' + riWuxing + '，克我者为官杀（' + peiOu + '），在女命为夫星，在男命为子女星。' +
          (wangShuai.indexOf('旺') >= 0 ?
            '日主旺盛，能任官杀，姻缘不乏，配偶得力。' +
            '但需注意' + peiOu + '过旺则配偶强势，需以柔克刚，以和为贵。' :
            '日主偏弱，官杀' + peiOu + '来克，姻缘路上多波折，需耐心等待合适时机。' +
            '待日主得运而旺，则良缘自至。'),

          '正缘之道，在于相合。' + (wangShuai.indexOf('旺') >= 0 ?
            '旺者宜寻' + WX_KE_BY[riWuxing] + '（财星）或' + WX_SHENG_BY[riWuxing] + '（食伤）旺者，互补平衡。' :
            '弱者宜寻' + WX_SHENG[riWuxing] + '（印星）或' + riWuxing + '（比劫）旺者，相互扶持。') +
          '缘起缘灭，皆有定数。不强求，不将就，顺其自然，方得善缘。'
        ];
        break;
    }

    return paragraphs.join('\n\n');
  }

  /* ========== 五、公开API ========== */

  /**
   * 大师风格分析
   * @param {string} masterId - 大师ID
   * @param {string} analysisType - 分析类型：'full'/'wealth'/'talent'/'balance'/'love'
   * @param {object} bazi - 八字排盘结果对象（来自 BaziEngine.paipan），可选
   * @param {string} gender - 性别：'male'/'female'
   * @returns {object} { opening, overview, specialty, quote, closing }
   */
  function analyze(masterId, analysisType, bazi, gender) {
    // 获取大师数据
    var master = MASTERS[masterId];
    if (!master) {
      // 默认使用邵雍
      master = MASTERS['shaoyong'];
    }

    // 处理八字数据
    if (!bazi || typeof bazi !== 'object') {
      bazi = generateMockBazi(gender);
    }
    if (!bazi.ri_zhu) {
      var merged = generateMockBazi(gender);
      for (var key in merged) {
        if (merged.hasOwnProperty(key) && !bazi[key]) {
          bazi[key] = merged[key];
        }
      }
    }

    // 提取八字信息
    var info = extractBaziInfo(bazi);

    // 生成分析内容
    var content = generateContentByType(info, analysisType);

    // 获取分析类型配置
    var typeConfig = ANALYSIS_TYPES[analysisType] || ANALYSIS_TYPES['full'];

    // 生成五段式分析
    var openingTemplates = master.openingTemplates;
    var opening = fillTemplate(
      openingTemplates[Math.floor(Math.random() * openingTemplates.length)],
      info, content
    );

    // 总论 — 详细版本
    var overview = generateDetailedOverview(master, info, typeConfig, analysisType);

    // 专论 — 详细版：含因果链、个性化分析
    var specialty = generateDetailedSpecialty(master, info, content, analysisType);

    // 经典引用
    var quoteTemplates = master.quoteTemplates;
    var quote = quoteTemplates[Math.floor(Math.random() * quoteTemplates.length)] +
      '\n\n' + master.pronouns + '引此以证汝命：' + info.riZhu + '为' + info.riWuxing + '之' +
      (GAN_YINYANG[info.riZhu] || '阳') + '干，其性' + describeGanNature(info.riZhu) + '。' +
      '今以' + master.name + '之法推之，其理自明，其象自现。' +
      '古人云' + master.phrase + '，诚不我欺也。';

    // 结语
    var closingTemplates = master.closingTemplates;
    var closing = fillTemplate(
      closingTemplates[Math.floor(Math.random() * closingTemplates.length)],
      info, content
    );

    return {
      opening: opening,
      overview: overview,
      specialty: specialty,
      quote: quote,
      closing: closing
    };
  }

  /**
   * 生成详细总论 — 四柱逐柱分析 + 十神 + 格局 + 旺衰 + 用神
   */
  function generateDetailedOverview(master, info, typeConfig, analysisType) {
    var p = master.pronouns;
    var lines = [];

    // 第一段：八字全貌 + 日主
    lines.push(p + '观汝命造，八字排盘为：' + info.baziStr + '。');
    lines.push('日主为' + info.riZhu + '，属' + info.riWuxing + '，' + GAN_YINYANG[info.riZhu] + '干，其性' + describeGanNature(info.riZhu) + '。');

    // 第二段：旺衰详解
    lines.push('');
    lines.push('【旺衰判断】' + info.wangShuaiDetail + '五行力量分布：' +
      '木' + (info.wuxingCount['木'] || 0) + '、火' + (info.wuxingCount['火'] || 0) + '、土' + (info.wuxingCount['土'] || 0) + '、金' + (info.wuxingCount['金'] || 0) + '、水' + (info.wuxingCount['水'] || 0) + '。');

    // 第三段：四柱逐柱十神分析
    lines.push('');
    lines.push('【四柱十神】逐柱论之：');
    var pillars = [
      { name: '年柱', pillar: info.yearPillar, gan: info.yearGan, zhi: info.yearZhi, ssKey: 'year_pillar' },
      { name: '月柱', pillar: info.monthPillar, gan: info.monthGan, zhi: info.monthZhi, ssKey: 'month_pillar' },
      { name: '日柱', pillar: info.dayPillar, gan: info.dayGan, zhi: info.dayZhi, ssKey: 'day_pillar' },
      { name: '时柱', pillar: info.hourPillar, gan: info.hourGan, zhi: info.hourZhi, ssKey: 'hour_pillar' }
    ];
    for (var i = 0; i < pillars.length; i++) {
      var pl = pillars[i];
      var ss = info.allShiShen[pl.ssKey] || '—';
      var ssDesc = SHISHEN_DESC[ss] || '';
      lines.push(pl.name + '「' + pl.pillar + '」：天干' + pl.gan + '为' + ss + '（' + ssDesc + '），地支' + pl.zhi + '藏' + ZHI_WUXING[pl.zhi] + '。');
    }

    // 第四段：格局分析
    lines.push('');
    lines.push('【格局分析】以月令取格，月令为' + info.monthZhi + '，本气' + info.pattern.yuelingBenQi + '（' + GAN_WUXING[info.pattern.yuelingBenQi] + '），' +
      '故为' + info.pattern.name + '，格局' + info.pattern.quality + '。' + info.pattern.analysis);

    // 第五段：用神喜忌
    lines.push('');
    lines.push('【用神喜忌】' + info.yongShenInfo.advice +
      '用神为' + info.yongShenInfo.yongShen.join('、') + '，忌' + info.yongShenInfo.jiShen.join('、') + '。');

    // 第六段：总体判断
    lines.push('');
    lines.push('今以' + typeConfig.label + '论之，聚焦' + typeConfig.focus + '。' +
      '此命' + (info.powerScore >= 60 ? '根基深厚，' : '根基尚浅，') +
      overallVerdict(info, analysisType) + '。');

    return lines.join('\n');
  }

  /**
   * 生成详细专论 — 多段因果链分析
   */
  function generateDetailedSpecialty(master, info, content, analysisType) {
    var riWuxing = info.riWuxing;
    var riZhu = info.riZhu;
    var p = master.pronouns;
    var paragraphs = [];

    // 所有分析类型共用：十神配置详解
    paragraphs.push('【十神配置】' + p + '观汝四柱十神分布：' +
      '年干' + info.yearGan + '为' + (info.allShiShen['year_pillar'] || '—') + '，' +
      '月干' + info.monthGan + '为' + (info.allShiShen['month_pillar'] || '—') + '，' +
      '日主' + riZhu + '为' + riWuxing + '，' +
      '时干' + info.hourGan + '为' + (info.allShiShen['hour_pillar'] || '—') + '。' +
      '十神各有所主，各司其职。' +
      (info.allShiShen['month_pillar'] === '正官' || info.allShiShen['month_pillar'] === '七杀' ?
        '月干透' + info.allShiShen['month_pillar'] + '，主事业心强，有担当，但压力亦大。' :
        info.allShiShen['month_pillar'] === '正财' || info.allShiShen['month_pillar'] === '偏财' ?
        '月干透' + info.allShiShen['month_pillar'] + '，主求财意识强，务实肯干。' :
        info.allShiShen['month_pillar'] === '正印' || info.allShiShen['month_pillar'] === '偏印' ?
        '月干透' + info.allShiShen['month_pillar'] + '，主聪慧有学识，得长辈贵人扶持。' :
        info.allShiShen['month_pillar'] === '食神' || info.allShiShen['month_pillar'] === '伤官' ?
        '月干透' + info.allShiShen['month_pillar'] + '，主才华外露，创意丰富，善于表达。' :
        '月干透' + info.allShiShen['month_pillar'] + '，自有其作用。'));

    // 按分析类型展开详细分析
    switch (analysisType) {
      case 'full':
        paragraphs.push('【五行流通】' + p + '察汝命局五行流通：' + riWuxing + '为本气，' +
          WX_SHENG[riWuxing] + '生之，' + WX_SHENG_BY[riWuxing] + '为其所生，' +
          WX_KE[riWuxing] + '克之，' + WX_KE_BY[riWuxing] + '为其所克。' +
          '五行流通之道，贵在循环无端。' +
          (info.powerScore >= 60 ?
            '汝命' + riWuxing + '气旺盛，' + WX_SHENG_BY[riWuxing] + '（食伤）可泄秀，' + WX_KE_BY[riWuxing] + '（财星）可纳气，' + WX_KE[riWuxing] + '（官杀）可制衡，五行流通之势尚可。' +
            '然' + riWuxing + '过旺，则' + WX_SHENG_BY[riWuxing] + '泄之不及，' + WX_KE[riWuxing] + '制之无力，需大运补足，方得平衡。' :
            '汝命' + riWuxing + '气偏弱，' + WX_SHENG[riWuxing] + '（印星）生之，' + riWuxing + '（比劫）助之，方能自立。' +
            '然' + WX_KE[riWuxing] + '（官杀）克身，' + WX_KE_BY[riWuxing] + '（财星）耗身，' + WX_SHENG_BY[riWuxing] + '（食伤）泄身，三者皆需日主承受，若力有不逮，则易疲惫。'));

        paragraphs.push('【格局成败】' + p + '论汝格局：' + info.pattern.name + '，' + info.pattern.quality + '。' +
          info.pattern.analysis +
          (info.pattern.touGan ?
            '月令之气透于天干，格局清纯有力，' + info.pattern.shiShen + '为用，其力可显。' :
            '月令之气未透于天干，格局藏而不露，' + info.pattern.shiShen + '虽有而力不足，需大运引出方显。') +
          (info.powerScore >= 60 ?
            '日主强旺，足以任' + info.pattern.shiShen + '，格局有成，人生层次不低。' :
            '日主偏弱，不堪任' + info.pattern.shiShen + '，格局虽美而力不足，需待身旺之运方能发挥。'));

        paragraphs.push('【大运趋势】' + p + '推汝大运：男女有别，顺逆有分。' +
          (info.gender === 'male' ?
            (GAN_YINYANG[info.yearGan] === '阳' ? '阳男大运顺行，' : '阴男大运逆行，') :
            (GAN_YINYANG[info.yearGan] === '阳' ? '阳女大运逆行，' : '阴女大运顺行，')) +
          '十年一换，各有吉凶。' +
          (info.powerScore >= 60 ?
            '身旺者宜行克泄耗之运：逢' + WX_KE[riWuxing] + '（官杀）运则事业有成，逢' + WX_SHENG_BY[riWuxing] + '（食伤）运则才华尽展，逢' + WX_KE_BY[riWuxing] + '（财运）则财源广进。' +
            '忌行' + WX_SHENG[riWuxing] + '（印）运和' + riWuxing + '（比劫）运，恐有壅塞之患。' :
            '身弱者宜行生扶之运：逢' + WX_SHENG[riWuxing] + '（印）运则得贵人相助，逢' + riWuxing + '（比劫）运则得朋友扶持。' +
            '忌行' + WX_KE[riWuxing] + '（官杀）运和' + WX_KE_BY[riWuxing] + '（财运），恐有不堪重负之虞。'));

        paragraphs.push('【人生建议】' + p + '综观全局，汝命' + (info.powerScore >= 60 ? '有根基，' : '根基需培，') +
          '当以' + info.yongShenInfo.yongShen.join('、') + '为用，以' + info.yongShenInfo.jiShen.join('、') + '为戒。' +
          '顺势而为，不逆天时；守正待时，不妄求速。' +
          '命虽有定，运可改之。把握' + info.yongShenInfo.yongShen[0] + '旺之年，则事半功倍，大有可为。');
        break;

      case 'wealth':
        var caiWuxing = WX_KE_BY[riWuxing];
        paragraphs.push('【财星分析】' + p + '论汝财运：我克者为财，' + riZhu + '日主' + riWuxing + '克' + caiWuxing + '，故' + caiWuxing + '为汝之财星。' +
          (info.powerScore >= 60 ?
            '日主强旺，足以任财。' + caiWuxing + '财可得，求财之力充足。' +
            '但需注意：身旺财旺方为富命，若财星不显，则需大运引出。' :
            '日主偏弱，不堪任财。' + caiWuxing + '财虽美，但身弱财多则为富屋贫人——财在眼前而无力取之。' +
            '需先固本培元，待日主得势，方可求财。'));

        paragraphs.push('【财源路径】' + p + '察汝财源：' +
          (info.allShiShen['month_pillar'] === '正财' || info.allShiShen['month_pillar'] === '偏财' ?
            '月干透' + info.allShiShen['month_pillar'] + '，财星为用，求财方向明确。' + caiWuxing + '相关行业，如' +
            (caiWuxing === '木' ? '教育、文化、出版、医药' : caiWuxing === '火' ? '能源、餐饮、娱乐、互联网' : caiWuxing === '土' ? '房地产、建筑、农业、矿产' : caiWuxing === '金' ? '金融、法律、机械、五金' : '物流、贸易、旅游、渔业') +
            '等领域，多有财利。' :
            '财星不显于月干，需从大运中求财。' +
            '食伤（' + WX_SHENG_BY[riWuxing] + '）生财，可以技艺、创意、表达为生财之道。'));

        paragraphs.push('【破财之防】' + p + '警示汝之破财隐患：' +
          (info.powerScore >= 60 ?
            '比劫（' + riWuxing + '）为忌，逢比劫旺运，需防合作破财、朋友借贷、冲动消费。' +
            '印星（' + WX_SHENG[riWuxing] + '）亦为忌，过于保守则错失良机。' :
            '官杀（' + WX_KE[riWuxing] + '）克身，逢官杀旺运，压力大而求财难，需量力而行。' +
            '食伤（' + WX_SHENG_BY[riWuxing] + '）泄身，过度消耗精力则财来财去。'));

        paragraphs.push('【理财建议】' + p + '汝之理财之道：' +
          (info.powerScore >= 60 ? '身旺能任财，可适度进取，但需知止。' + caiWuxing + '旺之年，宜加大投入；比劫旺之年，宜守不宜攻。' :
            '身弱不胜财，宜稳健理财，以储蓄为主，投资为辅。待' + WX_SHENG[riWuxing] + '（印）旺之年，根基稳固，再图进取。') +
          '守财之道，在于知止。知止不殆，可以长久。');
        break;

      case 'talent':
        var shiShang = WX_SHENG_BY[riWuxing];
        var yinShou = WX_SHENG[riWuxing];
        paragraphs.push('【天赋根源】' + p + '论汝天赋：' + riZhu + '日主' + riWuxing + '，我生者' + shiShang + '为食伤，主才华技艺；生我者' + yinShou + '为印星，主学识文采。' +
          (info.powerScore >= 60 ?
            '日主旺盛，' + shiShang + '食伤有力，才华外露，创造力强，适合在艺术、技术、创新领域发挥。' +
            '食伤泄秀，能将内在能量转化为外在成果，此为创造型人才之象。' :
            '日主虽弱，' + yinShou + '印星生扶，学识渊博，内秀深藏。' +
            '印星为用，擅长学习、研究、策划，为智慧型人才之象。'));

        paragraphs.push('【天赋方向】' + p + '细察汝之天赋方向：' +
          (info.allShiShen['month_pillar'] === '食神' || info.allShiShen['month_pillar'] === '伤官' ?
            '月干透' + info.allShiShen['month_pillar'] + '，天赋明确，' +
            (info.allShiShen['month_pillar'] === '食神' ? '食神主温和的创造力，适合艺术、美食、教育、心理咨询等需要耐心与审美的领域。' :
              '伤官主锐利的创造力，适合科技、设计、演艺、写作等需要突破与创新的领域。') :
            info.allShiShen['month_pillar'] === '正印' || info.allShiShen['month_pillar'] === '偏印' ?
            '月干透' + info.allShiShen['month_pillar'] + '，天赋在学习与思考，' +
            (info.allShiShen['month_pillar'] === '正印' ? '正印主正统学识，适合学术研究、教育、法律、管理等需要系统知识的领域。' :
              '偏印主特殊才能，适合技术研发、命理玄学、编程、设计等需要独特思维的领域。') :
            '天赋需从大运中寻找方向，' + shiShang + '旺之年创意迸发，' + yinShou + '旺之年学有所成。'));

        paragraphs.push('【发展瓶颈】' + p + '警示汝之天赋发展阻碍：' +
          (info.powerScore >= 60 ?
            '印星（' + yinShou + '）为忌，过于保守或依赖传统思维，可能限制创造力发挥。' +
            '需以' + shiShang + '食伤为用，大胆表达，勇于创新，方能突破瓶颈。' :
            '食伤（' + shiShang + '）泄身，过度表达和创作可能消耗精力，导致身心疲惫。' +
            '需以' + yinShou + '印星为补，注重学习和积累，厚积薄发，方能持续发展。'));

        paragraphs.push('【天赋培养】' + p + '汝之天赋培养之道：' +
          (info.powerScore >= 60 ? '身旺者宜泄不宜克，' + shiShang + '为用，多实践、多创作、多表达。' +
            '选择' + shiShang + '相关的行业和方向，天赋如鱼得水，成就可期。' :
            '身弱者宜补不宜泄，' + yinShou + '为用，多学习、多积累、多沉淀。' +
            '以扎实的学识为基础，天赋方能持久发光。') +
          '天赋如种子，需合适土壤方能发芽。知命而后用命，方为明智。');
        break;

      case 'balance':
        var guanSha = WX_KE[riWuxing];
        paragraphs.push('【压力根源】' + p + '论汝内耗之源：' + riZhu + '日主' + riWuxing + '，克我者' + guanSha + '为官杀，主压力、责任、约束。' +
          (info.powerScore >= 60 ?
            '日主强旺，能抗官杀，压力可化为动力，责任心强，可担重任。' +
            '然' + guanSha + '过旺，则易焦虑烦躁，需以' + WX_SHENG_BY[riWuxing] + '（食伤）泄之，以' + WX_SHENG[riWuxing] + '（印星）化之，方能身心平衡。' :
            '日主偏弱，官杀' + guanSha + '来克，如小舟遇大浪，易感压力山大。' +
            '精力有限而责任无限，此乃内耗之根源。需以' + WX_SHENG[riWuxing] + '（印星）化官杀，以' + riWuxing + '（比劫）助身，方能缓解。'));

        paragraphs.push('【内耗模式】' + p + '察汝内耗之具体模式：' +
          (info.allShiShen['month_pillar'] === '七杀' || info.allShiShen['hour_pillar'] === '七杀' ?
            '命带七杀，性格刚烈，对自己要求极高，追求完美，容易陷入"不够好"的自我否定中。' +
            '七杀无制则为祸，需以食神制杀或以印星化杀，方能将压力转化为动力，而非内耗。' :
            info.allShiShen['month_pillar'] === '正官' || info.allShiShen['hour_pillar'] === '正官' ?
            '命带正官，责任心过强，事事亲力亲为，不擅拒绝他人，容易被他人的期望压垮。' +
            '需学会设定边界，适度放手，方能减少内耗。' :
            '内耗多源于五行失衡：' + (info.powerScore >= 60 ? '身旺而' + riWuxing + '气壅塞，能量无处宣泄，易生烦躁。' :
              '身弱而' + guanSha + '来克，精力不足而事务繁多，易生疲惫。')));

        paragraphs.push('【调和之道】' + p + '授汝反内耗之方：' +
          (info.powerScore >= 60 ?
            '身旺者宜泄，泄之方有三：一曰运动，以' + WX_SHENG_BY[riWuxing] + '（食伤）为出口，跑步、健身、球类等体能消耗可解' + riWuxing + '气之壅塞；' +
            '二曰创作，以' + WX_SHENG_BY[riWuxing] + '为表达，写作、绘画、音乐等创意输出可化内耗为成果；' +
            '三曰社交，以' + WX_KE_BY[riWuxing] + '（财）为媒介，适度消费和社交可调和' + riWuxing + '气之过旺。' :
            '身弱者宜补，补之方有三：一曰休息，以' + WX_SHENG[riWuxing] + '（印）为滋养，保证充足睡眠，减少不必要的消耗；' +
            '二曰学习，以' + WX_SHENG[riWuxing] + '为积累，读书、听课、冥想，以内养外；' +
            '三曰结伴，以' + riWuxing + '（比劫）为扶持，与志同道合者同行，互相鼓励。'));

        paragraphs.push('【心法要诀】' + p + '反内耗之根本，不在术而在道。' +
          '阴阳平衡，则百病不生；五行流通，则万事顺遂。' +
          '汝当知：内耗非敌，乃身心之警报。闻警报而知调理，此乃知命改命之道。' +
          '不求事事完美，但求心安理得。' + (info.powerScore >= 60 ? '旺者知收敛，' : '弱者知蓄力，') + '则内耗自消，福泽自至。');
        break;

      case 'love':
        var peiOu = WX_KE[riWuxing];
        paragraphs.push('【姻缘根基】' + p + '论汝姻缘：' + riZhu + '日主' + riWuxing + '，克我者' + peiOu + '为官杀。' +
          (info.gender === 'female' ? '女命以官杀为夫星，' + peiOu + '即汝之正缘所系。' :
            '男命以财星为妻星，' + WX_KE_BY[riWuxing] + '即汝之正缘所系。') +
          (info.powerScore >= 60 ?
            '日主强旺，能任' + (info.gender === 'female' ? '官杀' : '财星') + '，姻缘不乏，' + (info.gender === 'female' ? '配偶' : '伴侣') + '得力。' +
            '但需注意' + (info.gender === 'female' ? peiOu : WX_KE_BY[riWuxing]) + '过旺则' + (info.gender === 'female' ? '配偶强势，需以柔克刚，以和为贵。' : '妻管严，需保持独立，不失自我。') :
            '日主偏弱，' + (info.gender === 'female' ? '官杀' + peiOu : '财星' + WX_KE_BY[riWuxing]) + '来' + (info.gender === 'female' ? '克' : '耗') + '，姻缘路上多波折，需耐心等待合适时机。' +
            '待日主得运而旺，则良缘自至。'));

        paragraphs.push('【夫妻宫解】' + p + '察汝日支夫妻宫：日支' + info.dayZhi + '为' + ZHI_WUXING[info.dayZhi] + '，乃婚姻之根基。' +
          (ZHI_WUXING[info.dayZhi] === riWuxing ?
            '夫妻宫为比劫，配偶性格独立，与汝志趣相投，但需注意平等相处，避免竞争。' :
            ZHI_WUXING[info.dayZhi] === WX_SHENG[riWuxing] ?
            '夫妻宫为印星，配偶温柔体贴，如长辈般照顾汝，婚姻稳定温暖。' :
            ZHI_WUXING[info.dayZhi] === WX_SHENG_BY[riWuxing] ?
            '夫妻宫为食伤，配偶有才华有情趣，但需注意沟通方式，避免言语伤害。' :
            ZHI_WUXING[info.dayZhi] === WX_KE[riWuxing] ?
            '夫妻宫为官杀，配偶有主见有担当，但需注意控制欲，给彼此空间。' :
            ZHI_WUXING[info.dayZhi] === WX_KE_BY[riWuxing] ?
            '夫妻宫为财星，配偶务实能干，婚姻有物质基础，但需注意情感交流。' :
            '夫妻宫之气，需结合全局判断。'));

        paragraphs.push('【正缘特征】' + p + '推汝正缘之特征：' +
          (info.gender === 'female' ?
            '女命以' + peiOu + '为夫，正缘之' + peiOu + '旺者，' + (peiOu === '木' ? '性格正直，有事业心，如大树般可靠。' :
              peiOu === '火' ? '热情开朗，有领导力，如阳光般温暖。' :
              peiOu === '土' ? '稳重踏实，有责任心，如大地般包容。' :
              peiOu === '金' ? '果断刚毅，有原则，如金石般坚定。' :
              '聪明灵活，有智慧，如流水般适应。') :
            '男命以' + WX_KE_BY[riWuxing] + '为妻，正缘之' + WX_KE_BY[riWuxing] + '旺者，' + (WX_KE_BY[riWuxing] === '木' ? '温柔贤惠，善解人意，如春风般和煦。' :
              WX_KE_BY[riWuxing] === '火' ? '热情大方，善于社交，如火焰般耀眼。' :
              WX_KE_BY[riWuxing] === '土' ? '勤俭持家，稳重可靠，如大地般踏实。' :
              WX_KE_BY[riWuxing] === '金' ? '精明细致，善于理财，如珠玉般珍贵。' :
              '柔情似水，善解人意，如清泉般滋润。')));

        paragraphs.push('【姻缘时机】' + p + '观汝姻缘时机：' +
          (info.powerScore >= 60 ?
            '身旺者逢' + (info.gender === 'female' ? peiOu : WX_KE_BY[riWuxing]) + '旺之运，正缘当至。' +
            '亦需注意' + riWuxing + '（比劫）旺之运，恐有竞争或第三者干扰。' :
            '身弱者逢' + WX_SHENG[riWuxing] + '（印）旺之运或' + riWuxing + '（比劫）旺之运，自身状态好转，方有良缘。' +
            '不可急于求成，待时而动，方得善果。') +
          '缘起缘灭，皆有定数。不强求，不将就，顺其自然，方得善缘。');
        break;
    }

    return paragraphs.join('\n\n');
  }

  // 辅助判断函数
  function riWuxingValue(wx) {
    var map = { 木: '木', 火: '火', 土: '土', 金: '金', 水: '水' };
    return map[wx] || wx;
  }

  function judgePattern(info, master) {
    if (info.wangShuai.indexOf('旺') >= 0) {
      return '身旺';
    }
    return '身弱';
  }

  function checkWuxingBalance(info) {
    if (info.wangShuai.indexOf('旺') >= 0) {
      return '偏旺，需克泄耗以求平衡';
    }
    return '偏弱，需生扶以求平衡';
  }

  function overallVerdict(info, analysisType) {
    var typeMap = {
      'full': '此命有可造之材，需待时而发',
      'wealth': '财运有起伏，需把握时机',
      'talent': '天赋异禀，需善加发掘',
      'balance': '需调和阴阳，方能身心安泰',
      'love': '良缘可期，需耐心等待'
    };
    return typeMap[analysisType] || '此命有可为之机';
  }

  function describeGanNature(gan) {
    var map = {
      '甲': '刚健正直，如参天大树',
      '乙': '柔顺婉转，如藤萝依木',
      '丙': '光明热烈，如烈日当空',
      '丁': '温和内敛，如灯烛之火',
      '戊': '厚重沉稳，如城墙之土',
      '己': '柔润滋养，如田园之土',
      '庚': '刚硬锋利，如刀剑之金',
      '辛': '精致细腻，如珠玉之金',
      '壬': '奔流不息，如江河之水',
      '癸': '润物无声，如雨露之水'
    };
    return map[gan] || '中和之性';
  }

  // 暴露到全局
  global.MastersEngine = {
    analyze: analyze,
    MASTERS: MASTERS,
    ANALYSIS_TYPES: ANALYSIS_TYPES,

    /**
     * 多术数组合蒸馏入口
     * @param {string[]} masterIds - 大师ID数组
     * @param {object} compositeData - CompositeEngine.run()返回的结果
     * @param {string} question - 所问之事
     * @returns {object[]} 每位大师的点评
     */
    batchAnalyze: function (masterIds, compositeData, question) {
      if (!masterIds || masterIds.length === 0) {
        masterIds = ['guiguzi', 'shaoyong', 'zhugeliang'];
      }
      var score = compositeData.score;
      var trend = compositeData.trend;
      var synthesis = compositeData.synthesis || {};
      var results = compositeData.individualResults || [];

      var selectedMasters = masterIds.filter(function (id) {
        return !!MASTERS[id];
      });
      if (selectedMasters.length === 0) selectedMasters = ['guiguzi'];

      var commentaries = [];
      for (var i = 0; i < selectedMasters.length; i++) {
        var mid = selectedMasters[i];
        var master = MASTERS[mid];
        var commentary = generateCommentary(master, score, trend, synthesis, results, question);
        commentaries.push({
          id: mid,
          name: master.name,
          title: master.title,
          era: master.era,
          avatar: master.avatar,
          style: master.style,
          commentary: commentary
        });
      }
      return commentaries;
    }
  };

  /* ========== 组合蒸馏专用点评生成 ========== */
  function generateCommentary(master, score, trend, synthesis, results, question) {
    var opening = master.openingTemplates[Math.floor(Math.random() * master.openingTemplates.length)];
    var closing = master.closingTemplates[Math.floor(Math.random() * master.closingTemplates.length)];

    var trendText = trend === 'up' ? '呈上升之势' : (trend === 'down' ? '需谨慎应对' : '趋于平稳');
    var scoreText = score >= 75 ? '吉象明显' : (score >= 55 ? '吉凶参半' : '局势偏凶');

    var methodsUsed = '';
    for (var i = 0; i < results.length && i < 3; i++) {
      methodsUsed += (i > 0 ? '、' : '') + results[i].name;
    }
    if (results.length > 3) methodsUsed += '等';

    var base = master.pronouns + opening.replace(/\{日主\}/g, '').replace(/\{日主五行\}/g, '').replace(/\{旺衰\}/g, trendText) + '\n\n综合' + methodsUsed + '多术同参，所问之事【' + (question || '当前运势') + '】已现端倪：' + scoreText + '。\n\n';

    // 根据大师风格生成差异化点评
    var flavor = '';
    if (master.id === 'guiguzi') {
      flavor = '捭阖之道，贵在审时度势。此事宜开不宜阖，宜动不宜静。阴阳之机，正在转折处把握。';
    } else if (master.id === 'jingfang') {
      flavor = '纳甲推之，吉凶早有定数。然天道无亲，常与善人。顺势而为，自有天助。';
    } else if (master.id === 'zhugeliang') {
      flavor = '谋事在人，成事在天。诸术合参已示方向，当择吉日吉时而动，步步为营，方能运筹帷幄。';
    } else if (master.id === 'yuanli') {
      flavor = '五行流通，命自不凡。多术验证已明，此一事天时地利皆备，唯待人和。顺势而行，可保无虞。';
    } else if (master.id === 'lichunfeng') {
      flavor = '天象人事，理出一源。星象历数已示吉兆，把握当下，顺势推进，则天道可循，人事可成。';
    } else if (master.id === 'wangpu') {
      flavor = '太乙之数，穷极天地。多术合参归一，吉凶已在数中。守正待时，自有定数。';
    } else if (master.id === 'chenxizai') {
      flavor = '紫微斗数所示，星曜流转自有规律。今多术合参，已见帝星照耀，宜把握良机。';
    } else if (master.id === 'shaoyong') {
      flavor = '先天易学，象数理占。以数推之，体用关系已明；以象验之，变化之机可寻。顺其自然，功到自然成。';
    } else if (master.id === 'xuzile') {
      flavor = '子平之法，以日为主。今观多术结果，格局已成，用神得力。顺势而为，则命途亨通。';
    } else if (master.id === 'liuzhitong') {
      flavor = '奇门遁甲，帝王之学。时空格局已显，开门大吉在即。择吉方吉时而动，天助人助。';
    } else if (master.id === 'wanminying') {
      flavor = '三命通会，万法归宗。各路术数虽有不同，结论却殊途同归。此乃大吉之兆。';
    } else if (master.id === 'zhangnan') {
      flavor = '病药相济，中和为贵。多术合参所示，有冲必有合，有险必有机。知险而避之，知机而取之。';
    } else if (master.id === 'yelan') {
      flavor = '格局清浊，贵贱自分。多术同参，格局已明。清气上扬，浊气退散，顺势而为。';
    } else if (master.id === 'shenxiao') {
      flavor = '格局顺逆，真假分明。今日多术合参，格局已成，用神得位。当顺势而行，不可逆势而动。';
    } else if (master.id === 'renqiao') {
      flavor = '滴天髓阐微，用神为要。多术同示吉象，用神得力。得用神之助，如虎添翼。';
    } else if (master.id === 'zhenguan') {
      flavor = '大道至简，命理亦然。千言万语，约之不过顺势二字。多术合参已示方向，行之即可。';
    } else if (master.id === 'shutong') {
      flavor = '星平会海，合参为妙。星宗子平，一炉共冶。今多术合参，其理自明，顺势而行。';
    } else if (master.id === 'weixian') {
      flavor = '千里命稿，验之于实。命理非玄虚之学，乃人生经验之总结。多术合参所示方向明确，当付诸行动。';
    } else if (master.id === 'yuanshu') {
      flavor = '探源溯本，五行流通。多术合参所示，根源已明，大势已定。源清则流洁，本固则枝荣。';
    } else if (master.id === 'linxuan') {
      flavor = '人鉴命理，以人为镜。古今名人命例已证：多术同归之时，即为时机成熟之日。当机立断。';
    } else if (master.id === 'songhuibin') {
      flavor = '奇门学术，逻辑为先。多术合参实为多模型交叉验证，结论可信度高。科学决策，理性执行。';
    } else if (master.id === 'zhougong') {
      flavor = '梦者魂游，兆者事应。今以梦学合参诸术，象数已明。吉梦兆福，凶梦示警，当察而改之。';
    } else if (master.id === 'zhangziye') {
      flavor = '综合术数，融会贯通。各派虽异，其理归一。多术合参已示方向，当择善而从，勇往直前。';
    } else if (master.id === 'shaoyanhe') {
      flavor = '六壬神课，天地盘开。四课三传已示端的，吉凶之象，尽在课中。观象知机，顺势而为，则天人相应。';
    } else if (master.id === 'chengongxian') {
      flavor = '六壬指南，理法兼备。课体既定，类神已明，三传所示即为事之机要。知理而行，方不迷途。';
    } else if (master.id === 'nihaihsia') {
      flavor = '天纪紫微，以医入命。星曜分布如人身经络，有病则治，有偏则调。知命如知病，改运如用药。';
    } else if (master.id === 'wangtingzhi') {
      flavor = '中州紫微，星曜为宗。庙旺利陷已分，四化飞星已定。星曜组合如棋局，一着得位，全局皆活。';
    } else if (master.id === 'guoyuqing') {
      flavor = '六壬大全，集古法之大成。课经为纲，毕法为目，纲举目张。多术合参，如众星拱月，方向已明。';
    } else if (master.id === 'chengshuxun') {
      flavor = '一字诀妙，玉连环通。精微之处见真章，多术合参之下，关键节点已浮现。把握机要，事半功倍。';
    } else if (master.id === 'luohongxian') {
      flavor = '星曜性情，宫位断事。多术合参已明，星宫相应，吉凶自见。知命而行，如顺水行舟。';
    } else if (master.id === 'lubinzao') {
      flavor = '体系为纲，逻辑为用。多术合参如多模型交叉验证，结论可信。科学决策，理性前行。';
    } else {
      flavor = '综合百家之言，此事格局已现。多术同参，吉兆明确。把握关键节点，自可趋吉避凶。';
    }

    var resultText = base + flavor + '\n\n' + closing.replace(/\{结论\}/g, scoreText).replace(/\{建议\}/g, trend === 'up' ? '顺势而为' : '韬光养晦');

    return resultText;
  }

})(typeof window !== 'undefined' ? window : this);