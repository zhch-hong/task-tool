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
  height: 100vh;
  display: flex;
}
</style>
