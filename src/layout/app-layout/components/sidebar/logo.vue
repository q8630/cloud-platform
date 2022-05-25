<template>
  <div class="sidebar-logo-container" :class="{'collapse':collapse}">
    <transition name="sidebarLogoFade">
      <router-link v-if="collapse" key="collapse" class="sidebar-logo-link" to="/">
        <svg-icon iconClass="logo-small" />
      </router-link>
      <router-link v-else key="expand" class="sidebar-logo-link" to="/">
        <svg-icon iconClass="logo" />
      </router-link>
    </transition>
  </div>
</template>

<script>
import SvgIcon from '@/components/svg-icon'

export default {
  name: 'SidebarLogo',
  components: { SvgIcon },
  props: {
    collapse: {
      type: Boolean,
      required: true
    }
  },
}
</script>

<style lang="scss" scoped>
@import "~@/styles/variables.scss";

.sidebarLogoFade-enter-active {
  transition: opacity 1.5s;
}

.sidebarLogoFade-enter,
.sidebarLogoFade-leave-to {
  opacity: 0;
}

.sidebar-logo-container {
  position: relative;
  width: 100%;
  height: 50px;
  line-height: 50px;
  background-color: $color-primary;
  text-align: center;
  overflow: hidden;

  & .sidebar-logo-link {
    height: 100%;
    width: 100%;

    & .svg-icon {
      width: 128px;
      height: 21px;
      vertical-align: middle;
    }
  }

  &.collapse {
    .svg-icon {
      width: 25px;
      margin-right: 0;
    }
  }
}
</style>
