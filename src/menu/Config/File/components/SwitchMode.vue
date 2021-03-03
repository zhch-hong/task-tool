<template>
  <div style="font-size: 14px; color: black">
    <input
      v-show="mode === 'edit'"
      v-model="local"
      type="text"
      class="content"
      ref="Input"
      @blur="handleBlur"
      @keydown.esc.stop="handleBlur"
      @keydown.enter="handleEnter"
    />
    <span v-show="mode === 'normal'" style="padding: 0 4px; display: block; min-height: 21px" @click="mode = 'edit'">
      {{ value }}
    </span>
  </div>
</template>
<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  props: ['value'],

  data() {
    return {
      mode: 'normal' as 'edit' | 'normal',
      local: this.value,
    };
  },

  watch: {
    // 进入编辑模式时输入框自动获取焦点
    mode(value: 'edit' | 'normal') {
      if (value === 'edit') {
        this.$nextTick(() => {
          (this.$refs.Input as HTMLInputElement).focus();
        });
      }
    },
  },

  methods: {
    handleBlur() {
      this.mode = 'normal';
      this.local = this.value;
    },

    handleEnter() {
      this.mode = 'normal';
      this.$emit('input', this.local);
    },
  },
});
</script>
<style lang="scss" scoped>
input.content {
  display: block;
  width: 100%;
  border: none;
  outline: none;
  font-size: 11px;
  box-sizing: border-box;
  padding: 0 4px;
  font: unset;
  position: relative;
  box-shadow: 0 0 1px 0 #4d4d4d;
  border-radius: 0;
}
</style>
