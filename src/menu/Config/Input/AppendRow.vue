<template>
  <el-form label-width="100px">
    <el-form-item label="字段">
      <el-input v-model="form.value"></el-input>
    </el-form-item>
    <el-form-item label="说明">
      <el-input v-model="form.name"></el-input>
    </el-form-item>
  </el-form>
</template>
<script lang="ts">
import Vue from 'vue';
export default Vue.extend({
  data() {
    return {
      form: {
        name: '',
        value: '',
      },
    };
  },

  methods: {
    getData() {
      return this.form;
    },
  },
});
</script>
