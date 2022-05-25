<template>
  <section class="layout-content" :style="styleObject">
    <transition name="fade-transform" mode="out-in">
      <!--
        利用 include 动态控制页面是否缓存，
        默认情况下，由菜单导航点击打开的页面，都不缓存，打开页面后的页面，都缓存，
        具体控制逻辑参考 Layout, Sidebar
      -->
      <keep-alive :include="keepAliveRoute"><router-view /></keep-alive>
    </transition>
  </section>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'LayoutContent',
  computed: {
    ...mapGetters(['keepAliveRoute']),
    fixedHeader() {
      return this.$store.state.settings.fixedHeader
    },
    hasTabs() {
      const { tabs } = this.$store.getters
      return tabs && tabs.length
    },
    styleObject() {
      const paddingSpacing = 15
      const navbarHeight = 50
      const tabHeight = 48
      let headerHeight = 0

      if (this.fixedHeader) {
        headerHeight = navbarHeight

        if (this.hasTabs) {
          headerHeight = navbarHeight + tabHeight
        }
      }

      return {
        paddingTop: `${headerHeight + paddingSpacing}px`
      }
    },
    // key() {
    //   return this.$route.path
    // },
  },
}
</script>

<style lang="scss" scoped>
@import "~@/styles/variables.scss";

.layout-content {
  width: 100%;
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  box-sizing: border-box;
  padding: $padding-spacing;
}
</style>

<style lang="scss">
@import "~@/styles/variables.scss";

// fix css style bug in open el-dialog
.el-popup-parent--hidden {
  .fixed-header {
    padding-right: $padding-spacing;
  }
}
</style>
