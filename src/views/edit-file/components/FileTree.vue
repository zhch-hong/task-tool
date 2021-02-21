<template>
  <div ref="FileTree" class="tree" @mouseenter="dirButtons = true" @mouseleave="dirButtons = false">
    <div ref="Resize" class="resize" @mousedown.prevent.stop="resizeMousedown($event)"></div>
    <div ref="ScrollBar" class="scrollbar">
      <el-tree
        ref="tree"
        :data="treeData"
        :props="defaultProps"
        :highlight-current="true"
        :default-expanded-keys="defaultExpandedKeys"
        :auto-expand-parent="false"
        :current-node-key="currentNodeKey"
        style="user-select: none"
        node-key="path"
        @node-click="nodeClick"
        @node-expand="nodeExpand"
        @node-collapse="nodeCollapse"
        @node-contextmenu="nodeContextmenu"
      >
        <template #default="{ data, node }">
          <div v-if="!statLabel(data)">
            <i v-if="!node.expanded" class="iconfont icon-folder" style="margin-right: 4px; color: #ffc800"></i>
            <i v-if="node.expanded" class="iconfont icon-049-folder-open" style="margin-right: 4px; color: #ffc800"></i>
            <span>{{ node.label }}</span>
          </div>
          <div v-else>
            <i class="iconfont icon-Microsoft-Excel" style="margin-right: 4px; color: #008000"></i>
            <span :title="titlePath(data)">{{ node.label }}</span>
          </div>
        </template>
      </el-tree>
    </div>
  </div>
</template>
<script lang="ts">
import path from 'path';
import { statSync } from 'fs';
import { nativeImage, remote } from 'electron';
import { getUserconfig } from '@/asserts/userconfig';
import { getTreeDataDefault, openInExcel, revealInFileExplorer, writeFileText } from '@/utils';
import { Component, Vue } from 'vue-property-decorator';
import { dirConfigPath } from '@/asserts/dir-config';
import { ActiveFileModule } from '@/store/modules/active-file';
import { FileTreeModule } from '@/store/modules/file-tree';
import { Tree } from 'element-ui';
import { TreeData } from 'element-ui/types/tree';
import { cloneDeep } from 'lodash';

import ExcelIcon from '@/assets/contextmenu_icon/icons8-microsoft-excel-2019-21.png';
import FolderIcon from '@/assets/contextmenu_icon/icons8-folder-21.png';

interface TreeMeta extends TreeData {
  path: string;
}

const { Menu, MenuItem } = remote;

@Component
export default class FileTree extends Vue {
  treeData: TreeMeta[] = [];
  /** 标题和子级使用的字段名 */
  defaultProps = {
    children: 'children',
    label: 'label',
    path: 'path',
  };
  defaultExpandedKeys = cloneDeep(FileTreeModule.expandedKeys);
  currentNodeKey = ActiveFileModule.path;

  mounted(): void {
    this.refresh();
  }

  async refresh(): Promise<void> {
    this.treeData = getTreeDataDefault();
    await this.$nextTick();
    (this.$refs.tree as Tree).setCurrentKey(ActiveFileModule.path);
  }

  setLastOpenFilePath(path: string): void {
    const object = getUserconfig();
    object.lastOpenFile = path;
    writeFileText(dirConfigPath, object);
  }

  nodeClick(data: TreeMeta): void {
    const path = data.path;
    const stat = statSync(path);

    if (stat.isDirectory()) {
      this.$nextTick(() => {
        (this.$refs.tree as Tree).setCurrentKey(ActiveFileModule.path);
      });
      return;
    }

    ActiveFileModule.SetPath(path);
    this.$emit('update:table');

    this.setLastOpenFilePath(path);
  }

  nodeExpand(data: TreeMeta): void {
    FileTreeModule.appendKey(data.path);
  }

  nodeCollapse(data: TreeMeta): void {
    FileTreeModule.removeKey(data.path);
  }

  statLabel(data: TreeMeta): boolean {
    if (!data.label) throw new Error('节点必须有label属性');

    return data.label?.endsWith('.xlsx');
  }

  titlePath(data: TreeMeta): string {
    return data.path;
  }

  resizeMousedown(event: MouseEvent): void {
    const LW = (this.$refs.FileTree as HTMLDivElement).clientWidth;
    document.onmousemove = (mEvent: MouseEvent) => {
      if (mEvent.pageX > event.pageX) {
        const diff = mEvent.pageX - event.pageX;
        (this.$refs.FileTree as HTMLDivElement).style.width = LW + diff + 'px';
      }
      if (mEvent.pageX < event.pageX) {
        const diff = event.pageX - mEvent.pageX;
        (this.$refs.FileTree as HTMLDivElement).style.width = LW - diff + 'px';
      }
    };

    document.addEventListener(
      'mouseup',
      () => {
        document.onmousemove = null;
        this.$emit('render-table');
        const ScrollBar = this.$refs.ScrollBar as HTMLDivElement;
        if (ScrollBar.clientWidth >= ScrollBar.scrollWidth) {
          (this.$refs.tree as any).$el.style.position = 'relative';
        } else {
          (this.$refs.tree as any).$el.style.position = 'absolute';
        }
      },
      { once: true }
    );
  }

  nodeContextmenu(event: MouseEvent, data: TreeMeta): void {
    const menu = new Menu();
    const folderIcon = nativeImage.createFromDataURL(FolderIcon);
    menu.append(
      new MenuItem({
        label: '在资源管理器中展示',
        icon: folderIcon,
        click: function () {
          revealInFileExplorer(data.path);
        },
      })
    );

    // menu.append(new MenuItem({ type: 'separator' }));

    if (path.extname(data.path) === '.xlsx' || path.extname(data.path) === '.xls') {
      const excelIcon = nativeImage.createFromDataURL(ExcelIcon);
      menu.append(
        new MenuItem({
          label: '通过Excel打开',
          icon: excelIcon,
          click: function () {
            openInExcel(data.path);
          },
        })
      );
    }

    menu.popup();
  }
}
</script>
<style lang="scss" scoped>
div.tree {
  position: relative;
  min-width: 300px;
  max-width: 500px;
  div.resize {
    position: absolute;
    height: 100%;
    width: 5px;
    top: 0;
    right: -4px;
    background-color: transparent;
    cursor: ew-resize;
    z-index: 10;
  }

  div.scrollbar {
    position: absolute;
    height: 100%;
    width: 100%;
    overflow: auto;
  }
}
</style>
