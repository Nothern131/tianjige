/**
 * 天机阁 · 紫微斗数组件
 * 命盘类：出生日期+时辰+性别 → 十二宫 → 十四主星 → 四化 → 解读
 * 后台算法：陈希夷《紫微斗数全书》体系
 */
function renderZiweiComponent() {
  var container = document.createElement('div');
  container.className = 'fade-in';

  container.innerHTML =
    '\
    <div class="section-header">\
      <h2 class="page-title">紫微斗数</h2>\
      <p class="page-subtitle">紫微帝星照命宫，十二宫垣定一生。后台融合陈希夷《紫微斗数全书》算法</p>\
    </div>\
\
    <div class="glass-card mb-24" id="ziwei-input-area">\
      <h3 style="font-family:var(--font-serif);color:var(--gold);margin-bottom:16px;">\u{1F52E} 排盘参数</h3>\
      <div class="form-row" style="grid-template-columns:1fr 1fr 1fr;">\
        <div class="form-group">\
          <label class="form-label">出生日期</label>\
          <input type="date" class="form-input" id="ziwei-birthdate">\
        </div>\
        <div class="form-group">\
          <label class="form-label">出生时辰</label>\
          <select class="form-select" id="ziwei-birthtime">\
            <option value="\u5B50\u65F6">\u5B50\u65F6 (23:00-01:00)</option>\
            <option value="\u4E11\u65F6">\u4E11\u65F6 (01:00-03:00)</option>\
            <option value="\u5BC5\u65F6">\u5BC5\u65F6 (03:00-05:00)</option>\
            <option value="\u536F\u65F6">\u536F\u65F6 (05:00-07:00)</option>\
            <option value="\u8FB0\u65F6">\u8FB0\u65F6 (07:00-09:00)</option>\
            <option value="\u5DF3\u65F6" selected>\u5DF3\u65F6 (09:00-11:00)</option>\
            <option value="\u5348\u65F6">\u5348\u65F6 (11:00-13:00)</option>\
            <option value="\u672A\u65F6">\u672A\u65F6 (13:00-15:00)</option>\
            <option value="\u7533\u65F6">\u7533\u65F6 (15:00-17:00)</option>\
            <option value="\u9149\u65F6">\u9149\u65F6 (17:00-19:00)</option>\
            <option value="\u620C\u65F6">\u620C\u65F6 (19:00-21:00)</option>\
            <option value="\u4EA5\u65F6">\u4EA5\u65F6 (21:00-23:00)</option>\
          </select>\
        </div>\
        <div class="form-group">\
          <label class="form-label">性别</label>\
          <select class="form-select" id="ziwei-gender">\
            <option value="\u7537">\u7537</option>\
            <option value="\u5973">\u5973</option>\
          </select>\
        </div>\
      </div>\
\
      <div class="form-group" style="margin-top:16px;">\
        <label class="form-label">\u{1F52E} 你所问之事（可选）</label>\
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px;" id="ziwei-domain-tags">\
          ' +
    [
      '\u{1F4BC} \u4E8B\u4E1A',
      '\u{1F495} \u611F\u60C5',
      '\u{1F4B0} \u8D22\u8FD0',
      '\u{1F3E5} \u5065\u5EB7',
      '\u{1F4DA} \u5B66\u4E1A',
      '\u{1F3E0} \u5BB6\u5EAD',
      '\u{1F91D} \u4EBA\u9645',
      '\u2708\uFE0F \u51FA\u884C',
    ]
      .map(function (d) {
        return (
          '<button class="btn-gold outline" style="font-size:0.75rem;padding:4px 10px;" data-domain="' +
          d +
          '">' +
          d +
          '</button>'
        );
      })
      .join('') +
    '\
        </div>\
        <input type="text" class="form-input" id="ziwei-question" placeholder="\u6216\u8F93\u5165\u4F60\u60F3\u95EE\u7684\u5177\u4F53\u95EE\u9898\uFF0C\u5982\uFF1A\u6700\u8FD1\u4E8B\u4E1A\u8FD0\u5982\u4F55\uFF1F...">\
      </div>\
\
      <button class="btn-gold lg" id="ziwei-submit" style="width:100%;margin-top:16px;">\u{1F52E} \u6392\u76D8\u63A8\u6F14</button>\
    </div>\
\
    <div id="ziwei-result-area" class="hidden">\
      <div class="glass-card" id="ziwei-result-card"></div>\
      <div id="ziwei-masters-area" class="hidden" style="margin-top:24px;"></div>\
    </div>\
  ';

  // 设置默认日期
  var dateInput = container.querySelector('#ziwei-birthdate');
  dateInput.value = '2000-01-01';

  // 事域快捷按钮
  var domainTags = container.querySelectorAll('#ziwei-domain-tags button');
  var questionInput = container.querySelector('#ziwei-question');
  domainTags.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var domain = this.getAttribute('data-domain');
      questionInput.value = domain;
      questionInput.focus();
    });
  });

  // 排盘推演
  container.querySelector('#ziwei-submit').addEventListener('click', function () {
    var dateStr = dateInput.value;
    var birthTime = container.querySelector('#ziwei-birthtime').value;
    var gender = container.querySelector('#ziwei-gender').value;
    var question = questionInput.value.trim();

    if (!dateStr) {
      window.showToast && window.showToast('\u8BF7\u9009\u62E9\u51FA\u751F\u65E5\u671F');
      return;
    }

    var dp = dateStr.split('-');
    var params = {
      year: parseInt(dp[0]) || 2000,
      month: parseInt(dp[1]) || 1,
      day: parseInt(dp[2]) || 1,
      hour: birthTime,
      gender: gender,
      isLunar: false,
    };

    var result;
    try {
      result = ZiWeiEngine.paipan(params);
    } catch (e) {
      window.showToast && window.showToast('\u6392\u76D8\u5931\u8D25\uFF1A' + e.message);
      return;
    }

    renderZiweiResult(container, result, question);

    // 自动记入命簿：紫微引擎无真实评分，不写伪造 score
    if (typeof UserProfileAPI !== 'undefined') {
      try {
        UserProfileAPI.addRecord({
          type: 'ziwei',
          question: question || '紫微排盘',
          result: {
            mingGong: result['\u547D\u5BAB'] || '',
            shenGong: result['\u8EAB\u5BAB'] || '',
            wuxingJu: result['\u4E94\u884C\u5C40'] || ''
          }
        });
      } catch (e) {
        console.warn('[命簿] 紫微记录写入失败', e);
      }
    }
  });

  return container;
}

