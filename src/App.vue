<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>
<script lang="ts">
import Vue from 'vue';
import { ChangedMapModule } from './store/modules/changed-map';
import { ViewResizeModule } from './store/modules/veiw-resize';
import { writeChanged } from './utils';

export default Vue.extend({
  mounted(): void {
    ViewResizeModule.resetWindowHeight();

    window.addEventListener('resize', () =>
      ViewResizeModule.resetWindowHeight()
    );

    window.addEventListener('beforeunload', (event) => {
      if (ChangedMapModule.changedMap.size !== 0) {
        event.returnValue = false;
        writeChanged(0).then(() => {
          window.close();
        });
      }
    });
  },
});
</script>
<style lang="scss">
#app {
  position: relative;
  height: 100%;
}
</style>
