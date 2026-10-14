/**
 * 奇门遁甲组件
 * 日期时间起局 → 九宫格展示 → 八门九星八神
 */

// ===== 奇门遁甲大师深度解读（移植自 EP5 体验页，主站/体验页共用） =====
function generateQimenAnalysis(master, result, question) {
  var _esc = (typeof escapeHtml === 'function') ? escapeHtml : function (s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  };
  var interp = result.interpretation || '';
  var opening = '', overview = '', specialty = '', quote = '', closing = '';

  var qimenQuotes = {
    '诸葛亮': '运筹帷幄之中，决胜千里之外。奇门者，帝王之学也。',
    '刘伯温': '天垂象，见吉凶。奇门遁甲，察天时地利人和。',
    '宋惠彬': '奇门学术，逻辑为纲。九宫八卦，时空之模型也。',
  };

  // 开口
  opening = '今起' + _esc(result.period || '') + ' ' + _esc(result.ju_num || '') + '局，值' + _esc(result.jieqi || '') + '。日' + _esc(result.day_gz || '') + '，时' + _esc(result.time_gz || '') + '。';
  if (question) opening += '所问者：' + _esc(question) + '。';

  // 总纲
  var auspiciousDoors = ['休门', '生门', '开门'];
  var auspiciousStars = ['天心', '天任', '天辅', '天禽'];
  var auspiciousGods = ['值符', '太阴', '六合', '九天', '九地'];
  var goodCount = 0, badCount = 0;
  var gridOrder = [4, 9, 2, 3, 5, 7, 8, 1, 6];
  var cells = result.cells || {};
  gridOrder.forEach(function (pos) {
    if (pos === 5) return;
    var c = cells[pos] || {};
    if (auspiciousDoors.indexOf(c.door) >= 0 || auspiciousStars.indexOf(c.star) >= 0 || auspiciousGods.indexOf(c.god) >= 0) {
      goodCount++;
    } else {
      badCount++;
    }
  });
  var verdict = goodCount > badCount ? '吉' : goodCount < badCount ? '凶' : '平';
  overview = '此局总断为' + verdict + '。' + goodCount + '宫得吉，' + badCount + '宫不吉。';

  // 专项
  specialty = '';
  if (interp) {
    specialty += interp + '\n\n';
  }
  var bestPos = null;
  gridOrder.forEach(function (pos) {
    if (pos === 5) return;
    var c = cells[pos] || {};
    if (auspiciousDoors.indexOf(c.door) >= 0 && auspiciousGods.indexOf(c.god) >= 0) {
      bestPos = pos;
    }
  });
  if (bestPos) {
    var gongNames = { 1: '坎一宫', 2: '坤二宫', 3: '震三宫', 4: '巽四宫', 5: '中五宫', 6: '乾六宫', 7: '兑七宫', 8: '艮八宫', 9: '离九宫' };
    specialty += '【吉方】' + _esc(gongNames[bestPos] || '') + '方吉，宜向此方布局出行。\n';
  }

  // 引经据典
  quote = qimenQuotes[master.name] || '《奇门遁甲》云：天遁、地遁、人遁，三遁相生，万事如意。';

  // 结语
  if (verdict === '吉') {
    closing = '综合而论，此局大吉。所问之事，顺势而为，可成。然盛极必衰，宜见好就收，趋吉避凶。';
  } else if (verdict === '平') {
    closing = '综合而论，此局平。所问之事，需待时运。宜择吉方而动，守正待时。';
  } else {
    closing = '综合而论，此局多阻。所问之事，短期内难有进展。宜退守蓄势，择吉时吉方而动，待时而起。';
  }

  return { opening: opening, overview: overview, specialty: specialty, quote: quote, closing: closing };
}

// ===== 奇门遁甲大师点评面板 =====
function initQimenMastersPanel(container, result, question) {
  var mastersArea = container ? container.querySelector('#qimen-masters-area') : null;
  if (!mastersArea || !result || typeof MastersEngine === 'undefined' || !MastersEngine.MASTERS) return;
  mastersArea.innerHTML = '';
  mastersArea.classList.remove('hidden');

  var qimenMasters = [];
  var allMasters = MastersEngine.MASTERS;
  for (var key in allMasters) {
    if (allMasters.hasOwnProperty(key)) {
      var m = allMasters[key];
      if (m.category === '奇门' || m.category === '综合') {
        qimenMasters.push(m);
      }
    }
  }
  if (qimenMasters.length === 0) return;

  if (typeof renderMastersPanel !== 'function') return;
  renderMastersPanel(mastersArea, {
    category: '奇门',
    masters: qimenMasters,
    analysisTypes: [{ id: 'full', label: '即时占断' }],
    onAnalyze: function (masterId) {
      var master = allMasters[masterId];
      if (!master || !result) {
        console.error('[天机阁] 奇门大师分析失败: master不存在或result为空');
        return null;
      }
      try {
        var res = generateQimenAnalysis(master, result, question || '');
        console.log('[天机阁] 奇门大师分析成功:', masterId, 'sections:', Object.keys(res).join(','));
        return res;
      } catch (e) {
        console.error('[天机阁] 奇门大师分析异常:', masterId, e);
        throw e;
      }
    },
  });
}

