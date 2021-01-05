<template>
  <div style="display: inline-block">
    <input
      v-if="edit"
      v-model.trim="valuesync"
      ref="input"
      class="inline-input"
      type="text"
      @keypress.enter="submit"
      @keydown.esc="edit = false"
      @blur="edit = false"
    />

    <span v-else @click="edit = true">{{ value }}</span>
  </div>
</template>
<script lang="ts">
import Vue from 'vue';
export default Vue.extend({
  name: 'InlineInput',

  props: {
    value: {
      type: String,
      default: '',
    },
  },

  data() {
    return {
      edit: false,
      valuesync: this.value,
    };
  },

  watch: {
    edit(v: boolean): void {
      if (v) {
        this.$nextTick(() => {
          (this.$refs.input as HTMLInputElement).focus();
        });
      } else {
        this.valuesync = this.value;
      }
    },

    value(v: string): void {
      this.valuesync = v;
    },
  },

  methods: {
    submit(): void {
      this.edit = false;
      this.$emit('input', this.valuesync);
    },
  },
});
</script>
<style lang="scss" scoped>
input.inline-input {
  border: none;
  outline: none;
  background: none;
  border-bottom: 1px solid #E0E0E0;
  font-size: 16px;
  width: 90%;
}
</style>
