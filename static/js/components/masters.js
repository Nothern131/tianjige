/**
 * 大师蒸馏组件
 * 34位古今命理大师 → 选择大师 → AI 风格分析
 */
function renderMastersComponent(state) {
  const container = document.createElement('div');
  container.className = 'fade-in';

  // 34位大师（按流派分组）
  const masters = [
    // 八字流派（13位）
    { id: 'yuanli', name: '袁天罡', title: '相术大师', era: '唐', avatar: '⭐', category: '八字' },
    { id: 'lichunfeng', name: '李淳风', title: '天文学家', era: '唐', avatar: '🌠', category: '八字' },
    { id: 'xuzile', name: '徐子平', title: '子平八字之祖', era: '宋', avatar: '📜', category: '八字' },
    { id: 'wanminying', name: '万民英', title: '三命通会', era: '明', avatar: '📚', category: '八字' },
    { id: 'zhangnan', name: '张楠', title: '神峰通考', era: '明', avatar: '⛰️', category: '八字' },
    { id: 'yelan', name: '叶兰', title: '命理正宗', era: '明', avatar: '🍂', category: '八字' },
    { id: 'shenxiao', name: '沈孝瞻', title: '子平真诠', era: '清', avatar: '🖋️', category: '八字' },
    { id: 'renqiao', name: '任铁樵', title: '滴天髓阐微', era: '清', avatar: '💧', category: '八字' },
    { id: 'zhenguan', name: '陈素庵', title: '命理约言', era: '清', avatar: '🎋', category: '八字' },
    { id: 'shutong', name: '舒继英', title: '星平会海', era: '清', avatar: '🌊', category: '八字' },
    { id: 'weixian', name: '韦千里', title: '千里命稿', era: '民国', avatar: '🌿', category: '八字' },
    { id: 'yuanshu', name: '袁树珊', title: '命理探源', era: '民国', avatar: '🏮', category: '八字' },
    { id: 'linxuan', name: '林庚白', title: '人鉴命理', era: '民国', avatar: '🪶', category: '八字' },
    // 六爻流派（2位）
    { id: 'guiguzi', name: '鬼谷子', title: '纵横家鼻祖', era: '战国', avatar: '🧙', category: '六爻' },
    { id: 'jingfang', name: '京房', title: '纳甲筮法之祖', era: '汉', avatar: '☯️', category: '六爻' },
    // 奇门流派（3位）
    { id: 'zhugeliang', name: '诸葛亮', title: '卧龙先生', era: '三国', avatar: '🐉', category: '奇门' },
    { id: 'liuzhitong', name: '刘伯温', title: '诚意伯', era: '明', avatar: '🔥', category: '奇门' },
    { id: 'songhuibin', name: '宋惠彬', title: '奇门学术化奠基人', era: '当代', avatar: '🎓', category: '奇门' },
    // 紫微流派（5位）
    { id: 'chenxizai', name: '陈希夷', title: '紫微斗数之祖', era: '宋', avatar: '🏔️', category: '紫微' },
    { id: 'luohongxian', name: '罗洪先', title: '紫微斗数全集', era: '明', avatar: '📜', category: '紫微' },
    { id: 'nihaihsia', name: '倪海厦', title: '天纪紫微', era: '当代', avatar: '🏥', category: '紫微' },
    { id: 'wangtingzhi', name: '王亭之', title: '中州派紫微', era: '当代', avatar: '📖', category: '紫微' },
    { id: 'lubinzao', name: '陆斌兆', title: '紫微斗数讲义', era: '当代', avatar: '🎓', category: '紫微' },
    // 大六壬流派（4位）
    { id: 'shaoyanhe', name: '邵彦和', title: '六壬断案之祖', era: '宋', avatar: '🌊', category: '大六壬' },
    { id: 'chengongxian', name: '陈公献', title: '大六壬指南', era: '明', avatar: '🧭', category: '大六壬' },
    { id: 'guoyuqing', name: '郭御青', title: '六壬大全', era: '明', avatar: '📕', category: '大六壬' },
    { id: 'chengshuxun', name: '程树勋', title: '壬学琐记', era: '清', avatar: '📝', category: '大六壬' },
    // 风水流派（3位）
    { id: 'yangyunsong', name: '杨筠松', title: '风水祖师·救贫仙人', era: '唐', avatar: '⛰️', category: '风水' },
    { id: 'laibuyi', name: '赖布衣', title: '理气派宗师', era: '宋', avatar: '🧭', category: '风水' },
    { id: 'jiangdahong', name: '蒋大鸿', title: '玄空飞星宗师', era: '清', avatar: '🌟', category: '风水' },
    // 其他流派（4位）
    { id: 'shaoyong', name: '邵雍', title: '梅花易数之祖', era: '宋', avatar: '🌸', category: '梅花' },
    { id: 'wangpu', name: '王朴', title: '太乙神数大师', era: '五代', avatar: '🔭', category: '太乙' },
    { id: 'zhougong', name: '周公', title: '解梦之祖', era: '西周', avatar: '🌙', category: '解梦' },
    { id: 'zhangziye', name: '张子业', title: '综合术数专家', era: '当代', avatar: '🔮', category: '综合' },
  ];

  // 流派分组
  const categoryGroups = [
    { key: '八字', label: '八字命理', icon: '📅', count: 13 },
    { key: '紫微', label: '紫微斗数', icon: '🔮', count: 5 },
    { key: '大六壬', label: '大六壬', icon: '🌊', count: 4 },
    { key: '奇门', label: '奇门遁甲', icon: '🚪', count: 3 },
    { key: '风水', label: '风水格局', icon: '🏔️', count: 3 },
    { key: '六爻', label: '六爻占卜', icon: '🪙', count: 2 },
    { key: '梅花', label: '梅花易数', icon: '🌸', count: 1 },
    { key: '太乙', label: '太乙神数', icon: '⭐', count: 1 },
    { key: '解梦', label: '周公解梦', icon: '🌙', count: 1 },
    { key: '综合', label: '综合术数', icon: '🧩', count: 1 },
  ];

  const analysisTypes = [
    { id: 'full', label: '全盘分析' },
    { id: 'wealth', label: '财富分析' },
    { id: 'talent', label: '天赋分析' },
    { id: 'balance', label: '反内耗' },
    { id: 'love', label: '正缘分析' },
  ];

  let selectedMaster = null;
  let selectedType = 'full';

  container.innerHTML = `
    <div class="section-header">
      <h2 class="page-title">大师蒸馏</h2>
      <p class="page-subtitle">三十四位古今命理大师，AI 复刻其断命风格与智慧，按流派分类</p>
    </div>

    <!-- 大师列表 — 按流派分组 -->
    <div class="glass-card mb-24" id="masters-panel">
      <h3 style="font-family:var(--font-serif);color:var(--gold);margin-bottom:20px;font-size:1rem;">选择一位大师</h3>
      ${categoryGroups.map((g) => {
        const groupMasters = masters.filter((m) => m.category === g.key);
        return `
        <div class="master-category">
          <div class="master-cat-header">
            <span class="master-cat-icon">${g.icon}</span>
            <span class="master-cat-label">${g.label}</span>
            <span class="master-cat-count">${g.count}位</span>
          </div>
          <div class="master-cat-grid" data-category="${g.key}">
            ${groupMasters.map((m) => `
              <div class="master-card" data-master-id="${m.id}">
                <div class="master-avatar">${m.avatar}</div>
                <div class="master-name">${m.name}</div>
                <div class="master-title">${m.title}</div>
                <div class="master-era">${m.era}</div>
              </div>
            `).join('')}
          </div>
        </div>
        `;
      }).join('')}
    </div>

    <!-- 出生信息输入（复用八字数据） -->
    <div class="glass-card mb-24" id="master-input-card">
      <h3 style="font-family:var(--font-serif);color:var(--gold);margin-bottom:16px;font-size:1rem;">出生信息</h3>
      <div class="form-row">
        <div class="form-group">
          <label class="form-label">出生日期</label>
          <input type="date" class="form-input" id="master-date" value="${state.userInfo.birthDate || ''}">
        </div>
        <div class="form-group">
          <label class="form-label">出生时辰</label>
          <select class="form-select" id="master-time">
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
          <label class="form-label">性别</label>
          <select class="form-select" id="master-gender">
            <option value="male" ${state.userInfo.gender === 'male' ? 'selected' : ''}>男</option>
            <option value="female" ${state.userInfo.gender === 'female' ? 'selected' : ''}>女</option>
          </select>
        </div>
      </div>

      <div class="form-group mt-8">
        <label class="form-label">分析类型</label>
        <div class="tabs" id="master-type-tabs" style="margin-bottom:0;border-bottom:none;">
          ${analysisTypes.map((t) => `
            <button class="tab-btn${t.id === 'full' ? ' active' : ''}" data-type="${t.id}">${t.label}</button>
          `).join('')}
        </div>
      </div>

      <button class="btn-gold lg" id="master-submit-btn" style="width:100%;margin-top:12px;" disabled>👨‍🏫 请先选择一位大师</button>
    </div>

    <!-- 结果区域 -->
    <div id="master-result-area" class="hidden">
      <div class="glass-card" id="master-result-card"></div>
    </div>
  `;

  // 大师选择事件
  const mastersPanel = container.querySelector('#masters-panel');
  mastersPanel.addEventListener('click', (e) => {
    const card = e.target.closest('.master-card');
    if (!card) return;

    const masterId = card.dataset.masterId;
    const master = masters.find((m) => m.id === masterId);
    selectedMaster = master;

    // 更新选中状态
    mastersPanel.querySelectorAll('.master-card').forEach((c) => c.classList.remove('selected'));
    card.classList.add('selected');

    // 更新按钮
    const submitBtn = container.querySelector('#master-submit-btn');
    submitBtn.disabled = false;
    submitBtn.textContent = `👨‍🏫 请 ${master.name} 断命`;
  });

  // 分析类型选择
  const typeTabs = container.querySelector('#master-type-tabs');
  typeTabs.addEventListener('click', (e) => {
    const btn = e.target.closest('.tab-btn');
    if (!btn) return;

    typeTabs.querySelectorAll('.tab-btn').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    selectedType = btn.dataset.type;
  });

  // 提交
  container.querySelector('#master-submit-btn').addEventListener('click', async () => {
    await handleMasterSubmit(container, selectedMaster, selectedType, state);
  });

  return container;
}

