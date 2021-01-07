<template>
  <div id="app">
    <TitleBar />
    <router-view></router-view>
  </div>
</template>
<script lang="ts">
import Vue from 'vue';
import TitleBar from '@/components/TitleBar.vue';
import { ViewResizeModule } from './store/modules/veiw-resize';

export default Vue.extend({
  components: {
    TitleBar,
  },
  mounted(): void {
    ViewResizeModule.resetWindowHeight();
    window.addEventListener('resize', () =>
      ViewResizeModule.resetWindowHeight()
    );
  },
});
</script>
<style lang="scss">
#app {
  position: relative;
  height: 100vh;
}
</style>
