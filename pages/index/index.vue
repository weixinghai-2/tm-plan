<template>
  <view class="page">
    <view class="page-scroll">
      <view class="page-copy">
        <view class="page-copy-kicker">SETTINGS</view>
        <view class="page-copy-title">设置参数</view>
      </view>

      <view class="tab-body">
        <view class="panel">
          <view class="panel-title">基础输入</view>
          <view class="panel-sub">这些值会直接影响 TM 和 17 次循环训练重量。</view>
          <view class="field-grid">
            <view v-for="field in inputFields" :key="field.key" class="field-card compact-field-card">
              <view class="field-row">
                <view class="field-label">{{ field.label }}</view>
                <input
                  class="field-input field-input-inline"
                  type="digit"
                  :adjust-position="true"
                  :cursor-spacing="160"
                  :value="String(form[field.key])"
                  @input="handleNumberInput(field.key, $event)"
                />
              </view>
              <view class="field-hint">{{ field.hint }}</view>
            </view>
          </view>
        </view>

        <view class="panel">
          <view class="panel-title">主项参数</view>
          <view class="panel-sub">`ratio` 控 B1，`step` 控 B2/B3。</view>

          <view class="formula-list">
            <view
              v-for="lift in liftCards"
              :key="lift.key"
              class="formula-row"
            >
              <view class="formula-name">{{ lift.name }}</view>

              <view class="config-inline-list">
                <view class="config-inline-row">
                  <text class="field-label">ratio</text>
                  <input
                    class="config-form-input mono"
                    type="digit"
                    :adjust-position="true"
                    :cursor-spacing="160"
                    :value="String(liftConfigs[lift.key].ratio)"
                    @input="handleConfigInput(lift.key, 'ratio', $event)"
                  />
                </view>
                <view class="config-inline-row">
                  <text class="field-label">step</text>
                  <input
                    class="config-form-input mono"
                    type="digit"
                    :adjust-position="true"
                    :cursor-spacing="160"
                    :value="String(liftConfigs[lift.key].blockStep)"
                    @input="handleConfigInput(lift.key, 'blockStep', $event)"
                  />
                </view>
              </view>
            </view>
          </view>
        </view>

        <view class="panel">
          <view class="panel-title">计算结果</view>
          <view class="result-list">
            <view
              v-for="lift in liftCards"
              :key="`summary-${lift.key}`"
              class="result-row"
            >
              <view class="result-row-head">
                <text class="formula-name">{{ lift.name }}</text>
                <text class="result-row-value mono">{{ liftResultMap[lift.key].tmText }}</text>
              </view>
              <view class="result-row-meta mono">
                1RM {{ liftResultMap[lift.key].rmText }} / ratio {{ liftResultMap[lift.key].ratioText }} / step +{{ liftResultMap[lift.key].blockStepText }}
              </view>
              <view class="result-row-meta mono">
                {{ formulaMap[lift.key] }}
              </view>
            </view>
          </view>
        </view>

        <view class="panel">
          <view class="panel-title">参数说明</view>
          <view class="rule-list">
            <view
              v-for="note in settingsNotes"
              :key="note"
              class="rule-item"
            >
              {{ note }}
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import {
  INPUT_FIELDS,
  LIFT_CARDS,
  SETTINGS_NOTES,
  createDefaultForm,
  createDefaultLiftConfigs,
  formatKg,
  getFormulaRows,
  getLiftResultMap,
  persistForm,
  persistLiftConfigs,
  restoreForm,
  restoreLiftConfigs,
  sanitizeNumberInput
} from '@/utils/tm-plan';

