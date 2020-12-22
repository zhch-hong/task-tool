<template>
  <el-dialog
    :visible.sync="visiblesync"
    :close-on-click-modal="false"
    :title="title"
    @closed="closed"
    width="25vw"
  >
    <el-form ref="ruleForm" :model="form" :rules="rules" label-width="80px">
      <el-form-item label="字段值" prop="value">
        <el-input v-model="form.value"></el-input>
      </el-form-item>
      <el-form-item label="字段说明" prop="label">
        <el-input v-model="form.label"></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <DialogFooter @reject="visiblesync = false" @resolve="submit" />
    </template>
  </el-dialog>
</template>
<script lang="ts">
import { Component, Prop, PropSync, Vue, Watch } from 'vue-property-decorator';
import { Form } from 'element-ui';

import DialogFooter from '@/components/DialogFooter.vue';

@Component({
  components: {
    DialogFooter,
  },
})
export default class UpdateNode extends Vue {
  $refs!: {
    ruleForm: Form;
  };

  @Prop({ type: String, required: true }) model!: 'append' | 'update';
  @Prop({ type: Object, required: true })
  node!: Record<string, string>;
  @PropSync('visible', { type: Boolean, required: true }) visiblesync!: boolean;

  get title(): string {
    return this.model === 'append' ? '添加字段' : '修改字段';
  }

  @Watch('model')
  modelChange(): void {
    this.refreshForm();
  }
  @Watch('node')
  nodeChange(): void {
    this.refreshForm();
  }

  form: Record<string, string> = {
    value: '',
    label: '',
  };
  rules = {
    value: [{ required: true, trigger: 'none' }],
    label: [{ required: true, trigger: 'none' }],
  };

  async submit(): Promise<void> {
    try {
      await this.$refs.ruleForm.validate();
    } catch (error) {
      return;
    }

    this.$emit('submit', this.form);
    this.visiblesync = false;
  }

  refreshForm(): void {
    const value = this.model;
    if (value === 'update') {
      this.form.value = this.node.id;
      this.form.label = this.node.label;
    } else {
      this.form.value = '';
      this.form.label = '';
    }
  }

  closed(): void {
    this.$refs.ruleForm.resetFields();
  }
}
</script>
