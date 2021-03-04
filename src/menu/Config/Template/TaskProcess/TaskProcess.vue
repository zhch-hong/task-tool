<template>
  <el-cascader-panel ref="CascaderPanel" :options="data" :props="{ label: 'name', value: 'uuid', multiple: true }">
    <template #default="{ data }">
      <span v-if="data.type === 'path'" :title="data.name">{{ formatPath(data.name) }}</span>
      <span v-else-if="data.type === 'task'" v-html="formatTask(data.name)" :title="formatTitle(data.name)"></span>
      <span v-else :title="data.name" @contextmenu.stop.prevent="contextmenu(data)">{{ data.name }}</span>
    </template>
  </el-cascader-panel>
</template>
<script lang="ts">
import Vue from 'vue';
import electron from 'electron';
import store from '@/electron-store';
import { fullData } from '../data';
import { writeTemplate } from '..';
import { WorkspacedModule } from '@/store/modules/workspaced';
import { ChangedMapModule } from '@/store/modules/changed-map';
import { ConfigFilesModule, TEMPLATE_PATH } from '@/store/modules/config-files';
import { writeFileText } from '@/utils';

const workDir = store.get('workDir') as string;

export default Vue.extend({
  data() {
    return {
      data: [] as Record<string, any>[],
    };
  },

  created() {
    this.refreshData();
  },

  methods: {
    refreshData() {
      fullData().then((data) => {
        const _data = data.find((object) => object.value === 'process');
        if (_data) {
          this.data = _data.children;
        }
      });
    },

    getCheckedNodes() {
      const nodes = (this.$refs.CascaderPanel as any).getCheckedNodes(true);
      writeTemplate(nodes, 'process');
    },

    contextmenu(data: Record<string, any>) {
      const { Menu, MenuItem } = electron.remote;
      const menu = new Menu();
      const item = new MenuItem({
        label: '删除模板',
        click: () => {
          this.deleteTemplate(data);
        },
      });

      menu.append(item);
      menu.popup();
    },

    deleteTemplate(data: Record<string, any>): void {
      const { uuid: templateId } = data;
      const object = ConfigFilesModule.templateData;
      const index = object.base.findIndex((el) => el.uuid === templateId);

      if (index !== -1) {
        object.base.splice(index, 1);
      }

      writeFileText(TEMPLATE_PATH, object);

      this.refreshData();

      const TYPE_PARAM = 'process_temp';
      // if (type) {
      //   if (type === 'base') typeParam = 'base_temp';
      //   if (type === 'process') typeParam = 'process_temp';
      //   if (type === 'source') typeParam = 'source_temp';
      // }
      data.children?.forEach((pathNode: any) => {
        const { name: path } = pathNode;
        const taskIdList: string[] = [];
        pathNode.children?.forEach((taskNode: any) => {
          const taskId = taskNode.name.split('@')[1];
          taskIdList.push(taskId);
        });

        this.clearTemplateId(path, TYPE_PARAM, taskIdList);
      });
    },

    async clearTemplateId(path: string, type: string, list: string[]): Promise<void> {
      const map = await WorkspacedModule.bookMapByPath(path);
      const taskList = map.get('process_data')!;

      list.forEach((id) => {
        const task = taskList.find((t) => t.id == id);
        if (task) {
          Object.assign(task, { [type]: null });
        }
      });

      ChangedMapModule.Append({ path, data: map });
    },

    formatPath(path: string) {
      return path.substring(workDir.length + 1).split('.xls')[0];
    },

    formatTask(name: string) {
      const _array = name.split('@');
      return `${_array[0]}【<strong style="color: red">${_array[1]}</strong>】`;
    },

    formatTitle(name: string) {
      const _array = name.split('@');
      return `${_array[0]}【${_array[1]}】`;
    },
  },
});
</script>
