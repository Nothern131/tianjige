/**
 * 天机阁 API 模块
 * 所有后端 API 请求的统一入口
 */
const API_BASE = '/api/bazi';

/**
 * 通用 fetch 封装，含错误处理和超时
 */
async function apiFetch(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `请求失败 (${response.status})`);
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('请求超时，请稍后重试');
    }
    throw error;
  }
}

/** 生成八字排盘 */
async function fetchBazi(data) {
  return apiFetch('/bazi', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/** 财富分析 */
async function fetchWealth(data) {
  return apiFetch('/wealth', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/** 天赋分析 */
async function fetchTalent(data) {
  return apiFetch('/talent', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/** 反内耗分析 */
async function fetchBalance(data) {
  return apiFetch('/balance', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/** 人生K线 */
async function fetchLifeline(data) {
  return apiFetch('/lifeline', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/** 流月 */
async function fetchMonthly(data) {
  return apiFetch('/monthly', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/** 择日 */
async function fetchDateSelect(data) {
  return apiFetch('/date-select', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/** 正缘 */
async function fetchLove(data) {
  return apiFetch('/love', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/** 诸葛神数 */
async function fetchZhuge(data) {
  return apiFetch('/zhuge', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/** 大师列表 */
async function fetchMasters() {
  return apiFetch('/masters');
}

/** 大师风格分析 */
async function fetchMasterAnalysis(data) {
  return apiFetch('/master-analysis', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/** 六爻 */
async function fetchLiuyao(data) {
  return apiFetch('/liuyao', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/** 梅花易数 */
async function fetchMeihua(data) {
  return apiFetch('/meihua', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/** 奇门遁甲 */
async function fetchQimen(data) {
  return apiFetch('/qimen', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/** 太乙神数 */
async function fetchTaiyi(data) {
  return apiFetch('/taiyi', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

