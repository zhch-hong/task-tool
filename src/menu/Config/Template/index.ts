import _ from 'lodash';
import Vue from 'vue';
import store from '@/electron-store';
import { WorkspacedModule } from '@/store/modules/workspaced';
import { ChangedMapModule } from '@/store/modules/changed-map';
import { updateBase, updateProcess, updateSource } from '@/utils';

function writeTemplate(nodes: any, type: string) {
  const array: Record<string, any>[] = [];
  nodes.forEach((node: any) => {
    const taskid = node.data.name.split('@')[1];
    const path = node.parent?.data.name;
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
    const path = item.path;
    const map = await WorkspacedModule.bookMapByPath(path);
    const list: Record<string, any>[] = item.list;

    list.forEach((t) => {
      const id: string = t.id;
      const type: string = t.type;
      const data: Record<string, any> = _.cloneDeep(t.data);

      if (type === 'base') updateBase(map, id, data);
      if (type === 'process') updateProcess(map, id, data);
      if (type === 'source') updateSource(map, id, data);
    });

    ChangedMapModule.Append({ path, data: map });

    if (index === array.length - 1) {
      Vue.notify({
        group: 'app',
        type: 'success',
        text: '模板数据应用完成',
      });
    }
  });
}

export { writeTemplate };
export { taskBase } from './TaskBase';
export { taskProcess } from './TaskProcess';
export { taskSource } from './TaskSource';
