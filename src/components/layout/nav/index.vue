<template>
  <nav id="nav">
    <el-menu
      :default-active="$route.path"
      :collapse="true"
      text-color="#606266"
      active-text-color="#303133"
      background-color="#f2f2f3"
      router
    >
      <el-menu-item index="/edit-file" class="el-menu-item">
        <i class="menu-icon el-icon-folder" title="编辑文件"></i>
        <!-- <span slot="title">编辑文件</span> -->
      </el-menu-item>
      <el-menu-item index="/edit-task" class="el-menu-item">
        <i class="menu-icon el-icon-edit-outline" title="编辑任务"></i>
        <!-- <span slot="title">编辑任务</span> -->
      </el-menu-item>
      <el-menu-item index="/sync-file" class="el-menu-item">
        <i class="menu-icon el-icon-refresh" title="批量修改Excel"></i>
        <!-- <span slot="title">批量修改Excel</span> -->
      </el-menu-item>
    </el-menu>
  </nav>
</template>
<style lang="scss">
#nav {
  background-color: #f2f2f3;
}
.menu-icon {
  font-size: 26px;
}
.el-menu-item {
  position: relative;
  height: 64px !important;
  line-height: 64px !important;
  box-sizing: border-box !important;
  &::before {
    position: absolute;
    content: '';
    display: inline-block;
    width: 3px;
    height: 0;
    left: 0;
    top: 50%;
    background-color: #409eff;
    transition: height 150ms, top 150ms;
  }
}
.el-menu-item.is-active {
  color: #409eff !important;
  &::before {
    height: 100%;
    top: 0;
  }
}
</style>
