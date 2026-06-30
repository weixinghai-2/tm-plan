export const STORAGE_KEY = 'tm-plan-inputs-v1';
export const QUERY_STORAGE_KEY = 'tm-plan-query-state-v1';
export const CONFIG_STORAGE_KEY = 'tm-plan-lift-configs-v1';

export const DEFAULTS = {
  benchRm: 112.5,
  squatRm: 142.5,
  pullupRm: 132.5,
  bodyweight: 70
};

export const INPUT_FIELDS = [
  { key: 'benchRm', label: '卧推 1RM / kg', hint: '用于计算卧推 TM 和 17 次循环重量' },
  { key: 'squatRm', label: '深蹲 1RM / kg', hint: '用于计算深蹲 TM 和 17 次循环重量' },
  { key: 'pullupRm', label: '引体向上 1RM 总重 / kg', hint: '按总重输入；表内显示外挂重量' },
  { key: 'bodyweight', label: '当前体重 / kg', hint: '用于计算引体向上外挂重量' }
];

export const SCHEDULE = [
  { block: 1, cycle: 1, topPct: 82.5, topReps: '1 x 6', backPct: 75, backReps: '4 x 6' },
  { block: 1, cycle: 2, topPct: 85, topReps: '1 x 6', backPct: 77.5, backReps: '4 x 6' },
  { block: 1, cycle: 3, topPct: 87.5, topReps: '1 x 5', backPct: 80, backReps: '4 x 5' },
  { block: 1, cycle: 4, topPct: 90, topReps: '1 x 5', backPct: 82.5, backReps: '4 x 5' },
  { block: 1, cycle: 5, topPct: 92.5, topReps: '1 x 4', backPct: 85, backReps: '5 x 4' },
  { block: 1, cycle: 6, topPct: 72.5, topReps: '1 x 5', backPct: 72.5, backReps: '3 x 5' },
  { block: 2, cycle: 7, topPct: 87.5, topReps: '1 x 5', backPct: 80, backReps: '4 x 5' },
  { block: 2, cycle: 8, topPct: 90, topReps: '1 x 4', backPct: 82.5, backReps: '4 x 4' },
  { block: 2, cycle: 9, topPct: 92.5, topReps: '1 x 4', backPct: 85, backReps: '4 x 4' },
  { block: 2, cycle: 10, topPct: 95, topReps: '1 x 3', backPct: 87.5, backReps: '5 x 3' },
  { block: 2, cycle: 11, topPct: 97.5, topReps: '1 x 2-3', backPct: 90, backReps: '4 x 3' },
  { block: 2, cycle: 12, topPct: 75, topReps: '1 x 4', backPct: 75, backReps: '3 x 4' },
  { block: 3, cycle: 13, topPct: 90, topReps: '1 x 4', backPct: 82.5, backReps: '4 x 4' },
  { block: 3, cycle: 14, topPct: 92.5, topReps: '1 x 3', backPct: 85, backReps: '4 x 3' },
  { block: 3, cycle: 15, topPct: 95, topReps: '1 x 3', backPct: 87.5, backReps: '5 x 2-3' },
  { block: 3, cycle: 16, topPct: 97.5, topReps: '1 x 2', backPct: 90, backReps: '4 x 2' },
  { block: 3, cycle: 17, topPct: 100, topReps: '1 x 1-2', backPct: 92.5, backReps: '3 x 2' }
];

export const LIFTS = {
  bench: {
    key: 'bench',
    name: '卧推',
    rmKey: 'benchRm',
    ratio: 0.89,
    blockStep: 2.5,
    sub: '胸日主项。'
  },
  squat: {
    key: 'squat',
    name: '深蹲',
    rmKey: 'squatRm',
    ratio: 0.88,
    blockStep: 5,
    sub: '腿日主项。'
  },
  pullup: {
    key: 'pullup',
    name: '引体向上',
    rmKey: 'pullupRm',
    ratio: 0.905,
    blockStep: 2.5,
    isPullup: true,
    sub: '背日主项。这里显示外挂重量，自动扣除体重。'
  }
};

