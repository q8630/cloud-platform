<template>
  <div class="sidebar-container">
    <logo :collapse="isCollapse" />
    <el-scrollbar>
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapse"
        :unique-opened="false"
        :collapse-transition="false"
        mode="vertical"
      >
        <sidebar-item
          v-for="route in routes"
          :active="isActive(route)"
          :key="route.path"
          :item="route"
          :base-path="route.path"
        />
      </el-menu>
    </el-scrollbar>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { Scrollbar, Menu } from 'element-ui'
import Logo from './logo'
import SidebarItem from './sidebar-item'
import { urlToList } from '@/utils'

export default {
  components: { ElScrollbar: Scrollbar, ElMenu: Menu, SidebarItem, Logo },
  computed: {
    ...mapGetters([
      'sidebar'
    ]),
    routes() {
      // route.hidden if set true, item will not show in the sidebar
      return (this.$store.getters.routes || []).filter(route => !route.hidden && route.meta && route.meta.title)
    },
    activeMenu() {
      const { meta, path } = this.$route

      // if set path, the sidebar will highlight the path you set
      if (meta.activeMenu) {
        return meta.activeMenu
      }

      return path
    },
    isCollapse() {
      return !this.sidebar.opened
    },
  },
  methods: {
    isActive(route) {
      const urlList = urlToList(this.activeMenu)
      return route.path === urlList[0]
    }
  }
}
</script>

<style lang="scss" scoped>
@import "~@/styles/mixin.scss";
@import "~@/styles/variables.scss";

.sidebar-container {
  transition: width 0.28s;
  width: $sideBarWidth;
  background-color: $menuBg;
  position: fixed;
  font-size: 0px;
  top: 0;
  bottom: 0;
  left: 0;
  z-index: 1001;
  overflow: hidden;
  box-shadow: -5px 0 7px 0px rgba(0,0,0,.5);

  // reset element-ui css
  .horizontal-collapse-transition {
    transition: 0s width ease-in-out, 0s padding-left ease-in-out, 0s padding-right ease-in-out;
  }

  /deep/ .el-scrollbar__wrap {
    overflow-x: hidden !important;
  }

  /deep/ .el-scrollbar__bar.is-vertical {
    right: 0px;
  }

  /deep/ .el-scrollbar {
    height: calc(100% - 50px);
  }

  /deep/ .el-scrollbar__bar.is-horizontal {
    display: none;
  }
}
</style>

<style lang="scss">
@import "~@/styles/variables.scss";

// el-menu
.sidebar-container .el-menu {
  width: 100%;
  height: 100%;
  border: 0;

  a {
    display: inline-block;
    width: 100%;
    text-decoration: none;
  }

  .svg-icon {
    width: 18px;
    height: 18px;
    color: #8e8e8e;
    margin-right: 6px;
    vertical-align: middle;
  }

  .el-menu-item {
    position: relative;
    min-width: $sideBarWidth;
    color: $menuText;
    padding: 0 16px !important;

    .el-menu-item--hover {
      position: absolute;
      left: 0;
      top: 0;
      width: 0;
      height: 50px;
      background-color: $color-primary;
    }

    &:hover,
    &:focus {
      background-color: #e8f3ff;
      .el-menu-item--hover {
        width: 4px;
      }
    }
    &.is-active {
      background-color: #e8f3ff;
    }
  }

  // menu-title
  .el-submenu__title {
    padding: 0 16px !important;
  }
  .el-submenu__title,
  .el-menu-item.submenu-title-noDropdown {
    font-size: 14px;
    font-weight: 600;
    color: $menuText;
  }

  .nest-menu .el-menu-item {
    font-size: 14px;
    padding-left: 40px !important;
  }

  .el-menu-item.submenu-title-noDropdown .el-menu-item--hover {
    height: 56px;
  }

  .el-menu-item.is-active,
  .el-menu-item.is-active .svg-icon,
  .el-submenu.is-active .el-submenu__title,
  .el-submenu.is-active .el-submenu__title .svg-icon {
    color: $menuActiveText;
  }

  // when menu collapsed
  &.el-menu--collapse {
    // menu-item
    .el-menu-item.submenu-title-noDropdown {
      min-width: 50px;
      padding: 0 !important;
      position: relative;

      .el-tooltip {
        padding: 0 !important;

        .svg-icon {
          margin-left: 16px;
        }
      }
    }

    // submenu
    .el-submenu {
      overflow: hidden;

      & > .el-submenu__title {
        padding: 0 !important;

        .svg-icon {
          margin-left: 16px;
        }

        .el-submenu__icon-arrow {
          display: none;
        }

        & > span {
          height: 0;
          width: 0;
          overflow: hidden;
          visibility: hidden;
          display: inline-block;
        }
      }
    }
  }
}

// when menu collapsed
.el-menu--vertical {
  // menu link
  a {
    display: inline-block;
    width: 100%;
    overflow: hidden;
    text-decoration: none;
  }

  // menu icon
  .svg-icon {
    color: #909399;
    margin-right: 16px;
  }

  .el-menu-item {
    position: relative;

    .el-menu-item--hover {
      position: absolute;
      left: 0;
      top: 0;
      width: 0;
      height: 56px;
      background-color: $color-primary;
    }

    &:hover,
    &:focus {
      .el-menu-item--hover {
        width: 4px;
      }
    }
    &.is-active {
      background-color: #e8f3ff;
    }
  }

  .el-menu-item.is-active .svg-icon {
    color: $menuActiveText;
  }

  // the scroll bar appears when the subMenu is too long
  > .el-menu--popup {
    min-width: 146px;
    max-height: 100vh;
    overflow-y: auto;

    &::-webkit-scrollbar-track-piece {
      background: #d3dce6;
    }

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-thumb {
      background: #99a9bf;
      border-radius: 20px;
    }
  }
}
</style>
