<template>
  <div class="help-layout">
    <page-header />

    <div class="content">
      <router-view :key="key" />
    </div>
  </div>
</template>

<script>
import PageHeader from '@/components/page-header'

export default {
  name: 'HelpLayout',

  components: {
    PageHeader
  },

  computed: {
    key() {
      return this.$route.path
    }
  }
}
</script>

<style lang="scss" scoped>
  @import "~@/styles/variables.scss";

  .help-layout {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    width: 100%;
    overflow-x: hidden;
    overflow-y: auto;
    background-color: #F0F2F5;

    .content {
      padding-top: $navbarHeight;
    }
  }
</style>
