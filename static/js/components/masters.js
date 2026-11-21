/**
 * 大师蒸馏组件 v2 — 精简版，融入分析流程
 * 不再有独立输入区，直接接收已有排盘数据进行分析
 *
 * 用法：
 *   renderMastersPanel(container, options)
 *   options: { category, masters, analysisTypes, onAnalyze, resultData }
 *   - category: 流派过滤（'八字'/'风水'等）
 *   - masters: 大师数据数组 [{id, name, title, era, avatar, category}]
 *   - analysisTypes: 分析类型 [{id, label}]
 *   - onAnalyze(masterId, analysisType): 分析回调，返回 { opening, overview, specialty, quote, closing }
 *   - resultData: 可选，用于展示分析所需的基本信息
 */
function renderMastersPanel(container, options) {
  'use strict';
  var opts = options || {};
  var masters = opts.masters || [];
  var analysisTypes = opts.analysisTypes || [{ id: 'full', label: '全盘分析' }];
  var category = opts.category || '';
  var onAnalyze =
    opts.onAnalyze ||
    function () {
      return null;
    };
  var resultData = opts.resultData || {};

  var selectedMaster = null;
  var selectedType = (analysisTypes[0] || {}).id || 'full';

  // 流派标签颜色
  var categoryColors = {
    八字: 'var(--gold)',
    六爻: '#c9a03c',
    奇门: '#4a9a8c',
    紫微: '#8a6ab8',
    大六壬: '#4a8ac9',
    风水: '#6a9a4a',
    梅花: '#c96a8a',
    太乙: '#8a8ac9',
    解梦: '#6a6a9a',
    综合: '#9a8a6a',
  };

  var html = '';

  // 标题
  html += '<div class="section-header">';
  html += '<h2 class="page-title">大师点评</h2>';
  html +=
    '<p class="page-subtitle">' +
    (category ? category + '流派 · ' + masters.length + '位大师，选择一位为汝解盘' : '选择一位大师，以古法解今盘') +
    '</p>';
  html += '</div>';

  // 大师选择区
  html += '<div class="glass-card mb-24" id="masters-select-panel">';
  html +=
    '<h3 style="font-family:var(--font-serif);color:var(--gold);margin-bottom:16px;font-size:1rem;">选择一位大师</h3>';
  html += '<div class="master-cat-grid" id="masters-grid">';
  for (var i = 0; i < masters.length; i++) {
    var m = masters[i];
    html += '<div class="master-card" data-master-id="' + m.id + '">';
    html += '<div class="master-avatar">' + (m.avatar || '⭐') + '</div>';
    html += '<div class="master-name">' + m.name + '</div>';
    html += '<div class="master-title">' + (m.title || '') + '</div>';
    html +=
      '<div class="master-era">' +
      (m.era || '') +
      (m.style ? ' · ' + (m.style.split('，')[0] || m.style.split('，')[0]) : '') +
      '</div>';
    html += '</div>';
  }
  html += '</div>';

  // 分析类型选择
  if (analysisTypes.length > 1) {
    html += '<div class="form-group mt-8">';
    html +=
      '<label class="form-label" style="font-size:0.72rem;color:var(--text2);margin-bottom:6px;letter-spacing:0.05em;">分析类型</label>';
    html += '<div class="tabs" id="master-type-tabs" style="margin-bottom:0;border-bottom:none;">';
    for (var j = 0; j < analysisTypes.length; j++) {
      var t = analysisTypes[j];
      html +=
        '<button class="tab-btn' +
        (t.id === selectedType ? ' active' : '') +
        '" data-type="' +
        t.id +
        '">' +
        t.label +
        '</button>';
    }
    html += '</div>';
    html += '</div>';
  }

  // 分析按钮
  html +=
    '<button class="btn-gold lg" id="master-analyze-btn" style="width:100%;margin-top:12px;" disabled>请先选择一位大师</button>';
  html += '</div>';

  // 结果区域
  html += '<div id="master-result-area" class="hidden">';
  html += '<div class="glass-card" id="master-result-card"></div>';
  html += '</div>';

  container.innerHTML = html;

  // 大师选择事件
  var grid = container.querySelector('#masters-grid');
  grid.addEventListener('click', function (e) {
    var card = e.target.closest('.master-card');
    if (!card) return;
    var masterId = card.dataset.masterId;
    selectedMaster = null;
    for (var k = 0; k < masters.length; k++) {
      if (masters[k].id === masterId) {
        selectedMaster = masters[k];
        break;
      }
    }
    // 更新选中状态
    var allCards = grid.querySelectorAll('.master-card');
    for (var c = 0; c < allCards.length; c++) {
      allCards[c].classList.remove('selected');
    }
    card.classList.add('selected');
    // 更新按钮
    var btn = container.querySelector('#master-analyze-btn');
    btn.disabled = false;
    btn.textContent = '请 ' + selectedMaster.name + ' 点评';
  });

  // 分析类型选择
  var typeTabs = container.querySelector('#master-type-tabs');
  if (typeTabs) {
    typeTabs.addEventListener('click', function (e) {
      var btn = e.target.closest('.tab-btn');
      if (!btn) return;
      var allBtns = typeTabs.querySelectorAll('.tab-btn');
      for (var b = 0; b < allBtns.length; b++) {
        allBtns[b].classList.remove('active');
      }
      btn.classList.add('active');
      selectedType = btn.dataset.type;
    });
  }

  // 分析按钮
  container.querySelector('#master-analyze-btn').addEventListener('click', function () {
    if (!selectedMaster) return;
    var btn = container.querySelector('#master-analyze-btn');
    var resultArea = container.querySelector('#master-result-area');
    var resultCard = container.querySelector('#master-result-card');

    resultArea.classList.remove('hidden');
    resultCard.innerHTML = '<div class="spinner"></div>';
    btn.disabled = true;
    btn.textContent = '分析中...';

    // 使用 setTimeout 让 UI 先更新（spinner 显示），然后同步执行分析
    setTimeout(function () {
      try {
        var result = onAnalyze(selectedMaster.id, selectedType);
        if (!result) {
          resultCard.innerHTML =
            '<div class="error-container"><div class="error-icon">⚠️</div><div class="error-text">分析数据不足，请先完成排盘</div></div>';
        } else {
          renderMasterResult(resultCard, result, selectedMaster, categoryColors);
        }
      } catch (err) {
        resultCard.innerHTML =
          '<div class="error-container"><div class="error-icon">⚠️</div><div class="error-text">分析出错：' +
          (err.message || '未知错误') +
          '</div></div>';
      }
      btn.disabled = false;
      btn.textContent = '请 ' + selectedMaster.name + ' 点评';
      resultCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 50);
  });
}

/** 渲染大师分析结果 */
function renderMasterResult(container, result, master, categoryColors) {
  var sections = [
    { key: 'opening', label: '开篇', icon: '📜', desc: '大师以自身风格开场，点明分析方向' },
    { key: 'overview', label: '总论', icon: '🔍', desc: '详细分析命盘/格局全貌' },
    { key: 'specialty', label: '专论', icon: '💎', desc: '聚焦所选方向，展开深度分析' },
    { key: 'quote', label: '经典引用', icon: '📖', desc: '引经据典，以古鉴今' },
    { key: 'closing', label: '结语', icon: '🎋', desc: '总结核心论断，给出方向性指引' },
  ];

  var catColor = (categoryColors || {})[master.category] || 'var(--gold)';

  var html = '<div class="fade-in">';
  // 大师头部信息
  html += '<div class="master-result-header">';
  html +=
    '<div class="master-result-avatar-wrap"><span class="master-result-avatar">' +
    (master.avatar || '⭐') +
    '</span></div>';
  html += '<div class="master-result-info">';
  html +=
    '<h3 class="master-result-name">' +
    master.name +
    '<span class="master-result-era">' +
    (master.era || '') +
    '</span></h3>';
  html += '<p class="master-result-title">' + (master.title || '') + '</p>';
  html += '<div class="master-result-tags">';
  html +=
    '<span class="master-result-tag" style="border-color:' +
    catColor +
    ';color:' +
    catColor +
    ';">' +
    (master.category || '') +
    '</span>';
  if (master.style) html += '<span class="master-result-tag">' + master.style + '</span>';
  html += '</div></div></div>';
  html += '<div class="master-result-divider"></div>';

  // 五段式分析
  html += '<div class="master-result-body">';
  for (var i = 0; i < sections.length; i++) {
    var section = sections[i];
    var content = result[section.key];
    if (content) {
      var paragraphs = content.split('\n\n');
      var formatted = '';
      for (var p = 0; p < paragraphs.length; p++) {
        var para = paragraphs[p].trim();
        if (para) formatted += '<p>' + para.replace(/\n/g, '<br>') + '</p>';
      }
      html += '<div class="master-result-section" style="--delay:' + i * 0.08 + 's;">';
      html += '<div class="master-section-header">';
      html += '<span class="master-section-icon">' + section.icon + '</span>';
      html +=
        '<div class="master-section-title-wrap"><span class="master-section-title">' +
        section.label +
        '</span><span class="master-section-desc">' +
        section.desc +
        '</span></div>';
      html += '<span class="master-section-num">0' + (i + 1) + '</span>';
      html += '</div>';
      html += '<div class="master-section-content">' + formatted + '</div>';
      html += '</div>';
    }
  }
  html += '</div>';

  container.innerHTML = html;
}

/**
 * 渲染大师蒸馏独立页面（#/masters路由用）
 * 展示所有大师，可选择分析
 */
function renderMastersComponent(userInfo) {
  'use strict';
  var el = document.createElement('div');
  el.className = 'fade-in';

  var mastersData = [];
  if (typeof MastersEngine !== 'undefined' && MastersEngine.MASTERS) {
    for (var k in MastersEngine.MASTERS) {
      if (MastersEngine.MASTERS.hasOwnProperty(k)) {
        mastersData.push(MastersEngine.MASTERS[k]);
      }
    }
  }

  var categories = {};
  for (var i = 0; i < mastersData.length; i++) {
    var c = mastersData[i].category || '综合';
    if (!categories[c]) categories[c] = [];
    categories[c].push(mastersData[i]);
  }
  var catKeys = Object.keys(categories).sort();

  var html = '<div style="max-width:800px;margin:0 auto;padding:20px 0;">';

  // Header
  html += '<div class="section-header">';
  html += '<h2 class="page-title">👨‍🏫 大师蒸馏</h2>';
  html += '<p class="page-subtitle">融通诸派，群英论道，以古鉴今。</p>';
  html += '</div>';

  // Category filter
  html += '<div class="tab-bar" id="master-cat-tabs" style="margin-bottom:20px;">';
  html += '<button class="tab-btn active" data-cat="all">全部</button>';
  for (var ci = 0; ci < catKeys.length; ci++) {
    html += '<button class="tab-btn" data-cat="' + catKeys[ci] + '">' + catKeys[ci] + '</button>';
  }
  html += '</div>';

  // Master cards grid
  html += '<div class="glass-card" style="margin-bottom:20px;">';
  html += '<div class="master-cat-grid" id="master-page-grid">';
  for (var j = 0; j < mastersData.length; j++) {
    var m = mastersData[j];
    html += '<div class="master-card" data-master-id="' + m.id + '" data-cat="' + (m.category || '综合') + '">';
    html += '<div class="master-avatar">' + (m.avatar || '⭐') + '</div>';
    html += '<div class="master-name">' + m.name + '</div>';
    html += '<div class="master-title">' + (m.title || '') + '</div>';
    html += '<div class="master-era">' + (m.era || '') + '</div>';
    html += '</div>';
  }
  html += '</div>';
  html += '</div>';

  // 真实盘面参数（大师点评必须基于引擎排盘，不再用通用模板虚构）
  html += '<div class="glass-card" style="margin-bottom:20px;" id="master-chart-card">';
  html += '<h3 style="font-family:var(--font-serif);color:var(--gold);margin-bottom:6px;font-size:0.95rem;">🗂 盘面参数</h3>';
  html += '<p style="font-size:0.76rem;color:var(--text2);margin-bottom:12px;" id="master-chart-hint">八字 / 紫微 / 综合类需出生信息，其余流派按占测时间起盘。</p>';
  html += '<div class="form-row">';
  html += '<div class="form-group"><label class="form-label">出生日期</label><input type="date" class="form-input" id="master-birth-date" min="1900-01-01" max="' + todayStr() + '"></div>';
  html += '<div class="form-group"><label class="form-label">出生时辰</label><select class="form-select" id="master-birth-time"><option value="">请选择</option>' + masterShichenOptions() + '</select></div>';
  html += '<div class="form-group"><label class="form-label">性别</label><select class="form-select" id="master-gender"><option value="male">男</option><option value="female">女</option></select></div>';
  html += '</div>';
  html += '<div class="form-row">';
  html += '<div class="form-group"><label class="form-label">占测日期</label><input type="date" class="form-input" id="master-div-date" max="' + todayStr() + '"></div>';
  html += '<div class="form-group"><label class="form-label">占测时辰</label><select class="form-select" id="master-div-time">' + masterShichenOptions() + '</select></div>';
  html += '<div class="form-group"><label class="form-label">风水坐山</label><select class="form-select" id="master-fs-sitting">' + masterZhiOptions() + '</select></div>';
  html += '</div>';
  html += '<div id="master-chart-error" style="min-height:18px;color:var(--red);font-size:0.78rem;"></div>';
  html += '</div>';

  // Question + analyze
  html += '<div class="glass-card" style="margin-bottom:20px;">';
  html += '<h3 style="font-family:var(--font-serif);color:var(--gold);margin-bottom:12px;font-size:0.95rem;">📝 输入所问之事</h3>';
  html += '<textarea id="master-question-input" class="question-input" rows="3" placeholder="请输入您想问的问题，例如：最近事业运势如何？" style="width:100%;resize:vertical;font-size:0.88rem;"></textarea>';
  html += '<div id="master-selected-info" style="font-size:0.8rem;color:var(--text2);margin-top:8px;"></div>';
  html += '<div style="text-align:center;margin-top:14px;">';
  html += '<button class="btn-gold" id="master-page-analyze-btn" disabled>请先选择一位大师</button>';
  html += '</div>';
  html += '</div>';

  // Result
  html += '<div id="master-page-result-area" class="hidden">';
  html += '<div class="glass-card" id="master-page-result-card"></div>';
  html += '</div>';

  html += '</div>';
  el.innerHTML = html;

  // 默认占测日期/时辰：取当前本地时间，避免用户误以为空值也会按今日起盘
  var divDateEl = el.querySelector('#master-div-date');
  if (divDateEl) divDateEl.value = todayStr();
  var divTimeEl = el.querySelector('#master-div-time');
  if (divTimeEl) divTimeEl.value = currentShichenName();
  var fsSittingEl = el.querySelector('#master-fs-sitting');
  if (fsSittingEl) fsSittingEl.value = '子';
  // 命簿已有出生信息时预填，减少重复输入
  var ui = (userInfo && userInfo.userInfo) ? userInfo.userInfo : (userInfo || {});
  var birthEl = el.querySelector('#master-birth-date');
  if (birthEl && ui.birthDate) birthEl.value = ui.birthDate;
  var genderSel = el.querySelector('#master-gender');
  if (genderSel && ui.gender) genderSel.value = ui.gender === 'female' ? 'female' : 'male';

  // Tab filtering
  var tabs = el.querySelectorAll('#master-cat-tabs .tab-btn');
  var grid = el.querySelector('#master-page-grid');
  tabs.forEach(function(tab) {
    tab.addEventListener('click', function() {
      tabs.forEach(function(t) { t.classList.remove('active'); });
      tab.classList.add('active');
      var cat = tab.dataset.cat;
      var cards = grid.querySelectorAll('.master-card');
      cards.forEach(function(card) {
        if (cat === 'all' || card.dataset.cat === cat) {
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // Master selection
  var selectedMaster = null;
  grid.addEventListener('click', function(e) {
    var card = e.target.closest('.master-card');
    if (!card) return;
    var id = card.dataset.masterId;
    selectedMaster = null;
    for (var i = 0; i < mastersData.length; i++) {
      if (mastersData[i].id === id) {
        selectedMaster = mastersData[i];
        break;
      }
    }
    var allCards = grid.querySelectorAll('.master-card');
    for (var c = 0; c < allCards.length; c++) {
      allCards[c].classList.remove('selected');
    }
    card.classList.add('selected');
    var info = el.querySelector('#master-selected-info');
    if (info && selectedMaster) {
      info.textContent = '已选择：' + selectedMaster.name + ' · ' + (selectedMaster.category || '综合') + ' · ' + (selectedMaster.era || '');
    }
    var hint = el.querySelector('#master-chart-hint');
    var errEl = el.querySelector('#master-chart-error');
    if (errEl) errEl.textContent = '';
    if (hint && selectedMaster) {
      var needBirth = ['八字', '紫微', '综合'].indexOf(selectedMaster.category) !== -1;
      hint.textContent = needBirth
        ? '「' + selectedMaster.category + '」需出生日期与出生时辰，缺失将无法排盘。'
        : selectedMaster.category === '解梦'
          ? '「解梦」请把梦境写在下方问题框，按梦境起盘。'
          : '「' + selectedMaster.category + '」将按占测日期与时辰起盘。';
    }
    var btn = el.querySelector('#master-page-analyze-btn');
    if (btn) {
      btn.disabled = false;
      btn.textContent = '请 ' + (selectedMaster ? selectedMaster.name : '') + ' 点评';
    }
  });

  // Analyze button
  var analyzeBtn = el.querySelector('#master-page-analyze-btn');
  if (analyzeBtn) {
    analyzeBtn.addEventListener('click', function() {
      if (!selectedMaster) return;
      var question = (el.querySelector('#master-question-input') || {}).value || '';
      var resultArea = el.querySelector('#master-page-result-area');
      var resultCard = el.querySelector('#master-page-result-card');
      var errEl = el.querySelector('#master-chart-error');
      if (!resultArea || !resultCard) return;
      if (errEl) errEl.textContent = '';

      // 先排真实盘面；缺参数或引擎失败时明确报错，不退回通用模板
      var chart;
      try {
        chart = buildMasterChart(selectedMaster.category, question, el);
      } catch (e) {
        if (errEl) errEl.textContent = e.message || '排盘参数不完整';
        if (resultArea) resultArea.classList.add('hidden');
        return;
      }

      resultArea.classList.remove('hidden');
      resultCard.innerHTML = '<div class="spinner" style="margin:40px auto;"></div>';
      analyzeBtn.disabled = true;
      analyzeBtn.textContent = '分析中...';

      setTimeout(function() {
        try {
          var analysis = analyzeMasterChart(selectedMaster, chart, question);
          if (!analysis) {
            resultCard.innerHTML = '<div style="padding:20px;color:var(--red);text-align:center;">该流派暂无可用解析，请换一位大师或前往对应板块查看点评。</div>';
          } else {
            renderMasterResult(resultCard, analysis, selectedMaster, {});
          }
        } catch(e) {
          resultCard.innerHTML = '<div style="padding:20px;color:var(--red);text-align:center;">分析出错：' + masterEsc(e.message || '未知错误') + '</div>';
        }
        analyzeBtn.disabled = false;
        analyzeBtn.textContent = '请 ' + selectedMaster.name + ' 点评';
        resultArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    });
  }

  return el;
}

/* ===== 独立大师页：真实盘面构建与解析 ===== */

var MASTER_SHICHEN = ['子时', '丑时', '寅时', '卯时', '辰时', '巳时', '午时', '未时', '申时', '酉时', '戌时', '亥时'];
var MASTER_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

function masterEsc(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function todayStr() {
  var d = new Date();
  var pad = function (n) { return n < 10 ? '0' + n : '' + n; };
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
}

function masterShichenOptions() {
  var html = '';
  for (var i = 0; i < MASTER_SHICHEN.length; i++) {
    html += '<option value="' + MASTER_SHICHEN[i] + '">' + MASTER_SHICHEN[i] + '</option>';
  }
  return html;
}

function masterZhiOptions() {
  var html = '';
  for (var i = 0; i < MASTER_ZHI.length; i++) {
    html += '<option value="' + MASTER_ZHI[i] + '">' + MASTER_ZHI[i] + '山</option>';
  }
  return html;
}

// 当前本地时辰（子时 23:00-01:00）
function currentShichenName() {
  var h = new Date().getHours();
  return MASTER_SHICHEN[Math.floor(((h + 1) % 24) / 2)];
}

function masterHourOf(name) {
  var map = { 子时: 0, 丑时: 2, 寅时: 4, 卯时: 6, 辰时: 8, 巳时: 10, 午时: 12, 未时: 14, 申时: 16, 酉时: 18, 戌时: 20, 亥时: 22 };
  return typeof map[name] === 'number' ? map[name] : 0;
}

// 六壬用 0-11 的时辰序号
function masterShichenIndex(name) {
  var idx = MASTER_SHICHEN.indexOf(name);
  return idx < 0 ? 0 : idx;
}

/**
 * 按流派构建真实盘面。
 * 缺参数时抛出明确错误，由调用方展示，不静默改用今日或默认值。
 */
function buildMasterChart(category, question, el) {
  var birthDate = (el.querySelector('#master-birth-date') || {}).value || '';
  var birthTime = (el.querySelector('#master-birth-time') || {}).value || '';
  var gender = (el.querySelector('#master-gender') || {}).value === 'female' ? 'female' : 'male';
  var divDate = (el.querySelector('#master-div-date') || {}).value || todayStr();
  var divTime = (el.querySelector('#master-div-time') || {}).value || currentShichenName();
  var sitting = (el.querySelector('#master-fs-sitting') || {}).value || '子';

  var needBirth = category === '八字' || category === '紫微' || category === '综合';
  var y, m, d;
  if (needBirth) {
    if (!birthDate) throw new Error('请先填写出生日期');
    if (!birthTime) throw new Error('请先选择出生时辰');
    if (birthDate > todayStr()) throw new Error('出生日期不能晚于今天');
    var parts = birthDate.split('-');
    y = parseInt(parts[0], 10);
    m = parseInt(parts[1], 10);
    d = parseInt(parts[2], 10);
    if (!y || !m || !d) throw new Error('出生日期格式不正确');
  }

  if (category === '八字' || category === '综合') {
    if (typeof BaziEngine === 'undefined' || !BaziEngine.paipan) throw new Error('八字引擎未加载');
    var bazi = BaziEngine.paipan(y, m, d, masterHourOf(birthTime));
    var pillars = (bazi['年柱'] || '') + ' ' + (bazi['月柱'] || '') + ' ' + (bazi['日柱'] || '') + ' ' + (bazi['时柱'] || '');
    return { method: 'bazi', result: bazi, bazi: bazi, gender: gender, question: question, summary: '四柱：' + pillars + '，日主' + (bazi['日主'] || '') };
  }

  if (category === '紫微') {
    if (typeof ZiWeiEngine === 'undefined' || !ZiWeiEngine.paipan) throw new Error('紫微引擎未加载');
    var ziwei = ZiWeiEngine.paipan({ year: y, month: m, day: d, hour: birthTime, gender: gender, isLunar: false });
    var summary = '命宫' + (ziwei['命宫'] || '—') + '，身宫' + (ziwei['身宫'] || '—') + (ziwei['五行局'] ? '，' + ziwei['五行局'] : '');
    return { method: 'ziwei', result: ziwei, gender: gender, question: question, summary: summary };
  }

  if (category === '六爻') {
    if (typeof LiuyaoEngine === 'undefined' || !LiuyaoEngine.divine) throw new Error('六爻引擎未加载');
    var lineMap = {
      6: { type: 'yin', changing: true },
      7: { type: 'yang', changing: false },
      8: { type: 'yin', changing: false },
      9: { type: 'yang', changing: true }
    };
    var lines = [];
    for (var i = 0; i < 6; i++) {
      var total = [2, 3][Math.random() > 0.5 ? 1 : 0] + [2, 3][Math.random() > 0.5 ? 1 : 0] + [2, 3][Math.random() > 0.5 ? 1 : 0];
      lines.push(lineMap[total]);
    }
    var lr = LiuyaoEngine.divine(lines);
    return {
      method: 'liuyao', result: lr, question: question,
      summary: '本卦「' + (lr.gua_name || '—') + '」' + (lr.changed_gua && lr.changed_gua.name ? '，变卦「' + lr.changed_gua.name + '」' : '')
    };
  }

  if (category === '梅花') {
    if (typeof MeihuaEngine === 'undefined' || !MeihuaEngine.divine) throw new Error('梅花引擎未加载');
    var mh = MeihuaEngine.divine({ method: 'datetime' });
    return {
      method: 'meihua', result: mh, question: question,
      summary: '本卦「' + (mh.original_gua ? mh.original_gua.name : '—') + '」，变卦「' + (mh.changed_gua ? mh.changed_gua.name : '—') + '」'
    };
  }

  if (category === '奇门') {
    if (typeof QimenEngine === 'undefined' || !QimenEngine.divine) throw new Error('奇门引擎未加载');
    var qm = QimenEngine.divine(divDate, divTime, 'auto');
    return { method: 'qimen', result: qm, question: question, summary: '奇门起局：' + divDate + ' ' + divTime };
  }

  if (category === '太乙') {
    if (typeof TaiyiEngine === 'undefined' || !TaiyiEngine.divine) throw new Error('太乙引擎未加载');
    var ty = TaiyiEngine.divine(divDate, divTime);
    var god = ty.taiyi_god && ty.taiyi_god.name ? ty.taiyi_god.name : '—';
    return { method: 'taiyi', result: ty, question: question, summary: '太乙落' + (ty.taiyi_gong || '—') + '宫，值' + god + '神' };
  }

  if (category === '诸葛') {
    if (typeof ZhugeEngine === 'undefined' || !ZhugeEngine.divine) throw new Error('诸葛引擎未加载');
    var nums = [Math.floor(Math.random() * 999) + 1, Math.floor(Math.random() * 999) + 1, Math.floor(Math.random() * 999) + 1];
    var zg = ZhugeEngine.divine({ method: 'random', numbers: nums });
    return {
      method: 'zhuge', result: zg, question: question,
      summary: '第' + (zg.number || zg['签号'] || '—') + '签，签等「' + (zg.level || '—') + '」'
    };
  }

  if (category === '大六壬') {
    if (typeof DaLiuRenEngine === 'undefined' || !DaLiuRenEngine.divine) throw new Error('六壬引擎未加载');
    var dl = DaLiuRenEngine.divine(divDate, masterShichenIndex(divTime));
    return { method: 'daliuren', result: dl, question: question, summary: '课体「' + (dl.ke_name || '—') + '」，断为「' + (dl.level || '—') + '」' };
  }

  if (category === '解梦') {
    if (!question) throw new Error('解梦类大师请在问题框描述梦境');
    if (typeof ZhougongEngine === 'undefined' || !ZhougongEngine.divine) throw new Error('解梦引擎未加载');
    var zm = ZhougongEngine.divine(question, question);
    return { method: 'zhougong', result: zm, question: question, summary: '梦境判为「' + (zm.ji || '—') + '」' };
  }

  if (category === '风水') {
    if (typeof FengshuiEngine === 'undefined' || !FengshuiEngine.divine) throw new Error('风水引擎未加载');
    var facing = MASTER_ZHI[(MASTER_ZHI.indexOf(sitting) + 6) % 12];
    var cy = new Date().getFullYear();
    var fs = FengshuiEngine.divine({ sitting: sitting, facing: facing, buildYear: cy, currentYear: cy });
    return {
      method: 'fengshui', result: fs, question: question,
      summary: '坐' + sitting + '向' + facing + '，综合 ' + (typeof fs.overallScore === 'number' ? fs.overallScore + ' 分' : '未评分') + '（' + (fs.overallLevel || '—') + '）'
    };
  }

  throw new Error('该流派暂不支持独立排盘');
}

/** 大师口吻的五段式内容：仅使用真实盘面与既有解析器 */
function analyzeMasterChart(master, chart, question) {
  var cat = master.category;
  var q = question || '';

  var specific = null;
  if (cat === '八字' || cat === '综合') {
    if (typeof MastersEngine !== 'undefined' && MastersEngine.analyze) {
      specific = MastersEngine.analyze(master.id, 'full', convertBaziFormat(chart.bazi, chart.gender), chart.gender);
    }
  } else if (cat === '六爻' && typeof generateLiuyaoAnalysis === 'function') {
    specific = generateLiuyaoAnalysis(master, chart.result, q);
  } else if (cat === '梅花' && typeof generateMeihuaAnalysis === 'function') {
    specific = generateMeihuaAnalysis(master, chart.result, q);
  } else if (cat === '奇门' && typeof generateQimenAnalysis === 'function') {
    specific = generateQimenAnalysis(master, chart.result, q);
  } else if (cat === '太乙' && typeof generateTaiyiAnalysis === 'function') {
    specific = generateTaiyiAnalysis(master, chart.result, q);
  } else if (cat === '诸葛' && typeof DomainAnalysis !== 'undefined' && DomainAnalysis.analyzeZhugeMaster) {
    specific = DomainAnalysis.analyzeZhugeMaster(master, chart.result, q);
  } else if (cat === '紫微') {
    specific = buildZiweiMasterNarrative(master, chart, q);
  }
  // 专属解析器缺失或返回空时，退回真实盘面的通用叙述；绝不虚构盘面
  return specific || buildGenericMasterNarrative(master, chart, q);
}

function pickMasterQuote(master) {
  var quotes = master.quoteTemplates || [];
  if (quotes.length > 0 && quotes[0].indexOf('{') === -1) return quotes[0];
  return (master.name || '大师') + '尝曰："' + (master.phrase || '观天之道，执天之行') + '。"';
}

function buildZiweiMasterNarrative(master, chart, question) {
  var r = chart.result;
  var gongs = r['十二宫'] || [];
  var mingGong = null;
  for (var i = 0; i < gongs.length; i++) {
    if (gongs[i] && gongs[i].name === '命宫') { mingGong = gongs[i]; break; }
  }
  var stars = mingGong && mingGong.stars && mingGong.stars.length ? mingGong.stars.join('、') : '无主星';
  var da = (typeof DomainAnalysis !== 'undefined' && DomainAnalysis.analyze) ? DomainAnalysis.analyze('ziwei', r, question || '请解读此紫微命盘') : null;
  var opening = (master.pronouns || '吾') + '以紫微斗数观此命盘：命宫在' + masterEsc(r['命宫'] || '—') + '，身宫在' + masterEsc(r['身宫'] || '—') + '，' + masterEsc(r['五行局'] || '') + '。';
  if (question) opening += '所问「' + masterEsc(question) + '」。';
  return {
    opening: opening,
    overview: '命宫星曜：' + masterEsc(stars) + '。十二宫以命宫为枢，吉凶须合大限流年而断。',
    specialty: da && da.analysis ? da.analysis : '未填写所问之事，仅列盘面要点，不作具体吉凶推断。',
    quote: pickMasterQuote(master),
    closing: '以上皆据紫微盘面直述；具体吉凶须结合大限流年，本页不代为虚断。'
  };
}

function buildGenericMasterNarrative(master, chart, question) {
  var analysisText = '';
  if (question && typeof DomainAnalysis !== 'undefined' && DomainAnalysis.analyze) {
    var a = DomainAnalysis.analyze(chart.method, chart.result, question);
    if (a && a.analysis) analysisText = a.analysis;
  }
  var opening = (master.pronouns || '吾') + '以' + (master.category || '术数') + '之术观此盘：' + chart.summary + '。';
  if (question) opening += '所问「' + masterEsc(question) + '」，' + (master.phrase ? masterEsc(master.phrase) + '。' : '');
  return {
    opening: opening,
    overview: '盘面实况：' + chart.summary + '。',
    specialty: analysisText || '未填写所问之事，仅列盘面实况，不作具体吉凶推断。',
    quote: pickMasterQuote(master),
    closing: '以上皆据引擎盘面直述；盘面所示吉凶须结合所问之事与具体情境，不作绝对断言。'
  };
}

