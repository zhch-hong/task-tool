<template>
  <div>
    <el-input placeholder="输入关键字进行过滤" v-model="filterText"> </el-input>
    <el-tree
      v-if="filterText"
      :data="treedata"
      :props="treeProps"
      :filter-node-method="filterNode"
      :default-expand-all="true"
      ref="treeFull"
      node-key="uuid"
      show-checkbox
    >
      <template #default="{ data }">
        <span style="user-select: none">{{ nameSlice(data) }}</span>
      </template>
    </el-tree>
    <el-tree
      v-else
      :props="treeProps"
      :load="loadNode"
      ref="tree"
      node-key="uuid"
      show-checkbox
      lazy
    >
      <template #default="{ data }">
        <span style="user-select: none">{{ nameSlice(data) }}</span>
      </template>
    </el-tree>
    <el-button type="primary" @click="getCheckedNodes">应用模板数据</el-button>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import { v4 as uuid } from 'uuid';
import { resolve } from 'path';
import { Tree } from 'element-ui';
import { TreeData, TreeNode } from 'element-ui/types/tree';
import { getUserconfig } from '@/asserts/userconfig';
import {
  getTreeDataDefault,
  readFileText,
  updateBase,
  updateProcess,
  updateSource,
} from '@/utils';
import { WorkspacedModule } from '@/store/modules/workspaced';
import { ChangedMapModule } from '@/store/modules/changed-map';
import { fullData } from './full-data';

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

// type name path task

function flatTreedata(params: TreeMeta[], pathList: string[]) {
  params.forEach((item) => {
    if (item.path?.endsWith('.xlsx')) {
      pathList.push(item.path);
    }
    if (item.children && item.children.length !== 0) {
      flatTreedata(item.children, pathList);
    }
  });
}

function readTemplate() {
  const path = resolve(resolve(workDir, 'app_config'), `template-manage.json`);
  const object: Record<string, any> = readFileText(path);
  for (const key in object) {
    if (Object.prototype.hasOwnProperty.call(object, key)) {
      const element: Record<string, any>[] = object[key];
      element.forEach((el) => {
        el['type'] = 'name';
      });
    }
  }
  return object;
}

@Component
export default class TemplateManage extends Vue {
  $refs!: {
    tree: Tree<string, TreeMeta>;
    treeFull: Tree<string, TreeMeta>;
  };

  filterText = '';
  treedata: any[] = [];

  treeProps = {
    label: 'name',
    children: 'children',
    disabled: false,
    isLeaf: (data: TreeMeta, node: TreeNode<string, any>): boolean => {
      if (node.level === 0) return false;

      if (node.level === 1) {
        const template: Record<string, any[]> = readTemplate();
        if (template[data.value].length === 0) return true;
        return false;
      }

      if (node.level === 4) return true;

      return false;
    },
  };

  @Watch('filterText')
  textWatch(value: string): void {
    this.$nextTick(() => {
      fullData().then((data) => {
        this.treedata = data;
        this.$nextTick(() => {
          setTimeout(() => {
            this.$refs.treeFull.filter(value);
          }, 3000);
        });
      });
    });
  }

  loadNode(
    node: TreeNode<string, TreeMeta>,
    resolve: (data: Record<string, string>[]) => void
  ): void {
    if (node.level === 0) {
      resolve([
        {
          uuid: uuid(),
          type: 'type',
          value: 'base',
          name: '任务模板',
        },
        {
          uuid: uuid(),
          type: 'type',
          value: 'process',
          name: '过程模板',
        },
        {
          uuid: uuid(),
          type: 'type',
          value: 'source',
          name: '来源模板',
        },
      ]);
    } else if (node.level === 1) {
      setTimeout(() => {
        const template: Record<string, any[]> = readTemplate();
        resolve(template[node.data.value]);
      }, 0);
    } else if (node.level === 2) {
      setTimeout(() => {
        const tempuuid = node.data.uuid;
        const type = node.parent?.data.value;

        const treedata: any = getTreeDataDefault();
        const pathList: string[] = [];

        flatTreedata(treedata, pathList);

        const pathTree: Record<string, any>[] = [];
        pathList.forEach((path, index) => {
          WorkspacedModule.bookMapByPath(path).then((map) => {
            const taskList = map.get('task');
            if (taskList) {
              let b = false;
              if (type === 'base') {
                b = taskList.some((item) => {
                  if (!item.base_temp) return false;
                  const id = item.base_temp.split('|')[0];
                  return id === tempuuid;
                });
              } else if (type === 'process') {
                b = taskList.some((item) => {
                  if (!item.process_temp) return false;
                  const id = item.process_temp.split('|')[0];
                  return id === tempuuid;
                });
              } else if (type === 'source') {
                b = taskList.some((item) => {
                  if (!item.source_temp) return false;
                  const id = item.source_temp.split('|')[0];
                  return id === tempuuid;
                });
              }
              if (b) {
                pathTree.push({
                  uuid: uuid(),
                  type: 'path',
                  name: path,
                  path: path,
                });
              }
            }

            if (pathList.length - 1 === index) {
              resolve(pathTree);
            }
          });
        });
      }, 0);
    } else if (node.level === 3) {
      setTimeout(() => {
        const taskTree: Record<string, any>[] = [];
        const path = node.data.path;
        const tempid = node.parent?.data.uuid;
        const type = node.parent?.parent?.data.value;
        if (path && tempid && type) {
          WorkspacedModule.bookMapByPath(path)
            .then((map) => {
              const taskList = map.get('task');
              if (taskList) {
                let list: Record<string, string>[] = [];
                if (type === 'base') {
                  list = taskList.filter((item) => {
                    if (!item.base_temp) return false;
                    if (item.base_temp.split('|')[0] === tempid) {
                      if (this.filterText)
                        return item.name.includes(this.filterText);
                      return true;
                    }
                    return false;
                  });
                } else if (type === 'process') {
                  list = taskList.filter((item) => {
                    if (!item.process_temp) return false;
                    if (item.process_temp.split('|')[0] === tempid) {
                      if (this.filterText)
                        return item.name.includes(this.filterText);
                      return true;
                    }
                    return false;
                  });
                } else if (type === 'source') {
                  list = taskList.filter((item) => {
                    if (!item.source_temp) return false;
                    if (item.source_temp.split('|')[0] === tempid) {
                      if (this.filterText)
                        return item.name.includes(this.filterText);
                      return true;
                    }
                    return false;
                  });
                }
                list.forEach((task) => {
                  const object = {
                    name: `${task.name}@${task.id}`,
                    type: 'task',
                    uuid: uuid(),
                  };
                  taskTree.push(object);
                });
                resolve(taskTree);
              } else {
                resolve([]);
              }
            })
            .catch((error: Error) => {
              resolve([]);
              throw error;
            });
        } else {
          resolve([]);
        }
      }, 0);
    } else {
      resolve([]);
    }
  }

  filterNode(value: string, data: Record<string, string>): any {
    console.log(data);

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

    array.forEach(async (item) => {
      const path: string = item.path;
      const map = await WorkspacedModule.bookMapByPath(path);

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
    });
  }

  nameSlice(data: TreeMeta): string {
    if (data.type === 'path') return data.name.slice(workDir.length + 1);
    return data.name;
  }
}
</script>
