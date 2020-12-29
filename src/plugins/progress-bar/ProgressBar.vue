<template>
  <div class="progress-bar">
    <div class="bar"></div>
  </div>
</template>
<script lang="ts">
import Vue from 'vue';
export default Vue.extend({
  name: 'ProgressBar',
});
</script>
<style lang="scss" scoped>
$--width: 60px;

@keyframes identifier {
  0% {
    left: -$--width;
  }
  100% {
    left: 100%;
  }
}

.progress-bar {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  overflow: hidden;
  height: 1px;
  .bar {
    position: absolute;
    top: 0;
    left: -$--width;
    height: 100%;
    width: $--width;
    background-color: #1ab2ff;
    animation: identifier 4000ms linear 500ms infinite;
  }
}
</style>
