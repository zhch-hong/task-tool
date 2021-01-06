import {
  Action,
  getModule,
  Module,
  Mutation,
  VuexModule,
} from 'vuex-module-decorators';
import { readExcelToMap } from '@/utils';
import { WorkbookMap } from '@/shims-cust';
import store from '@/store';

@Module({ dynamic: true, store, name: 'workspaced' })
class Workspaced extends VuexModule {
  private dirMap: Map<string, WorkbookMap> = new Map();

  @Mutation
  private UPDATE_WORKBOOKMAP(payload: {
    path: string;
    data: WorkbookMap;
  }): void {
    const { data, path } = payload;
    this.dirMap.set(path, data);
  }

  @Action
  public UpdateWorkbookmap(payload: { path: string; data: WorkbookMap }): void {
    this.UPDATE_WORKBOOKMAP(payload);
  }

  public get bookMapByPath(): (path: string) => Promise<WorkbookMap> {
    return (path: string) => {
      const map = this.dirMap.get(path);
      if (map) {
        return Promise.resolve(map);
      }

      return new Promise<WorkbookMap>((resolve, reject) => {
        readExcelToMap(path)
          .then((data) => {
            this.dirMap.set(path, data);
            resolve(data);
          })
          .catch((error) => reject(error));
      });
    };
  }
}

export const WorkspacedModule = getModule(Workspaced);