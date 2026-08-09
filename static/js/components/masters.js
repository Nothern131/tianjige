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

  html +=
    '<div class="master-result-footer"><span class="master-footer-note">以上分析由纯前端算法生成，基于大师历史风格复刻，仅供娱乐参考</span></div>';

  // 满意度评分区
  html += '<div class="satisfaction-bar" id="satisfaction-bar">';
  html += '<div class="satisfaction-label">分析是否有帮助？</div>';
  html += '<div class="satisfaction-stars" id="satisfaction-stars">';
  for (var s = 1; s <= 5; s++) {
    html += '<span class="sat-star" data-score="' + s + '">' + (s <= 3 ? '☆' : '★') + '</span>';
  }
  html += '</div>';
  html += '<div class="satisfaction-msg hidden" id="satisfaction-msg"></div>';
  html += '</div>';

  // 评分交互
  var satBar = container.querySelector('#satisfaction-bar');
  var satStars = container.querySelector('#satisfaction-stars');
  var satMsg = container.querySelector('#satisfaction-msg');
  var satScores = satStars.querySelectorAll('.sat-star');
  var satGiven = -1;

  satStars.addEventListener('mouseover', function (e) {
    var star = e.target.closest('.sat-star');
    if (!star) return;
    var hoverScore = parseInt(star.dataset.score);
    for (var h = 0; h < satScores.length; h++) {
      satScores[h].textContent = (h < hoverScore) ? '★' : '☆';
      satScores[h].style.color = (h < hoverScore) ? 'var(--gold)' : 'var(--text3)';
    }
  });
  satStars.addEventListener('mouseout', function () {
    for (var r = 0; r < satScores.length; r++) {
      satScores[r].textContent = (r < satGiven + 1) ? '★' : '☆';
      satScores[r].style.color = (r < satGiven + 1) ? 'var(--gold)' : 'var(--text3)';
    }
  });
  satStars.addEventListener('click', function (e) {
    var star = e.target.closest('.sat-star');
    if (!star || satGiven >= 0) return;
    satGiven = parseInt(star.dataset.score) - 1;
    var labels = ['不满意', '较不满意', '一般', '满意', '非常满意'];
    satMsg.textContent = '感谢反馈：' + labels[satGiven] + ' (' + (satGiven + 1) + '/5)';
    satMsg.classList.remove('hidden');
    for (var f = 0; f < satScores.length; f++) {
      satScores[f].style.cursor = 'default';
      satScores[f].textContent = (f <= satGiven) ? '★' : '☆';
    }
    // 本地存储评分记录
    try {
      var history = JSON.parse(localStorage.getItem('liuyao_ratings') || '[]');
      history.push({ ts: Date.now(), score: satGiven + 1, master: (master ? master.name : ''), question: '' });
      localStorage.setItem('liuyao_ratings', JSON.stringify(history));
    } catch (e) {}
  });
  html += '</div>';

  container.innerHTML = html;
}
