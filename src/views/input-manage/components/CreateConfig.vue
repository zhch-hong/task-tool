<template>
  <div>
    <div style="text-align: right">
      <el-button
        type="primary"
        @click="visiblesync = true"
        style="margin: 20px 20px 0 0"
        >添加</el-button
      >
    </div>
    <el-dialog :visible.sync="visiblesync" title="添加类型" @closed="closed">
      <el-form ref="ruleForm" label-position="top" :model="form" :rules="rules">
        <el-form-item label="字段" prop="value">
          <el-input v-model="form.value"></el-input>
        </el-form-item>
        <el-form-item label="说明" prop="name">
          <el-input v-model="form.name"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <DialogFooter @reject="visiblesync = false" @resolve="submit" />
      </template>
    </el-dialog>
  </div>
</template>
<script lang="ts">
import { Component, PropSync, Vue } from 'vue-property-decorator';
import { Form } from 'element-ui';
import { cloneDeep } from 'lodash';

import DialogFooter from '@/components/DialogFooter.vue';

@Component({
  components: {
    DialogFooter,
  },
})
export default class CreateConfig extends Vue {
  $refs!: {
    ruleForm: Form;
  };

  @PropSync('visible', { type: Boolean, required: true }) visiblesync!: boolean;

  form = {
    name: '',
    value: '',
  };
  rules = {
    name: [{ required: true, trigger: 'none' }],
    value: [{ required: true, trigger: 'none' }],
  };

  async submit(): Promise<void> {
    try {
      await this.$refs.ruleForm.validate();
      this.$emit('submit', cloneDeep(this.form));
      this.visiblesync = false;
    } catch (error) {
      return;
    }
  }

  closed(): void {
    this.$refs.ruleForm.resetFields();
  }
}
</script>
