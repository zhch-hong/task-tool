import { TreeData } from 'element-ui/types/tree';
import { Workbook } from 'exceljs';
import { v4 as uuid } from 'uuid';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import {
  getSheet,
  getTreeDataDefault,
  readFileText,
  sheet2json,
} from '@/utils';
import { getUserconfig } from '@/asserts/userconfig';
import { WorkspacedModule } from '@/store/modules/workspaced';

interface TreeMeta extends TreeData {
  uuid: string;
  type: 'type' | 'name' | 'path' | 'task';
  value: 'base' | 'process' | 'source';
  name: string;
  path?: string;
  data?: Record<string, any>;
  children?: TreeMeta[];
}

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
      const map = await WorkspacedModule.bookMapByPath(path);
      const json = map.get('task');
      if (json) {
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

export async function fullData() {
  const treedata: any = getTreeDataDefault();
  const pathList: string[] = [];
  flatTreedata(treedata, pathList);

  const treeMap: Record<string, any> = await treedataMap(pathList);

  const uuidList: string[] = [];

  const workDir: string = getUserconfig().workDir;
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
  return Promise.resolve(data);
}
