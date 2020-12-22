<template>
  <div>
    <el-button @click="$emit('reject')">取消</el-button>
    <el-button type="primary" @click="$emit('resolve')">确定</el-button>
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
@Component
export default class DialogFooter extends Vue {}
</script>