// 四化对象转文案（缺失字段如实显示“未提供”）
function formatZiweiSiHua(s) {
  if (!s) return '未提供';
  return (s.lu || '未提供') + '化禄 · ' + (s.quan || '未提供') + '化权 · ' +
    (s.ke || '未提供') + '化科 · ' + (s.ji || '未提供') + '化忌';
}

function renderZiweiResult(container, result, question) {
  var resultArea = container.querySelector('#ziwei-result-area');
  var resultCard = container.querySelector('#ziwei-result-card');

  var mingGongZhuXing = result['\u547D\u5BAB\u4E3B\u661F'] || '\u65E0\u4E3B\u661F';
  var mingGong = result['\u547D\u5BAB'] || '?';
  var shenGong = result['\u8EAB\u5BAB'] || '?';
  var wuxingJu = result['\u4E94\u884C\u5C40'] || '?';
  var siHua = result['\u56DB\u5316'] || {};
  var gongs = result['\u5341\u4E8C\u5BAB'] || [];
  var overallVerdict = result['\u603B\u4F53\u8FD0\u52BF'] || '\u4E2D\u5E73';

  var gongNames = ZiWeiEngine.GONG_NAMES || [
    '\u547D\u5BAB',
    '\u5144\u5F1F',
    '\u592B\u59BB',
    '\u5B50\u5973',
    '\u8D22\u5E1B',
    '\u75BE\u5384',
    '\u8FC1\u79FB',
    '\u4EA4\u53CB',
    '\u5B98\u797F',
    '\u7530\u5B85',
    '\u798F\u5FB7',
    '\u7236\u6BCD',
  ];

  var gongCards = '';
  for (var i = 0; i < gongs.length; i++) {
    var g = gongs[i];
    var isMing = g.isMingGong ? 'minggong-highlight' : '';
    var isShen = g.isShenGong ? 'shengong-highlight' : '';
    var starStr = g.stars && g.stars.length > 0 ? g.stars.join('\u3001') : '\u2014';
    var marker = '';
    if (g.isMingGong) marker = ' <span style="color:var(--gold);font-size:0.7rem;">\u547D</span>';
    if (g.isShenGong) marker += ' <span style="color:#c9a84c;font-size:0.7rem;">\u8EAB</span>';

    gongCards +=
      '\
      <div class="ziwei-gong-card ' +
      isMing +
      ' ' +
      isShen +
      '">\
        <div class="gong-header">\
          <span class="gong-name">' +
      g.name +
      marker +
      '</span>\
          <span class="gong-ganzhi">' +
      g.ganZhi +
      '</span>\
        </div>\
        <div class="gong-stars">' +
      starStr +
      '</div>\
      </div>\
    ';
  }

  // ===== 大限 / 流年运程（只渲染引擎真实数据）=====
  var yunXianHtml = '';
  if (typeof ZiWeiEngine !== 'undefined' && ZiWeiEngine.calcDaXian && ZiWeiEngine.calcLiuNian) {
    try {
      var now = new Date();
      var lunarNow = null;
      if (typeof ZiWeiEngine.solarToLunar === 'function') {
        lunarNow = ZiWeiEngine.solarToLunar(now.getFullYear(), now.getMonth() + 1, now.getDate());
      }
      var birthLunarYear = parseInt(result['\u519C\u5386\u5E74'], 10);
      var currentAge = lunarNow && birthLunarYear ? lunarNow.year - birthLunarYear + 1 : 0;
      if (!currentAge || currentAge < 1) currentAge = 1;

      var dx = ZiWeiEngine.calcDaXian(result, currentAge);
      var ln = ZiWeiEngine.calcLiuNian(result, now.getFullYear());
      var cur = dx.currentLimit >= 0 ? dx.list[dx.currentLimit] : null;

      var chips = '';
      dx.list.forEach(function (item, idx) {
        var active = idx === dx.currentLimit;
        chips +=
          '<div style="padding:8px 12px;border-radius:10px;border:1px solid ' +
          (active ? 'rgba(184,154,92,0.65)' : 'rgba(255,255,255,0.08)') +
          ';background:' + (active ? 'rgba(184,154,92,0.14)' : 'rgba(0,0,0,0.22)') +
          ';font-size:0.76rem;line-height:1.5;min-width:96px;text-align:center;">' +
          '<div style="color:' + (active ? 'var(--gold)' : 'var(--text-secondary)') + ';">' + item.startAge + '–' + item.endAge + '岁</div>' +
          '<div style="color:var(--text-primary);">' + item.ganZhi + '</div>' +
          '<div style="color:var(--text-muted);">' + (item.gongName || '未知') + '</div>' +
          '</div>';
      });

      var curHtml = cur
        ? '当前虚岁 <b style="color:var(--gold);">' + currentAge + '</b> 岁 · 行 <b>' + cur.startAge + '–' + cur.endAge + '</b> 岁大限：' +
          cur.ganZhi + ' 临 <b>' + cur.gongName + '</b> 宫，主星 ' +
          (cur.stars.length ? cur.stars.slice(0, 4).join('、') : '无主星') +
          '；大限四化：' + formatZiweiSiHua(cur.siHua) + '。'
        : '当前虚岁 <b style="color:var(--gold);">' + currentAge + '</b> 岁，已超出引擎 1–60 岁大限范围。';

      var lnHtml = '流年 <b>' + ln.year + '</b>（' + ln.ganZhi + '）流年命宫临 <b>' + ln.gongName +
        '</b> 宫，星曜 ' + (ln.stars.length ? ln.stars.slice(0, 4).join('、') : '无主星') +
        '；流年四化：' + formatZiweiSiHua(ln.siHua) + '。';

      yunXianHtml =
        '<h4 style="color:var(--gold);margin:20px 0 8px;">\u{1F9ED} \u5927\u9650 \u00B7 \u6D41\u5E74\u8FD0\u7A0B</h4>' +
        '<div style="background:rgba(184,154,92,0.05);border:1px solid rgba(255,255,255,0.05);border-radius:10px;padding:14px;">' +
        '<div style="font-size:0.86rem;line-height:1.8;color:var(--text-secondary);">' + curHtml + '</div>' +
        '<div style="font-size:0.86rem;line-height:1.8;color:var(--text-secondary);margin-top:4px;">' + lnHtml + '</div>' +
        '<div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:12px;">' + chips + '</div>' +
        '<div style="font-size:0.72rem;color:var(--text-muted);margin-top:10px;">大限按虚岁排（1–10 岁起于命宫）；流年按公历年/太岁。仅展示引擎计算结果，未作吉凶推断。</div>' +
        '</div>';
    } catch (e) {
      console.warn('[紫微] 运限数据计算失败', e);
      yunXianHtml = '';
    }
  } else {
    console.warn('[紫微] 运限数据不可用');
  }

  var html =
    '\
    <div class="section-header">\
      <h2 class="page-title">\u{1F52E} \u7D2B\u5FAE\u6597\u6570\u547D\u76D8</h2>\
      <p class="page-subtitle">\u519C\u5386' +
    (result['\u519C\u5386\u5E74'] || '?') +
    '\u5E74' +
    (result['\u519C\u5386\u6708'] || '?') +
    '\u6708' +
    (result['\u519C\u5386\u65E5'] || '?') +
    '\u65E5 | \u5E74\u5E72' +
    (result['\u5E74\u5E72'] || '?') +
    ' | \u547D\u5BAB\u4E3B\u661F\uFF1A' +
    mingGongZhuXing +
    '</p>\
    </div>\
\
    <div class="glass-card mb-24">\
      <div style="display:flex;align-items:center;gap:16px;margin-bottom:16px;flex-wrap:wrap;">\
        <span style="font-size:1.2rem;font-weight:700;color:var(--gold);">\u547D\u5BAB\uFF1A' +
    mingGong +
    '</span>\
        <span style="color:var(--text-secondary);">\u8EAB\u5BAB\uFF1A' +
    shenGong +
    '</span>\
        <span style="color:var(--text-secondary);">' +
    wuxingJu +
    '</span>\
      </div>\
\
      <div style="margin-bottom:16px;color:var(--text-secondary);">\
        \u56DB\u5316\uFF1A' +
    (siHua.lu || '?') +
    '\u5316\u7984 \u00B7 ' +
    (siHua.quan || '?') +
    '\u5316\u6743 \u00B7 ' +
    (siHua.ke || '?') +
    '\u5316\u79D1 \u00B7 ' +
    (siHua.ji || '?') +
    '\u5316\u5FCC\
      </div>\
\
      <div style="margin-bottom:16px;padding:12px;background:rgba(184,154,92,0.05);border-radius:8px;border-left:3px solid var(--gold);">\
        <strong style="color:var(--gold);">\u603B\u4F53\u8FD0\u52BF\uFF1A</strong> ' +
    overallVerdict +
    '\
      </div>\
\
      <h4 style="color:var(--gold);margin-bottom:8px;">\u{1F3E0} \u5341\u4E8C\u5BAB\u661F\u66DC\u5206\u5E03</h4>\
      <div class="ziwei-gongs-grid">\
        ' +
    gongCards +
    '\
      </div>\
      ' +
    yunXianHtml +
    '\
      <h4 style="color:var(--gold);margin:20px 0 8px;">\u{1F4DD} \u547D\u76D8\u89E3\u8BFB</h4>\
      <div style="background:rgba(184,154,92,0.05);padding:16px;border-radius:8px;border-left:3px solid var(--gold);white-space:pre-wrap;line-height:1.8;font-size:0.9rem;">' +
    (result.interpretation || '') +
    '</div>\
    </div>\
  ';

  // 问事分析
  if (question && window.DomainAnalysis) {
    var da = window.DomainAnalysis.analyze('ziwei', result, question);
    if (da && da.analysis) {
      html +=
        '\
        <div class="glass-card mb-24">\
          <div style="background:rgba(184,154,92,0.05);padding:16px;border-radius:8px;white-space:pre-wrap;line-height:1.8;font-size:0.9rem;">' +
        da.analysis +
        '</div>\
        </div>\
      ';
    }
  }

  resultCard.innerHTML = html;
  resultArea.classList.remove('hidden');
  resultArea.scrollIntoView({ behavior: 'smooth', block: 'start' });

  // 大师点评面板（EP8Z 体验页已打磨的五段式大师解读，主站/体验页共用）
  initZiweiMastersPanel(container, result, question);
}

