<template>
  <div style="margin: 20px">
    <el-tabs v-model="activeName">
      <el-tab-pane label="任务获得类型" name="type">
        <tab-item :table-data="typeData" @update-data="updateType" />
      </el-tab-pane>
      <el-tab-pane label="任务枚举类型" name="enum">
        <tab-item :table-data="enumData" @update-data="updateEnum" />
      </el-tab-pane>
      <el-tab-pane label="财富类型" name="asset">
        <tab-item :table-data="assetData" @update-data="updateAsset" />
      </el-tab-pane>
    </el-tabs>
    <CreateConfig
      :visible="createConfig"
      @update:visible="(v) => (createConfig = v)"
      @submit="appendRow"
    />
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { resolve } from 'path';
import { v4 as uuid } from 'uuid';

import { readFileText, writeFileText } from '@/utils/fileSystem';

import TabItem from './components/TabItem.vue';
import CreateConfig from './components/CreateConfig.vue';
import { configDir } from '@/asserts/dir-config';

const path = resolve(configDir, 'app_config', 'input-manage.json');

@Component({
  components: {
    TabItem,
    CreateConfig,
  },
})
export default class InputManage extends Vue {
  activeName: 'type' | 'enum' | 'asset' = 'type';

  data: Record<string, any>[] = readFileText(path);

  typeData: Record<string, string>[] = [];
  enumData: Record<string, string>[] = [];
  assetData: Record<string, string>[] = [];

  createConfig = false;

  created(): void {
    this.data.forEach((object) => {
      const select: Record<string, string>[] = object.select;
      select.forEach((selc) => (selc['uuid'] = uuid()));
      if (object.value === 'type') this.typeData = select;
      if (object.value === 'enum') this.enumData = select;
      if (object.value === 'asset') this.assetData = select;
    });
  }

  appendRow(payload: Record<string, string>): void {
    if (this.activeName === 'type') {
      this.typeData.push({
        name: payload.name,
        value: payload.value,
        uuid: uuid(),
      });
      const typeList = this.data.find((item) => item.value === 'type');
      if (typeList) typeList.select = this.typeData;
    } else if (this.activeName === 'enum') {
      this.enumData.push({
        name: payload.name,
        value: payload.value,
        uuid: uuid(),
      });
      const enumList = this.data.find((item) => item.value === 'enum');
      if (enumList) enumList.select = this.enumData;
    } else if (this.activeName === 'asset') {
      this.assetData.push({
        name: payload.name,
        value: payload.value,
        uuid: uuid(),
      });
      const assetList = this.data.find((item) => item.value === 'asset');
      if (assetList) assetList.select = this.assetData;
    }

    this.writeFile();
  }

  updateType(data: Record<string, string>[]): void {
    const res = this.data.find((item) => item.value === 'type');
    if (res) {
      res.select = data;
      this.writeFile();
    }
    //
  }

  updateEnum(data: Record<string, string>[]): void {
    const res = this.data.find((item) => item.value === 'enum');
    if (res) {
      res.select = data;
      this.writeFile();
    }
    //
  }

  updateAsset(data: Record<string, string>[]): void {
    const res = this.data.find((item) => item.value === 'asset');
    if (res) {
      res.select = data;
      this.writeFile();
    }
    //
  }

  writeFile(): void {
    this.data.forEach((item) => {
      item.select.forEach(
        (object: Record<string, string>) => delete object.uuid
      );
    });
    writeFileText(path, this.data);
  }
}
</script>