export const LIFT_CARDS = [LIFTS.bench, LIFTS.squat, LIFTS.pullup];
export const QUERY_LIFT_OPTIONS = LIFT_CARDS.map((lift) => ({
  key: lift.key,
  label: lift.name
}));
export const BLOCK_FILTER_OPTIONS = [
  { value: 1, label: 'B1' },
  { value: 2, label: 'B2' },
  { value: 3, label: 'B3' }
];

export const DEFAULT_LIFT_CONFIGS = Object.keys(LIFTS).reduce((acc, key) => {
  acc[key] = {
    ratio: LIFTS[key].ratio,
    blockStep: LIFTS[key].blockStep
  };
  return acc;
}, {});

export const SETTINGS_NOTES = [
  '1RM 会影响整个主项的 TM 和 17 次循环重量，是每轮最常规的更新项。',
  'ratio 决定 Block 1 的 TM 高低，适合做主项优先级调节。',
  'blockStep 决定 Block 2 和 Block 3 的递进幅度，适合控制后半程推进速度。',
  '17 个循环的百分比、组数和次数模板固定；这里只调参数，不改模板。'
];

export const PLAN_TRAIN_TITLES = {
  bench: '胸',
  squat: '腿',
  pullup: '背'
};

export const PLAN_MAIN_MOVEMENTS = {
  bench: '杠铃卧推',
  squat: '深蹲',
  pullup: '引体向上'
};

export function createDefaultForm() {
  return { ...DEFAULTS };
}

export function createDefaultLiftConfigs() {
  return Object.keys(DEFAULT_LIFT_CONFIGS).reduce((acc, key) => {
    acc[key] = { ...DEFAULT_LIFT_CONFIGS[key] };
    return acc;
  }, {});
}

export function createDefaultBlockFilters() {
  return {
    bench: 1,
    squat: 1,
    pullup: 1
  };
}

export function getSafeIndex(value, length) {
  const index = Number(value);
  if (!Number.isInteger(index) || index < 0 || index >= length) {
    return 0;
  }
  return index;
}

export function sanitizeNumberInput(raw) {
  const safeValue = raw === '' ? '' : String(raw).replace(/[^\d.]/g, '');
  const parsed = Number(safeValue);
  return safeValue === '' || !Number.isFinite(parsed) ? 0 : parsed;
}

export function normalize(value) {
  return Number(Number(value || 0).toFixed(4));
}

export function roundToStep(value, step = 2.5) {
  const scaled = value / step;
  const floor = Math.floor(scaled);
  const fraction = scaled - floor;

  if (Math.abs(fraction - 0.5) < 1e-9) {
    return normalize((floor % 2 === 0 ? floor : floor + 1) * step);
  }

  return normalize(Math.round(scaled) * step);
}

export function getDisplayTm(lift, totalTm, bodyweight) {
  return lift.isPullup ? normalize(totalTm - bodyweight) : totalTm;
}

export function getWorkWeight(lift, totalTm, pct, bodyweight) {
  const totalWeight = roundToStep(totalTm * pct / 100);
  return lift.isPullup ? normalize(totalWeight - bodyweight) : totalWeight;
}

export function formatReps(reps) {
  return reps.replace(/\s*x\s*/i, 'x');
}

export function formatKg(value, options = {}) {
  const fixed = Math.abs(value) < 0.0001 ? 0 : normalize(value);
  const text = Number.isInteger(fixed) ? String(fixed) : String(Number(fixed.toFixed(1)));
  return options.plus && fixed > 0 ? `+${text}` : text;
}

export function formatRatio(value) {
  return String(Number(normalize(value).toFixed(3)));
}

function getNumericText(value) {
  const fixed = normalize(value);
  return Number.isInteger(fixed) ? String(fixed) : String(Number(fixed.toFixed(1)));
}

function normalizeConfigValue(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? normalize(parsed) : fallback;
}

