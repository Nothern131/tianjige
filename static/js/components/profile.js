/**
 * 天机阁 · 用户档案组件
 * localStorage 存储，支持微信内置浏览器
 */
(function (global) {
  'use strict';

  var STORAGE_KEY = 'tianjige_profile';

  function loadProfile() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return getDefaultProfile();
      return JSON.parse(raw);
    } catch(e) {
      return getDefaultProfile();
    }
  }

  function saveProfile(profile) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
      return true;
    } catch(e) {
      alert('存储空间不足，无法保存');
      return false;
    }
  }

  function getDefaultProfile() {
    return { name: '', birthDate: '', gender: 'male', consultations: [], createdAt: Date.now() };
  }

  function escapeHtml(s) {
    return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function formatTime(ts) {
    if (!ts) return '未知';
    var d = new Date(ts);
    var pad = function(n){ return n < 10 ? '0'+n : ''+n; };
    return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())+' '+pad(d.getHours())+':'+pad(d.getMinutes());
  }

  // 本地时区当天 YYYY-MM-DD（用作出生日期上限）
  function todayYmd() {
    var d = new Date();
    var pad = function(n){ return n < 10 ? '0'+n : ''+n; };
    return d.getFullYear() + '-' + pad(d.getMonth()+1) + '-' + pad(d.getDate());
  }

  // 出生日期校验：允许为空；非空必须是真实日期、1900-2100、且不晚于今天
  function validateBirthDate(str) {
    if (!str) return null;
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(str);
    if (!m) return '出生日期格式应为 YYYY-MM-DD';
    var y = parseInt(m[1], 10);
    var mo = parseInt(m[2], 10);
    var day = parseInt(m[3], 10);
    if (y < 1900 || y > 2100) return '出生年份需在 1900–2100 之间';
    var dt = new Date(y, mo - 1, day);
    if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== day) {
      return '出生日期不存在，请核对年月日';
    }
    if (str > todayYmd()) return '出生日期不能晚于今天';
    return null;
  }

  function typeIcon(type) {
    return { liuyao:'🪙', meihua:'🌸', bazi:'📅', qimen:'🚪', taiyi:'⭐', zhuge:'🎋', zhougong:'🌙', daliuren:'🌊', ziwei:'🔮', fengshui:'🏔️', composite:'🧿', other:'🔮' }[type] || '🔮';
  }

  function typeLabel(type) {
    return { liuyao:'六爻', meihua:'梅花', bazi:'八字', qimen:'奇门', taiyi:'太乙', zhuge:'诸葛', zhougong:'解梦', daliuren:'六壬', ziwei:'紫微', fengshui:'风水', composite:'合参', other:'其他' }[type] || type;
  }

  function scoreToLabel(score) {
    if (!score) return '';
    if (score >= 80) return '<span style="color:#4ade80">大吉</span>';
    if (score >= 60) return '<span style="color:#86efac">吉</span>';
    if (score >= 40) return '<span style="color:#fbbf24">平</span>';
    if (score >= 20) return '<span style="color:#f97316">凶</span>';
    return '<span style="color:#ef4444">大凶</span>';
  }

  function renderProfilePage() {
    var profile = loadProfile();
    var consultations = profile.consultations || [];

    // 统计
    var byType = {};
    consultations.forEach(function(c) { byType[c.type] = (byType[c.type]||0)+1; });

    var html = '<div class="profile-container">';

    // 头部信息卡片
    html += '<div class="profile-header-card">';
    html += '<div class="profile-avatar">';
    html += '<div class="avatar-initial">' + (profile.name ? profile.name.charAt(0).toUpperCase() : '?') + '</div>';
    html += '</div>';
    html += '<div class="profile-info">';
    html += '<h1 class="profile-name">' + (profile.name ? escapeHtml(profile.name) : '命簿未立') + '</h1>';
    if (profile.birthDate) {
      html += '<p class="profile-meta">出生：' + escapeHtml(profile.birthDate) + (profile.gender==='male'?' · 男':' · 女') + '</p>';
    }
    html += '<p class="profile-meta">建档时间：' + formatTime(profile.createdAt) + '</p>';
    html += '</div>';
    html += '<button class="btn-edit-profile" onclick="window._editProfile()">✏️ 立命</button>';
    html += '</div>';

    // 内联立命表单（默认隐藏，替代连续 prompt）
    html += '<div class="profile-edit-panel hidden" id="profileEditPanel">';
    html += '<div class="section-title">✏️ 立命录</div>';
    html += '<div class="form-row profile-edit-row">';
    html += '<div class="form-group"><label class="form-label">姓名</label><input type="text" class="form-input" id="profile-edit-name" maxlength="20" placeholder="请输入姓名"></div>';
    html += '<div class="form-group"><label class="form-label">出生日期</label><input type="date" class="form-input" id="profile-edit-birth" min="1900-01-01" max="' + todayYmd() + '"></div>';
    html += '<div class="form-group"><label class="form-label">性别</label><select class="form-select" id="profile-edit-gender"><option value="male">男</option><option value="female">女</option></select></div>';
    html += '</div>';
    html += '<div class="profile-edit-error" id="profile-edit-error"></div>';
    html += '<div class="profile-edit-actions">';
    html += '<button class="btn-profile-cancel" onclick="window._cancelEditProfile()">取消</button>';
    html += '<button class="btn-gold" onclick="window._saveProfile()">保存命簿</button>';
    html += '</div>';
    html += '</div>';

    // 统计卡片
    html += '<div class="profile-stats">';
    html += '<div class="stat-item"><div class="stat-num">' + consultations.length + '</div><div class="stat-label">总咨询</div></div>';
    html += '<div class="stat-item"><div class="stat-num">' + (byType.liuyao||0) + '</div><div class="stat-label">六爻</div></div>';
    html += '<div class="stat-item"><div class="stat-num">' + (byType.meihua||0) + '</div><div class="stat-label">梅花</div></div>';
    html += '<div class="stat-item"><div class="stat-num">' + (byType.bazi||0) + '</div><div class="stat-label">八字</div></div>';
    html += '</div>';
    // 口径说明：总咨询涵盖所有板块，下方三项只是常用分类计数
    html += '<div class="profile-stats-note">总咨询含全部板块；六爻 / 梅花 / 八字为常用分类计数。</div>';

    // 记录列表
    html += '<div class="profile-section">';
    html += '<div class="section-title">📜 咨询记录</div>';
    html += '<div class="section-actions">';
    if (consultations.length > 0) {
      html += '<button class="btn-clear-history" onclick="window._clearHistory()">清空记录</button>';
    }
    html += '<button class="btn-export" onclick="window._exportProfile()">📤 导出档案</button>';
    html += '</div>';

    if (consultations.length === 0) {
      html += '<div class="empty-state">🌌 命簿尚空<br><span>请先立命录，再开启占卜之旅</span></div>';
    } else {
      html += '<div class="consult-list">';
      consultations.forEach(function(c) {
        html += '<div class="consult-item" data-id="'+c.id+'">';
        html += '<div class="consult-type-icon">'+typeIcon(c.type)+'</div>';
        html += '<div class="consult-content">';
        html += '<div class="consult-question">' + (c.question ? escapeHtml(c.question) : '无问题') + '</div>';
        html += '<div class="consult-meta">' + typeLabel(c.type) + ' · ' + formatTime(c.timestamp) + '</div>';
        html += '</div>';
        html += '<div class="consult-score">' + scoreToLabel(c.score) + '</div>';
        html += '</div>';
      });
      html += '</div>';
    }
    html += '</div>';

    // 导入区
    html += '<div class="profile-section">';
    html += '<div class="section-title">📥 导入档案</div>';
    html += '<textarea class="import-textarea" id="importArea" placeholder="粘贴导出的JSON档案数据..."></textarea>';
    html += '<div style="text-align:center;margin-top:12px;">';
    html += '<button class="btn-gold" onclick="window._importProfile()">导入</button>';
    html += '</div>';
    html += '</div>';

    html += '</div>'; // profile-container

    return html;
  }

  // ===== 全局操作函数 =====
  function setEditError(msg) {
    var el = document.getElementById('profile-edit-error');
    if (el) el.textContent = msg || '';
  }

  function showProfileEditForm() {
    var profile = loadProfile();
    var panel = document.getElementById('profileEditPanel');
    if (!panel) return;
    var nameEl = document.getElementById('profile-edit-name');
    var birthEl = document.getElementById('profile-edit-birth');
    var genderEl = document.getElementById('profile-edit-gender');
    if (nameEl) nameEl.value = profile.name || '';
    if (birthEl) birthEl.value = profile.birthDate || '';
    if (genderEl) genderEl.value = profile.gender === 'female' ? 'female' : 'male';
    setEditError('');
    panel.classList.remove('hidden');
    if (nameEl) nameEl.focus();
  }

  function cancelProfileEditForm() {
    var panel = document.getElementById('profileEditPanel');
    if (panel) panel.classList.add('hidden');
    setEditError('');
  }

  function saveProfileForm() {
    var nameEl = document.getElementById('profile-edit-name');
    var birthEl = document.getElementById('profile-edit-birth');
    var genderEl = document.getElementById('profile-edit-gender');
    if (!nameEl || !birthEl || !genderEl) return;

    var name = nameEl.value.trim();
    if (!name) {
      setEditError('姓名不能为空');
      nameEl.focus();
      return;
    }
    if (name.length > 20) {
      setEditError('姓名不能超过 20 个字符');
      nameEl.focus();
      return;
    }

    var birthDate = birthEl.value.trim();
    var dateErr = validateBirthDate(birthDate);
    if (dateErr) {
      setEditError(dateErr);
      birthEl.focus();
      return;
    }

    var gender = genderEl.value;
    if (gender !== 'male' && gender !== 'female') {
      setEditError('性别只能为男或女');
      genderEl.focus();
      return;
    }

    var profile = loadProfile();
    profile.name = name;
    profile.birthDate = birthDate;
    profile.gender = gender;
    if (!saveProfile(profile)) {
      setEditError('保存失败，请检查浏览器存储权限');
      return;
    }
    cancelProfileEditForm();
    global._refreshProfile();
    if (window.showToast) window.showToast('命簿已更新');
  }

  global._editProfile = showProfileEditForm;
  global._saveProfile = saveProfileForm;
  global._cancelEditProfile = cancelProfileEditForm;

  global._clearHistory = function() {
    if (!confirm('确定要清空所有咨询记录吗？此操作不可恢复。')) return;
    var profile = loadProfile();
    profile.consultations = [];
    saveProfile(profile);
    global._refreshProfile();
  };

  global._exportProfile = function() {
    var profile = loadProfile();
    var json = JSON.stringify(profile, null, 2);
    var blob = new Blob([json], {type: 'application/json'});
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = '天机阁档案_' + (profile.name||'用户') + '_' + new Date().toISOString().slice(0,10) + '.json';
    a.click();
    URL.revokeObjectURL(url);
    alert('档案已导出');
  };

  global._importProfile = function() {
    var text = document.getElementById('importArea').value.trim();
    if (!text) { alert('请先粘贴档案数据'); return; }
    try {
      var data = JSON.parse(text);
      var profile = loadProfile();
      if (data.name) profile.name = data.name;
      if (data.birthDate) profile.birthDate = data.birthDate;
      if (data.gender) profile.gender = data.gender;
      if (data.consultations && Array.isArray(data.consultations)) {
        // 合并，去重
        var existingIds = {};
        profile.consultations.forEach(function(c){ existingIds[c.id] = true; });
        data.consultations.forEach(function(c){ if(!existingIds[c.id]) profile.consultations.unshift(c); });
      }
      if (data.createdAt) profile.createdAt = data.createdAt;
      saveProfile(profile);
      document.getElementById('importArea').value = '';
      global._refreshProfile();
      alert('导入成功');
    } catch(e) {
      alert('导入失败：数据格式错误');
    }
  };

  global._refreshProfile = function() {
    var container = document.getElementById('page-container');
    if (!container) return;
    var html = renderProfilePage();
    container.innerHTML = html;
    applyProfileStyles();
  };

  function applyProfileStyles() {
    // 注入档案页专用样式
    if (document.getElementById('profile-styles')) return;
    var style = document.createElement('style');
    style.id = 'profile-styles';
    style.textContent = `
      .profile-container { max-width: 700px; margin: 0 auto; padding: 20px 0; }
      .profile-header-card {
        display: flex; align-items: center; gap: 20px;
        padding: 24px; background: rgba(24,20,14,0.82);
        border: 1px solid rgba(255,255,255,0.05); border-radius: 14px;
        margin-bottom: 20px;
      }
      .profile-avatar { flex-shrink: 0; }
      .avatar-initial {
        width: 64px; height: 64px; border-radius: 50%;
        background: linear-gradient(135deg, rgba(184,154,92,0.3), rgba(184,154,92,0.1));
        border: 2px solid rgba(184,154,92,0.4);
        display: flex; align-items: center; justify-content: center;
        font-size: 1.6rem; font-family: 'Ma Shan Zheng', cursive;
        color: #d4bb7c;
      }
      .profile-name { font-size: 1.4rem; font-weight: 700; color: #d4bb7c; margin: 0 0 6px; font-family: 'Noto Serif SC', serif; }
      .profile-meta { font-size: 0.82rem; color: #8a8576; margin: 2px 0; }
      .btn-edit-profile {
        padding: 8px 18px; background: rgba(184,154,92,0.1); border: 1px solid rgba(184,154,92,0.3);
        border-radius: 20px; color: #d4bb7c; font-size: 0.82rem; cursor: pointer;
        font-family: 'Noto Sans SC', sans-serif; transition: all 0.3s;
      }
      .btn-edit-profile:hover { background: rgba(184,154,92,0.2); }
      .profile-edit-panel {
        padding: 20px; background: rgba(24,20,14,0.82);
        border: 1px solid rgba(184,154,92,0.18); border-radius: 14px;
        margin-bottom: 20px;
      }
      .profile-edit-row { grid-template-columns: repeat(3, 1fr); }
      .profile-edit-error { min-height: 18px; margin-top: 10px; color: #ef4444; font-size: 0.78rem; }
      .profile-edit-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 6px; }
      .btn-profile-cancel {
        padding: 10px 24px; background: transparent; border: 1px solid rgba(255,255,255,0.12);
        border-radius: 24px; color: #8a8576; font-size: 0.88rem; cursor: pointer;
        font-family: 'Noto Sans SC', sans-serif; transition: all 0.3s;
      }
      .btn-profile-cancel:hover { color: #e0dcd0; border-color: rgba(255,255,255,0.25); }
      .profile-stats {
        display: grid; grid-template-columns: repeat(4,1fr); gap: 12px;
        margin-bottom: 8px;
      }
      .profile-stats-note {
        font-size: 0.72rem; color: #8a8576; text-align: center;
        margin-bottom: 20px;
      }
      .stat-item {
        text-align: center; padding: 16px 8px; background: rgba(24,20,14,0.82);
        border: 1px solid rgba(255,255,255,0.05); border-radius: 12px;
      }
      .stat-num { font-size: 1.5rem; color: #d4bb7c; font-weight: 700; font-family: 'Noto Serif SC', serif; }
      .stat-label { font-size: 0.72rem; color: #8a8576; margin-top: 4px; }
      .profile-section {
        background: rgba(24,20,14,0.82); border: 1px solid rgba(255,255,255,0.05);
        border-radius: 14px; padding: 20px; margin-bottom: 20px;
      }
      .section-title { font-size: 0.95rem; color: #d4bb7c; margin-bottom: 12px; font-family: 'Noto Serif SC', serif; }
      .section-actions { display: flex; gap: 10px; margin-bottom: 16px; }
      .btn-clear-history {
        padding: 6px 14px; background: transparent; border: 1px solid rgba(239,68,68,0.3);
        border-radius: 16px; color: #ef4444; font-size: 0.75rem; cursor: pointer;
        font-family: 'Noto Sans SC', sans-serif; transition: all 0.3s;
      }
      .btn-clear-history:hover { background: rgba(239,68,68,0.1); }
      .btn-export {
        padding: 6px 14px; background: rgba(184,154,92,0.1); border: 1px solid rgba(184,154,92,0.3);
        border-radius: 16px; color: #d4bb7c; font-size: 0.75rem; cursor: pointer;
        font-family: 'Noto Sans SC', sans-serif; transition: all 0.3s;
      }
      .btn-export:hover { background: rgba(184,154,92,0.2); }
      .empty-state { text-align: center; padding: 40px 20px; color: #8a8576; font-size: 0.9rem; }
      .consult-list { display: flex; flex-direction: column; gap: 8px; }
      .consult-item {
        display: flex; align-items: center; gap: 12px;
        padding: 12px 14px; background: rgba(0,0,0,0.25); border-radius: 8px;
        border: 1px solid rgba(255,255,255,0.03); transition: border-color 0.3s;
      }
      .consult-item:hover { border-color: rgba(184,154,92,0.2); }
      .consult-type-icon { font-size: 1.3rem; flex-shrink: 0; }
      .consult-content { flex: 1; min-width: 0; }
      .consult-question { font-size: 0.88rem; color: #e0dcd0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .consult-meta { font-size: 0.72rem; color: #8a8576; margin-top: 2px; }
      .consult-score { font-size: 0.78rem; flex-shrink: 0; }
      .import-textarea {
        width: 100%; padding: 12px; background: rgba(0,0,0,0.35); border: 1px solid rgba(255,255,255,0.05);
        border-radius: 8px; color: #e0dcd0; font-size: 0.82rem; resize: vertical;
        min-height: 80px; font-family: monospace; outline: none;
      }
      .import-textarea:focus { border-color: rgba(184,154,92,0.4); }
      .btn-gold {
        padding: 10px 28px; background: linear-gradient(135deg,rgba(138,109,52,0.82),rgba(184,154,92,0.9));
        color: #0a080f; font-weight: 600; border-radius: 24px; border: 1px solid rgba(184,154,92,0.28);
        cursor: pointer; font-family: 'Noto Sans SC', sans-serif; font-size: 0.88rem;
        letter-spacing: 0.05em; transition: all 0.3s;
      }
      .btn-gold:hover { background: linear-gradient(135deg,#8a6d34,#b89a5c); box-shadow: 0 0 20px rgba(184,154,92,0.3); }
      @media(max-width:600px){
        .profile-stats { grid-template-columns: repeat(2,1fr); }
        .profile-header-card { flex-wrap: wrap; }
        .profile-edit-row { grid-template-columns: 1fr; }
      }
    `;
    document.head.appendChild(style);
  }

  function renderProfileComponent() {
    var el = document.createElement('div');
    el.className = 'fade-in';
    el.innerHTML = renderProfilePage();
    applyProfileStyles();
    return el;
  }

  global.renderProfileComponent = renderProfileComponent;

  // 公开API供各EP页面调用
  global.UserProfileAPI = {
    getProfile: loadProfile,
    saveProfile: saveProfile,
    addRecord: function(record) {
      var p = loadProfile();
      record.id = record.id || Date.now().toString(36) + Math.random().toString(36).slice(2,6);
      record.timestamp = record.timestamp || Date.now();
      if (!p.consultations) p.consultations = [];
      p.consultations.unshift(record);
      if (p.consultations.length > 500) p.consultations = p.consultations.slice(0, 500);
      saveProfile(p);
      return record.id;
    },
    getTypeIcon: typeIcon,
    getTypeLabel: typeLabel
  };

})(window);
