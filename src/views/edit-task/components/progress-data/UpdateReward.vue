<template>
  <el-dialog
    :visible.sync="visiblesync"
    :close-on-click-modal="false"
    @closed="closed"
  >
    <el-form ref="rulesForm" :model="form" :rules="rules" label-width="100px">
      <el-form-item label="奖励名称" prop="award_name">
        <el-input v-model="form.award_name"></el-input>
      </el-form-item>
      <el-form-item label="财富类型" prop="asset_type">
        <el-select v-model="form.asset_type">
          <el-option
            v-for="option in selectOptions"
            filterable
            allow-create
            :key="option.value"
            :label="option.name"
            :value="option.value"
          >
            <span style="float: left; margin-right: 20px">{{
              option.name
            }}</span>
            <span style="float: right; color: #8492a6; font-size: 13px">{{
              option.value
            }}</span></el-option
          >
        </el-select>
      </el-form-item>
      <el-form-item label="数量" prop="asset_count">
        <el-input v-model="form.asset_count"></el-input>
      </el-form-item>
      <el-form-item
        v-if="rewardType === 'random'"
        label="权重"
        prop="get_weight"
      >
        <el-input v-model="form.get_weight"></el-input>
      </el-form-item>
      <el-form-item label="广播">
        <el-switch
          v-model="form.broadcast_content"
          :active-value="1"
          :inactive-value="0"
        >
        </el-switch>
      </el-form-item>
      <el-form-item label="邮件">
        <el-switch
          v-model="form.is_send_email"
          :active-value="1"
          :inactive-value="0"
        >
        </el-switch>
      </el-form-item>
    </el-form>
    <template #footer>
      <DialogFooter @resolve="submit" @reject="visiblesync = false" />
    </template>
  </el-dialog>
</template>
<script lang="ts">
import { Component, Prop, PropSync, Vue, Watch } from 'vue-property-decorator';
import { cloneDeep } from 'lodash';
import { Form } from 'element-ui';
import { resolve } from 'path';

import DialogFooter from '@/components/DialogFooter.vue';
import { readFileText } from '@/utils/fileSystem';
import { configDir } from '@/asserts/dir-config';

const form: Record<string, any> = {
  award_name: '',
  asset_type: '',
  asset_count: '',
  get_weight: '',
  broadcast_content: false,
  is_send_email: false,
};

const filePath = resolve(configDir, 'app_config', 'input-manage.json');

@Component({
  components: { DialogFooter },
})
export default class UpdateReward extends Vue {
  $refs!: {
    rulesForm: Form;
  };

  @Prop({ type: Object, default: () => cloneDeep(form) }) propRow!: Record<
    string,
    any
  >;
  @Prop({ type: String, required: true }) rewardType!: string;
  @PropSync('visible', { type: Boolean, required: true }) visiblesync!: boolean;

  form = cloneDeep(form);
  rules = {};
  selectOptions: Record<string, string>[] = [];

  created(): void {
    const data: Record<string, any>[] = readFileText(filePath);
    const object = data.find((item) => item.value === 'asset');
    if (object) {
      this.selectOptions = object.select;
    }
  }

  @Watch('propRow', { immediate: true })
  propRowChange(object: Record<string, any>): void {
    if (object) {
      this.form = cloneDeep(object);
    } else {
      this.form = cloneDeep(form);
    }
  }

  submit(): void {
    this.$emit('submit', cloneDeep(this.form));
    this.visiblesync = false;
  }

  closed(): void {
    this.$refs.rulesForm.resetFields();
  }
}
</script>