function renderQimenComponent() {
  const container = document.createElement('div');
  container.className = 'fade-in';

  container.innerHTML = `
    <div class="section-header">
      <h2 class="page-title">奇门遁甲</h2>
      <p class="page-subtitle">帝王之学，九宫八卦，八门九星八神，趋吉避凶</p>
    </div>

    <!-- 起局 -->
    <div class="glass-card mb-24">
      <h3 style="font-family:var(--font-serif);color:var(--gold);margin-bottom:16px;font-size:1rem;">起局参数</h3>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">日期</label>
          <input type="date" class="form-input" id="qimen-date">
        </div>
        <div class="form-group">
          <label class="form-label">时辰</label>
          <select class="form-select" id="qimen-time">
            <option value="">请选择时辰</option>
            <option value="子时">子时 (23:00-01:00)</option>
            <option value="丑时">丑时 (01:00-03:00)</option>
            <option value="寅时">寅时 (03:00-05:00)</option>
            <option value="卯时">卯时 (05:00-07:00)</option>
            <option value="辰时">辰时 (07:00-09:00)</option>
            <option value="巳时">巳时 (09:00-11:00)</option>
            <option value="午时">午时 (11:00-13:00)</option>
            <option value="未时">未时 (13:00-15:00)</option>
            <option value="申时">申时 (15:00-17:00)</option>
            <option value="酉时">酉时 (17:00-19:00)</option>
            <option value="戌时">戌时 (19:00-21:00)</option>
            <option value="亥时">亥时 (21:00-23:00)</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">局数</label>
          <select class="form-select" id="qimen-ju">
            <option value="auto">自动</option>
            <option value="yang-1">阳遁一局</option>
            <option value="yang-2">阳遁二局</option>
            <option value="yang-3">阳遁三局</option>
            <option value="yang-4">阳遁四局</option>
            <option value="yang-5">阳遁五局</option>
            <option value="yang-6">阳遁六局</option>
            <option value="yang-7">阳遁七局</option>
            <option value="yang-8">阳遁八局</option>
            <option value="yang-9">阳遁九局</option>
            <option value="yin-1">阴遁一局</option>
            <option value="yin-2">阴遁二局</option>
            <option value="yin-3">阴遁三局</option>
            <option value="yin-4">阴遁四局</option>
            <option value="yin-5">阴遁五局</option>
            <option value="yin-6">阴遁六局</option>
            <option value="yin-7">阴遁七局</option>
            <option value="yin-8">阴遁八局</option>
            <option value="yin-9">阴遁九局</option>
          </select>
        </div>
      </div>
      <button class="btn-gold lg" id="qimen-submit-btn" style="width:100%;margin-top:8px;">🚪 起局</button>

      <!-- 所问之事 -->
      <div class="form-group" style="margin-top:16px;">
        <label class="form-label">🔮 你所问之事（可选）—— 想通过奇门了解哪个方面的运势？</label>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px;" id="qimen-domain-tags">
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
        <input type="text" class="form-input" id="qimen-question-text" placeholder="或输入你想问的具体问题，如：最近事业运如何？...">
      </div>
    </div>

    <!-- 九宫格 -->
    <div id="qimen-result-area" class="hidden">
      <div class="glass-card" id="qimen-result-card"></div>
      <div id="qimen-masters-area" class="hidden" style="margin-top:24px;"></div>
    </div>
  `;

  // 提交
  container.querySelector('#qimen-submit-btn').addEventListener('click', async () => {
    const date = container.querySelector('#qimen-date').value;
    const time = container.querySelector('#qimen-time').value;
    const ju = container.querySelector('#qimen-ju').value;

    if (!date) {
      showToast('请选择日期');
      return;
    }
    if (!time) {
      showToast('请选择时辰');
      return;
    }

    await handleQimenSubmit(container, { date, time, ju });
  });

  // 事域快捷按钮
  container.querySelector('#qimen-domain-tags').addEventListener('click', function (e) {
    var btn = e.target.closest('button');
    if (!btn || !btn.dataset.domain) return;
    var questionInput = container.querySelector('#qimen-question-text');
    var domainText = btn.dataset.domain.replace(/^[^\s]+\s/, '');
    questionInput.value = '最近' + domainText + '运如何？';
    var allBtns = container.querySelectorAll('#qimen-domain-tags button');
    for (var i = 0; i < allBtns.length; i++) {
      allBtns[i].classList.remove('active');
    }
    btn.classList.add('active');
  });

  return container;
}

