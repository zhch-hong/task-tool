<template>
  <div id="layout">
    <Nav />
    <Main />
  </div>
</template>
<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import Nav from './nav/index.vue';
import Main from './main/index.vue';

@Component({
  components: {
    Nav,
    Main,
  },
})
export default class Layout extends Vue {}
</script>
<style lang="scss">
#layout {
  position: absolute;
  top: 30px;
  bottom: 0;
  left: 0;
  width: 100%;
  display: flex;
  overflow: auto;
}
</style>
