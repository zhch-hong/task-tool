<template>
  <div class="source-item">
    <el-form label-width="100px">
      <el-form-item label="来源类型">
        <el-select v-model="sourceType">
          <el-option
            v-for="s in typeList"
            :key="s.id"
            :label="s.label"
            :value="s.id"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="进度折扣">
        <el-input></el-input>
      </el-form-item>
      <el-form-item label="奖励条件">
        <div>
          <ConditionItem
            v-for="c in conditionList"
            :key="c.id"
            :source-config="sourceConfig"
          />
        </div>
      </el-form-item>
    </el-form>
    <el-button>删除来源</el-button>
    <el-button>编辑来源</el-button>
    <el-button>保存配置</el-button>
    <el-button>还原配置</el-button>
  </div>
</template>
<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

import ConditionItem from './ConditionItem.vue';

@Component({
  components: {
    ConditionItem,
  },
})
export default class SourceItem extends Vue {
  @Prop({ type: Array, required: true }) sourceConfig!: Record<string, any>[];

  sourceType = '';
  typeList: Record<string, any>[] = [];

  conditionList: Record<string, any>[] = [];

  created(): void {
    this.parseTypeList();
  }

  parseTypeList(): void {
    this.typeList = this.sourceConfig;
  }
}
</script>
<style lang="scss" scoped>
.source-item {
  background-color: #f2f2f2;
  padding: 20px 20px 20px 0;
  border-radius: 4px;
}
</style>
