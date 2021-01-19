<template>
  <div style="-webkit-app-region: drag" class="title-bar">
    <div class="app-icon"></div>
    <div class="app-name">任务配置工具</div>
    <ul style="-webkit-app-region: no-drag" class="do-window">
      <li class="min-size" @click.stop="minSize"></li>
      <li
        :class="[isMax ? 'nor-size' : 'max-size']"
        @click.stop="switchSize"
      ></li>
      <li class="close-window" @click.stop="closeWindow"></li>
    </ul>
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { remote } from 'electron';
import { ChangedMapModule } from '@/store/modules/changed-map';
import { writeChanged } from '@/utils';

const { app, BrowserWindow } = remote;

@Component
export default class TitleBar extends Vue {
  isMax = false;

  created(): void {
    const win = BrowserWindow.getFocusedWindow();
    if (win) {
      win.on('maximize', () => (this.isMax = true));
      win.on('unmaximize', () => (this.isMax = false));
    }
  }

  closeWindow(): void {
    if (ChangedMapModule.changedMap.size === 0) {
      app.exit();
    } else {
      writeChanged(0).then(() => {
        app.exit();
      });
    }
  }

  switchSize(): void {
    this.isMax ? this.normalSize() : this.maxSize();
  }

  minSize(): void {
    BrowserWindow.getFocusedWindow()?.minimize();
  }

  maxSize(): void {
    BrowserWindow.getFocusedWindow()?.maximize();
    this.isMax = true;
  }

  normalSize(): void {
    BrowserWindow.getFocusedWindow()?.unmaximize();
    this.isMax = false;
  }
}
</script>
<style lang="scss" scoped>
.title-bar {
  position: relative;
  height: 30px;
  background-color: #eaeaeb;
  .do-window {
    position: absolute;
    height: 100%;
    right: 0;
    top: 0;
    padding: 0;
    margin: 0;
    list-style-type: none;
    display: flex;
    li {
      display: flex;
      width: 46px;
      height: 30px;
      cursor: pointer;
      align-items: center;
      justify-content: center;
      background-color: #606266;
    }
  }
}
.min-size {
  mask: url("data:image/svg+xml;charset=utf-8,%3Csvg width='11' height='11' viewBox='0 0 11 11' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 4.399V5.5H0V4.399h11z' fill='%23000'/%3E%3C/svg%3E")
    no-repeat 50% 50%;
  &:hover {
    background-color: #3e3f42 !important;
  }
}
.max-size {
  mask: url("data:image/svg+xml;charset=utf-8,%3Csvg width='11' height='11' viewBox='0 0 11 11' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 0v11H0V0h11zM9.899 1.101H1.1V9.9h8.8V1.1z' fill='%23000'/%3E%3C/svg%3E")
    no-repeat 50% 50%;
  &:hover {
    background-color: #000000 !important;
  }
}
.nor-size {
  mask: url("data:image/svg+xml;charset=utf-8,%3Csvg width='11' height='11' viewBox='0 0 11 11' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 8.798H8.798V11H0V2.202h2.202V0H11v8.798zm-3.298-5.5h-6.6v6.6h6.6v-6.6zM9.9 1.1H3.298v1.101h5.5v5.5h1.1v-6.6z' fill='%23000'/%3E%3C/svg%3E")
    no-repeat 50% 50%;
  &:hover {
    background-color: #000000 !important;
  }
}
.close-window {
  mask: url("data:image/svg+xml;charset=utf-8,%3Csvg width='11' height='11' viewBox='0 0 11 11' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M6.279 5.5L11 10.221l-.779.779L5.5 6.279.779 11 0 10.221 4.721 5.5 0 .779.779 0 5.5 4.721 10.221 0 11 .779 6.279 5.5z' fill='%23000'/%3E%3C/svg%3E")
    no-repeat 50% 50%;
  &:hover {
    background-color: #ff471a !important;
  }
}
.app-icon {
  display: inline-block;
  height: 100%;
  width: 30px;
  margin-left: 5px;
  background: no-repeat url('../assets/icon_32.png') 5px 6px/20px 18px;
}
.app-name {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  font-size: 12px;
}
</style>