function mergeLiftConfigs(liftConfigs) {
  const defaults = createDefaultLiftConfigs();

  return Object.keys(defaults).reduce((acc, key) => {
    const current = liftConfigs && typeof liftConfigs === 'object' ? liftConfigs[key] : null;
    acc[key] = {
      ratio: normalizeConfigValue(current && current.ratio, defaults[key].ratio),
      blockStep: normalizeConfigValue(current && current.blockStep, defaults[key].blockStep)
    };
    return acc;
  }, {});
}

export function getLiftConfigMap(liftConfigs) {
  return mergeLiftConfigs(liftConfigs);
}

export function getLiftTmMap(form, liftConfigs) {
  const resolvedLiftConfigs = getLiftConfigMap(liftConfigs);

  return Object.keys(LIFTS).reduce((acc, key) => {
    const lift = LIFTS[key];
    const config = resolvedLiftConfigs[key];
    const baseTm = roundToStep(form[lift.rmKey] * config.ratio);
    acc[key] = [0, 1, 2].map((index) => normalize(baseTm + config.blockStep * index));
    return acc;
  }, {});
}

export function getLiftResultMap(form, liftConfigs) {
  const resolvedLiftConfigs = getLiftConfigMap(liftConfigs);
  const liftTmMap = getLiftTmMap(form, resolvedLiftConfigs);

  return Object.keys(LIFTS).reduce((acc, key) => {
    const lift = LIFTS[key];
    const config = resolvedLiftConfigs[key];
    const plus = Boolean(lift.isPullup);
    const tmList = liftTmMap[key].map((tm) => `${formatKg(getDisplayTm(lift, tm, form.bodyweight), { plus })}kg`);

    acc[key] = {
      rmText: `${formatKg(form[lift.rmKey])}kg`,
      ratioText: formatRatio(config.ratio),
      blockStepText: `${formatKg(config.blockStep)}kg`,
      bodyweightText: `${formatKg(form.bodyweight)}kg`,
      tmList,
      tmText: tmList.join(' -> '),
      blockTmText: tmList.map((tm, index) => `B${index + 1} ${tm}`).join(' / ')
    };
    return acc;
  }, {});
}

export function getSummaryTmText(form, liftConfigs) {
  const liftResults = getLiftResultMap(form, liftConfigs);

  return Object.keys(LIFTS).reduce((acc, key) => {
    acc[key] = liftResults[key].tmText;
    return acc;
  }, {});
}

export function getFormulaRows(form, liftConfigs) {
  const resolvedLiftConfigs = getLiftConfigMap(liftConfigs);
  const liftTmMap = getLiftTmMap(form, resolvedLiftConfigs);
  const pullupBlockTm = liftTmMap.pullup[0];

  return [
    {
      name: '卧推',
      formula: `TM = 1RM x ${formatRatio(resolvedLiftConfigs.bench.ratio)}`,
      current: `${formatKg(form.benchRm)}kg`,
      block1Tm: `${formatKg(liftTmMap.bench[0])}kg`
    },
    {
      name: '深蹲',
      formula: `TM = 1RM x ${formatRatio(resolvedLiftConfigs.squat.ratio)}`,
      current: `${formatKg(form.squatRm)}kg`,
      block1Tm: `${formatKg(liftTmMap.squat[0])}kg`
    },
    {
      name: '引体向上总重',
      formula: `TM = 1RM x ${formatRatio(resolvedLiftConfigs.pullup.ratio)}`,
      current: `${formatKg(form.pullupRm)}kg`,
      block1Tm: `${formatKg(pullupBlockTm)}kg`
    },
    {
      name: '引体向上外挂',
      formula: '外挂 TM = 总重 TM - 体重',
      current: `体重 ${formatKg(form.bodyweight)}kg`,
      block1Tm: `${formatKg(normalize(pullupBlockTm - form.bodyweight), { plus: true })}kg`
    }
  ];
}

