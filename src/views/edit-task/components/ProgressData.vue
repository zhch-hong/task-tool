<template>
  <fieldset>
    <legend>进度配置</legend>
    <TemplateOption
      template-type="process"
      @template-data="templateData"
      @template-uuid="(v) => $emit('template-uuid', v)"
      @update-template="updateTemplate"
      @save-template="saveTemplate"
    />
    <el-form label-width="100px">
      <el-form-item label="奖励方式">
        <el-radio v-model="processForm.get_award_type" label="nor"
          >普通</el-radio
        >
        <el-radio v-model="processForm.get_award_type" label="random"
          >随机</el-radio
        >
      </el-form-item>
      <el-form-item label="循环最后阶段">
        <el-switch v-model="lastLoop"> </el-switch>
      </el-form-item>
      <el-form-item label="初始进度">
        <el-input v-model.trim="processForm.pre_add_process"> </el-input>
      </el-form-item>
    </el-form>
    <ProgressLine
      ref="progressLine"
      :process="process"
      :awards="awards"
      :reward-type="processForm.get_award_type"
    />
  </fieldset>
</template>
<script lang="ts">
import { stringify } from '@/utils';
import { cloneDeep } from 'lodash';
import { Component, Prop, Vue } from 'vue-property-decorator';

import ProgressLine from './progress-data/ProgressLine.vue';
import TemplateOption from './TemplateOption.vue';

const process = {
  id: '',
  process_id: '',
  condition_type: '',
  source_id: '',
  condition_id: '',
  process: '',
  pre_add_process: '',
  awards: '',
  get_award_type: 'nor',
  is_auto_get_award: '',
};

@Component({
  components: {
    ProgressLine,
    TemplateOption,
  },
})
export default class ProgressData extends Vue {
  $refs!: {
    progressLine: any;
  };

  @Prop() processData!: Record<string, string> | null;
  @Prop({ type: Array, required: true }) awardData!: Record<string, string>[][];

  processForm = cloneDeep(process);

  lastLoop = false;
  process: string[] | null = null;
  awards = this.awardData;

  created(): void {
    if (this.processData) {
      Object.assign(this.processForm, this.processData);

      const _process = this.processData.process.split(',');
      this.lastLoop = _process[_process.length - 1] === '-1';
      if (this.lastLoop) this.process = _process.slice(0, _process.length - 1);
      else this.process = _process;
    }
  }

  submit(): void {
    const lineData: Record<string, any>[] = this.$refs.progressLine.submit();
    this.$emit('submit', {
      process: this.processForm,
      award: lineData,
      lastLoop: this.lastLoop,
    });
  }

  templateData(data: Record<string, any>): void {
    const processArray: string[] = data.process.process.split(',');
    if (processArray[processArray.length - 1] === '-1') {
      this.lastLoop = true;
      processArray.pop();
      this.process = processArray;
    } else {
      this.process = processArray;
    }
    delete data.process.process;
    Object.assign(this.processForm, data.process);
    this.awards = data.awards;
  }

  updateTemplate(method: (data: Record<string, any>) => void): void {
    const object = {
      process: this.processForm,
      award: this.$refs.progressLine.submit(),
      lastLoop: this.lastLoop,
    };
    method(cloneDeep(object));
  }

  saveTemplate(method: (data: Record<string, any>) => void): void {
    const object = {
      process: this.processForm,
      award: this.$refs.progressLine.submit(),
      lastLoop: this.lastLoop,
    };
    method(cloneDeep(object));
  }
}
</script>
