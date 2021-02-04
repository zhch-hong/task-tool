import { Action, getModule, Module, Mutation, VuexModule } from 'vuex-module-decorators';
import store from '@/store';
import { readExcelToMap } from '@/utils';
import { WorkbookMap } from '@/shims-cust';

@Module({ dynamic: true, store, name: 'workspaced' })
class Workspaced extends VuexModule {
  private dirMap: Map<string, WorkbookMap> = new Map();

  @Mutation
  private UPDATE_WORKBOOKMAP(payload: { path: string; data: WorkbookMap }): void {
    const { data, path } = payload;
    this.dirMap.set(path, data);
  }

  @Action
  public UpdateWorkbookmap(payload: { path: string; data?: WorkbookMap }): void {
    if (payload.data) {
      this.UPDATE_WORKBOOKMAP({
        path: payload.path,
        data: payload.data,
      });
    } else {
      readExcelToMap(payload.path)
        .then((data) => {
          this.UPDATE_WORKBOOKMAP({ path: payload.path, data: data });
        })
        .catch((error) => ({
          //
        }));
    }
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

  public get readedPathList() {
    return () => {
      return this.dirMap.keys();
    };
  }
}

export const WorkspacedModule = getModule(Workspaced);