export function getPlanRows(form, liftConfigs) {
  const liftTmMap = getLiftTmMap(form, liftConfigs);

  return Object.keys(LIFTS).reduce((acc, key) => {
    const lift = LIFTS[key];
    acc[key] = SCHEDULE.map((row) => {
      const tm = liftTmMap[key][row.block - 1];
      const plus = Boolean(lift.isPullup);

      return {
        block: row.block,
        cycle: row.cycle,
        tm: `${formatKg(getDisplayTm(lift, tm, form.bodyweight), { plus })}kg`,
        topPct: `${row.topPct}%`,
        topReps: row.topReps,
        topWeight: `${formatKg(getWorkWeight(lift, tm, row.topPct, form.bodyweight), { plus })}kg`,
        backPct: `${row.backPct}%`,
        backReps: row.backReps,
        backWeight: `${formatKg(getWorkWeight(lift, tm, row.backPct, form.bodyweight), { plus })}kg`
      };
    });
    return acc;
  }, {});
}

export function getFilteredPlanRows(form, blockFilters, liftConfigs) {
  const planRows = getPlanRows(form, liftConfigs);

  return Object.keys(planRows).reduce((acc, key) => {
    const activeBlock = blockFilters[key];
    acc[key] = planRows[key].filter((row) => row.block === activeBlock);
    return acc;
  }, {});
}

export function getLiftNotes(form, liftConfigs) {
  const liftTmMap = getLiftTmMap(form, liftConfigs);

  return Object.keys(LIFTS).reduce((acc, key) => {
    const lift = LIFTS[key];
    const block3Tm = liftTmMap[key][2];
    const plus = Boolean(lift.isPullup);
    const displayTm = getDisplayTm(lift, block3Tm, form.bodyweight);

    if (lift.isPullup) {
      const pullupWork = (value) => formatKg(roundToStep(value), { plus: true });
      const pullupRangeEnd = formatKg(roundToStep(displayTm + 10));
      acc[key] = `测试模板，按 Block 3 的外挂 TM ${formatKg(displayTm, { plus })}：${pullupWork(displayTm * 0.9)} @ 90%左右、${pullupWork(displayTm * 0.95)} @ 95%左右、${pullupWork(displayTm)} @ 100%、${pullupWork(displayTm + 5)} 下一档、${pullupWork(displayTm + 7.5)}-${pullupRangeEnd} 冲刺，状态好继续每次加 2.5kg。`;
      return acc;
    }

    const work = (pct) => formatKg(getWorkWeight(lift, block3Tm, pct, form.bodyweight), { plus });
    const rangeStart = work(107.5);
    const rangeEnd = work(110);
    acc[key] = `测试模板，按 Block 3 的 TM ${formatKg(displayTm, { plus })}kg：${work(90)}kg @ 90%、${work(95)}kg @ 95%、${work(100)}kg @ 100%、${work(105)}kg @ 105%、${rangeStart}-${rangeEnd}kg @ 107.5%-110%，状态好继续每次加 2.5kg。`;
    return acc;
  }, {});
}

export function getQueryCycleOptions() {
  return SCHEDULE.map((item) => ({
    block: item.block,
    cycle: item.cycle,
    label: `第 ${item.cycle} 循环 / Block ${item.block}`
  }));
}

export function getCurrentQuery(form, queryLiftIndex, queryCycleIndex, liftConfigs) {
  const liftKey = QUERY_LIFT_OPTIONS[getSafeIndex(queryLiftIndex, QUERY_LIFT_OPTIONS.length)].key;
  const lift = LIFTS[liftKey];
  const schedule = SCHEDULE[getSafeIndex(queryCycleIndex, SCHEDULE.length)];
  const totalTm = getLiftTmMap(form, liftConfigs)[liftKey][schedule.block - 1];
  const plus = Boolean(lift.isPullup);
  const topWeight = `${formatKg(getWorkWeight(lift, totalTm, schedule.topPct, form.bodyweight), { plus })}kg`;
  const backWeight = `${formatKg(getWorkWeight(lift, totalTm, schedule.backPct, form.bodyweight), { plus })}kg`;

  return {
    text: `顶组：${topWeight} ${formatReps(schedule.topReps)}  回退组：${backWeight} ${formatReps(schedule.backReps)}`
  };
}

