<template>
  <div>
    <el-button @click="visible = true">添加</el-button>
    <el-dialog
      :visible.sync="visible"
      :close-on-click-modal="false"
      @closed="closed"
    >
      <el-form ref="RuleForm" label-position="top">
        <el-form-item label="文件" prop="file">
          <el-input v-model="form.file"></el-input>
        </el-form-item>
        <el-form-item label="起始ID" prop="start">
          <el-input v-model="form.start"></el-input>
        </el-form-item>
        <el-form-item label="截止ID" prop="end">
          <el-input v-model="form.end"></el-input>
        </el-form-item>
        <el-form-item label="说明" prop="desc">
          <el-input v-model="form.desc"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <DialogFooter @resolve="submit" @reject="visible = false" />
      </template>
    </el-dialog>
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { Form } from 'element-ui';

import DialogFooter from '@/components/DialogFooter.vue';

@Component({
  components: {
    DialogFooter,
  },
})
export default class AddConfig extends Vue {
  $refs!: {
    RuleForm: Form;
  };

  visible = false;

  form = {
    file: '',
    start: '',
    end: '',
    desc: '',
  };

  submit(): void {
    this.$emit('add-config', this.form);
    this.visible = false;
  }

  closed(): void {
    this.$refs.RuleForm.resetFields();
  }
}
</script>
