<template>
  <view class="cycle-selector">

    <view class="cycle-trigger" @tap="toggleOpen">
      <view>
        <view class="cycle-label">循环</view>
        <view class="cycle-value">{{ activeLabel }}</view>
      </view>
      <view :class="['cycle-arrow', open ? 'is-open' : '']"></view>
    </view>

    <view v-if="open" class="cycle-popup">
      <view class="cycle-mask" @tap="closePopup"></view>
      <view class="cycle-sheet">
        <view class="cycle-sheet-head">
          <view>
            <view class="cycle-sheet-title">选择循环</view>
            <view class="cycle-sheet-sub">按 Block 分组，点选后自动关闭</view>
          </view>
          <view class="cycle-close" @tap="closePopup">关闭</view>
        </view>

        <view
          v-for="group in groupedOptions"
          :key="group.block"
          class="cycle-group"
        >
          <view class="cycle-group-title">B{{ group.block }}</view>
          <view class="cycle-options">
            <view
              v-for="item in group.items"
              :key="item.cycle"
              :class="['cycle-option', value === item.index ? 'is-active' : '']"
              @tap="selectCycle(item.index)"
            >
              第 {{ item.cycle }} 循环
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'CycleSelector',
  props: {
    value: {
      type: Number,
      default: 0
    },
    options: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      open: false
    };
  },
  computed: {
    activeLabel() {
      const option = this.options[this.value];
      return option ? option.label : '选择循环';
    },
    groupedOptions() {
      return this.options.reduce((groups, item, index) => {
        const block = item.block || 1;
        let group = groups.find((target) => target.block === block);

        if (!group) {
          group = { block, items: [] };
          groups.push(group);
        }

        group.items.push({
          ...item,
          index
        });
        return groups;
      }, []);
    }
  },
  methods: {
    toggleOpen() {
      this.open = !this.open;
    },
    closePopup() {
      this.open = false;
    },
    selectCycle(index) {
      this.$emit('change', index);
      this.open = false;
    }
  }
};
</script>

<style scoped lang="scss">
.cycle-selector {
  margin-top: 18rpx;
}

.cycle-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20rpx;
  padding: 22rpx 20rpx;
  border-radius: 24rpx;
  background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
  border: 2rpx solid rgba(191, 219, 254, 0.9);
}

.cycle-label {
  font-size: 24rpx;
  font-weight: 700;
  color: #4f6ea3;
}

.cycle-value {
  margin-top: 8rpx;
  font-size: 32rpx;
  font-weight: 700;
  color: #102a56;
}

.cycle-arrow {
  flex-shrink: 0;
  width: 18rpx;
  height: 18rpx;
  border-right: 4rpx solid #3b82f6;
  border-bottom: 4rpx solid #3b82f6;
  transform: rotate(45deg);
  transition: transform 0.2s ease;
}

.cycle-arrow.is-open {
  transform: rotate(225deg);
}

.cycle-popup {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 99;
}

.cycle-mask {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: rgba(15, 23, 42, 0.42);
}

.cycle-sheet {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  display: grid;
  gap: 22rpx;
  max-height: 76vh;
  padding: 26rpx 24rpx calc(34rpx + env(safe-area-inset-bottom));
  border-radius: 34rpx 34rpx 0 0;
  background: linear-gradient(180deg, #ffffff 0%, #f4f8ff 100%);
  box-shadow: 0 -24rpx 60rpx rgba(15, 23, 42, 0.18);
}

.cycle-sheet-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20rpx;
}

.cycle-sheet-title {
  font-size: 34rpx;
  font-weight: 700;
  color: #102a56;
}

.cycle-sheet-sub {
  margin-top: 6rpx;
  font-size: 22rpx;
  color: #8a9ab3;
}

.cycle-close {
  flex-shrink: 0;
  padding: 10rpx 18rpx;
  border-radius: 999rpx;
  color: #2563eb;
  background: #eff6ff;
  border: 2rpx solid #bfdbfe;
  font-size: 22rpx;
  font-weight: 700;
}

.cycle-group-title {
  font-size: 22rpx;
  font-weight: 700;
  color: #3560a6;
}

.cycle-options {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10rpx;
  margin-top: 10rpx;
}

.cycle-option {
  padding: 14rpx 6rpx;
  border-radius: 16rpx;
  text-align: center;
  font-size: 22rpx;
  font-weight: 700;
  color: #4f6ea3;
  background: #ffffff;
  border: 2rpx solid rgba(191, 219, 254, 0.78);
}

.cycle-option.is-active {
  color: #ffffff;
  background: #2563eb;
  border-color: #2563eb;
  box-shadow: 0 8rpx 18rpx rgba(37, 99, 235, 0.18);
}
</style>
