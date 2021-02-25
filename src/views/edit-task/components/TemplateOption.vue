<template>
  <div style="margin-bottom: 20px; margin-left: 100px">
    <el-select
      v-model="templateValue"
      style="margin-right: 20px"
      placeholder="使用模板数据"
      @change="templateChange"
      clearable
    >
      <el-option v-for="temp in templateList" :key="temp.uuid" :label="temp.name" :value="temp.uuid"></el-option>
    </el-select>
    <el-button v-if="templateValue" @click="onclickUpdate">更新模板</el-button>
    <el-button @click="onclickSave">保存模板</el-button>
  </div>
</template>
<script lang="ts">
import { TemplateType } from '@/shims-type';
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
import { resolve } from 'path';
import { v4 as uuid } from 'uuid';
import { cloneDeep } from 'lodash';

import { readFileText, writeFileText } from '@/utils';
import store from '@/electron-store';

const path = resolve(resolve(store.get('configDir') as string, 'app_config'), `template-manage.json`);

function readTemplate(type: TemplateType): Record<string, any>[] {
  const object = readFileText(path);
  return object[type];
}

function writeTemplate(type: TemplateType, data: Record<string, any>[]): void {
  const object: Record<string, Record<string, any>[]> = readFileText(path);
  object[type] = data;
  writeFileText(path, object);
}

@Component
export default class TemplateOption extends Vue {
  @Prop() uuid?: string;
  @Prop({ type: String, required: true }) templateType!: TemplateType;

  templateValue = '';
  templateName = '';
  templateList: Record<string, any>[] = [];

  @Watch('uuid')
  uuidWatch(value: string): void {
    this.templateValue = value.split('|')[0];
  }

  @Watch('templateType')
  typeWatch(value: TemplateType): void {
    this.templateList = readTemplate(value);
  }

  created(): void {
    this.refreshTemplate();

    if (this.uuid) this.templateValue = this.uuid;
  }

  refreshTemplate(): void {
    this.templateList = readTemplate(this.templateType);
  }

  templateChange(value: string): void {
    const temp = this.templateList.find((temp) => temp.uuid === value);

    if (temp) {
      this.$emit('template-data', cloneDeep(temp.data));
      this.$emit('template-uuid', value + '|' + temp.name);
    } else {
      this.$emit('template-uuid', '');
    }
  }

  writeTempBefore(data: any): Record<string, any> | undefined {
    let tempData: any = null;

    if (this.templateType === 'base') {
      delete data.id;
      delete data.process_id;
      tempData = data;
    }
    if (this.templateType === 'process') {
      const process: Record<string, any> = data.process;
      delete process.id;
      delete process.process_id;
      delete process.source_id;
      delete process.awards;

      const processArray: string[] = [];
      const awards: Record<string, string>[][] = [];
      const award: Record<string, any>[] = data.award;
      award.forEach((awa) => {
        processArray.push(awa.process);
        const awardList: Record<string, string>[] = awa.awards;
        const _array = awardList.map((item) => {
          delete item.award_id;
          delete item.id;
          return item;
        });
        awards.push(_array);
      });

      if (data.lastLoop) processArray.push('-1');
      process.process = processArray.join(',');

      tempData = {
        process,
        awards,
      };
    }
    if (this.templateType === 'source') {
      const source: Record<string, string | number>[] = [];
      const condition: Record<string, string | number>[][] = [];

      data.forEach((item: Record<string, any>) => {
        const sourceItem: Record<string, string | number> = item.source;
        const conditionItem: Record<string, string | number>[] = item.condition;

        delete sourceItem.id;
        delete sourceItem.condition_id;
        delete sourceItem.source_id;

        conditionItem.forEach((cond) => delete cond.condition_id);

        source.push(sourceItem);
        condition.push(conditionItem);
      });

      tempData = { source, condition };
    }

    return {
      uuid: uuid(),
      name: this.templateName,
      data: tempData,
    };
  }

  onclickUpdate(): void {
    this.$emit('update-template', this.updateTemplate);
  }

  updateTemplate(data: any): void {
    const index = this.templateList.findIndex((temp) => temp.uuid === this.templateValue);
    if (index !== -1) {
      const object = this.writeTempBefore(data);
      if (object) {
        object.uuid = this.templateList[index].uuid;
        object.name = this.templateList[index].name;

        this.templateList.splice(index, 1, object);
        writeTemplate(this.templateType, this.templateList);
      }
    }
  }

  async onclickSave(): Promise<void> {
    try {
      const res: any = await this.$prompt('请输入模板名称', '保存模板', {
        type: 'info',
      });
      this.templateName = res.value;
      this.$emit('save-template', this.saveTemplate);
    } catch (error) {
      //
    }
  }

  saveTemplate(data: Record<string, any>): void {
    const object = this.writeTempBefore(data);

    if (object) {
      this.templateList.push(object);
      writeTemplate(this.templateType, this.templateList);

      this.$nextTick(() => {
        this.refreshTemplate();

        this.templateValue = object.uuid;

        this.$emit('template-uuid', object.uuid + '|' + object.name);
      });
    }
  }
}
</script>
