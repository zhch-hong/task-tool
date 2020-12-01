<template>
  <main id="main">
    <keep-alive exclude="EditTask">
      <router-view></router-view>
    </keep-alive>
  </main>
</template>
<style lang="scss">
#main {
  flex-grow: 1;
  overflow: auto;
}
</style>
