<template>
  <ul class="tabs">
    <li v-for="item in tabs" :key="item" :class="['tab', active === item ? 'active' : '']" @click="active = item">
      <span class="text">{{ item }}</span>
    </li>
  </ul>
</template>
<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'SheetTabs',

  data() {
    return {
      tabs: ['--', '==', '^^^'],
      active: '',
    };
  },

  created() {
    this.active = this.tabs[0];
  },

  methods: {},
});
</script>
<style lang="scss" scoped>
ul.tabs {
  display: flex;
  list-style-type: none;
  border-top: 1px solid #999999;
  border-bottom: 1px solid #999999;
  background-color: #e6e6e6;
  -webkit-user-select: none;
  & > li.tab {
    position: relative;
    cursor: default;
    & > span.text {
      padding: 0 8px;
      border-left: 1px solid #999999;
      border-right: 1px solid #999999;
    }
  }
  & > li.active {
    background-color: #fff;
    & > ::before {
      position: absolute;
      content: '';
      display: inline-block;
      height: 1px;
      width: 100%;
      top: -1px;
      left: 0;
      background-color: #fff;
    }
    & > ::after {
      position: absolute;
      content: '';
      display: inline-block;
      height: 2px;
      width: 1px;
      top: -1px;
      left: 0;
      background-color: #999999;
    }
    & > ::after {
      position: absolute;
      content: '';
      display: inline-block;
      height: 2px;
      width: 1px;
      top: -1px;
      right: 0;
      background-color: #999999;
    }
  }
}
</style>
