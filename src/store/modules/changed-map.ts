import {
  Action,
  getModule,
  Module,
  Mutation,
  VuexModule,
} from 'vuex-module-decorators';
import { WorkbookMap } from '@/shims-cust';
import { WorkspacedModule } from './workspaced';
import { writeChanged } from '@/utils';
import store from '@/store';

@Module({ dynamic: true, store, name: 'changedMap' })
class ChangedMap extends VuexModule {
  public readonly changedMap: Map<string, WorkbookMap> = new Map();

  @Mutation
  private APPEND(payload: { path: string; data: WorkbookMap }): void {
    const { data, path } = payload;
    this.changedMap.set(path, data);
  }

  @Action
  public Append(payload: { path: string; data: WorkbookMap }): void {
    const { data, path } = payload;

    // 添加到已改变的数据Map
    this.APPEND(payload);

    // 更新工作空间中的数据
    WorkspacedModule.UpdateWorkbookmap(payload);
    // 当已改变的数据Map写入到本地磁盘完成后，清空已改变的数据Map
    writeChanged()
      .then(() => {
        this.changedMap.clear();
      })
      .catch((error: Error) => {
        throw error;
      });
  }
}

export const ChangedMapModule = getModule(ChangedMap);
