/**
 * 周公解梦组件 v2
 * 输入梦境描述 + 所问之事 → 关键词匹配 → 多条目解读 → 事域交叉分析
 */
function renderZhougongComponent() {
  var container = document.createElement('div');
  container.className = 'fade-in';

  container.innerHTML = `
    <div class="section-header">
      <h2 class="page-title">周公解梦</h2>
      <p class="page-subtitle">周公旦所传梦学经典，以梦境占吉凶，解天地人事之兆</p>
    </div>

    <!-- 输入区域 -->
    <div class="glass-card mb-24" id="zhougong-input-card">
      <h3 style="font-family:var(--font-serif);color:var(--gold);margin-bottom:16px;font-size:1rem;">🌙 描述你的梦境</h3>
      <div class="form-group">
        <label class="form-label">请尽可能详细地描述你梦到的内容</label>
        <textarea class="form-input" id="zhougong-dream-text" placeholder="例如：梦见自己在一条大河中游泳，河水很清澈，还看到一条大鱼跃出水面..." rows="4" style="resize:vertical;min-height:80px;"></textarea>
      </div>

      <!-- 所问之事 -->
      <div class="form-group" style="margin-top:16px;">
        <label class="form-label">🔮 你所问之事（可选）—— 想通过此梦了解哪个方面的运势？</label>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px;" id="zhougong-domain-tags">
          ${['💼 事业', '💕 感情', '💰 财运', '🏥 健康', '📚 学业', '🏠 家庭', '🤝 人际', '✈️ 出行']
            .map(function (d) {
              return (
                '<button class="btn-gold outline" style="font-size:0.75rem;padding:4px 10px;" data-domain="' +
                d +
                '">' +
                d +
                '</button>'
              );
            })
            .join('')}
        </div>
        <input type="text" class="form-input" id="zhougong-question-text" placeholder="或输入你想问的具体问题，如：最近事业运如何？这段感情有结果吗？...">
      </div>

      <div style="display:flex;gap:12px;flex-wrap:wrap;">
        <button class="btn-gold lg" id="zhougong-submit-btn">
          <span>🌙</span> 解梦
        </button>
        <button class="btn-gold outline sm" id="zhougong-random-btn">
          🎲 随机梦境
        </button>
      </div>

      <!-- 快捷关键词 -->
      <div style="margin-top:16px;">
        <p style="font-size:0.78rem;color:var(--text-muted);margin-bottom:8px;">常见梦境快速查询：</p>
        <div style="display:flex;flex-wrap:wrap;gap:6px;" id="zhougong-quick-tags">
          ${['蛇', '鱼', '水', '火', '飞', '坠落', '牙齿', '考试', '死人', '棺材', '龙', '钱', '花', '树', '房子', '车']
            .map(function (k) {
              return (
                '<button class="btn-gold outline" style="font-size:0.75rem;padding:4px 10px;" data-keyword="' +
                k +
                '">' +
                k +
                '</button>'
              );
            })
            .join('')}
        </div>
      </div>
    </div>

    <!-- 结果区域 -->
    <div id="zhougong-result-area" class="hidden">
      <div class="glass-card" id="zhougong-result-card"></div>
    </div>
  `;

  // 提交解梦
  container.querySelector('#zhougong-submit-btn').addEventListener('click', function () {
    handleZhougongSubmit(container);
  });

  // 回车提交
  var textarea = container.querySelector('#zhougong-dream-text');
  textarea.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleZhougongSubmit(container);
    }
  });

  // 随机梦境
  container.querySelector('#zhougong-random-btn').addEventListener('click', function () {
    var allDreams = ZhougongEngine.getAllDreams();
    var randomDream = allDreams[Math.floor(Math.random() * allDreams.length)];
    textarea.value = '梦见' + randomDream.keyword;
    handleZhougongSubmit(container);
  });

  // 快捷关键词
  container.querySelector('#zhougong-quick-tags').addEventListener('click', function (e) {
    var btn = e.target.closest('button');
    if (!btn || !btn.dataset.keyword) return;
    textarea.value = '梦见' + btn.dataset.keyword;
    handleZhougongSubmit(container);
  });

  // 事域快捷按钮
  container.querySelector('#zhougong-domain-tags').addEventListener('click', function (e) {
    var btn = e.target.closest('button');
    if (!btn || !btn.dataset.domain) return;
    var questionInput = container.querySelector('#zhougong-question-text');
    // 提取纯文本（去掉emoji）
    var domainText = btn.dataset.domain.replace(/^[^\s]+\s/, '');
    questionInput.value = '最近' + domainText + '运如何？';
    // 高亮当前选中
    var allBtns = container.querySelectorAll('#zhougong-domain-tags button');
    for (var i = 0; i < allBtns.length; i++) {
      allBtns[i].classList.remove('active');
    }
    btn.classList.add('active');
  });

  return container;
}