function parseSetPrescription(text) {
  const normalizedText = String(text || '').replace(/\s+/g, '');
  const match = normalizedText.match(/^(\d+)(?:-\d+)?x(.+)$/i);
  if (!match) {
    return {
      setCount: 1,
      repsText: normalizedText || '1'
    };
  }

  return {
    setCount: Number(match[1]) || 1,
    repsText: match[2]
  };
}

function buildDraftSetText(setItem) {
  const parts = [];

  if (setItem.weight) {
    parts.push(`${setItem.weight}${setItem.unit || 'kg'}`);
  }

  if (setItem.reps) {
    parts.push(`${setItem.reps}次`);
  }

  if (setItem.done === false) {
    parts.push('未完成');
  }

  return parts.join(' · ');
}

export function normalizeDraftSet(setItem = {}, index = 0) {
  const nextSet = {
    done: setItem.done !== undefined ? (setItem.done !== false) : false,
    reps: setItem.reps === undefined || setItem.reps === null ? '' : String(setItem.reps),
    unit: setItem.unit ? String(setItem.unit) : 'kg',
    weight: setItem.weight === undefined || setItem.weight === null ? '' : String(setItem.weight)
  };

  return {
    ...nextSet,
    label: `第 ${index + 1} 组`,
    text: buildDraftSetText(nextSet)
  };
}

function buildDraftSetList(setCount, repsText, extra = {}) {
  return Array.from({ length: setCount }, (_, index) => normalizeDraftSet({
    done: false,
    reps: String(repsText || ''),
    unit: extra.unit || 'kg',
    weight: extra.weight || ''
  }, index));
}

export function normalizeDraftMovement(movement = {}, index = 0) {
  const sets = Array.isArray(movement.sets) ? movement.sets : [];
  const normalizedSets = sets.map((setItem, setIndex) => normalizeDraftSet(setItem, setIndex));

  return {
    key: movement.key || `draft-movement-${index + 1}`,
    name: movement.name ? String(movement.name) : '',
    type: movement.type ? String(movement.type) : '',
    category: movement.category || 'accessory',
    setCount: normalizedSets.length,
    doneCount: normalizedSets.filter((setItem) => setItem.done !== false).length,
    sets: normalizedSets
  };
}

export function cloneDraftMovements(movements = []) {
  return movements.map((movement, index) => normalizeDraftMovement(movement, index));
}

export function createEmptyAccessoryDraftSet() {
  return normalizeDraftSet({
    done: false,
    weight: '',
    reps: '',
    unit: 'kg',
    time: '0'
  });
}

export function createEmptyAccessoryDraftMovement() {
  return normalizeDraftMovement({
    name: '',
    type: '',
    category: 'accessory',
    sets: [createEmptyAccessoryDraftSet()]
  });
}

function buildTopMovementDraft(liftKey, schedule, form, liftConfigs) {
  const lift = LIFTS[liftKey];
  const totalTm = getLiftTmMap(form, liftConfigs)[liftKey][schedule.block - 1];
  const weight = getNumericText(getWorkWeight(lift, totalTm, schedule.topPct, form.bodyweight));
  const { repsText } = parseSetPrescription(schedule.topReps);

  return normalizeDraftMovement({
    key: `${liftKey}-main-top-${schedule.cycle}`,
    name: '主项顶组',
    type: lift.name,
    category: 'main',
    sets: buildDraftSetList(1, repsText, {
      unit: 'kg',
      weight
    })
  });
}

