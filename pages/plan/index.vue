<template>
  <view class="page">
    <view class="page-scroll">
      <view class="page-copy">
        <view class="page-copy-kicker">PLAN</view>
        <view class="page-copy-actions">
          <view class="page-copy-title">训练计划</view>
          <view class="page-copy-action-group">
            <text class="draft-link-btn" @tap="copyPlanSummary">一键复制</text>
            <text class="draft-link-btn" @tap="openBaseSettings">基础配置</text>
            <text class="draft-link-btn is-primary" @tap="openXunjiSettings">训记设置</text>
          </view>
        </view>
        <view class="page-copy-desc">{{ xunjiKeyStatus }}</view>
      </view>

      <view class="tab-body">
        <view class="panel">
          <!-- <view class="panel-title">训练表</view> -->
          <view class="lift-tabs">
            <view
              v-for="lift in liftCards"
              :key="lift.key"
              :class="['lift-tab', activeLiftKey === lift.key ? 'is-active' : '']"
              @tap="activeLiftKey = lift.key"
            >
              {{ lift.name }}
            </view>
          </view>

          <view class="panel-sub">{{ activeLift.sub }}</view>

          <view class="block-filter">
            <view
              v-for="item in blockFilterOptions"
              :key="`${activeLift.key}-${item.value}`"
              :class="['block-chip', blockFilters[activeLift.key] === item.value ? 'is-active' : '']"
              @tap="setBlockFilter(activeLift.key, item.value)"
            >
              {{ item.label }}
            </view>
          </view>

          <scroll-view scroll-x class="table-scroll">
            <view class="plan-table">
              <view class="plan-row plan-head">
                <text class="col cycle">循环</text>
                <text class="col weight">TM</text>
                <text class="col set">顶组</text>
                <text class="col set">回退组</text>
              </view>
              <view
                v-for="row in filteredPlanRows[activeLift.key]"
                :key="`${activeLift.key}-${row.cycle}`"
                class="plan-row"
              >
                <text class="col cycle">{{ row.cycle }}</text>
                <text class="col weight mono">{{ row.tm }}</text>
                <view class="col set">
                  <text class="set-primary mono">{{ row.topWeight }}</text>
                  <text class="set-secondary mono">{{ row.topPct }} / {{ row.topReps }}</text>
                </view>
                <view class="col set">
                  <text class="set-primary mono">{{ row.backWeight }}</text>
                  <text class="set-secondary mono">{{ row.backPct }} / {{ row.backReps }}</text>
                </view>
              </view>
            </view>
          </scroll-view>

          <view class="note-box">{{ liftNotes[activeLift.key] }}</view>
        </view>
      </view>
    </view>

    <view v-if="xunjiSettingsVisible" class="modal-mask" @tap="closeXunjiSettings">
      <view class="modal-card" @tap.stop>
        <view class="panel-title">训记设置</view>
        <view class="panel-sub">Key 只保存在当前设备本地缓存。</view>

        <view class="field-card">
          <view class="field-label">Access Key</view>
          <input
            v-model="xunjiKeyInput"
            class="field-input"
            :adjust-position="true"
            :cursor-spacing="160"
            placeholder="请输入训记 Open API Key"
            placeholder-class="placeholder-text"
          />
        </view>

        <view class="xunji-action-row">
          <text class="draft-link-btn is-danger" @tap="clearXunjiKey">清空</text>
          <text class="draft-link-btn is-primary" @tap="saveXunjiKey">保存</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import {
  BLOCK_FILTER_OPTIONS,
  LIFT_CARDS,
  LIFTS,
  createDefaultBlockFilters,
  createDefaultForm,
  createDefaultLiftConfigs,
  getFilteredPlanRows,
  getLiftResultMap,
  getLiftNotes,
  getPlanRows,
  persistLiftConfigs,
  restoreForm,
  restoreLiftConfigs
} from '@/utils/tm-plan';
import {
  clearStoredXunjiKey,
  getStoredXunjiKey,
  persistXunjiKey
} from '@/utils/xunji';