/** 处理解梦提交 */
function handleZhougongSubmit(container) {
  var text = container.querySelector('#zhougong-dream-text').value.trim();
  if (!text) {
    showToast('请输入梦境描述');
    return;
  }

  var question = container.querySelector('#zhougong-question-text').value.trim();

  var resultArea = container.querySelector('#zhougong-result-area');
  var resultCard = container.querySelector('#zhougong-result-card');

  resultArea.classList.remove('hidden');
  resultCard.innerHTML = '<div class="spinner"></div>';
  resultArea.scrollIntoView({ behavior: 'smooth', block: 'start' });

  try {
    // 纯前端本地算法，零API调用
    var result = ZhougongEngine.divine(text, question);
    renderZhougongResult(resultCard, result);
  } catch (error) {
    resultCard.innerHTML = `
      <div class="error-container">
        <div class="error-icon">⚠️</div>
        <div class="error-text">${escapeHtml(error.message)}</div>
      </div>
    `;
  }
}

/** 渲染解梦结果 */
function renderZhougongResult(container, result) {
  var jiClass = result.ji === '吉' ? 'auspicious' : result.ji === '凶' ? 'inauspicious' : 'neutral';
  var jiEmoji = result.ji === '吉' ? '🌟' : result.ji === '凶' ? '⚠️' : '🔮';

  var html = '<div class="fade-in">';

  // 头部
  html += `
    <div style="text-align:center;margin-bottom:20px;">
      <div style="font-size:2.5rem;margin-bottom:8px;">${jiEmoji}</div>
      <h3 style="font-family:var(--font-serif);color:var(--gold-light);">梦境解析</h3>
      <p style="font-size:0.85rem;color:var(--text-muted);">您梦到了：${escapeHtml(result.input)}</p>
      ${result.question ? '<p style="font-size:0.85rem;color:var(--gold);margin-top:4px;">所问之事：' + escapeHtml(result.question) + '</p>' : ''}
      ${result.count > 0 ? '<span class="verse-level ' + jiClass + '">匹配到 ' + result.count + ' 个梦境条目</span>' : ''}
    </div>
  `;

  // 梦境条目
  if (result.results && result.results.length > 0) {
    html += '<div class="card-grid cols-2 mb-24">';
    result.results.forEach(function (item) {
      var itemJiClass = item.ji === '吉' ? 'auspicious' : item.ji === '凶' ? 'inauspicious' : 'neutral';
      var catName =
        {
          天象: '🌤️',
          地理: '⛰️',
          人物: '👤',
          身体: '🦴',
          动物: '🐾',
          植物: '🌿',
          建筑: '🏠',
          器物: '🔧',
          衣饰: '👗',
          饮食: '🍜',
          文书: '📜',
          交通: '🚗',
          水火: '💧🔥',
          佛道: '🛕',
          丧葬: '⚰️',
          其他: '🔮',
        }[item.cat] || '🔮';
      html += `
        <div class="glass-card" style="padding:14px;">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
            <span style="font-size:1.1rem;">${catName}</span>
            <span style="font-family:var(--font-serif);font-size:1rem;color:var(--gold-light);">${escapeHtml(item.keyword)}</span>
            <span class="verse-level ${itemJiClass}" style="font-size:0.7rem;padding:2px 8px;">${item.ji}</span>
          </div>
          <p style="font-size:0.85rem;line-height:1.7;color:var(--text-secondary);">${escapeHtml(item.interpretation)}</p>
        </div>
      `;
    });
    html += '</div>';
  }

  // 经典解梦综合解读
  html += `
    <hr class="section-divider">
    <div class="analysis-section">
      <h3>📖 经典解梦综合解读</h3>
      <div class="analysis-content">${formatAnalysisText(result.interpretation)}</div>
    </div>
  `;

  // 问事分析（如果有）
  if (result.questionAnalysis) {
    html += `
      <hr class="section-divider">
      <div class="analysis-section" style="background:rgba(184,154,92,0.03);border:1px solid var(--border-subtle);border-radius:12px;padding:20px;margin-top:20px;">
        <h3 style="color:var(--gold-light);">${result.domain ? result.domain.icon : '🔮'} 所问之事分析</h3>
        <div class="analysis-content">${formatAnalysisText(result.questionAnalysis)}</div>
      </div>
    `;
  }

  html += '<div id="zhougong-masters-content" class="mt-24"></div>';
  html += '</div>';
  container.innerHTML = html;
  initZhougongMasters(container, result);
}

