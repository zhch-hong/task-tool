<template>
  <span>{{ path }}</span>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class ExplorerPath extends Vue {
  @Prop({ type: String, default: '' }) path!: string;
}
</script>
