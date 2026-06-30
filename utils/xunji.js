import { cloneDraftMovements, normalizeDraftMovement, PLAN_MAIN_MOVEMENTS } from '@/utils/tm-plan';

export const XUNJI_KEY_STORAGE = 'tm-plan-xunji-key-v1';
export const XUNJI_CACHE_STORAGE = 'tm-plan-xunji-cache-v1';
export const XUNJI_RATE_LIMIT_STORAGE = 'tm-plan-xunji-rate-limit-v1';
export const XUNJI_DRAFT_ACCESSORY_STORAGE = 'tm-plan-xunji-draft-accessory-v1';
export const XUNJI_EDITOR_DRAFT_STORAGE = 'tm-plan-xunji-editor-draft-v1';
export const XUNJI_EDITOR_RESULT_STORAGE = 'tm-plan-xunji-editor-result-v1';

export const XUNJI_BASE_URL = 'https://trains.xunjiapp.cn';
export const XUNJI_READ_API = '/api_trains_for_llm_v2';
export const XUNJI_UPSERT_API = '/api_upsert_trains_for_llm_v2';
export const XUNJI_SCHEMA_VERSION = 'train_open_api_v2';
export const DEFAULT_INCLUDE_FULL_DATA = true;

const READ_INTERVAL_LIGHT_SECONDS = 15;
const READ_INTERVAL_FULL_SECONDS = 30;
const WRITE_INTERVAL_SECONDS = 45;