export default {
  data() {
    return {
      blockFilterOptions: BLOCK_FILTER_OPTIONS,
      blockFilters: createDefaultBlockFilters(),
      activeLiftKey: 'bench',
      form: createDefaultForm(),
      liftConfigs: createDefaultLiftConfigs(),
      xunjiSettingsVisible: false,
      xunjiKeyInput: '',
      hasSavedXunjiKey: false
    };
  },
  computed: {
    liftCards() {
      return LIFT_CARDS;
    },
    activeLift() {
      return LIFTS[this.activeLiftKey] || LIFTS.bench;
    },
    filteredPlanRows() {
      return getFilteredPlanRows(this.form, this.blockFilters, this.liftConfigs);
    },
    liftResultMap() {
      return getLiftResultMap(this.form, this.liftConfigs);
    },
    liftNotes() {
      return getLiftNotes(this.form, this.liftConfigs);
    },
    xunjiKeyStatus() {
      return this.hasSavedXunjiKey
        ? '训记 Key 已设置，可直接去新增或编辑页使用。'
        : '训记 Key 未设置，先点上方“训记设置”即可。';
    }
  },
  onLoad() {
    this.restoreLocalForm();
  },
  onShow() {
    this.restoreLocalForm();
  },
  methods: {
    setBlockFilter(liftKey, block) {
      this.blockFilters = {
        ...this.blockFilters,
        [liftKey]: block
      };
    },
    buildCopyText() {
      const planRows = getPlanRows(this.form, this.liftConfigs);
      const lines = [
        '基础参数',
        `体重：${this.liftResultMap.bench.bodyweightText}`,
        `卧推：1RM ${this.liftResultMap.bench.rmText} / ratio ${this.liftResultMap.bench.ratioText} / step ${this.liftResultMap.bench.blockStepText} / TM ${this.liftResultMap.bench.blockTmText}`,
        `深蹲：1RM ${this.liftResultMap.squat.rmText} / ratio ${this.liftResultMap.squat.ratioText} / step ${this.liftResultMap.squat.blockStepText} / TM ${this.liftResultMap.squat.blockTmText}`,
        `引体向上：1RM 总重 ${this.liftResultMap.pullup.rmText} / ratio ${this.liftResultMap.pullup.ratioText} / step ${this.liftResultMap.pullup.blockStepText} / TM ${this.liftResultMap.pullup.blockTmText}`,
        '',
        '训练计划'
      ];

      this.liftCards.forEach((lift) => {
        lines.push('');
        lines.push(`${lift.name}`);
        (planRows[lift.key] || []).forEach((row) => {
          lines.push(
            `第${row.cycle}循环（${row.tm}） 顶组 ${row.topWeight} ${row.topPct} ${row.topReps} / 回退 ${row.backWeight} ${row.backPct} ${row.backReps}`
          );
        });
        lines.push(`测试模板：${this.liftNotes[lift.key]}`);
      });

      return lines.join('\n');
    },
    copyPlanSummary() {
      uni.setClipboardData({
        data: this.buildCopyText(),
        success: () => {
          uni.showToast({
            title: '已复制',
            icon: 'success'
          });
        },
        fail: () => {
          uni.showToast({
            title: '复制失败',
            icon: 'none'
          });
        }
      });
    },
    openBaseSettings() {
      uni.navigateTo({
        url: '/pages/index/index'
      });
    },
    openXunjiSettings() {
      this.xunjiKeyInput = getStoredXunjiKey();
      this.xunjiSettingsVisible = true;
    },
    closeXunjiSettings() {
      this.xunjiSettingsVisible = false;
    },
    saveXunjiKey() {
      const key = String(this.xunjiKeyInput || '').trim();
      if (!key) {
        uni.showToast({
          title: '请先输入 Key',
          icon: 'none'
        });
        return;
      }

      persistXunjiKey(key);
      this.xunjiKeyInput = key;
      this.hasSavedXunjiKey = true;
      this.xunjiSettingsVisible = false;
      uni.showToast({
        title: '保存成功',
        icon: 'none'
      });
    },
    clearXunjiKey() {
      clearStoredXunjiKey();
      this.xunjiKeyInput = '';
      this.hasSavedXunjiKey = false;
      this.xunjiSettingsVisible = false;
      uni.showToast({
        title: '已清空',
        icon: 'none'
      });
    },
    restoreLocalForm() {
      this.form = restoreForm();
      this.liftConfigs = restoreLiftConfigs();
      persistLiftConfigs(this.liftConfigs);
      this.hasSavedXunjiKey = Boolean(getStoredXunjiKey());
    }
  }
};
</script>

<style scoped lang="scss">
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

