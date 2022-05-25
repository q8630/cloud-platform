<template>
  <div class="user-layout">
    <router-view :key="key" />
  </div>
</template>

<script>
export default {
  name: 'UserLayout',

  computed: {
    key() {
      return this.$route.path
    }
  }
}
</script>

<style lang="scss" scoped>
  .user-layout {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    width: 100%;
    overflow-x: hidden;
    overflow-y: auto;
  }
</style>