/** 处理奇门遁甲请求 */
async function handleQimenSubmit(container, params) {
  const resultArea = container.querySelector('#qimen-result-area');
  const resultCard = container.querySelector('#qimen-result-card');

  resultArea.classList.remove('hidden');
  resultCard.innerHTML = '<div class="spinner"></div>';

  try {
    // 纯前端本地算法，零API调用
    const result = QimenEngine.divine(params.date, params.time, params.ju);

    // 问事分析
    var question = container.querySelector('#qimen-question-text').value.trim();
    var questionAnalysisHtml = '';
    if (question && typeof DomainAnalysis !== 'undefined') {
      var qaResult = DomainAnalysis.analyze('qimen', result, question);
      if (qaResult) {
        questionAnalysisHtml =
          '<hr class="section-divider"><div class="analysis-section" style="background:rgba(184,154,92,0.03);border:1px solid var(--border-subtle);border-radius:12px;padding:20px;margin-top:20px;"><h3 style="color:var(--gold-light);">' +
          qaResult.domain.icon +
          ' 所问之事：' +
          qaResult.domain.name +
          '</h3><div class="analysis-content">' +
          formatAnalysisText(qaResult.analysis) +
          '</div></div>';
      }
    }

    renderQimenResult(resultCard, result, questionAnalysisHtml);

    // 大师点评面板（基于奇门九宫格深度解读，主站/体验页共用）
    initQimenMastersPanel(container, result, question);
  } catch (error) {
    resultCard.innerHTML = `
      <div class="error-container">
        <div class="error-icon">⚠️</div>
        <div class="error-text">${escapeHtml(error.message)}</div>
      </div>
    `;
  }
}

/** 渲染奇门遁甲九宫格 */
function renderQimenResult(container, result, questionAnalysisHtml) {
  // 九宫格布局：4 9 2 / 3 5 7 / 8 1 6
  const gridOrder = [4, 9, 2, 3, 5, 7, 8, 1, 6];
  const gridLabels = {
    1: '坎一宫',
    2: '坤二宫',
    3: '震三宫',
    4: '巽四宫',
    5: '中五宫',
    6: '乾六宫',
    7: '兑七宫',
    8: '艮八宫',
    9: '离九宫',
  };

  const cells = result.cells || {};

  let html = `
    <div class="fade-in">
      <div style="text-align:center;margin-bottom:20px;">
        <h3 style="font-family:var(--font-serif);color:var(--gold-light);">奇门遁甲盘</h3>
        <p style="font-size:0.85rem;color:var(--text-muted);">${escapeHtml(result.period || '')} · ${escapeHtml(result.ju || '')}</p>
      </div>

      <div class="qimen-grid">
  `;

  gridOrder.forEach((pos) => {
    const cell = cells[pos] || {};
    const label = gridLabels[pos] || `宫${pos}`;

    html += `
      <div class="qimen-cell">
        <div style="font-size:0.65rem;color:var(--text-muted);">${label}</div>
        <div class="cell-main">${escapeHtml(cell.di_pan || '—')}</div>
        <div class="cell-sub">${escapeHtml(cell.tian_pan || '')}${cell.ji_tian_pan ? escapeHtml(cell.ji_tian_pan) : ''}</div>
        <div class="cell-door">${escapeHtml(cell.door || '')}</div>
        <div class="cell-sub">${escapeHtml(cell.star || '')}${cell.ji_star ? '<span style="color:var(--gold);">+' + escapeHtml(cell.ji_star) + '</span>' : ''}</div>
        <div class="cell-sub">${escapeHtml(cell.god || '')}</div>
      </div>
    `;
  });

  html += `
      </div>
  `;

  // 图例
  html += `
      <div style="margin-top:20px;padding:12px;background:rgba(255,255,255,0.02);border-radius:8px;display:flex;flex-wrap:wrap;gap:16px;justify-content:center;font-size:0.8rem;color:var(--text-muted);">
        <span>大字：地盘干</span>
        <span>小字：天盘干</span>
        <span style="color:var(--gold);">彩字：八门</span>
        <span>小字：九星 / 八神</span>
      </div>
  `;

  // 解读
  if (result.interpretation) {
    html += `
      <hr class="section-divider">
      <div class="analysis-section">
        <h3>📖 局象解读</h3>
        <div class="analysis-content">${formatAnalysisText(result.interpretation)}</div>
      </div>
    `;
  }

  if (questionAnalysisHtml) {
    html += questionAnalysisHtml;
  }

  html += '</div>';

  container.innerHTML = html;
}
