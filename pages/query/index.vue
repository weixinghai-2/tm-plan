<template>
  <view class="page">
    <view class="page-scroll">
      <view class="tab-body">
        <view class="panel">
          <view class="query-lift-tabs">
            <view
              v-for="(lift, index) in draftLiftOptions"
              :key="lift.key"
              :class="['query-lift-tab', draftLiftIndex === index ? 'is-active' : '']"
              @tap="setDraftLift(index)"
            >
              {{ lift.label }}
            </view>
          </view>

          <cycle-selector
            :value="draftCycleIndex"
            :options="draftCycleOptions"
            @change="setDraftCycle"
          />

          <view class="query-result">
            <view class="query-main-text">{{ currentQuery.text }}</view>
          </view>

          <view class="accessory-summary-card">
            <view class="accessory-summary-head">
              <view>
                <view class="panel-title accessory-summary-title">当前辅助项</view>
                <view class="panel-sub">{{ accessorySummaryText }}</view>
              </view>
              <view class="accessory-summary-actions">
                <text class="draft-link-btn" @tap="openAccessoryModal">新增辅助项</text>
                <text
                  v-if="currentAccessoryMovements.length"
                  class="draft-link-btn is-danger"
                  @tap="clearAccessorySnapshot"
                >
                  清空
                </text>
              </view>
            </view>

            <view v-if="currentAccessoryMovements.length" class="history-selected-list">
              <view
                v-for="movement in currentAccessoryMovements"
                :key="movement.key"
                class="history-selected-item"
              >
                <view class="history-selected-name">{{ movement.name || '未命名动作' }}</view>
                <view class="history-selected-meta">
                  {{ movement.setCount ? `${movement.setCount} 组` : '待补组数 / 次数' }}
                </view>
              </view>
            </view>
          </view>

          <view class="field-card">
            <view class="field-label">训练标题</view>
            <input
              :value="planDraft.title"
              class="field-input"
              :adjust-position="true"
              :cursor-spacing="160"
              placeholder="请输入训练标题"
              placeholder-class="placeholder-text"
              @input="updateTitle"
            />
          </view>

          <view class="panel">
            <view class="xunji-movement-list">
              <view v-for="movement in readonlyMovements" :key="movement.key" class="xunji-movement-card accessory-editor-card">
                <view class="xunji-movement-head" @tap="toggleMovementCard(movement.key)">
                  <view>
                    <view class="xunji-movement-title">{{ movement.name }}</view>
                    <view v-if="movement.type" class="xunji-movement-type">{{ movement.type }}</view>
                  </view>
                  <view class="xunji-movement-meta">{{ movement.category === 'main' ? '主项' : '辅助项' }}</view>
                </view>

                <view v-if="expandedMovements[movement.key]" class="xunji-set-list">
                  <view v-for="(setItem, setIndex) in movement.sets" :key="`${movement.key}-readonly-${setIndex}`" class="xunji-set-row">
                    <view class="xunji-set-label">{{ setItem.label }}</view>
                    <view class="xunji-set-text">{{ setItem.text }}</view>
                  </view>
                </view>
              </view>
            </view>

            <view v-if="editableMovements.length" class="xunji-movement-list">
              <view v-for="(movement, movementIndex) in editableMovements" :key="movement.key" class="xunji-movement-card">
                <view class="xunji-movement-card-row">
                  <view class="xunji-movement-card-name" @tap="toggleMovementCard(movement.key)">
                    <view class="xunji-movement-title">{{ movement.name || '未命名动作' }}</view>
                    <view v-if="movement.type" class="xunji-movement-type">{{ movement.type }}</view>
                  </view>
                  <view class="xunji-movement-card-actions">
                    <text class="draft-link-btn" @tap.stop="openRenameModal(movementIndex)">编辑</text>
                    <text class="draft-link-btn" @tap.stop="addSet(movementIndex)">+组</text>
                    <text class="draft-link-btn is-danger" @tap.stop="removeMovement(movementIndex)">删除</text>
                  </view>
                </view>

                <view v-if="expandedMovements[movement.key]" class="draft-set-editor">
                  <view v-for="(setItem, setIndex) in movement.sets" :key="`${movement.key}-${setIndex}`" class="draft-set-grid">
                    <view class="draft-set-editor-head">
                      <view class="field-label">{{ setItem.label }}</view>
                      <view class="draft-link-btn is-danger" @tap="removeSet(movementIndex, setIndex)">删除组</view>
                    </view>

                    <view class="config-form">
                      <view class="config-form-row">
                        <view class="config-form-label">重量</view>
                        <input
                          :value="setItem.weight"
                          class="config-form-input"
                          :adjust-position="true"
                          :cursor-spacing="160"
                          placeholder="0"
                          placeholder-class="placeholder-text"
                          @input="updateSetField(movementIndex, setIndex, 'weight', $event.detail.value)"
                        />
                      </view>
                      <view class="config-form-row">
                        <view class="config-form-label">次数</view>
                        <input
                          :value="setItem.reps"
                          class="config-form-input"
                          :adjust-position="true"
                          :cursor-spacing="160"
                          placeholder="0"
                          placeholder-class="placeholder-text"
                          @input="updateSetField(movementIndex, setIndex, 'reps', $event.detail.value)"
                        />
                      </view>
                      <view class="config-form-row">
                        <view class="config-form-label">单位</view>
                        <input
                          :value="setItem.unit"
                          class="config-form-input"
                          :adjust-position="true"
                          :cursor-spacing="160"
                          placeholder="kg"
                          placeholder-class="placeholder-text"
                          @input="updateSetField(movementIndex, setIndex, 'unit', $event.detail.value)"
                        />
                      </view>
                    </view>
                  </view>
                </view>
              </view>
            </view>

            <view v-if="!editableMovements.length && !readonlyMovements.length" class="note-box draft-empty-note">当前没有可编辑动作，先点"新增动作"。</view>

              <view class="draft-editor-actions">
                <text class="draft-link-btn" @tap="addMovement">新增动作</text>
                <text class="draft-link-btn is-primary" @tap="submitDraft">确认写回</text>
              </view>
          </view>
        </view>
      </view>
    </view>

    <view v-if="showAccessoryModal" class="modal-mask" @tap="closeAccessoryModal">
      <view class="modal-card accessory-modal-card" @tap.stop>
        <view class="accessory-modal-head">
          <view class="accessory-modal-topbar">
            <view>
              <view class="draft-editor-title">新增辅助项</view>
              <view class="panel-sub">按当前类型保存缓存。拉取列表只在你点击"拉取"后更新。</view>
            </view>
            <view class="accessory-modal-actions">
              <text class="draft-link-btn" @tap="closeAccessoryModal">关闭</text>
              <text class="draft-link-btn is-primary" @tap="confirmAccessoryModal">确认使用</text>
            </view>
          </view>

          <view class="field-card">
            <view class="field-label">拉取日期</view>
            <picker mode="date" :value="sourceDate" @change="changeSourceDate">
              <view class="field-input field-picker">{{ sourceDate }}</view>
            </picker>
          </view>

          <view class="accessory-fetch-actions">
            <text class="draft-link-btn is-primary" @tap="loadSourceHistory">拉取动作列表</text>
          </view>
        </view>

        <scroll-view scroll-y class="accessory-modal-body">
          <view class="draft-editor-section">
            <view class="accessory-section-head">
              <view>
                <view class="draft-editor-title">已选辅助项</view>
                <view class="panel-sub">确认后会覆盖当前{{ activeDraftLiftLabel }}类型缓存。</view>
              </view>
            </view>

            <view v-if="modalSelectedMovements.length" class="history-selected-list">
              <view
                v-for="movement in modalSelectedMovements"
                :key="movement.key"
                class="history-selected-item"
              >
                <view>
                  <view class="history-selected-name">{{ movement.name || '未命名动作' }}</view>
                  <view class="history-selected-meta">
                    {{ movement.setCount ? `${movement.setCount} 组` : '手动新增，待补组数 / 次数' }}
                  </view>
                </view>
                <view class="draft-link-btn is-danger" @tap="removeModalMovement(movement.key)">移除</view>
              </view>
            </view>

            <view v-else class="note-box draft-empty-note">当前还没有选中的辅助项。</view>
          </view>

          <view class="draft-editor-section">
            <view class="accessory-section-head">
              <view>
                <view class="draft-editor-title">训记动作列表</view>
           
              </view>
            </view>

            <view v-if="sourceMovementOptions.length" class="history-source-list">
              <view
                v-for="movement in sourceMovementOptions"
                :key="movement.key"
                :class="['history-source-card', isMovementSelected(movement) ? 'is-active' : '']"
                @tap="toggleFetchedMovement(movement)"
              >
                <view class="history-source-head">
                  <view>
                    <view class="xunji-movement-title">{{ movement.name || '未命名动作' }}</view>
                    <view class="xunji-movement-type">{{ movement.sourceTitle }}</view>
                  </view>
                  <view class="xunji-movement-meta">{{ movement.setCount }} 组</view>
                </view>
                <view class="history-source-set-list">
                  <view
                    v-for="(setItem, setIndex) in movement.sets"
                    :key="`${movement.key}-${setIndex}`"
                    class="history-source-set-item"
                  >
                    {{ setItem.label }}：{{ setItem.text }}
                  </view>
                </view>
              </view>
            </view>

            <view v-else class="note-box draft-empty-note">先选日期并点击"拉取动作列表"。</view>
          </view>
        </scroll-view>
      </view>
    </view>





    <view v-if="showSubmitModal" class="modal-mask" @tap="closeSubmitModal">
      <view class="modal-card" @tap.stop>
        <view class="submit-modal-head">
          <view class="submit-modal-actions">
            <text class="draft-link-btn" @tap="closeSubmitModal">取消</text>
            <text class="draft-link-btn is-primary" @tap="confirmSubmitDraft">确认</text>
          </view>
        </view>

        <view class="field-card">
          <picker mode="date" :value="submitDate || sourceDate" @change="changeSubmitDate">
            <view :class="['field-input', 'field-picker', submitDate ? '' : 'field-picker-placeholder']">
              {{ submitDate || '请选择日期' }}
            </view>
          </picker>
        </view>

        <view class="note-box draft-summary-box">
          {{ submitSummaryText }}
        </view>
      </view>
    </view>
    
	
	
	
	
	<view v-if="showRenameModal" class="modal-mask" @tap="closeRenameModal">
      <view class="modal-card" @tap.stop style="width: 580rpx;">
        <view class="panel-title" style="margin-bottom: 14rpx;">编辑动作名</view>
        <input
          :value="renameValue"
          class="field-input"
          :adjust-position="true"
          :cursor-spacing="160"
          placeholder="请输入动作名"
          placeholder-class="placeholder-text"
          @input="renameValue = $event.detail.value"
        />
        <view class="rename-modal-actions">
          <text class="draft-link-btn" @tap="closeRenameModal">取消</text>
          <text class="draft-link-btn is-primary" @tap="confirmRename">确认</text>
        </view>
      </view>
    </view>
  </view></template>

