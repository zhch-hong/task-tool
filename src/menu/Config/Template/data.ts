import { v4 as uuid } from 'uuid';
import { DATA_MEMORY } from '@/utils';
import { WorkspacedModule } from '@/store/modules/workspaced';
import { ConfigFilesModule } from '@/store/modules/config-files';

function flatTreedata(params: any[], pathList: string[]) {
  params.forEach((item) => {
    if (item.path?.endsWith('.xlsx') || item.path?.endsWith('.xls')) {
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
              const res = baseidMap.find((item: Record<string, any>) => item.name === path);
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
              const res = processidMap.find((item: Record<string, any>) => item.name === path);
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
              const res = sourceidMap.find((item: Record<string, any>) => item.name === path);
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
  const treedata = DATA_MEMORY;

  const pathList: string[] = [];
  flatTreedata(treedata, pathList);

  const treeMap: Record<string, any> = await treedataMap(pathList);

  const uuidList: string[] = [];

  const object = ConfigFilesModule.templateData;
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
