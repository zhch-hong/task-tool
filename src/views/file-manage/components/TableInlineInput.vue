<template>
  <input
    v-model="text"
    type="text"
    ref="text"
    @blur="$emit('blur')"
    @keydown.enter.stop="$emit('enter')"
  />
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class TableInlineInput extends Vue {
  $refs!: {
    text: HTMLInputElement;
  };

  @Prop({ type: [String, Number], default: '' }) value!: string;

  get text(): string {
    return this.value;
  }
  set text(v: string) {
    this.$emit('input', v);
  }

  focus(): void {
    this.$refs.text.focus();
  }
}
</script>
<style lang="scss" scoped>
input {
  width: 90%;
  outline: none;
  border: none;
  background: transparent;
  border-bottom: 1px solid #ccd4e5;
  font-size: 16px;
}
</style>