.page-copy {
  margin: 20rpx 20rpx 0;
  padding: 18rpx 20rpx;
  border-radius: 28rpx;
  background: rgba(255, 255, 255, 0.78);
  border: 2rpx solid rgba(148, 163, 184, 0.18);
  box-shadow: 0 18rpx 38rpx rgba(15, 23, 42, 0.06);
}

.page-copy-kicker {
  font-size: 20rpx;
  font-weight: 700;
  color: #5676ae;
  letter-spacing: 2rpx;
}

.page-copy-title {
  flex: 1;
  min-width: 0;
  margin-top: 8rpx;
  font-size: 38rpx;
  font-weight: 700;
  color: #102a56;
}

.page-copy-desc {
  margin-top: 8rpx;
  font-size: 22rpx;
  line-height: 1.6;
  color: #6a7e9e;
}

.page-copy-actions {
  margin-top: 12rpx;
  display: flex;
  justify-content: space-between;
  gap: 12rpx;
}

.page-copy-action-group {
  flex-shrink: 0;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 12rpx;
}

.tab-body {
  padding-bottom: 40rpx;
}

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

.field-card {
  padding: 8rpx 0 14rpx;
  border-bottom: 2rpx solid rgba(191, 219, 254, 0.72);
}

.field-card:last-child {
  padding-bottom: 0;
  border-bottom: 0;
}

.field-label {
  flex: 1;
  min-width: 0;
  padding-right: 8rpx;
  font-size: 26rpx;
  font-weight: 700;
  color: #16356b;
}

.field-input {
  margin-top: 14rpx;
  padding: 18rpx;
  border-radius: 18rpx;
  background: #ffffff;
  font-size: 32rpx;
  font-weight: 700;
  color: #102a56;
  font-family: 'Consolas', 'SFMono-Regular', monospace;
  border: 2rpx solid rgba(96, 165, 250, 0.88);
  box-shadow: inset 0 1rpx 0 rgba(255, 255, 255, 0.95), 0 8rpx 18rpx rgba(37, 99, 235, 0.10);
}

.placeholder-text {
  color: #94a3b8;
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

.lift-tabs,
.block-filter {
  display: grid;
  gap: 10rpx;
  margin-top: 16rpx;
  padding: 8rpx;
  border-radius: 22rpx;
  background: #eef5ff;
  border: 2rpx solid rgba(191, 219, 254, 0.74);
}

.lift-tabs,
.block-filter {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.lift-tab,
.block-chip {
  padding: 16rpx 6rpx;
  border-radius: 18rpx;
  text-align: center;
  font-size: 24rpx;
  font-weight: 700;
  color: #4f6ea3;
}

.block-chip {
  padding: 12rpx 0;
  border-radius: 999rpx;
  font-size: 22rpx;
}

.lift-tab.is-active,
.block-chip.is-active {
  color: #ffffff;
  background: #2563eb;
  box-shadow: 0 8rpx 18rpx rgba(37, 99, 235, 0.18);
}

.table-scroll {
  margin-top: 14rpx;
}

.plan-table {
  width: 100%;
  border-radius: 24rpx;
  overflow: hidden;
  background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
  border: 2rpx solid rgba(191, 219, 254, 0.75);
}

.plan-row {
  display: flex;
  align-items: stretch;
  border-bottom: 2rpx solid rgba(191, 219, 254, 0.72);
}

.plan-row:last-child {
  border-bottom: 0;
}

.plan-head {
  background: linear-gradient(180deg, #dbeafe 0%, #cfe2ff 100%);
}

.plan-head .col {
  color: #20407a;
  font-weight: 700;
}

.col {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16rpx 8rpx;
  font-size: 22rpx;
  line-height: 1.42;
  text-align: center;
  color: #102a56;
}

.col.cycle {
  flex: 0 0 76rpx;
}

.col.weight {
  flex: 0 0 112rpx;
}

.col.set {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4rpx;
}

.set-primary {
  font-size: 23rpx;
  font-weight: 700;
  color: #102a56;
}

.set-secondary {
  font-size: 19rpx;
  text-align: center;
  color: #64748b;
}

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

.mono {
  font-family: 'Consolas', 'SFMono-Regular', monospace;
}

.field-picker {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.xunji-action-row {
  display: flex;
  justify-content: flex-end;
  gap: 16rpx;
  margin-top: 18rpx;
}

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

@media screen and (max-width: 750px) {
  .page-copy-title {
    font-size: 42rpx;
  }
}
</style>