<script>
import CycleSelector from '@/components/CycleSelector/CycleSelector.vue';
import {
  QUERY_LIFT_OPTIONS,
  buildPlanTrainDraft,
  cloneDraftMovements,
  createDefaultForm,
  createDefaultLiftConfigs,
  createEmptyAccessoryDraftMovement,
  getQueryCycleOptions,
  getSafeIndex,
  getLiftTmMap,
  getWorkWeight,
  formatKg,
  formatReps,
  LIFTS,
  SCHEDULE,
  normalizeDraftMovement,
  persistQueryState,
  restoreForm,
  restoreLiftConfigs,
  restoreQueryState
} from '@/utils/tm-plan';
import {
  buildDraftSubmitSummary,
  buildTrainDetails,
  clearDraftAccessoryMovements,
  createXunjiTrainFromDraft,
  extractSelectableAccessoryMovementsFromTrainDetail,
  getTodayDateString,
  normalizeDateInput,
  persistDraftAccessoryMovements,
  persistEditorDraft,
  persistEditorResult,
  queryXunjiTrains,
  restoreDraftAccessoryMovements
} from '@/utils/xunji';

function buildMovementSignature(movement) {
  const sets = Array.isArray(movement && movement.sets)
    ? movement.sets.map((setItem) => [
      String(setItem.weight || ''),
      String(setItem.reps || ''),
      String(setItem.unit || 'kg')
    ].join('|')).join(';')
    : '';

  return [
    String(movement && movement.name ? movement.name : '').trim(),
    String(movement && movement.type ? movement.type : '').trim(),
    sets
  ].join('@@');
}