/** 处理大师分析请求 */
async function handleMasterSubmit(container, master, analysisType, state) {
  const date = container.querySelector('#master-date').value;
  const time = container.querySelector('#master-time').value;
  const gender = container.querySelector('#master-gender').value;

  if (!date || !time) {
    showToast('请填写出生日期和时辰');
    return;
  }

  const resultArea = container.querySelector('#master-result-area');
  const resultCard = container.querySelector('#master-result-card');

  resultArea.classList.remove('hidden');
  resultCard.innerHTML = '<div class="spinner"></div>';

  const submitBtn = container.querySelector('#master-submit-btn');
  submitBtn.disabled = true;
  submitBtn.textContent = '分析中...';

  try {
    // 纯前端本地算法，零API调用
    // 先用 BaziEngine 排盘，再传给大师引擎
    var dateParts = date.split('-');
    var year = parseInt(dateParts[0]), month = parseInt(dateParts[1]), day = parseInt(dateParts[2]);
    var hour = SHICHEN_NAMES[time] || 0;
    var baziData = BaziEngine.paipan(year, month, day, hour);
    const result = MastersEngine.analyze(master.id, analysisType, baziData, gender);

    renderMasterResult(resultCard, result, master);
  } catch (error) {
    resultCard.innerHTML = `
      <div class="error-container">
        <div class="error-icon">⚠️</div>
        <div class="error-text">${escapeHtml(error.message)}</div>
      </div>
    `;
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = `👨‍🏫 请 ${master.name} 断命`;
  }
}

