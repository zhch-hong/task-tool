<template>
  <div style="margin-bottom: 20px">
    <el-select v-model="templateValue" @change="templateChange" clearable>
      <el-option
        v-for="temp in templateList"
        :key="temp.uuid"
        :label="temp.name"
        :value="temp.uuid"
      ></el-option>
    </el-select>
    <el-button v-if="templateValue" @click="onclickUpdate">更新模板</el-button>
    <el-button @click="onclickSave">保存模板</el-button>
  </div>
</template>
<script lang="ts">
import { TemplateType } from '@/shims-vue';
import { Vue, Component, Prop } from 'vue-property-decorator';
import { resolve } from 'path';
import { v4 as uuid } from 'uuid';

import { getUserconfig } from '@/asserts/userconfig';
import { readFile, stringify, writeFile } from '@/utils';

const workDir = getUserconfig().workDir;
const path = resolve(resolve(workDir, 'app_config'), `template-manage.json`);

function readTemplate(type: TemplateType): Record<string, any>[] {
  const object = readFile(path);
  return object[type];
}

function writeTemplate(type: TemplateType, data: Record<string, any>[]): void {
  const object: Record<string, Record<string, any>[]> = readFile(path);
  object[type] = data;
  writeFile(path, object);
}

@Component
export default class TemplateOption extends Vue {
  @Prop({ type: String, required: true }) templateType!: TemplateType;

  templateValue = '';
  templateName = '';
  templateList: Record<string, any>[] = [];

  created(): void {
    this.templateList = readTemplate(this.templateType);
  }

  templateChange(value: string): void {
    const temp = this.templateList.find((temp) => temp.uuid === value);
    if (temp) {
      this.$emit('template-data', temp.data);
      this.$emit('template-uuid', value);
    } else {
      this.$emit('template-uuid', '');
    }
  }

  writeTempBefore(data: Record<string, any>): Record<string, any> | undefined {
    if (this.templateType === 'base') {
      delete data.id;
      delete data.process_id;
      return data;
    }
    if (this.templateType === 'process') {
      const process: Record<string, any> = data.process;
      delete process.id;
      delete process.process_id;
      delete process.source_id;
      delete process.awards;

      const processArray: string[] = [];
      const awardArray: Record<string, string>[][] = [];
      const award: Record<string, any>[] = data.award;
      award.forEach((awa) => {
        processArray.push(awa.process);
        const awardList: Record<string, string>[] = awa.awards;
        if (awardList.length !== 0) {
          const _array = awardList.map((item) => {
            delete item.award_id;
            delete item.id;
            return item;
          });
          awardArray.push(_array);
        }
      });

      if (data.lastLoop) processArray.push('-1');
      process.process = processArray.join(',');

      return {
        process,
        awardArray,
      };
    }
  }

  onclickUpdate(): void {
    this.$emit('update-template', this.updateTemplate);
  }

  updateTemplate(data: Record<string, any>): void {
    const _data = this.writeTempBefore(data);

    const index = this.templateList.findIndex(
      (temp) => temp.uuid === this.templateValue
    );
    if (index !== -1) {
      const object = {
        uuid: this.templateList[index].uuid,
        name: this.templateList[index].name,
        data: _data,
      };
      this.templateList.splice(index, 1, object);
      writeTemplate(this.templateType, this.templateList);
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
    if (this.templateType === 'base') this.saveBaseTemp(data);
    if (this.templateType === 'process') this.saveProcessTemp(data);
  }

  saveBaseTemp(data: Record<string, any>): void {
    console.log(stringify(data));
    const _data = this.writeTempBefore(data);
    const object = {
      uuid: uuid(),
      name: this.templateName,
      data: _data,
    };
    this.templateList.push(object);
    writeTemplate(this.templateType, this.templateList);
  }

  saveProcessTemp(data: Record<string, any>): void {
    console.log(stringify(data));
    const _data = this.writeTempBefore(data);
    if (_data) {
      const object = {
        uuid: uuid(),
        name: this.templateName,
        data: {
          process: _data.process,
          awards: _data.awardArray,
        },
      };
      this.templateList.push(object);
      writeTemplate(this.templateType, this.templateList);
    }
  }
}
</script>
