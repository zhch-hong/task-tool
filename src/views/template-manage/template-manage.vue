<template>
  <div>
    <el-input placeholder="输入关键字进行过滤" v-model="filterText"> </el-input>
    <el-tree
      :data="treedata"
      :props="treeProps"
      :filter-node-method="filterNode"
      ref="tree"
      node-key="uuid"
      show-checkbox
      default-expand-all
    >
      <template #default="{ data }">
        <span>{{ nameSlice(data) }}</span>
      </template>
    </el-tree>
    <el-button type="primary" @click="getCheckedNodes">应用模板数据</el-button>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import { Tree } from 'element-ui';
import { TreeData, TreeNode } from 'element-ui/types/tree';
import { getUserconfig } from '@/asserts/userconfig';
import { fullData } from './full-data';
import {
  readExcelToMap,
  updateBase,
  updateProcess,
  updateSource,
} from '@/utils';
import { ChangedMapModule } from '@/store/modules/changed-map';
import { NProgress } from '@/plugins/nprogress';
import nProgress from 'nprogress';

interface TreeMeta extends TreeData {
  uuid: string;
  type: 'type' | 'name' | 'path' | 'task';
  value: 'base' | 'process' | 'source';
  name: string;
  path?: string;
  data?: Record<string, any>;
  children?: TreeMeta[];
}

const workDir: string = getUserconfig().workDir;

@Component
export default class TemplateManage extends Vue {
  $refs!: {
    tree: Tree<string, TreeMeta>;
  };

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

  async mounted(): Promise<void> {
    NProgress.start();
    await this.$nextTick();
    fullData().then(async (data) => {
      this.treedata = data;
      await this.$nextTick();
      nProgress.done();
    });
  }

  filterNode(value: string, data: Record<string, string>): any {
    if (value === '') return true;

    if (data.type !== 'task') return true;

    return data.name.includes(value);
  }

  getCheckedNodes(): void {
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
      const map = await readExcelToMap(path);
      const list: Record<string, any>[] = item.list;
      list.forEach((t) => {
        const id: string = t.id;
        const type: string = t.type;
        const data: Record<string, any> = t.data;

        if (type === 'base') updateBase(map, id, data);
        if (type === 'process') updateProcess(map, id, data);
        if (type === 'source') updateSource(map, id, data);
      });
      ChangedMapModule.Append({ path, data: map });

      if (index === array.length - 1) {
        this.$notify({
          title: '文件更新完成',
          message: '所选任务已全部使用模板数据',
          type: 'success',
          position: 'bottom-right',
        });
      }
    });
  }

  nameSlice(data: TreeMeta): string {
    if (data.type === 'path') return data.name.slice(workDir.length + 1);
    return data.name;
  }
}
</script>
