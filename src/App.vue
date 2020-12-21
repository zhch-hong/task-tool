<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>
<script lang="ts">
import Vue from 'vue';
export default Vue.extend({
  mounted(): void {
    this.$store.commit('windowHeight');
    window.addEventListener('resize', () => this.$store.commit('windowHeight'));
  },
});
</script>
