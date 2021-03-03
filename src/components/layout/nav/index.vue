<template>
  <nav id="nav">
    <el-menu
      :default-active="$route.path"
      text-color="#606266"
      active-text-color="#303133"
      background-color="#f2f2f3"
      router
    >
      <el-menu-item-group title="任务配置工具">
        <el-menu-item index="/edit-file">编辑文件</el-menu-item>
        <el-menu-item index="/edit-task">编辑任务</el-menu-item>
        <el-menu-item index="/sync-file">批量修改Excel</el-menu-item>
      </el-menu-item-group>
      <el-menu-item-group title="工具配置">
        <el-menu-item index="/input-manage">输入项管理</el-menu-item>
        <el-menu-item index="/template-manage">模板管理</el-menu-item>
      </el-menu-item-group>
    </el-menu>
  </nav>
</template>
<style lang="scss">
#nav {
  background-color: #f2f2f3;
}
</style>
