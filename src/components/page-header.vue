<template>
  <div class="page-header" :class="{[`page-header__${theme}`]: true}">
    <div class="logo">
      <svg-icon v-if="theme === 'default'" icon-class="logo" />
      <svg-icon v-else-if="theme === 'withe'" icon-class="logo-blue" />
    </div>

    <div class="right-menu"></div>
  </div>
</template>

<script>
const themes = [
  'default', // 默认（如门店页用的 header）
  'withe', // 白底（如注册页用的 header）
]
export default {
  name: 'PageHeader',
  props: {
    theme: {
      type: String,
      default: 'default',
      validator(value) {
        return themes.indexOf(value) !== -1
      }
    }
  },
}
</script>

<style lang="scss" scoped>
@import "~@/styles/variables.scss";

.page-header {
  position: fixed;
  display: flex;
  width: 100%;
  height: $navbarHeight;
  background-color: #fff;
  border-bottom: 1px solid $border-color-lighter;
  z-index: 9;

  .logo {
    height: 100%;
    text-align: center;

    .svg-icon {
      width: 127px;
      height: 21px;
      margin-top: 14px;
    }
  }

  .right-menu {
    flex: 1 0 auto;
    display: flex;
    justify-content: flex-end;
    padding-right: 40px;

    :global(.el-link.el-link--default) {
      color: #ffffff;
    }
  }
}

.page-header__default {
  .logo {
    width: 180px;
    background-color: $color-primary;
  }
}

.page-header__withe {
  .logo {
    width: 237px;
  }
}
</style>