function buildBackoffMovementDraft(liftKey, schedule, form, liftConfigs) {
  const lift = LIFTS[liftKey];
  const totalTm = getLiftTmMap(form, liftConfigs)[liftKey][schedule.block - 1];
  const weight = getNumericText(getWorkWeight(lift, totalTm, schedule.backPct, form.bodyweight));
  const { setCount, repsText } = parseSetPrescription(schedule.backReps);

  return normalizeDraftMovement({
    key: `${liftKey}-main-backoff-${schedule.cycle}`,
    name: PLAN_MAIN_MOVEMENTS[liftKey] || lift.name,
    type: '',
    category: 'main',
    sets: buildDraftSetList(setCount, repsText, {
      unit: 'kg',
      weight
    })
  });
}

export function buildPlanTrainDraft(form, liftKey, cycleIndex, liftConfigs, options = {}) {
  const safeLiftKey = LIFTS[liftKey] ? liftKey : 'bench';
  const safeCycleIndex = getSafeIndex(cycleIndex, SCHEDULE.length);
  const schedule = SCHEDULE[safeCycleIndex];
  const lift = LIFTS[safeLiftKey];
  const datestr = options.datestr || '';
  const titlePrefix = PLAN_TRAIN_TITLES[safeLiftKey] || lift.name;
  const mainMovements = [
    buildTopMovementDraft(safeLiftKey, schedule, form, liftConfigs),
    buildBackoffMovementDraft(safeLiftKey, schedule, form, liftConfigs)
  ];
  const accessoryMovements = cloneDraftMovements(options.accessoryMovements || []).map((movement) => ({
    ...movement,
    category: 'accessory'
  }));
  const movements = [...mainMovements, ...accessoryMovements];

  return {
    datestr,
    title: `${titlePrefix}${schedule.cycle}`,
    note: '',
    source: {
      liftKey: safeLiftKey,
      liftName: lift.name,
      block: schedule.block,
      cycle: schedule.cycle,
      coreMovementCount: mainMovements.length
    },
    movementCount: movements.length,
    movements
  };
}

export function restoreForm() {
  try {
    const saved = uni.getStorageSync(STORAGE_KEY);
    if (saved && typeof saved === 'object') {
      return {
        ...DEFAULTS,
        ...saved
      };
    }
  } catch (error) {
    // Ignore storage failure and fall back to defaults.
  }

  return createDefaultForm();
}

export function persistForm(form) {
  try {
    uni.setStorageSync(STORAGE_KEY, form);
  } catch (error) {
    // Ignore storage failure and keep the in-memory form.
  }
}

export function restoreLiftConfigs() {
  try {
    const saved = uni.getStorageSync(CONFIG_STORAGE_KEY);
    if (saved && typeof saved === 'object') {
      return mergeLiftConfigs(saved);
    }
  } catch (error) {
    // Ignore storage failure and fall back to defaults.
  }

  return createDefaultLiftConfigs();
}

export function persistLiftConfigs(liftConfigs) {
  try {
    uni.setStorageSync(CONFIG_STORAGE_KEY, mergeLiftConfigs(liftConfigs));
  } catch (error) {
    // Ignore storage failure and keep the in-memory configs.
  }
}

export function restoreQueryState() {
  try {
    const saved = uni.getStorageSync(QUERY_STORAGE_KEY);
    if (saved && typeof saved === 'object') {
      return {
        queryLiftIndex: getSafeIndex(saved.queryLiftIndex, QUERY_LIFT_OPTIONS.length),
        queryCycleIndex: getSafeIndex(saved.queryCycleIndex, SCHEDULE.length)
      };
    }
  } catch (error) {
    // Ignore storage failure and fall back to defaults.
  }

  return {
    queryLiftIndex: 0,
    queryCycleIndex: 0
  };
}

export function persistQueryState(queryState) {
  try {
    uni.setStorageSync(QUERY_STORAGE_KEY, {
      queryLiftIndex: getSafeIndex(queryState.queryLiftIndex, QUERY_LIFT_OPTIONS.length),
      queryCycleIndex: getSafeIndex(queryState.queryCycleIndex, SCHEDULE.length)
    });
  } catch (error) {
    // Ignore storage failure and keep the in-memory query state.
  }
}
