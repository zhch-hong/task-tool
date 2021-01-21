<template>
  <div style="margin: 20px; width: 500px">
    <el-input
      v-model="filterText"
      style="width: 400px; margin-bottom: 20px"
      placeholder="输入关键字进行过滤"
    >
    </el-input>
    <el-tree
      :data="treedata"
      :props="treeProps"
      :filter-node-method="filterNode"
      ref="tree"
      node-key="uuid"
      show-checkbox
    >
      <template #default="{ data, node }">
        <NodeItem
          :tree-node="node"
          :tree-data="data"
          @remove="deleteTemplate(data, node)"
        >
          <span style="user-select: none">{{ nameSlice(data) }}</span>
        </NodeItem>
      </template>
    </el-tree>
    <el-button
      :loading="loading"
      type="primary"
      style="margin-top: 20px"
      @click="getCheckedNodes"
      >应用模板数据</el-button
    >
  </div>
</template>
<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import { resolve } from 'path';
import { Tree } from 'element-ui';
import { TreeData, TreeNode } from 'element-ui/types/tree';
import { fullData } from './full-data';
import {
  readFileText,
  updateBase,
  updateProcess,
  updateSource,
  writeFileText,
} from '@/utils';
import { ChangedMapModule } from '@/store/modules/changed-map';
import { NProgress } from '@/plugins/nprogress';
import nProgress from 'nprogress';

import NodeItem from './components/NodeItem.vue';
import { WorkspacedModule } from '@/store/modules/workspaced';
import { cloneDeep } from 'lodash';
import { configDir, workDir } from '@/asserts/dir-config';

interface TreeMeta extends TreeData {
  uuid: string;
  type: 'type' | 'name' | 'path' | 'task';
  value: 'base' | 'process' | 'source';
  name: string;
  path?: string;
  data?: Record<string, any>;
  children?: TreeMeta[];
}

@Component({
  components: {
    NodeItem,
  },
})
export default class TemplateManage extends Vue {
  $refs!: {
    tree: Tree<string, TreeMeta>;
  };

  loading = false;
  filterText = '';
  treedata: any[] = [];
  treeProps = {
    label: 'name',
    children: 'children',
    disabled: false,
  };

  @Watch('filterText')
  textWatch(value: string): void {
    this.$refs.tree.filter(value);
  }

  mounted(): void {
    this.refreshTreeData();
  }

  async refreshTreeData(): Promise<void> {
    NProgress.start();
    await this.$nextTick();
    fullData().then(async (data) => {
      this.treedata = data;
      await this.$nextTick();
      nProgress.done();
    });
  }

  filterNode(value: string, data: Record<string, any>): any {
    if (value === '') return true;

    if (data.type !== 'task') {
      if (data.type === 'path') {
        const b = data.children.some((item: Record<string, string>) =>
          item.name.includes(value)
        );
        return b;
      }
      return true;
    }

    return data.name.includes(value);
  }

  async getCheckedNodes(): Promise<void> {
    this.loading = true;
    await this.$nextTick();

    const nodes = this.$refs.tree.getCheckedNodes(true);
    const array: Record<string, any>[] = [];
    nodes.forEach((data) => {
      const { uuid } = data;
      const node: TreeNode<string, TreeMeta> = this.$refs.tree.getNode(uuid);

      const taskid = node.data.name.split('@')[1];
      const path = node.parent?.data.name;
      const type = node.parent?.parent?.parent?.data.value;
      const temp = node.parent?.parent?.data.data;

      const arrayItem = array.find((item) => item.path === path);
      if (arrayItem) {
        const itemList: Record<string, any>[] = arrayItem.list;
        itemList.push({
          id: taskid,
          type: type,
          data: temp,
        });
      } else {
        const object = {
          path: path,
          list: [
            {
              id: taskid,
              type: type,
              data: temp,
            },
          ],
        };
        array.push(object);
      }
    });

    array.forEach(async (item, index) => {
      const path: string = item.path;
      const map = await WorkspacedModule.bookMapByPath(path);
      const list: Record<string, any>[] = item.list;
      list.forEach((t) => {
        const id: string = t.id;
        const type: string = t.type;
        const data: Record<string, any> = cloneDeep(t.data);

        if (type === 'base') updateBase(map, id, data);
        if (type === 'process') updateProcess(map, id, data);
        if (type === 'source') updateSource(map, id, data);
      });
      ChangedMapModule.Append({ path, data: map });

      if (index === array.length - 1) {
        this.$message.success('模板数据应用完成');
        this.loading = false;
      }
    });
  }

  deleteTemplate(data: TreeMeta, node: TreeNode<string, TreeMeta>): void {
    const { uuid: templateId } = data;

    const type = node.parent?.data.value;
    if (typeof type === 'undefined') return;

    const path = resolve(
      resolve(configDir, 'app_config'),
      `template-manage.json`
    );
    const object: Record<string, Record<string, any>[]> = readFileText(path);

    const index = object[type].findIndex((el) => el.uuid === templateId);

    if (index !== -1) {
      object[type].splice(index, 1);
    }

    writeFileText(path, object);

    this.refreshTreeData();

    let typeParam = '';
    if (type) {
      if (type === 'base') typeParam = 'base_temp';
      if (type === 'process') typeParam = 'process_temp';
      if (type === 'source') typeParam = 'source_temp';
    }
    data.children?.forEach((pathNode) => {
      const { name: path } = pathNode;
      const taskIdList: string[] = [];
      pathNode.children?.forEach((taskNode) => {
        const taskId = taskNode.name.split('@')[1];
        taskIdList.push(taskId);
      });

      this.clearTemplateId(path, typeParam, taskIdList);
    });
  }

  async clearTemplateId(
    path: string,
    type: string,
    list: string[]
  ): Promise<void> {
    const map = await WorkspacedModule.bookMapByPath(path);
    const taskList = map.get('task')!;

    list.forEach((id) => {
      const task = taskList.find((t) => t.id === id);
      if (task) {
        Object.assign(task, { [type]: null });
      }
    });

    ChangedMapModule.Append({ path, data: map });
  }

  nameSlice(data: TreeMeta): string {
    if (data.type === 'path') return data.name.slice(workDir.length + 1);
    return data.name;
  }
}
</script>