/* ========== 周公点评 + 四维增强（自 EP10 回填） ========== */
var ZG_CATEGORIES = {
  天象: '天象气候',
  地理: '山水地理',
  人物: '人物鬼神',
  身体: '身体器官',
  动物: '鸟兽虫鱼',
  植物: '草木花实',
  建筑: '宫室屋宇',
  器物: '器用财物',
  衣饰: '衣冠服饰',
  饮食: '饮食酒水',
  文书: '文书典籍',
  交通: '车船出行',
  水火: '水火雷电',
  佛道: '佛道仙灵',
  丧葬: '丧葬殡殓',
  其他: '杂事百态',
};

// 五行关键词（与引擎 WUXING_CAT 同源，页面本地统计用）
var ZG_WUXING_CAT = {
  金: ['刀', '剑', '金', '银', '铁', '铜', '钟', '戒指', '金属', '钱币', '锁', '钥匙'],
  木: ['树', '花', '草', '竹', '木', '植物', '森林', '林', '梅花', '荷花', '兰花'],
  水: ['水', '海', '河', '雨', '雪', '冰', '泉', '鱼', '船', '游泳', '洗澡'],
  火: ['火', '灯', '光', '太阳', '炉', '烛', '烧', '热', '红', '赤', '亮'],
  土: ['山', '地', '土', '石', '墙', '屋', '房', '墓', '坟', '塔', '城'],
};

function zgGetWuxing(keyword) {
  for (var wx in ZG_WUXING_CAT) {
    var list = ZG_WUXING_CAT[wx];
    for (var i = 0; i < list.length; i++) {
      if (String(keyword).indexOf(list[i]) !== -1) return wx;
    }
  }
  return '土';
}

function zgCountJi(results) {
  var counts = { ji: 0, xiong: 0, mid: 0 };
  (results || []).forEach(function (r) {
    if (r.ji === '吉') counts.ji++;
    else if (r.ji === '凶') counts.xiong++;
    else counts.mid++;
  });
  return counts;
}

function zgDominantWuxing(results) {
  var counts = {};
  (results || []).forEach(function (r) {
    var wx = zgGetWuxing(r.keyword);
    counts[wx] = (counts[wx] || 0) + 1;
  });
  var best = '土';
  var bestCount = -1;
  Object.keys(counts).forEach(function (wx) {
    if (counts[wx] > bestCount) {
      bestCount = counts[wx];
      best = wx;
    }
  });
  return best;
}

