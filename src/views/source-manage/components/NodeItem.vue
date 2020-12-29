<template>
  <div @contextmenu.prevent="dblclick">
    <slot></slot>
  </div>
</template>
<script lang="ts">
import Vue from 'vue';
export default Vue.extend({
  name: 'NodeItem',

  props: {
    treeNode,
  },

  methods: {
    dblclick() {
      console.log('--');
    },
  },
});
</script>
