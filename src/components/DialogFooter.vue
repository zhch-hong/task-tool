<template>
  <div>
    <el-button size="mini" @click="$emit('reject')">取消</el-button>
    <el-button size="mini" type="primary" @click="$emit('resolve')"
      >确定</el-button
    >
  </div>
</template>
