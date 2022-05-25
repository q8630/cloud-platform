<template>
  <div :class="classes" class="app-layout">
    <div v-if="device==='mobile'&&sidebar.opened" class="drawer-bg" @click="handleClickOutside" />
    <sidebar />
    <div class="main-container">
      <div :class="{'fixed-header':fixedHeader}">
        <navbar />
        <tabs />
      </div>
      <!--
        在登录后进入页面，刷新浏览器会同时出现全局和局部loading，这是由于拉取user_info接口，
        会出现全局loading，这里等待user_info拉取完后才显示
      -->
      <layout-content v-if="hasUserInfo && contractValid" />
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { Navbar, Sidebar, Tabs, LayoutContent } from './components'
import KeepAlive from './mixin/keep-alive'
import Permission from './mixin/permission'
import Resize from './mixin/resize-handler'

export default {
  name: 'Layout',
  components: {
    Navbar,
    Sidebar,
    Tabs,
    LayoutContent
  },
  mixins: [KeepAlive, Permission, Resize],
  computed: {
    ...mapGetters(['user_info']),
    sidebar() {
      return this.$store.state.app.sidebar
    },
    device() {
      return this.$store.state.app.device
    },
    fixedHeader() {
      return this.$store.state.settings.fixedHeader
    },
    classes() {
      return {
        hideSidebar: !this.sidebar.opened,
        openSidebar: this.sidebar.opened,
        withoutAnimation: this.sidebar.withoutAnimation,
        mobile: this.device === 'mobile'
      }
    },
    hasUserInfo() {
      return this.user_info && this.user_info.user_id
    },
    contractValid() {
      return +this.user_info.need_contract === 0
    }
  },
  created() {
    this.$store.dispatch('user/getUserInfo', { showLoading: true })
      .then(this.validateContractStatus)
  },
  methods: {
    validateContractStatus(userInfo) {
      let error
      const { need_contract: status } = userInfo

      if (+status === 1) {
        error = '您未签署合同，无法正常使用服务，是否立即去签署？'
      } else if (+status === 2) {
        error = '您的合同已过期，无法正常使用服务，是否重新签署？'
      }

      if (error) {
        const confirmOptions = {
          type: 'warning',
          showClose: false,
          closeOnClickModal: false,
          closeOnPressEscape: false,
          // hash（这里指路由）变化时，不关闭弹窗，因为进入根路由时，会被重定向到“首页”
          closeOnHashChange: false,
        }

        this.$confirm(error, confirmOptions)
          .then(() => this.$router.push('/user/sign-contract'))
          .catch(this.logout)
      }
    },
    logout() {
      this.$store.dispatch('user/logout')
      this.$router.push('/user/login')
    },
    handleClickOutside() {
      this.$store.dispatch('app/closeSideBar', { withoutAnimation: false })
    }
  }
}
</script>

<style lang="scss" scoped>
  @import "~@/styles/mixin.scss";
  @import "~@/styles/variables.scss";

  .app-layout {
    @include clearfix;
    position: relative;
    height: 100%;
    width: 100%;
    &.mobile.openSidebar{
      position: fixed;
      top: 0;
    }
  }

  .main-container {
    min-height: 100%;
    transition: margin-left .28s;
    margin-left: $sideBarWidth;
    position: relative;
    background-color: #F0F2F5;
  }

  .app-layout.hideSidebar {
    .sidebar-container {
      width: 54px !important;
    }

    .main-container {
      margin-left: 54px;
    }
  }

  // mobile responsive
  .app-layout.mobile {
    .main-container {
      margin-left: 0px;
    }

    .sidebar-container {
      transition: transform .28s;
      width: $sideBarWidth !important;
    }

    &.hideSidebar {
      .sidebar-container {
        pointer-events: none;
        transition-duration: 0.3s;
        transform: translate3d(-$sideBarWidth, 0, 0);
      }
    }
  }

  .app-layout.withoutAnimation {
    .main-container,
    .sidebar-container {
      transition: none;
    }
  }

  .drawer-bg {
    background: #000;
    opacity: 0.3;
    width: 100%;
    top: 0;
    height: 100%;
    position: absolute;
    z-index: 999;
  }

  .fixed-header {
    position: fixed;
    top: 0;
    right: 0;
    z-index: 9;
    width: calc(100% - #{$sideBarWidth});
    transition: width 0.28s;
  }

  .app-layout.hideSidebar .fixed-header {
    width: calc(100% - 54px)
  }

  .app-layout.mobile .fixed-header {
    width: 100%;
  }

  // /deep/ .el-menu--collapse .el-menu .el-submenu {
  //   min-width: $sideBarWidth !important;
  // }
</style>
