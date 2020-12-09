<template>
  <nav id="nav">
    <el-menu
      :default-active="$route.path"
      background-color="transparent"
      active-text-color="#0099ff"
      router
    >
      <el-menu-item-group title="任务配置工具">
        <el-menu-item index="/edit-file">编辑文件</el-menu-item>
        <el-menu-item index="/edit-task">编辑任务</el-menu-item>
      </el-menu-item-group>
      <el-menu-item-group title="工具配置">
        <el-menu-item index="/file-manage">文件管理</el-menu-item>
        <el-menu-item index="/source-manage">来源管理</el-menu-item>
        <el-menu-item index="/input-manage">输入项管理</el-menu-item>
      </el-menu-item-group>
    </el-menu>
  </nav>
</template>
<style lang="scss">
#nav {
  background-color: #f2f3f4;
}
</style>