function buildCurrentQueryText(form, queryLiftIndex, queryCycleIndex, liftConfigs) {
  const liftKey = QUERY_LIFT_OPTIONS[getSafeIndex(queryLiftIndex, QUERY_LIFT_OPTIONS.length)].key;
  const lift = LIFTS[liftKey];
  const schedule = SCHEDULE[getSafeIndex(queryCycleIndex, SCHEDULE.length)];
  const totalTm = getLiftTmMap(form, liftConfigs)[liftKey][schedule.block - 1];
  const plus = Boolean(lift && lift.isPullup);
  const topWeight = `${formatKg(getWorkWeight(lift, totalTm, schedule.topPct, form.bodyweight), { plus })}kg`;
  const backWeight = `${formatKg(getWorkWeight(lift, totalTm, schedule.backPct, form.bodyweight), { plus })}kg`;

  return {
    text: `顶组：${topWeight} ${formatReps(schedule.topReps)}  回退组：${backWeight} ${formatReps(schedule.backReps)}`
  };
}

function normalizeLoadedDraft(draft) {
  const rawMovements = Array.isArray(draft && draft.movements) ? draft.movements : [];
  return {
    ...draft,
    note: '',
    title: String(draft && draft.title ? draft.title : ''),
    movements: cloneDraftMovements(rawMovements),
    movementCount: rawMovements.length
  };
}

