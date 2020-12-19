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
      @node-click="nodeClick"
    >
      <template #default="{ data }">
        <span>{{ nameSlice(data) }}</span>
      </template>
    </el-tree>
    <el-button @click="getCheckedNodes">getCheckedNodes</el-button>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import { Workbook } from 'exceljs';
import { v4 as uuid } from 'uuid';
import { resolve } from 'path';
import { readFileSync } from 'fs';
import { Tree } from 'element-ui';
import { TreeData, TreeNode } from 'element-ui/types/tree';
import { getUserconfig } from '@/asserts/userconfig';
import {
  readExcelToMap,
  getSheet,
  getTreeDataDefault,
  writeMapToExcel,
  readFileText,
  sheet2json,
  updateBase,
  updateProcess,
  updateSource,
} from '@/utils';

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

function treedataMap(pathList: string[]): Promise<Record<string, any>> {
  return new Promise((resolve) => {
    const uuidMap: Record<string, any> = {};
    pathList.forEach(async (path, index) => {
      const workbook = new Workbook();
      const buffer = readFileSync(path);
      await workbook.xlsx.load(buffer);
      const sheet = getSheet(workbook, 'task');
      if (sheet) {
        const json = sheet2json(sheet);
        json.forEach((task) => {
          const { base_temp, process_temp, source_temp } = task;

          if (base_temp) {
            const baseid = base_temp.split('|')[0];
            const baseidMap = uuidMap[baseid];

            if (baseidMap) {
              const res = baseidMap.find(
                (item: Record<string, any>) => item.name === path
              );
              if (res) {
                res.children.push({
                  uuid: uuid(),
                  type: 'task',
                  name: `${task.name}@${task.id}`,
                });
              } else {
                const object = {
                  uuid: uuid(),
                  name: path,
                  type: 'path',
                  children: [
                    {
                      uuid: uuid(),
                      type: 'task',
                      name: `${task.name}@${task.id}`,
                    },
                  ],
                };
                baseidMap.push(object);
              }
            } else {
              const object = {
                uuid: uuid(),
                name: path,
                type: 'path',
                children: [
                  {
                    uuid: uuid(),
                    type: 'task',
                    name: `${task.name}@${task.id}`,
                  },
                ],
              };
              uuidMap[baseid] = [object];
            }
          }

          if (process_temp) {
            const processid = process_temp.split('|')[0];
            const processidMap = uuidMap[processid];

            if (processidMap) {
              const res = processidMap.find(
                (item: Record<string, any>) => item.name === path
              );
              if (res) {
                res.children.push({
                  uuid: uuid(),
                  type: 'task',
                  name: `${task.name}@${task.id}`,
                });
              } else {
                const object = {
                  uuid: uuid(),
                  name: path,
                  type: 'path',
                  children: [
                    {
                      uuid: uuid(),
                      type: 'task',
                      name: `${task.name}@${task.id}`,
                    },
                  ],
                };
                processidMap.push(object);
              }
            } else {
              const object = {
                uuid: uuid(),
                name: path,
                type: 'path',
                children: [
                  {
                    uuid: uuid(),
                    type: 'task',
                    name: `${task.name}@${task.id}`,
                  },
                ],
              };
              uuidMap[processid] = [object];
            }
          }

          if (source_temp) {
            const sourceid = source_temp.split('|')[0];
            const sourceidMap = uuidMap[sourceid];

            if (sourceidMap) {
              const res = sourceidMap.find(
                (item: Record<string, any>) => item.name === path
              );
              if (res) {
                res.children.push({
                  uuid: uuid(),
                  type: 'task',
                  name: `${task.name}@${task.id}`,
                });
              } else {
                const object = {
                  uuid: uuid(),
                  name: path,
                  type: 'path',
                  children: [
                    {
                      uuid: uuid(),
                      type: 'task',
                      name: `${task.name}@${task.id}`,
                    },
                  ],
                };
                sourceidMap.push(object);
              }
            } else {
              const object = {
                uuid: uuid(),
                name: path,
                type: 'path',
                children: [
                  {
                    uuid: uuid(),
                    type: 'task',
                    name: `${task.name}@${task.id}`,
                  },
                ],
              };
              uuidMap[sourceid] = [object];
            }
          }
        });
      }
      if (index === pathList.length - 1) {
        resolve(uuidMap);
      }
    });
  });
}

async function readTemplate() {
  const treedata: any = getTreeDataDefault();
  const pathList: string[] = [];
  flatTreedata(treedata, pathList);

  const treeMap: Record<string, any> = await treedataMap(pathList);

  const uuidList: string[] = [];

  const path = resolve(resolve(workDir, 'app_config'), `template-manage.json`);
  const object: Record<string, Record<string, any>[]> = readFileText(path);
  for (const key in object) {
    if (Object.prototype.hasOwnProperty.call(object, key)) {
      const element = object[key];
      element.forEach((el) => {
        uuidList.push(el.uuid);
        el['type'] = 'name';
        el['children'] = treeMap[el.uuid];
      });
    }
  }

  const data = [
    {
      uuid: uuid(),
      type: 'type',
      value: 'base',
      name: '任务模板',
      children: object.base,
    },
    {
      uuid: uuid(),
      type: 'type',
      value: 'process',
      name: '过程模板',
      children: object.process,
    },
    {
      uuid: uuid(),
      type: 'type',
      value: 'source',
      name: '来源模板',
      children: object.source,
    },
  ];
  return data;
}

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
    isLeaf: (data: any, node: any) => {
      return false;
    },
  };

  @Watch('filterText')
  textWatch(value: string): void {
    this.$refs.tree.filter(value);
  }

  created(): void {
    readTemplate().then((data) => {
      this.treedata = data;
    });
  }

  nodeClick(data: any, node: any): void {
    console.log(data, node);
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
      writeMapToExcel(map, path);

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