/** 渲染大师分析结果 */
function renderMasterResult(container, result, master) {
  const sections = [
    { key: 'opening', label: '开篇', icon: '📜', desc: '大师以自身风格开场，点明分析方向，奠定整体基调' },
    { key: 'overview', label: '总论', icon: '🔍', desc: '详析八字全貌：四柱逐柱十神、旺衰力量评分、格局成败、用神喜忌' },
    { key: 'specialty', label: '专论', icon: '💎', desc: '聚焦所选分析类型，展开因果链推演：五行流通、十神作用、大运趋势、人生建议' },
    { key: 'quote', label: '经典引用', icon: '📖', desc: '引经据典，以大师代表著作证今人之命，以古鉴今' },
    { key: 'closing', label: '结语', icon: '🎋', desc: '总结命局核心论断，给出方向性指引与人生建议' },
  ];

  // 流派标签颜色映射
  var categoryColors = {
    '八字': 'var(--gold)',
    '六爻': '#c9a03c',
    '奇门': '#4a9a8c',
    '紫微': '#8a6ab8',
    '大六壬': '#4a8ac9',
    '风水': '#6a9a4a',
    '梅花': '#c96a8a',
    '太乙': '#8a8ac9',
    '解梦': '#6a6a9a',
    '综合': '#9a8a6a',
  };
  var catColor = categoryColors[master.category] || 'var(--gold)';

  let html = `
    <div class="fade-in">
      <!-- 大师头部信息 -->
      <div class="master-result-header">
        <div class="master-result-avatar-wrap">
          <span class="master-result-avatar">${master.avatar}</span>
        </div>
        <div class="master-result-info">
          <h3 class="master-result-name">${master.name}<span class="master-result-era">${master.era}</span></h3>
          <p class="master-result-title">${master.title}</p>
          <div class="master-result-tags">
            <span class="master-result-tag" style="border-color:${catColor};color:${catColor};">${master.category}</span>
            <span class="master-result-tag">${master.style}</span>
          </div>
        </div>
      </div>

      <div class="master-result-divider"></div>

      <!-- 五段式分析 -->
      <div class="master-result-body">
  `;

  sections.forEach(function(section, idx) {
    var content = result[section.key];
    if (content) {
      // 将换行转为段落
      var paragraphs = content.split('\n\n');
      var formattedContent = paragraphs.map(function(p) {
        return '<p>' + escapeHtml(p.trim()).replace(/\n/g, '<br>') + '</p>';
      }).join('');

      html += `
        <div class="master-result-section" style="--delay:${idx * 0.08}s;">
          <div class="master-section-header">
            <span class="master-section-icon">${section.icon}</span>
            <div class="master-section-title-wrap">
              <span class="master-section-title">${section.label}</span>
              <span class="master-section-desc">${section.desc}</span>
            </div>
            <span class="master-section-num">0${idx + 1}</span>
          </div>
          <div class="master-section-content">${formattedContent}</div>
        </div>
      `;
    }
  });

  html += `
      </div>

      <!-- 底部操作 -->
      <div class="master-result-footer">
        <span class="master-footer-note">以上分析由纯前端算法生成，基于大师历史风格复刻，仅供娱乐参考</span>
      </div>
    </div>
  `;

  container.innerHTML = html;
}