function createDraftMovement() {
  return {
    ...createEmptyAccessoryDraftMovement(),
    key: `draft-movement-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  };
}

export default {
  components: {
    CycleSelector
  },
  data() {
    return {
      sourceDate: getTodayDateString(),
      submitDate: '',
      form: createDefaultForm(),
      liftConfigs: createDefaultLiftConfigs(),
      draftLiftIndex: 0,
      draftCycleIndex: 0,
      templateRefreshTick: 0,
      showAccessoryModal: false,
      showSubmitModal: false,
      sourceStatusText: '',
      sourceQueryMeta: null,
      sourceResultData: null,
      modalSelectedMovements: [],
      planDraft: {
        mode: 'create',
        datestr: '',
        title: '',
        localid: '',
        start: '',
        end: '',
        source: {
          type: 'xunji',
          liftKey: 'bench',
          coreMovementCount: 0
        },
        movementCount: 0,
        movements: []
      },
      editableMovements: [],
      expandedMovements: {},
      renameIndex: -1,
      renameValue: '',
      showRenameModal: false,
      submitLoading: false
    };
  },
  computed: {
    draftLiftOptions() {
      return QUERY_LIFT_OPTIONS;
    },
    draftCycleOptions() {
      return getQueryCycleOptions();
    },
    activeDraftLiftKey() {
      const current = this.draftLiftOptions[getSafeIndex(this.draftLiftIndex, this.draftLiftOptions.length)];
      return current ? current.key : 'bench';
    },
    activeDraftLiftLabel() {
      const current = this.draftLiftOptions[getSafeIndex(this.draftLiftIndex, this.draftLiftOptions.length)];
      return current ? current.label : '胸';
    },
    currentQuery() {
      return buildCurrentQueryText(this.form, this.draftLiftIndex, this.draftCycleIndex, this.liftConfigs);
    },
    normalizedSourceDate() {
      return normalizeDateInput(this.sourceDate);
    },
    currentAccessoryMovements() {
      void this.templateRefreshTick;
      return restoreDraftAccessoryMovements(this.activeDraftLiftKey);
    },
    accessorySummaryText() {
      if (!this.currentAccessoryMovements.length) {
        return `当前${this.activeDraftLiftLabel}还没有缓存辅助项，只会生成主项。`;
      }

      const previewNames = this.currentAccessoryMovements
        .slice(0, 4)
        .map((movement) => movement.name)
        .filter(Boolean)
        .join('、');
      const suffix = this.currentAccessoryMovements.length > 4 ? ' 等' : '';
      return `已缓存 ${this.currentAccessoryMovements.length} 个动作：${previewNames}${suffix}`;
    },
    sourceTrainDetails() {
      return this.sourceResultData ? buildTrainDetails(this.sourceResultData) : [];
    },
    sourceMovementOptions() {
      return this.sourceTrainDetails.flatMap((train, trainIndex) => {
        const extracted = extractSelectableAccessoryMovementsFromTrainDetail(train);
        if (!extracted || extracted.error || !Array.isArray(extracted.movements)) {
          return [];
        }

        return extracted.movements.map((movement, movementIndex) => ({
          ...movement,
          key: `fetched-${trainIndex + 1}-${movementIndex + 1}-${buildMovementSignature(movement)}`,
          sourceTitle: train.title || '未命名训练'
        }));
      });
    },
    readonlyMovements() {
      if (!this.planDraft) {
        return [];
      }
      const coreCount = Number(this.planDraft.source && this.planDraft.source.coreMovementCount) || 0;
      return this.planDraft.movements.slice(0, coreCount);
    },
    submitSummaryText() {
      if (!this.planDraft) {
        return '';
      }

      return buildDraftSubmitSummary({
        ...this.planDraft,
        datestr: this.submitDate || '未选择',
        title: String(this.planDraft.title || '').trim(),
        movements: this.planDraft.movements,
        movementCount: Array.isArray(this.planDraft.movements) ? this.planDraft.movements.length : 0,
        mode: 'create'
      });
    }
  },
  onLoad() {
    this.restoreState();
    this.loadDraft();
  },
  onShow() {
    this.templateRefreshTick += 1;
    this.restoreState();
  },
  methods: {
    restoreState() {
      this.form = restoreForm();
      this.liftConfigs = restoreLiftConfigs();
      const queryState = restoreQueryState();
      this.draftLiftIndex = queryState.queryLiftIndex;
      this.draftCycleIndex = queryState.queryCycleIndex;
    },
    loadDraft() {
      const nextDraft = buildPlanTrainDraft(
        this.form,
        this.activeDraftLiftKey,
        this.draftCycleIndex,
        this.liftConfigs,
        {
          datestr: '',
          accessoryMovements: this.currentAccessoryMovements
        }
      );

      this.planDraft = normalizeLoadedDraft({
        ...nextDraft,
        mode: 'create'
      });
      this.submitDate = '';
      this.editableMovements = this.getEditableMovements(this.planDraft);
      this.persistCurrentDraft();
    },
    getEditableMovements(draft) {
      if (!draft) {
        return [];
      }

      const coreCount = Number(draft.source && draft.source.coreMovementCount) || 0;
      return cloneDraftMovements(draft.movements.slice(coreCount));
    },
    persistCurrentDraft() {
      if (!this.planDraft) {
        return;
      }

      const nextEditable = cloneDraftMovements(this.editableMovements);
      const coreCount = Number(this.planDraft.source && this.planDraft.source.coreMovementCount) || 0;
      const readonlyMovements = cloneDraftMovements(this.planDraft.movements.slice(0, coreCount)).map((movement) => ({
        ...movement,
        category: 'main'
      }));
      const nextMovements = [
        ...readonlyMovements,
        ...nextEditable.map((movement) => ({
          ...movement,
          category: 'accessory'
        }))
      ];

      this.planDraft = {
        ...this.planDraft,
        note: '',
        title: String(this.planDraft.title || ''),
        movements: nextMovements,
        movementCount: nextMovements.length
      };

      persistEditorDraft(this.planDraft);

      if (this.planDraft.source && this.planDraft.source.liftKey) {
        persistDraftAccessoryMovements(this.planDraft.source.liftKey, nextEditable);
      }
    },
    changeSourceDate(event) {
      this.sourceDate = event.detail.value;
    },
    setDraftLift(index) {
      this.draftLiftIndex = getSafeIndex(index, this.draftLiftOptions.length);
      this.templateRefreshTick += 1;
      this.persistLocalQueryState();
      this.reloadDraftFromCurrentPlan();
    },
    setDraftCycle(index) {
      this.draftCycleIndex = getSafeIndex(index, this.draftCycleOptions.length);
      this.persistLocalQueryState();
      this.reloadDraftFromCurrentPlan();
    },
    persistLocalQueryState() {
      persistQueryState({
        queryLiftIndex: this.draftLiftIndex,
        queryCycleIndex: this.draftCycleIndex
      });
    },
    reloadDraftFromCurrentPlan() {
      if (!this.planDraft) {
        return;
      }

      const nextDraft = buildPlanTrainDraft(
        this.form,
        this.activeDraftLiftKey,
        this.draftCycleIndex,
        this.liftConfigs,
        {
          datestr: '',
          accessoryMovements: this.currentAccessoryMovements
        }
      );

      this.planDraft = normalizeLoadedDraft({
        ...nextDraft,
        mode: 'create',
        localid: this.planDraft.localid,
        start: this.planDraft.start,
        end: this.planDraft.end
      });
      this.editableMovements = this.getEditableMovements(this.planDraft);
      this.persistCurrentDraft();
    },
    openAccessoryModal() {
      this.showAccessoryModal = true;
      this.modalSelectedMovements = cloneDraftMovements(this.currentAccessoryMovements);
    },
    closeAccessoryModal() {
      this.showAccessoryModal = false;
    },
    changeSubmitDate(event) {
      this.submitDate = event.detail.value;
    },
    openSubmitModal() {
      this.submitDate = normalizeDateInput(this.submitDate);
      this.showSubmitModal = true;
    },
    closeSubmitModal() {
      this.showSubmitModal = false;
    },
    async loadSourceHistory() {
      if (!this.normalizedSourceDate) {
        uni.showToast({
          title: '请先选择日期',
          icon: 'none'
        });
        return;
      }

      this.sourceStatusText = '正在拉取训记动作...';
      try {
        const result = await queryXunjiTrains({
          datestr: this.normalizedSourceDate,
          includeFullData: true,
          forceRefresh: true
        });

        console.log('拉取动作列表原始数据:', JSON.stringify(result.data, null, 2));

        this.sourceQueryMeta = {
          source: result.source,
          datestr: result.datestr
        };
        this.sourceResultData = result.data;
        this.sourceStatusText = result.source === 'cache'
          ? '已命中训记本地缓存。'
          : '已从训记远程拉取最新列表。';
      } catch (error) {
        this.sourceStatusText = error && error.message ? error.message : '拉取失败';
        uni.showToast({
          title: '拉取失败',
          icon: 'none'
        });
      }
    },
    removeModalMovement(movementKey) {
      this.modalSelectedMovements = this.modalSelectedMovements.filter((movement) => movement.key !== movementKey);
    },
    findSelectedMovementIndexBySignature(signature) {
      return this.modalSelectedMovements.findIndex((movement) => buildMovementSignature(movement) === signature);
    },
    isMovementSelected(movement) {
      return this.findSelectedMovementIndexBySignature(buildMovementSignature(movement)) >= 0;
    },
    toggleFetchedMovement(movement) {
      const signature = buildMovementSignature(movement);
      const currentIndex = this.findSelectedMovementIndexBySignature(signature);

      if (currentIndex >= 0) {
        this.modalSelectedMovements = this.modalSelectedMovements.filter((_, index) => index !== currentIndex);
        return;
      }

      this.modalSelectedMovements = [
        ...this.modalSelectedMovements,
        normalizeDraftMovement({
          key: movement.key,
          name: movement.name,
          type: movement.type,
          category: 'accessory',
          sets: movement.sets
        }, this.modalSelectedMovements.length)
      ];
    },
    confirmAccessoryModal() {
      persistDraftAccessoryMovements(this.activeDraftLiftKey, this.modalSelectedMovements);
      this.templateRefreshTick += 1;
      this.showAccessoryModal = false;
      this.reloadDraftFromCurrentPlan();
      uni.showToast({
        title: `${this.activeDraftLiftLabel}辅助项已更新`,
        icon: 'none'
      });
    },
    clearAccessorySnapshot() {
      clearDraftAccessoryMovements(this.activeDraftLiftKey);
      this.templateRefreshTick += 1;
      this.reloadDraftFromCurrentPlan();
      uni.showToast({
        title: `${this.activeDraftLiftLabel}辅助项已清空`,
        icon: 'none'
      });
    },
    updateTitle(event) {
      if (!this.planDraft) {
        return;
      }

      this.planDraft.title = event.detail.value;
      this.persistCurrentDraft();
    },
    addMovement() {
      this.editableMovements = [...this.editableMovements, createDraftMovement()];
      this.persistCurrentDraft();
    },
    removeMovement(movementIndex) {
      this.editableMovements = this.editableMovements.filter((_, index) => index !== movementIndex);
      this.persistCurrentDraft();
    },
    toggleMovementCard(movementKey) {
      this.expandedMovements = {
        ...this.expandedMovements,
        [movementKey]: !this.expandedMovements[movementKey]
      };
    },
    openRenameModal(movementIndex) {
      this.renameIndex = movementIndex;
      this.renameValue = (this.editableMovements[movementIndex] || {}).name || '';
      this.showRenameModal = true;
    },
    closeRenameModal() {
      this.showRenameModal = false;
      this.renameIndex = -1;
      this.renameValue = '';
    },
    confirmRename() {
      const name = String(this.renameValue || '').trim();
      if (!name) {
        uni.showToast({ title: '动作名不能为空', icon: 'none' });
        return;
      }
      this.editableMovements = this.editableMovements.map((movement, index) => (
        index === this.renameIndex
          ? { ...movement, name }
          : movement
      ));
      this.persistCurrentDraft();
      this.closeRenameModal();
    },
    updateMovementName(movementIndex, value) {
      this.editableMovements = this.editableMovements.map((movement, index) => (
        index === movementIndex
          ? { ...movement, name: String(value || '') }
          : movement
      ));
      this.persistCurrentDraft();
    },
    addSet(movementIndex) {
      this.editableMovements = this.editableMovements.map((movement, index) => {
        if (index !== movementIndex) {
          return movement;
        }

        return {
          ...movement,
          sets: [
            ...movement.sets,
            {
              ...createEmptyAccessoryDraftMovement().sets[0]
            }
          ]
        };
      });
      this.persistCurrentDraft();
    },
    removeSet(movementIndex, setIndex) {
      this.editableMovements = this.editableMovements.map((movement, index) => {
        if (index !== movementIndex) {
          return movement;
        }

        return {
          ...movement,
          sets: movement.sets.filter((_, index2) => index2 !== setIndex)
        };
      }).filter((movement) => movement.sets.length);
      this.persistCurrentDraft();
    },
    updateSetField(movementIndex, setIndex, field, value) {
      this.editableMovements = this.editableMovements.map((movement, index) => {
        if (index !== movementIndex) {
          return movement;
        }

        return {
          ...movement,
          sets: movement.sets.map((setItem, index2) => {
            if (index2 !== setIndex) {
              return setItem;
            }
            return {
              ...setItem,
              [field]: String(value || '')
            };
          })
        };
      });
      this.persistCurrentDraft();
    },
    validateDraft() {
      if (!this.planDraft) {
        return '草稿不存在';
      }

      const title = String(this.planDraft.title || '').trim();
      if (!title) {
        return '训练标题不能为空';
      }

      const movementsToValidate = Array.isArray(this.planDraft.movements) ? this.planDraft.movements : [];
      if (!movementsToValidate.length) {
        return '至少保留 1 个动作';
      }

      for (const movement of movementsToValidate) {
        if (!String(movement.name || '').trim()) {
          return '动作名称不能为空';
        }
        if (!Array.isArray(movement.sets) || !movement.sets.length) {
          return `动作 ${movement.name || ''} 至少要有 1 组`;
        }

        for (const setItem of movement.sets) {
          const hasValue = Boolean(
            String(setItem.weight || '').trim() ||
            String(setItem.reps || '').trim()
          );

          if (!hasValue) {
            return `${movement.name || '动作'} 的 ${setItem.label || '某组'} 不能为空`;
          }
        }
      }

      return '';
    },
    async submitDraft() {
      if (this.submitLoading) {
        return;
      }

      const errorMessage = this.validateDraft();
      if (errorMessage) {
        uni.showToast({
          title: errorMessage,
          icon: 'none'
        });
        return;
      }
      this.openSubmitModal();
    },
    async confirmSubmitDraft() {
      if (this.submitLoading) {
        return;
      }

      const normalizedSubmitDate = normalizeDateInput(this.submitDate);
      if (!normalizedSubmitDate) {
        uni.showToast({
          title: '请先选择写回日期',
          icon: 'none'
        });
        return;
      }

      this.submitLoading = true;
      try {
        const finalDraft = {
          ...this.planDraft,
          datestr: normalizedSubmitDate,
          note: '',
          title: String(this.planDraft.title || '').trim(),
          movements: cloneDraftMovements(this.planDraft.movements),
          movementCount: this.planDraft.movements.length
        };

        const result = await createXunjiTrainFromDraft({
          trainDraft: finalDraft
        });

        persistEditorResult({
          ...result,
          mode: 'create'
        });

        this.planDraft = {
          ...this.planDraft,
          datestr: normalizedSubmitDate
        };
        this.closeSubmitModal();
        this.persistCurrentDraft();

        uni.showToast({
          title: '写回成功',
          icon: 'none'
        });
      } catch (error) {
        uni.showToast({
          title: error && error.message ? error.message : '写回失败',
          icon: 'none'
        });
      } finally {
        this.submitLoading = false;
      }
    },
  }
};
</script>

<style scoped lang="scss">
/* ========== Page & Layout ========== */
.page {
  min-height: 100vh;
  background:
    radial-gradient(circle at top left, rgba(59, 130, 246, 0.20), transparent 34%),
    linear-gradient(180deg, #f4f8ff 0%, #edf4ff 55%, #e9f1ff 100%);
}

.page-scroll {
  min-height: 100vh;
  padding-bottom: env(safe-area-inset-bottom);
  box-sizing: border-box;
}

.tab-body {
  padding-bottom: 40rpx;
}

/* ========== Panel ========== */
.panel {
  margin: 20rpx 20rpx 0;
  padding: 20rpx;
  border-radius: 30rpx;
  background: rgba(255, 255, 255, 0.96);
  border: 2rpx solid rgba(148, 163, 184, 0.12);
  box-shadow: 0 18rpx 38rpx rgba(15, 23, 42, 0.06);
}

.panel-title {
  font-size: 36rpx;
  font-weight: 700;
  color: #102a56;
}

.panel-sub {
  margin-top: 6rpx;
  font-size: 21rpx;
  line-height: 1.5;
  color: #8a9ab3;
}

/* ========== Field Card ========== */
.field-card {
  padding: 8rpx 0 14rpx;
  border-radius: 0;
  background: transparent;
  border: 0;
  border-bottom: 2rpx solid rgba(191, 219, 254, 0.72);
}

.field-card:last-child {
  padding-bottom: 0;
  border-bottom: 0;
}

.compact-field-card {
  padding: 8rpx 0 14rpx;
}

.field-label {
  font-size: 26rpx;
  font-weight: 700;
  color: #16356b;
}

.field-input {
  margin-top: 14rpx;
  padding: 18rpx 18rpx;
  border-radius: 18rpx;
  background: #ffffff;
  font-size: 32rpx;
  font-weight: 700;
  color: #102a56;
  font-family: 'Consolas', 'SFMono-Regular', monospace;
  border: 2rpx solid rgba(96, 165, 250, 0.88);
  box-shadow: inset 0 1rpx 0 rgba(255, 255, 255, 0.95), 0 8rpx 18rpx rgba(37, 99, 235, 0.10);
}

.field-picker {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.field-picker-placeholder {
  color: #94a3b8;
}

/* ========== Lift Tabs ========== */
.query-lift-tabs {
  display: grid;
  gap: 10rpx;
  margin-top: 16rpx;
  padding: 8rpx;
  border-radius: 22rpx;
  background: #eef5ff;
  border: 2rpx solid rgba(191, 219, 254, 0.74);
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.query-lift-tab {
  padding: 16rpx 6rpx;
  border-radius: 18rpx;
  text-align: center;
  font-size: 24rpx;
  font-weight: 700;
  color: #4f6ea3;
}

.query-lift-tab.is-active {
  color: #ffffff;
  background: #2563eb;
  box-shadow: 0 8rpx 18rpx rgba(37, 99, 235, 0.18);
}

/* ========== Note Box ========== */
.note-box {
  margin-top: 14rpx;
  padding: 18rpx 20rpx;
  border-radius: 22rpx;
  background: #eff6ff;
  border: 2rpx solid #bfdbfe;
  font-size: 22rpx;
  line-height: 1.6;
  color: #1e3a5f;
}

.placeholder-text {
  color: #94a3b8;
}

.mono {
  font-family: 'Consolas', 'SFMono-Regular', monospace;
}

/* ========== Query Result ========== */
.query-result {
  margin-top: 16rpx;
  padding: 20rpx;
  border-radius: 24rpx;
  background: linear-gradient(135deg, #dbeafe, #eff6ff);
  border: 2rpx solid #bfdbfe;
  color: #102a56;
}

.query-main-text {
  font-size: 30rpx;
  font-weight: 700;
  line-height: 1.65;
}

/* ========== Config Form ========== */
.config-form {
  display: grid;
  gap: 10rpx;
  margin-top: 14rpx;
}

.config-form-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20rpx;
}

.config-form-label {
  flex: 1;
  min-width: 0;
  font-size: 24rpx;
  font-weight: 700;
  color: #16356b;
}

.config-form-input {
  flex: 0 0 208rpx;
  width: 208rpx;
  padding: 14rpx 18rpx;
  border-radius: 16rpx;
  border: 2rpx solid rgba(96, 165, 250, 0.86);
  background: #ffffff;
  box-shadow: inset 0 1rpx 0 rgba(255, 255, 255, 0.95), 0 8rpx 18rpx rgba(37, 99, 235, 0.08);
  font-size: 28rpx;
  font-weight: 700;
  text-align: right;
  color: #102a56;
}

/* ========== Xunji Movement ========== */
.xunji-movement-list {
  display: grid;
  gap: 12rpx;
  margin-top: 16rpx;
}

.xunji-movement-card {
  padding: 16rpx;
  border-radius: 20rpx;
  background: rgba(239, 246, 255, 0.7);
  border: 2rpx solid rgba(191, 219, 254, 0.62);
}

.xunji-movement-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16rpx;
}

.xunji-movement-title {
  font-size: 28rpx;
  font-weight: 700;
  line-height: 1.4;
  color: #102a56;
}

.xunji-movement-type {
  margin-top: 6rpx;
  font-size: 20rpx;
  line-height: 1.5;
  color: #6b7f9d;
}

.xunji-movement-meta {
  flex-shrink: 0;
  padding: 8rpx 14rpx;
  border-radius: 999rpx;
  background: #e0edff;
  font-size: 20rpx;
  color: #2153a5;
}

.xunji-set-list {
  display: grid;
  gap: 12rpx;
  margin-top: 12rpx;
}

.xunji-set-row {
  padding: 14rpx 16rpx;
  border-radius: 18rpx;
  background: #ffffff;
  border: 2rpx solid rgba(191, 219, 254, 0.55);
}

.xunji-set-label {
  font-size: 22rpx;
  font-weight: 700;
  color: #16356b;
}

.xunji-set-text {
  margin-top: 6rpx;
  font-size: 21rpx;
  line-height: 1.6;
  color: #35527d;
}

/* ========== Draft Editor ========== */
.draft-editor-section {
  margin-top: 18rpx;
  padding-top: 18rpx;
  border-top: 2rpx dashed rgba(250, 204, 21, 0.5);
}

.draft-editor-title {
  font-size: 28rpx;
  font-weight: 700;
  color: #9a3412;
}

.draft-set-editor-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16rpx;
}

.draft-set-editor {
  display: grid;
  gap: 12rpx;
}

.draft-set-grid {
  display: grid;
  gap: 12rpx;
}

.draft-link-btn {
  flex-shrink: 0;
  font-size: 22rpx;
  font-weight: 700;
  color: #2563eb;
}

.draft-link-btn.is-primary {
  color: #0f3d91;
}

.draft-link-btn.is-danger {
  color: #dc2626;
}

.draft-empty-note {
  background: rgba(255, 255, 255, 0.7);
  border-color: rgba(250, 204, 21, 0.38);
  color: #92400e;
}

.draft-summary-box {
  white-space: pre-line;
}

.accessory-editor-card {
  background: rgba(255, 255, 255, 0.9);
  border-color: rgba(250, 204, 21, 0.42);
}

/* ========== Modal ========== */
.modal-mask {
  position: fixed;
  inset: 0;
  z-index: 999;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  overflow-y: auto;
  box-sizing: border-box;
  padding: 96rpx 32rpx calc(32rpx + env(safe-area-inset-bottom));
  background: rgba(15, 23, 42, 0.38);
}

.modal-card {
  width: 100%;
  max-width: 680rpx;
  margin: 0 auto;
  padding: 26rpx 24rpx;
  border-radius: 30rpx;
  background: rgba(255, 255, 255, 0.98);
  border: 2rpx solid rgba(148, 163, 184, 0.12);
  box-shadow: 0 24rpx 60rpx rgba(15, 23, 42, 0.18);
}

/* ========== Accessory Modal ========== */
.accessory-modal-card {
  height: 85vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.accessory-modal-head {
  flex-shrink: 0;
  padding-bottom: 10rpx;
}

.accessory-modal-body {
  flex: 1;
  height: 0;
}

/* ========== Accessory Summary Card ========== */
.accessory-summary-card {
  margin-top: 16rpx;
  padding: 18rpx;
  border-radius: 24rpx;
  background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
  border: 2rpx solid rgba(191, 219, 254, 0.7);
}

.accessory-summary-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16rpx;
}

.accessory-summary-title {
  margin-bottom: 4rpx;
}

.accessory-summary-actions,
.accessory-modal-actions,
.submit-modal-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 12rpx;
}

.draft-editor-actions,
.accessory-fetch-actions,
.rename-modal-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 16rpx;
  margin-top: 18rpx;
}

.accessory-modal-topbar,
.accessory-section-head,
.submit-modal-head {
  display: flex;
  align-items: flex-start;
  gap: 16rpx;
}

.accessory-modal-topbar {
  justify-content: space-between;
}

.accessory-section-head {
  justify-content: flex-start;
}

.accessory-modal-topbar > view:first-child,
.accessory-section-head > view:first-child {
  flex: 1;
}

.submit-modal-head {
  justify-content: flex-end;
}

/* ========== History Selected List ========== */
.history-selected-list {
  display: grid;
  gap: 10rpx;
  margin-top: 14rpx;
}

.history-selected-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
  padding: 14rpx 16rpx;
  border-radius: 18rpx;
  background: rgba(255, 255, 255, 0.9);
  border: 2rpx solid rgba(250, 204, 21, 0.35);
}

.history-selected-name {
  font-size: 24rpx;
  font-weight: 700;
  color: #102a56;
}

.history-selected-meta {
  margin-top: 6rpx;
  font-size: 20rpx;
  color: #64748b;
}

/* ========== History Source List ========== */
.history-source-list {
  display: grid;
  gap: 12rpx;
  margin-top: 14rpx;
}

.history-source-card {
  padding: 16rpx;
  border-radius: 20rpx;
  background: #ffffff;
  border: 2rpx solid rgba(191, 219, 254, 0.55);
}

.history-source-card.is-active {
  background: #eff6ff;
  border-color: #2563eb;
  box-shadow: 0 8rpx 20rpx rgba(37, 99, 235, 0.12);
}

.history-source-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16rpx;
}

.history-source-set-list {
  display: grid;
  gap: 6rpx;
  margin-top: 10rpx;
  padding-top: 10rpx;
  border-top: 2rpx solid rgba(191, 219, 254, 0.45);
}

.history-source-set-item {
  font-size: 20rpx;
  line-height: 1.5;
  color: #64748b;
}

/* ========== Responsive ========== */
@media screen and (max-width: 750px) {
  .config-form-input {
    flex: 0 0 208rpx;
  }

  .xunji-movement-head,
  .accessory-modal-topbar,
  .accessory-section-head,
  .submit-modal-head,
  .draft-set-editor-head {
    flex-direction: column;
  }

  .accessory-summary-actions,
  .accessory-modal-actions,
  .submit-modal-actions {
    width: 100%;
    justify-content: flex-end;
  }
}

/* ========== Movement Card Collapse ========== */
.xunji-movement-card-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 12rpx;
}

.xunji-movement-card-name {
  flex: 1;
  min-width: 0;
}

.xunji-movement-card-actions {
  flex-shrink: 0;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 16rpx;
  white-space: nowrap;
}
</style>