/** 紫微斗数大师点评面板 — 移植自 EP8Z 体验页，主站/体验页共用 */
function initZiweiMastersPanel(container, result, question) {
  if (typeof MastersEngine === 'undefined' || typeof renderMastersPanel === 'undefined') return;

  var mastersArea = container.querySelector('#ziwei-masters-area');
  if (!mastersArea) return;

  // 过滤紫微斗数大师
  var ziweiMasters = [];
  if (typeof MastersEngine !== 'undefined' && MastersEngine.MASTERS) {
    var allMasters = MastersEngine.MASTERS;
    for (var key in allMasters) {
      if (allMasters.hasOwnProperty(key)) {
        var m = allMasters[key];
        if (m.category === '紫微' || m.category === '综合') {
          ziweiMasters.push(m);
        }
      }
    }
    var seen = {};
    ziweiMasters = ziweiMasters.filter(function (m) {
      if (seen[m.id]) return false;
      seen[m.id] = true;
      return true;
    });
  }

  if (ziweiMasters.length === 0) {
    mastersArea.innerHTML = '<p style="color:var(--text-muted);text-align:center;padding:20px;">暂无可用大师</p>';
    return;
  }

  if (typeof renderMastersPanel !== 'function') return;
  renderMastersPanel(mastersArea, {
    category: '紫微',
    masters: ziweiMasters,
    analysisTypes: [
      { id: 'full', label: '命盘解读' },
      { id: 'minggong', label: '命宫专论' },
    ],
    onAnalyze: function (masterId, analysisType) {
      var master = MastersEngine.MASTERS[masterId];
      if (!master || !result) return null;

      var q = question || (analysisType === 'minggong' ? '请重点解读命宫主星与四化飞星' : '请全面解读此命盘');

      var fullResult = '';
      var mingResult = '';
      if (typeof DomainAnalysis !== 'undefined' && DomainAnalysis.analyze) {
        try {
          var r1 = DomainAnalysis.analyze('ziwei', result, q);
          if (r1 && r1.analysis) fullResult = r1.analysis;
        } catch(e){}
        try {
          var r2 = DomainAnalysis.analyze('ziwei', result, '请重点解读命宫主星与四化飞星');
          if (r2 && r2.analysis) mingResult = r2.analysis;
        } catch(e){}
      }
      if (!fullResult) {
        fullResult = '命宫：' + (result.命宫||'?') + '（主星：' + (result.命宫主星||'无') + '）\n身宫：' + (result.身宫||'?') + ' | 五行局：' + (result.五行局||'?') + '\n紫微落：' + (result.紫微星落||'?') + '宫\n总体运势：' + (result.总体运势||'平稳');
      }
      if (!mingResult) {
        mingResult = '【命宫专论】命宫在' + (result.命宫||'?') + '，主星' + (result.命宫主星||'无') + '。' + (result.总体运势||'运势平稳') + '。';
      }

      var openingTpl = master.openingTemplates && master.openingTemplates[0]
        ? master.openingTemplates[0]
        : master.name + '观紫微星盘，帝星所临，吉凶自现。';
      var opening = openingTpl
        .replace(/\{日主\}/g, result.命宫主星||'紫微')
        .replace(/\{日主五行\}/g, result.五行局||'金')
        .replace(/\{旺衰\}/g, result.总体运势||'平和');

      var quoteTpl = master.quoteTemplates && master.quoteTemplates[0]
        ? master.quoteTemplates[0]
        : '《紫微斗数全书》云："紫微帝座，乃众星之主，万曜之尊。"';

      var closingTpl = master.closingTemplates && master.closingTemplates[0]
        ? master.closingTemplates[0]
        : '大师断之：' + (result.总体运势||'运势平稳') + '。星曜流转，命亦随之。';
      var closing = closingTpl
        .replace(/\{结论\}/g, result.总体运势||'命途平顺')
        .replace(/\{建议\}/g, '顺势而为，守正待时');

      return {
        opening: opening,
        overview: fullResult,
        specialty: analysisType === 'minggong' ? mingResult : fullResult,
        quote: quoteTpl,
        closing: closing,
      };
    },
  });
}