export function normalizeDateInput(value) {
  const raw = String(value || '').trim();
  if (!raw) {
    return '';
  }

  const normalized = raw.replace(/\//g, '-');
  const match = normalized.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (!match) {
    return '';
  }

  const year = match[1];
  const month = match[2].padStart(2, '0');
  const day = match[3].padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getTodayDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getStoredXunjiKey() {
  try {
    return String(uni.getStorageSync(XUNJI_KEY_STORAGE) || '').trim();
  } catch (error) {
    return '';
  }
}

export function persistXunjiKey(value) {
  const key = String(value || '').trim();
  uni.setStorageSync(XUNJI_KEY_STORAGE, key);
  return key;
}

export function clearStoredXunjiKey() {
  try {
    uni.removeStorageSync(XUNJI_KEY_STORAGE);
  } catch (error) {
    // Ignore storage failure.
  }
}

export function persistEditorDraft(draft) {
  uni.setStorageSync(XUNJI_EDITOR_DRAFT_STORAGE, draft || null);
  return draft;
}

export function consumeEditorDraft() {
  try {
    const draft = uni.getStorageSync(XUNJI_EDITOR_DRAFT_STORAGE);
    uni.removeStorageSync(XUNJI_EDITOR_DRAFT_STORAGE);
    return draft || null;
  } catch (error) {
    return null;
  }
}

export function persistEditorResult(result) {
  uni.setStorageSync(XUNJI_EDITOR_RESULT_STORAGE, result || null);
  return result;
}

export function consumeEditorResult() {
  try {
    const result = uni.getStorageSync(XUNJI_EDITOR_RESULT_STORAGE);
    uni.removeStorageSync(XUNJI_EDITOR_RESULT_STORAGE);
    return result || null;
  } catch (error) {
    return null;
  }
}

function getAccessoryDraftBucket() {
  try {
    const data = uni.getStorageSync(XUNJI_DRAFT_ACCESSORY_STORAGE);
    return data && typeof data === 'object' ? data : {};
  } catch (error) {
    return {};
  }
}

function persistAccessoryDraftBucket(bucket) {
  uni.setStorageSync(XUNJI_DRAFT_ACCESSORY_STORAGE, bucket);
}

export function restoreDraftAccessoryMovements(liftKey) {
  if (!liftKey) {
    return [];
  }

  const bucket = getAccessoryDraftBucket();
  const savedMovements = Array.isArray(bucket[liftKey]) ? bucket[liftKey] : [];
  return cloneDraftMovements(savedMovements).map((movement) => ({
    ...movement,
    category: 'accessory'
  }));
}

export function persistDraftAccessoryMovements(liftKey, movements = []) {
  if (!liftKey) {
    return [];
  }

  const bucket = getAccessoryDraftBucket();
  const normalizedMovements = cloneDraftMovements(movements).map((movement) => ({
    ...movement,
    category: 'accessory'
  }));
  bucket[liftKey] = normalizedMovements;
  persistAccessoryDraftBucket(bucket);
  return normalizedMovements;
}

export function clearDraftAccessoryMovements(liftKey) {
  if (!liftKey) {
    return;
  }

  const bucket = getAccessoryDraftBucket();
  delete bucket[liftKey];
  persistAccessoryDraftBucket(bucket);
}

function getCacheBucket() {
  try {
    const data = uni.getStorageSync(XUNJI_CACHE_STORAGE);
    return data && typeof data === 'object' ? data : {};
  } catch (error) {
    return {};
  }
}

function persistCacheBucket(bucket) {
  uni.setStorageSync(XUNJI_CACHE_STORAGE, bucket);
}

function buildCacheKey(datestr, includeFullData) {
  return `${datestr}:${includeFullData ? 'full' : 'light'}`;
}

export function getCachedTrainData(datestr, includeFullData = DEFAULT_INCLUDE_FULL_DATA) {
  const safeDate = normalizeDateInput(datestr);
  if (!safeDate) {
    return null;
  }

  const bucket = getCacheBucket();
  return bucket[buildCacheKey(safeDate, includeFullData)] || null;
}

export function setCachedTrainData(datestr, includeFullData, data) {
  const safeDate = normalizeDateInput(datestr);
  if (!safeDate) {
    return;
  }

  const bucket = getCacheBucket();
  bucket[buildCacheKey(safeDate, includeFullData)] = {
    datestr: safeDate,
    includeFullData,
    savedAt: Date.now(),
    data
  };
  persistCacheBucket(bucket);
}

function getRateLimitBucket() {
  try {
    const data = uni.getStorageSync(XUNJI_RATE_LIMIT_STORAGE);
    return data && typeof data === 'object' ? data : {};
  } catch (error) {
    return {};
  }
}

function persistRateLimitBucket(bucket) {
  uni.setStorageSync(XUNJI_RATE_LIMIT_STORAGE, bucket);
}

function buildRateLimitKey(datestr, includeFullData) {
  return `${datestr}:${includeFullData ? 'full' : 'light'}`;
}

function buildWriteRateLimitKey(datestr) {
  return `${datestr}:write`;
}

function getRequiredIntervalSeconds(includeFullData) {
  return includeFullData ? READ_INTERVAL_FULL_SECONDS : READ_INTERVAL_LIGHT_SECONDS;
}

export function getRateLimitStatus(datestr, includeFullData = DEFAULT_INCLUDE_FULL_DATA) {
  const safeDate = normalizeDateInput(datestr);
  if (!safeDate) {
    return {
      blocked: false,
      retryAfterSeconds: 0
    };
  }

  const bucket = getRateLimitBucket();
  const lastRequestAt = Number(bucket[buildRateLimitKey(safeDate, includeFullData)] || 0);
  if (!lastRequestAt) {
    return {
      blocked: false,
      retryAfterSeconds: 0
    };
  }

  const intervalSeconds = getRequiredIntervalSeconds(includeFullData);
  const elapsedSeconds = (Date.now() - lastRequestAt) / 1000;
  if (elapsedSeconds >= intervalSeconds) {
    return {
      blocked: false,
      retryAfterSeconds: 0
    };
  }

  return {
    blocked: true,
    retryAfterSeconds: Math.ceil(intervalSeconds - elapsedSeconds)
  };
}

export function markRateLimitedRequest(datestr, includeFullData = DEFAULT_INCLUDE_FULL_DATA) {
  const safeDate = normalizeDateInput(datestr);
  if (!safeDate) {
    return;
  }

  const bucket = getRateLimitBucket();
  bucket[buildRateLimitKey(safeDate, includeFullData)] = Date.now();
  persistRateLimitBucket(bucket);
}

export function getWriteRateLimitStatus(datestr) {
  const safeDate = normalizeDateInput(datestr);
  if (!safeDate) {
    return {
      blocked: false,
      retryAfterSeconds: 0
    };
  }

  const bucket = getRateLimitBucket();
  const lastRequestAt = Number(bucket[buildWriteRateLimitKey(safeDate)] || 0);
  if (!lastRequestAt) {
    return {
      blocked: false,
      retryAfterSeconds: 0
    };
  }

  const elapsedSeconds = (Date.now() - lastRequestAt) / 1000;
  if (elapsedSeconds >= WRITE_INTERVAL_SECONDS) {
    return {
      blocked: false,
      retryAfterSeconds: 0
    };
  }

  return {
    blocked: true,
    retryAfterSeconds: Math.ceil(WRITE_INTERVAL_SECONDS - elapsedSeconds)
  };
}

export function markWriteRequest(datestr) {
  const safeDate = normalizeDateInput(datestr);
  if (!safeDate) {
    return;
  }

  const bucket = getRateLimitBucket();
  bucket[buildWriteRateLimitKey(safeDate)] = Date.now();
  persistRateLimitBucket(bucket);
}

function buildHeaders(key) {
  return {
    Authorization: `Bearer ${key}`,
    'x-api-key': key,
    'Content-Type': 'application/json'
  };
}

function buildReadPayload(datestr, includeFullData) {
  return {
    schema_version: XUNJI_SCHEMA_VERSION,
    datestr,
    include_full_data: includeFullData
  };
}

function mergeMainMovementsForSubmit(trainDraft) {
  const movements = Array.isArray(trainDraft && trainDraft.movements) ? trainDraft.movements : [];
  const coreMovementCount = Number(trainDraft && trainDraft.source && trainDraft.source.coreMovementCount) || 0;
  const mainMovementName = PLAN_MAIN_MOVEMENTS[trainDraft && trainDraft.source && trainDraft.source.liftKey] || '';

  if (coreMovementCount < 2 || movements.length < 2 || !mainMovementName) {
    return cloneDraftMovements(movements);
  }

  const coreMovements = movements.slice(0, coreMovementCount);
  const accessoryMovements = movements.slice(coreMovementCount);
  const topMovement = coreMovements[0];
  const backoffMovement = coreMovements[1];

  if (!topMovement || !backoffMovement) {
    return cloneDraftMovements(movements);
  }

  const mergedMainMovement = normalizeDraftMovement({
    key: topMovement.key || 'merged-main-movement',
    name: mainMovementName,
    type: topMovement.type || backoffMovement.type || '',
    category: 'main',
    sets: [
      ...(Array.isArray(topMovement.sets) ? topMovement.sets : []),
      ...(Array.isArray(backoffMovement.sets) ? backoffMovement.sets : [])
    ]
  }, 0);

  return cloneDraftMovements([
    mergedMainMovement,
    ...coreMovements.slice(2),
    ...accessoryMovements
  ]);
}

function buildUpsertPayload(trainDraft, includeFullData = DEFAULT_INCLUDE_FULL_DATA) {
  const mergedMovements = mergeMainMovementsForSubmit(trainDraft);
  const nextTrain = {
    datestr: trainDraft.datestr,
    title: trainDraft.title,
    note: trainDraft.note || '',
    movements: mergedMovements.map((movement) => ({
      name: movement.name,
      sets: (movement.sets || []).map((setItem) => {
        const nextSet = {
          done: false
        };

        if (hasMeaningfulValue(setItem.weight)) {
          nextSet.weight = String(setItem.weight);
        }
        if (hasMeaningfulValue(setItem.unit)) {
          nextSet.unit = setItem.unit;
        }
        if (hasMeaningfulValue(setItem.reps)) {
          nextSet.reps = String(setItem.reps);
        }

        return nextSet;
      })
    }))
  };

  if (hasMeaningfulValue(trainDraft.localid)) {
    nextTrain.localid = trainDraft.localid;
  }
  if (hasMeaningfulValue(trainDraft.start)) {
    nextTrain.start = trainDraft.start;
  }
  if (hasMeaningfulValue(trainDraft.end)) {
    nextTrain.end = trainDraft.end;
  }

  return {
    schema_version: XUNJI_SCHEMA_VERSION,
    client_request_id: `tm-plan-${Date.now()}`,
    dry_run: false,
    include_full_data: includeFullData,
    res: [nextTrain]
  };
}

function parseApiResponse(response) {
  if (!response || typeof response !== 'object') {
    throw new Error('训记接口返回为空');
  }

  if (response.success === false) {
    throw new Error(response.msg || response.message || '查询失败');
  }

  if (!response.res) {
    throw new Error('训记接口返回缺少 res');
  }

  return response;
}

export function extractTrainList(responseData) {
  return responseData && responseData.res && Array.isArray(responseData.res.trains)
    ? responseData.res.trains
    : [];
}

export function buildTrainSummary(responseData) {
  const trains = extractTrainList(responseData);
  return {
    count: trains.length,
    trains: trains.map((train) => {
      const movements = Array.isArray(train.movements) ? train.movements : [];
      return {
        localid: train.localid,
        title: train.title || '未命名训练',
        datestr: train.datestr || '',
        note: train.note || '',
        movementCount: movements.length,
        movementNames: movements.map((movement) => movement.name || '')
      };
    })
  };
}

function hasMeaningfulValue(value) {
  return value !== undefined && value !== null && value !== '';
}

function formatMetricEntry(key, value) {
  const labelMap = {
    distance: '距离',
    kcal: '千卡',
    calories: '卡路里',
    workoutTime: '训练时长',
    avgHeartRate: '平均心率',
    maxHeartRate: '最大心率'
  };
  const label = labelMap[key] || key;
  return `${label} ${value}`;
}

function formatMetrics(metrics) {
  if (!metrics || typeof metrics !== 'object') {
    return '';
  }

  return Object.keys(metrics)
    .filter((key) => hasMeaningfulValue(metrics[key]))
    .map((key) => formatMetricEntry(key, metrics[key]))
    .join(' · ');
}

function formatSetText(setData) {
  if (!setData || typeof setData !== 'object') {
    return '暂无组数据';
  }

  const parts = [];
  if (setData.done === false) {
    parts.push('未完成');
  }

  const weightValue = hasMeaningfulValue(setData.weight) ? setData.weight : setData.weight_kg;
  const weightUnit = setData.unit || (hasMeaningfulValue(setData.weight_kg) ? 'kg' : '');
  if (hasMeaningfulValue(weightValue)) {
    parts.push(weightUnit ? `${weightValue}${weightUnit}` : String(weightValue));
  } else if (setData.selfWeight) {
    parts.push('自重');
  }

  if (hasMeaningfulValue(setData.reps)) {
    parts.push(`${setData.reps}次`);
  }

  const durationValue = hasMeaningfulValue(setData.duration_s) ? setData.duration_s : setData.time;
  if (hasMeaningfulValue(durationValue)) {
    parts.push(`time ${durationValue}秒`);
  }

  if (hasMeaningfulValue(setData.rpe)) {
    parts.push(`RPE ${setData.rpe}`);
  }

  if (hasMeaningfulValue(setData.feeling)) {
    parts.push(`感受 ${setData.feeling}`);
  }

  const metricsText = formatMetrics(setData.metrics);
  if (metricsText) {
    parts.push(metricsText);
  }

  return parts.length ? parts.join(' · ') : '暂无组数据';
}

function buildChildItemDetails(items) {
  if (!Array.isArray(items) || !items.length) {
    return [];
  }

  return items.map((item, index) => {
    const setData = item && item.set ? item.set : item;
    return {
      key: item && item.name ? `${item.name}-${index}` : `child-${index}`,
      name: item && item.name ? item.name : `子动作 ${index + 1}`,
      text: formatSetText(setData)
    };
  });
}

function formatTrainTime(timestamp) {
  const numeric = Number(timestamp);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return '';
  }

  const time = new Date(numeric);
  const hour = String(time.getHours()).padStart(2, '0');
  const minute = String(time.getMinutes()).padStart(2, '0');
  return `${hour}:${minute}`;
}

function buildMovementDetails(movement) {
  const sets = Array.isArray(movement && movement.sets) ? movement.sets : [];
  return {
    key: `${movement && movement.name ? movement.name : 'movement'}-${movement && movement.index ? movement.index : 0}`,
    name: movement && movement.name ? movement.name : '未命名动作',
    type: movement && movement.type ? movement.type : '',
    setCount: sets.length,
    doneCount: sets.filter((setItem) => setItem && setItem.done !== false).length,
    sets: sets.map((setItem, index) => ({
      key: `${movement && movement.name ? movement.name : 'set'}-${index + 1}`,
      label: `第 ${index + 1} 组`,
      text: formatSetText(setItem),
      done: setItem && setItem.done !== false,
      childItems: buildChildItemDetails(setItem && setItem.items)
    }))
  };
}

function buildMovementCopyText(movement) {
  const lines = [`${movement.name}`];

  movement.sets.forEach((setItem) => {
    lines.push(`${setItem.label}：${setItem.text}`);
    if (Array.isArray(setItem.childItems) && setItem.childItems.length) {
      setItem.childItems.forEach((child) => {
        lines.push(`  - ${child.name}：${child.text}`);
      });
    }
  });

  return lines.join('\n');
}

function buildTrainCopyText(trainDetail) {
  const lines = [trainDetail.title];

  if (trainDetail.timeRangeText) {
    lines.push(`时间：${trainDetail.timeRangeText}`);
  }

  if (trainDetail.note) {
    lines.push(`备注：${trainDetail.note}`);
  }

  lines.push('');

  trainDetail.movements.forEach((movement, index) => {
    lines.push(`${index + 1}. ${buildMovementCopyText(movement)}`);
    lines.push('');
  });

  return lines.join('\n').trim();
}

export function buildDraftSubmitSummary(trainDraft) {
  if (!trainDraft) {
    return '';
  }

  const mergedMovements = mergeMainMovementsForSubmit(trainDraft);
  const movementLines = mergedMovements.map((movement, index) => {
    return `${index + 1}. ${movement.name}（${movement.setCount}组）`;
  });

  return [
    `日期：${trainDraft.datestr}`,
    `标题：${trainDraft.title}`,
    `动作数：${mergedMovements.length}`,
    '',
    ...movementLines
  ].join('\n');
}

export function buildTrainDetails(responseData) {
  const trains = extractTrainList(responseData);
  return trains.map((train, index) => {
    const movements = Array.isArray(train && train.movements) ? train.movements : [];
    const trainDetail = {
      key: train && train.localid ? String(train.localid) : `train-${index}`,
      localid: train && train.localid ? train.localid : '',
      title: train && train.title ? train.title : '未命名训练',
      note: train && train.note ? train.note : '',
      datestr: train && train.datestr ? train.datestr : '',
      start: train && train.start ? train.start : '',
      end: train && train.end ? train.end : '',
      timeRangeText: [formatTrainTime(train && train.start), formatTrainTime(train && train.end)]
        .filter(Boolean)
        .join(' - '),
      movementCount: movements.length,
      movements: movements.map((movement) => buildMovementDetails(movement)),
      rawTrain: train
    };

    return {
      ...trainDetail,
      copyText: buildTrainCopyText(trainDetail)
    };
  });
}

export function buildTrainDraftFromDetail(trainDetail) {
  if (!trainDetail || !trainDetail.rawTrain) {
    return null;
  }

  const rawTrain = trainDetail.rawTrain;
  const hasNestedItems = (Array.isArray(rawTrain.movements) ? rawTrain.movements : []).some((movement) => (
    Array.isArray(movement && movement.sets) && movement.sets.some((setItem) => Array.isArray(setItem && setItem.items) && setItem.items.length)
  ));

  if (hasNestedItems) {
    return {
      error: '暂不支持直接修改超级组或递减组训练'
    };
  }

  const movements = (Array.isArray(rawTrain.movements) ? rawTrain.movements : []).map((movement, index) => (
    normalizeDraftMovement({
      key: `update-movement-${index + 1}`,
      name: movement && movement.name ? movement.name : '',
      type: movement && movement.type ? movement.type : '',
      category: 'editable',
      sets: Array.isArray(movement && movement.sets) ? movement.sets : []
    }, index)
  ));

  return {
    datestr: rawTrain.datestr || trainDetail.datestr || '',
    title: rawTrain.title || trainDetail.title || '未命名训练',
    note: rawTrain.note || '',
    localid: rawTrain.localid,
    start: rawTrain.start,
    end: rawTrain.end,
    source: {
      type: 'xunji',
      coreMovementCount: 0
    },
    movementCount: movements.length,
    movements
  };
}

export function inferLiftKeyFromTrainDetail(trainDetail) {
  if (!trainDetail) {
    return '';
  }

  const title = String(trainDetail.title || '').trim();
  if (title.startsWith('胸')) {
    return 'bench';
  }
  if (title.startsWith('腿')) {
    return 'squat';
  }
  if (title.startsWith('背')) {
    return 'pullup';
  }

  const movementNames = Array.isArray(trainDetail.rawTrain && trainDetail.rawTrain.movements)
    ? trainDetail.rawTrain.movements.map((movement) => String(movement && movement.name ? movement.name : ''))
    : [];

  if (movementNames.includes(PLAN_MAIN_MOVEMENTS.bench)) {
    return 'bench';
  }
  if (movementNames.includes(PLAN_MAIN_MOVEMENTS.squat)) {
    return 'squat';
  }
  if (movementNames.includes(PLAN_MAIN_MOVEMENTS.pullup)) {
    return 'pullup';
  }

  return '';
}

export function extractAccessoryMovementsFromTrainDetail(trainDetail) {
  if (!trainDetail || !trainDetail.rawTrain) {
    return {
      error: '训练数据无效'
    };
  }

  const rawMovements = Array.isArray(trainDetail.rawTrain.movements) ? trainDetail.rawTrain.movements : [];
  if (rawMovements.length <= 2) {
    return {
      error: '这条训练没有可提取的辅助项'
    };
  }

  const accessoryRawMovements = rawMovements.slice(2);
  const hasNestedItems = accessoryRawMovements.some((movement) => (
    Array.isArray(movement && movement.sets) && movement.sets.some((setItem) => Array.isArray(setItem && setItem.items) && setItem.items.length)
  ));

  if (hasNestedItems) {
    return {
      error: '暂不支持提取包含超级组或递减组的辅助项'
    };
  }

  const movements = accessoryRawMovements.map((movement, index) => (
    normalizeDraftMovement({
      key: `template-movement-${index + 1}`,
      name: movement && movement.name ? movement.name : '',
      type: movement && movement.type ? movement.type : '',
      category: 'accessory',
      sets: Array.isArray(movement && movement.sets) ? movement.sets : []
    }, index)
  ));

  if (!movements.length) {
    return {
      error: '这条训练没有可提取的辅助项'
    };
  }

  return {
    movements
  };
}

export function extractSelectableAccessoryMovementsFromTrainDetail(trainDetail) {
  if (!trainDetail || !trainDetail.rawTrain) {
    return {
      error: '训练数据无效'
    };
  }

  const mainMovementNames = new Set([
    '主项顶组',
    ...Object.values(PLAN_MAIN_MOVEMENTS)
  ]);
  const rawMovements = Array.isArray(trainDetail.rawTrain.movements) ? trainDetail.rawTrain.movements : [];
  const accessoryRawMovements = rawMovements.filter((movement) => !mainMovementNames.has(String(movement && movement.name ? movement.name : '').trim()));

  if (!accessoryRawMovements.length) {
    return {
      error: '这条训练没有可选的辅助项'
    };
  }

  const movements = [];

  accessoryRawMovements.forEach((movement, index) => {
    const hasNestedItems = Array.isArray(movement && movement.sets)
      && movement.sets.some((setItem) => Array.isArray(setItem && setItem.items) && setItem.items.length);

    if (hasNestedItems) {
      return;
    }

    movements.push(normalizeDraftMovement({
      key: `history-accessory-movement-${index + 1}`,
      name: movement && movement.name ? movement.name : '',
      type: movement && movement.type ? movement.type : '',
      category: 'accessory',
      sets: Array.isArray(movement && movement.sets) ? movement.sets : []
    }, index));
  });

  if (!movements.length) {
    return {
      error: '可选动作包含暂不支持的超级组或递减组'
    };
  }

  return {
    movements
  };
}

function normalizeUpsertResponse(datestr, includeFullData, responseData) {
  const rawRes = responseData && responseData.res ? responseData.res : {};
  const trains = Array.isArray(rawRes)
    ? rawRes
    : Array.isArray(rawRes.trains)
      ? rawRes.trains
      : [];

  return {
    success: true,
    res: {
      schema_version: XUNJI_SCHEMA_VERSION,
      datestr,
      include_full_data: includeFullData,
      trains
    }
  };
}

export function queryXunjiTrains(options = {}) {
  const datestr = normalizeDateInput(options.datestr || getTodayDateString());
  const includeFullData = options.includeFullData !== false;
  const forceRefresh = Boolean(options.forceRefresh);
  const key = String(options.key || getStoredXunjiKey()).trim();

  if (!key) {
    return Promise.reject(new Error('请先在训练计划页设置训记 Key'));
  }
  if (!datestr) {
    return Promise.reject(new Error('日期格式不正确'));
  }

  if (!forceRefresh) {
    const cached = getCachedTrainData(datestr, includeFullData);
    if (cached && cached.data) {
      return Promise.resolve({
        source: 'cache',
        datestr,
        includeFullData,
        data: cached.data
      });
    }

    const rateLimitStatus = getRateLimitStatus(datestr, includeFullData);
    if (rateLimitStatus.blocked) {
      return Promise.reject(
        new Error(`请求过于频繁，请在 ${rateLimitStatus.retryAfterSeconds} 秒后重试`)
      );
    }
  }

  return new Promise((resolve, reject) => {
    uni.request({
      url: `${XUNJI_BASE_URL}${XUNJI_READ_API}`,
      method: 'POST',
      header: buildHeaders(key),
      data: buildReadPayload(datestr, includeFullData),
      success: (result) => {
        try {
          const responseData = parseApiResponse(result.data);
          setCachedTrainData(datestr, includeFullData, responseData);
          markRateLimitedRequest(datestr, includeFullData);
          resolve({
            source: 'remote',
            datestr,
            includeFullData,
            data: responseData
          });
        } catch (error) {
          reject(error);
        }
      },
      fail: (error) => {
        reject(new Error(error && error.errMsg ? error.errMsg : '请求失败'));
      }
    });
  });
}

export function createXunjiTrainFromDraft(options = {}) {
  const trainDraft = options.trainDraft;
  const includeFullData = options.includeFullData !== false;
  const key = String(options.key || getStoredXunjiKey()).trim();
  const datestr = normalizeDateInput(trainDraft && trainDraft.datestr);

  if (!key) {
    return Promise.reject(new Error('请先在训练计划页设置训记 Key'));
  }
  if (!datestr || !trainDraft) {
    return Promise.reject(new Error('训练草稿无效'));
  }

  const writeRateStatus = getWriteRateLimitStatus(datestr);
  if (writeRateStatus.blocked) {
    return Promise.reject(
      new Error(`写入过于频繁，请在 ${writeRateStatus.retryAfterSeconds} 秒后重试`)
    );
  }

  return new Promise((resolve, reject) => {
    uni.request({
      url: `${XUNJI_BASE_URL}${XUNJI_UPSERT_API}`,
      method: 'POST',
      header: buildHeaders(key),
      data: buildUpsertPayload(trainDraft, includeFullData),
      success: (result) => {
        try {
          const responseData = parseApiResponse(result.data);
          markWriteRequest(datestr);
          const normalized = normalizeUpsertResponse(datestr, includeFullData, responseData);
          setCachedTrainData(datestr, includeFullData, normalized);
          resolve({
            datestr,
            includeFullData,
            data: normalized
          });
        } catch (error) {
          reject(error);
        }
      },
      fail: (error) => {
        reject(new Error(error && error.errMsg ? error.errMsg : '写回失败'));
      }
    });
  });
}