function zgEscInline(s) {
  return String(s).replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** 构建周公五段式分析（供 renderMastersPanel onAnalyze 与增强模块共用） */
function buildZhougongAnalysis(result, masterId, analysisType) {
  if (!result) return null;
  var master = window.MastersEngine ? (window.MastersEngine.MASTERS || {})[masterId] : null;
  if (!master) return null;

  var results = result.results || [];
  var counts = zgCountJi(results);
  var ji = result.ji || '中';
  var dominant = zgDominantWuxing(results);
  var keywords = results.map(function (r) {
    return r.keyword;
  });
  var question = result.question || '';
  var domainName = result.domain ? result.domain.name : '所问之事';
  var catNames = (result.categories || []).map(function (c) {
    return ZG_CATEGORIES[c] || c;
  });

  var conclusion = '';
  if (analysisType === 'elements') {
    conclusion = keywords.length
      ? '梦中「' + keywords.join('、') + '」诸象并见，' + ji + '之应'
      : '梦中无经典条目可对，' + ji + '之判';
  } else if (analysisType === 'ji') {
    conclusion = '吉象' + counts.ji + '、中象' + counts.mid + '、凶象' + counts.xiong + '，综判为' + ji;
  } else if (analysisType === 'domain') {
    conclusion = '就「' + domainName + '」而言，此梦呈' + ji + '之兆';
  } else {
    conclusion = keywords.length ? '此梦共应' + results.length + '象，' + ji + '之兆' : '梦象未明，' + ji + '之判';
  }

  var advice =
    ji === '吉'
      ? '乘吉梦之兆，主动把握机缘'
      : ji === '凶'
        ? '惕凶梦之警，谨言慎行，先安而后动'
        : '守中观察，取吉惕凶，不可偏执';

  var openingTpl = (master.openingTemplates || [''])[0] || '';
  var quoteTpl = (master.quoteTemplates || [''])[0] || '';
  var closingTpl = (master.closingTemplates || [''])[0] || '';

  function fill(tpl) {
    return String(tpl)
      .replace(/\{日主\}/g, '梦中主象')
      .replace(/\{日主五行\}/g, dominant)
      .replace(/\{旺衰\}/g, ji)
      .replace(/\{事域\}/g, domainName)
      .replace(/\{结论\}/g, conclusion)
      .replace(/\{建议\}/g, advice)
      .replace(/\{分数\}/g, ji);
  }

  var opening = fill(openingTpl);
  var overview = result.interpretation || '';

  var specialty = '';
  if (analysisType === 'elements') {
    specialty =
      '【梦境拆解】' +
      (keywords.length
        ? '梦中见于' + catNames.join('、') + '诸类，逐条已列于上。'
        : '本次梦境未匹配到经典条目。') +
      '主导五行属' + dominant + '，' +
      (question ? '就「' + question + '」而言，' : '') +
      conclusion +
      '。';
  } else if (analysisType === 'ji') {
    specialty =
      '【吉凶研判】吉象' + counts.ji + '，中象' + counts.mid + '，凶象' + counts.xiong + '。' + conclusion + '。' + advice + '。';
  } else if (analysisType === 'domain') {
    specialty =
      '【事域研判】所问「' + (question || domainName) + '」，梦象归于' + domainName + '。' + conclusion + '。' + advice + '。';
  } else {
    specialty = '【全盘解梦】' + conclusion + '。主导五行属' + dominant + '，' + advice + '。';
  }

  // 增强维度 01：逐条梦境元素拆解
  var detailLines = results.length
    ? results.map(function (r) {
        return '【' + r.keyword + '】' + (ZG_CATEGORIES[r.cat] || r.cat) + '类 · ' + r.ji + '。' + r.interpretation;
      })
    : ['【无匹配】经典文库中未找到精确条目，当以梦中情绪与近事合参。'];

  // 增强维度 02：五行归经
  var wxCounts = {};
  results.forEach(function (r) {
    var wx = zgGetWuxing(r.keyword);
    wxCounts[wx] = (wxCounts[wx] || 0) + 1;
  });
  var wxLine = Object.keys(wxCounts)
    .map(function (wx) {
      return wx + '（' + wxCounts[wx] + '象）';
    })
    .join('、');
  var wuxing =
    '【主导】此梦五行以' + dominant + '为主' + (wxLine ? '，兼见' + wxLine : '') + '。' +
    '【取象】' + dominant + '气当令，' +
    (dominant === '金'
      ? '主决断、收敛，宜断舍离'
      : dominant === '木'
        ? '主生发、成长，宜谋新局'
        : dominant === '水'
          ? '主流动、智慧，宜顺势而为'
          : dominant === '火'
            ? '主热烈、显扬，宜把握时机'
            : '主承载、稳固，宜守成蓄势') +
    '。';

  // 增强维度 03：背景关联
  var background =
    '周公解梦源自西周，后世辑为《周公解梦》经典文库，以梦象反推人事。' +
    '本次梦境涉' + catNames.join('、') + '诸类，共' + (result.count || 0) + '象，综判为' + ji + '。' +
    '本师' + zgEscInline(master.name) + '（' + zgEscInline(master.title || '解梦之祖') + '），其法承「' +
    zgEscInline(master.style || '梦兆解析') + '」一脉，立言「' + zgEscInline(master.phrase || '梦者，魂之游也') + '」。';

  // 增强维度 04：延伸参考
  var references =
    '【延伸阅读】一、《周公解梦》——梦象分类与吉凶断语之纲；二、《梦林玄解》——梦象与五行人事合参之法；三、本师' +
    zgEscInline(master.name) + '所传「' + zgEscInline(master.style || '梦兆解析') + '」。' +
    '【进阶方向】梦象与近事对照、五行归经、事域交叉，三者合观可深化对「' +
    (keywords.join('、') || '此梦') + '」之理解。';

  return {
    opening: opening,
    overview: overview,
    specialty: specialty,
    quote: fill(quoteTpl),
    closing: fill(closingTpl),
    enhanced: {
      detailLines: detailLines,
      wuxing: wuxing,
      background: background,
      references: references,
    },
  };
}

/** 增强维度模块渲染（细节拆解/五行归经/背景关联/延伸参考 + stagger 动效） */
function zgRenderEnhancedModules(resultCard, masterId, analysisType, result) {
  if (!resultCard || !window.MastersEngine) return;
  var analysis = buildZhougongAnalysis(result, masterId, analysisType);
  if (!analysis || !analysis.enhanced) return;
  var enh = analysis.enhanced;
  var master = window.MastersEngine.MASTERS[masterId];

  var mods = [
    { cls: 'enh-elem', ico: '🔍', label: '细节拆解 · 逐条梦境元素', num: '01', lines: enh.detailLines },
    { cls: 'enh-wx', ico: '☯️', label: '五行归经 · 象义取用', num: '02', lines: [enh.wuxing] },
    { cls: 'enh-bg', ico: '📜', label: '背景关联 · 梦学渊源', num: '03', lines: [enh.background] },
    { cls: 'enh-ref', ico: '📚', label: '延伸参考 · 研读方向', num: '04', lines: [enh.references] },
  ];

  var html = '<div class="zg-enhanced">';
  html += '<div class="zg-enhanced-header"><span class="deh-lead">' + zgEscInline(master ? master.name : '周公') + ' · 深度解析</span></div>';
  var base = 5;
  for (var i = 0; i < mods.length; i++) {
    var m = mods[i];
    var delay = ((base + i) * 0.1).toFixed(2);
    html += '<div class="enh-mod ' + m.cls + '" style="--delay:' + delay + 's;">';
    html +=
      '<div class="enh-mod-title"><span class="emt-ico">' + m.ico + '</span><span>' + m.label + '</span><span class="emt-num">' + m.num + '</span></div>';
    html += '<div class="enh-mod-body">';
    for (var j = 0; j < m.lines.length; j++) {
      var line = m.lines[j];
      var lab = zgSectionLabel(line);
      var body = zgSectionBody(line);
      if (lab) {
        html += '<span class="emb-line"><span class="tag">' + zgEscInline(lab) + '</span>' + zgEscInline(body) + '</span>';
      } else {
        html += '<span class="emb-line">' + zgEscInline(line) + '</span>';
      }
    }
    html += '</div></div>';
  }
  html += '</div>';

  var oldEnh = resultCard.querySelector('.zg-enhanced');
  if (oldEnh) oldEnh.remove();
  resultCard.insertAdjacentHTML('beforeend', html);
}

// 提取「【标签】正文」中【】内的标签名；无【】时返回空串
function zgSectionLabel(line) {
  var mm = String(line).match(/【([^】]*)】/);
  return mm ? mm[1] : '';
}
// 提取「【标签】正文」中【】之后的正文；无【】时返回整行
function zgSectionBody(line) {
  var s = String(line);
  var idx = s.indexOf('】');
  return idx >= 0 ? s.slice(idx + 1) : s;
}

/** 初始化周公点评面板 */
function initZhougongMasters(container, result) {
  var panel = container.querySelector('#zhougong-masters-content');
  if (!panel || !window.MastersEngine || !window.renderMastersPanel) return;

  var masters = Object.values(window.MastersEngine.MASTERS || {}).filter(function (m) {
    return m.category === '解梦';
  });
  if (masters.length === 0) return;

  renderMastersPanel(panel, {
    category: '解梦',
    masters: masters,
    analysisTypes: [
      { id: 'full', label: '全盘解梦' },
      { id: 'elements', label: '梦境拆解' },
      { id: 'ji', label: '吉凶研判' },
      { id: 'domain', label: '事域研判' },
    ],
    onAnalyze: function (masterId, analysisType) {
      return buildZhougongAnalysis(result, masterId, analysisType);
    },
    resultData: result,
  });

  // 在分析按钮 click（capture）上挂增强模块渲染：
  // renderMastersPanel 内部会 setTimeout(50ms) 调 renderMasterResult 填充主分析，
  // 这里 capture 阶段先读选中态，再延时追加增强模块。
  var analyzeBtn = panel.querySelector('#master-analyze-btn');
  if (analyzeBtn) {
    analyzeBtn.addEventListener(
      'click',
      function () {
        var mSel = panel.querySelector('.master-card.selected');
        var tSel = panel.querySelector('#master-type-tabs .tab-btn.active');
        var mid = mSel && mSel.dataset.masterId ? mSel.dataset.masterId : null;
        var tid = tSel && tSel.dataset.type ? tSel.dataset.type : 'full';
        if (!mid) return;
        setTimeout(function () {
          var rc = panel.querySelector('#master-result-card');
          if (rc) zgRenderEnhancedModules(rc, mid, tid, result);
        }, 620);
      },
      true
    );
  }
}