export default {
  data() {
    return {
      inputFields: INPUT_FIELDS,
      settingsNotes: SETTINGS_NOTES,
      form: createDefaultForm(),
      liftConfigs: createDefaultLiftConfigs()
    };
  },
  computed: {
    liftCards() {
      return LIFT_CARDS;
    },
    liftResultMap() {
      return getLiftResultMap(this.form, this.liftConfigs);
    },
    formulaRows() {
      return getFormulaRows(this.form, this.liftConfigs);
    },
    formulaMap() {
      const formulaRows = this.formulaRows;
      return {
        bench: (formulaRows.find((item) => item.name === '卧推') || {}).formula || '',
        squat: (formulaRows.find((item) => item.name === '深蹲') || {}).formula || '',
        pullup: (formulaRows.find((item) => item.name === '引体向上总重') || {}).formula || ''
      };
    }
  },
  onLoad() {
    this.restoreLocalState();
  },
  onShow() {
    this.restoreLocalState();
  },
  methods: {
    handleNumberInput(key, event) {
      const raw = event && event.detail ? event.detail.value : '';
      this.form = {
        ...this.form,
        [key]: sanitizeNumberInput(raw)
      };
      persistForm(this.form);
    },
    handleConfigInput(liftKey, field, event) {
      const raw = event && event.detail ? event.detail.value : '';
      const value = sanitizeNumberInput(raw);

      this.liftConfigs = {
        ...this.liftConfigs,
        [liftKey]: {
          ...this.liftConfigs[liftKey],
          [field]: value
        }
      };
      persistLiftConfigs(this.liftConfigs);
    },
    restoreLocalState() {
      this.form = restoreForm();
      this.liftConfigs = restoreLiftConfigs();
      persistForm(this.form);
      persistLiftConfigs(this.liftConfigs);
    },
    formatKg
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
  margin-top: 8rpx;
  font-size: 38rpx;
  font-weight: 700;
  color: #102a56;
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

.field-grid,
.formula-list,
.result-list,
.rule-list {
  display: grid;
  gap: 12rpx;
  margin-top: 16rpx;
}

.field-grid {
  grid-template-columns: 1fr;
}

.field-card,
.formula-row {
  padding: 18rpx;
  border-radius: 24rpx;
  background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
  border: 2rpx solid rgba(191, 219, 254, 0.7);
}

.compact-field-card {
  padding: 8rpx 0 14rpx;
  border-radius: 0;
  background: transparent;
  border: 0;
  border-bottom: 2rpx solid rgba(191, 219, 254, 0.72);
}

.field-row,
.config-form-row,
.result-row-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}

.field-label,
.formula-name {
  font-size: 26rpx;
  font-weight: 700;
  color: #16356b;
}

.field-hint,
.result-row-meta,
.rule-item {
  margin-top: 8rpx;
  font-size: 21rpx;
  line-height: 1.5;
  color: #64748b;
}

.field-input-inline,
.config-form-input {
  flex: 0 0 208rpx;
  width: 208rpx;
  min-height: 72rpx;
  padding: 8rpx 16rpx;
  border-radius: 16rpx;
  border: 2rpx solid rgba(96, 165, 250, 0.86);
  background: #ffffff;
  box-shadow: inset 0 1rpx 0 rgba(255, 255, 255, 0.95), 0 8rpx 18rpx rgba(37, 99, 235, 0.08);
  font-size: 28rpx;
  font-weight: 700;
  text-align: right;
  color: #102a56;
  font-family: 'Consolas', 'SFMono-Regular', monospace;
}

.config-form {
  display: grid;
  gap: 10rpx;
  margin-top: 14rpx;
}

.config-inline-list {
  display: grid;
  gap: 10rpx;
  margin-top: 14rpx;
}

.config-inline-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}

.result-row {
  padding: 18rpx 16rpx;
  border-radius: 22rpx;
  background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
  border: 2rpx solid rgba(191, 219, 254, 0.7);
}

.result-row-value {
  font-size: 26rpx;
  color: #102a56;
}

.mono {
  font-family: 'Consolas', 'SFMono-Regular', monospace;
}

.rule-item {
  padding: 14rpx 16rpx;
  border-radius: 20rpx;
  background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
  border: 2rpx solid rgba(191, 219, 254, 0.72);
  color: #35527d;
}

@media screen and (max-width: 750px) {
  .result-row-head {
    flex-direction: column;
    align-items: flex-start;
  }

  .page-copy-title {
    font-size: 42rpx;
  }
}
</style>
