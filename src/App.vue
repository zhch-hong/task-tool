<template>
  <div id="app">
    <TitleBar />
    <router-view></router-view>
  </div>
</template>
<script lang="ts">
import Vue from 'vue';
import TitleBar from '@/components/TitleBar.vue';

export default Vue.extend({
  components: {
    TitleBar,
  },
  mounted(): void {
    this.$store.commit('windowHeight');
    window.addEventListener('resize', () => this.$store.commit('windowHeight'));
  },
});
</script>
<style lang="scss">
#app {
  position: relative;
  height: 100vh;
}
</style>
