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
import { Component, Vue, Watch } from 'vue-property-decorator';
import { statSync } from 'fs';
import { contextmenu, DATA_MEMORY } from '@/utils';
import { ActiveFileModule } from '@/store/modules/active-file';
import { ExpandedKeysModule } from '@/store/modules/expanded-keys';
import { Tree } from 'element-ui';
import { TreeData } from 'element-ui/types/tree';
import { cloneDeep } from 'lodash';

import store from '@/electron-store';

interface TreeMeta extends TreeData {
  path: string;
}

@Component
export default class FileTree extends Vue {
  treeData: TreeMeta[] = [];
  /** 标题和子级使用的字段名 */
  defaultProps = {
    children: 'children',
    label: 'label',
    path: 'path',
  };
  defaultExpandedKeys = cloneDeep(ExpandedKeysModule.expandedKeys);

  get currentNodeKey(): string {
    return ActiveFileModule.path;
  }

  @Watch('currentNodeKey', { immediate: true })
  currentNodeKeyWatch(value: string): void {
    if (this.$refs.tree && value) {
      (this.$refs.tree as Tree).setCurrentKey(value);
    }
  }

  mounted(): void {
    this.refresh();
  }

  async refresh(): Promise<void> {
    this.treeData = DATA_MEMORY;
    await this.$nextTick();
    (this.$refs.tree as Tree).setCurrentKey(ActiveFileModule.path);
  }

  setLastOpenFilePath(path: string): void {
    store.set('lastOpenFile', path);
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
    ExpandedKeysModule.appendKey(data.path);
  }

  nodeCollapse(data: TreeMeta): void {
    ExpandedKeysModule.removeKey(data.path);
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
    contextmenu(data.path);
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
