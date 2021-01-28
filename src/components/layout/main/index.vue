<template>
  <main id="main">
    <div id="main_content">
      <router-view></router-view>
    </div>
  </main>
</template>
<style lang="scss">
#main {
  flex-grow: 1;
  overflow: auto;
  position: relative;
  #main_content {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: auto;
  }
}
</style>
