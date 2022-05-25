<template>
  <div class="navbar">
    <div class="left-menu">
      <div
        class="menu-item menu-item__hamburger link"
        :class="sidebar.opened ? 'expand' : 'collapse'"
        :title="hamburgerTips"
        @click="toggleSideBar"
      >
        <svg-icon icon-class="hamburger" />
      </div>
      <div class="menu-item menu-item__refresh link" title="刷新" @click="handleRefresh">
        <svg-icon icon-class="refresh" />
      </div>
      <el-link :underline="false" class="menu-item menu-item__store" href="/#/user/switch-store">
        门店：{{selected_client_store.name || '--'}}
        <i class="el-icon-arrow-right" />
      </el-link>
    </div>


    <!-- <breadcrumb class="breadcrumb-container" /> -->

    <div class="right-menu">
      <el-dropdown>
        <span class="menu-item link">
          支持与帮助
        </span>

        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item>
            <el-link :underline="false" href="https://support.qq.com/products/29900" target="_blank">建议反馈</el-link>
          </el-dropdown-item>

          <el-dropdown-item>
            <el-link :underline="false" href="/#/help-center/handbook" target="_blank">操作手册</el-link>
          </el-dropdown-item>

          <el-dropdown-item>
            <el-link :underline="false" href="/#/help-center/install-download" target="_blank">安装包下载</el-link>
          </el-dropdown-item>

          <el-dropdown-item>
            <div @click="showService">联系客服</div>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>

      <el-dropdown>
        <span class="menu-item menu-item__user link">
          <svg-icon icon-class="person" />
          {{user_info.nickname}}
        </span>

        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item>
            <div @click="isShowPasswd(true)">修改密码</div>
          </el-dropdown-item>

          <el-dropdown-item>
            <div @click="logout">退出登录</div>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>

    <Service :visible="serviceVisible" @close="showService" />

    <password-modify-modal
      :visible="passwordVisible"
      @cancel="isShowPasswd(false)"
      @ok="onChangePassword"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Service from '@/components/service'
import PasswordModifyModal from '@/components/password-modify-modal'

export default {
  name: 'Navbar',
  components: {
    Service, PasswordModifyModal
  },
  data() {
    return {
      serviceVisible: false,
      passwordVisible: false
    }
  },
  computed: {
    ...mapGetters([
      'sidebar',
      'avatar',
      'user_info',
      'selected_client_store',
    ]),
    hamburgerTips() {
      return this.sidebar.opened ? '收起' : '展开'
    }
  },
  methods: {
    toggleSideBar() {
      this.$store.dispatch('app/toggleSideBar')
    },
    handleRefresh() {
      window.location.reload()
    },
    logout() {
      this.$confirm('您确定要退出登录吗？')
        .then(() => this.$store.dispatch('user/logout'))
        .then(() => this.$router.push('/login'))
    },
    showService() {
      this.serviceVisible = !this.serviceVisible
    },
    isShowPasswd(isShow) {
      this.passwordVisible = isShow
    },
    onChangePassword() {
      this.isShowPasswd(false)
      this.$message.success('密码修改成功')
    }
  }
}
</script>

<style lang="scss" scoped>
@import "~@/styles/variables.scss";

.navbar {
  height: $navbarHeight;
  overflow: hidden;
  position: relative;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0,21,41,.08);
  color: $color-text-primary;
  font-size: 14px;

  .left-menu,
  .right-menu {
    height: 100%;
    display: flex;
    align-items: center;

    .menu-item {
      display: inline-block;
      padding: 0 8px;

      .svg-icon {
        width: 20px;
        height: 20px;
        vertical-align: -5px;
        color: #8e8e8e;
      }

      &.link {
        cursor: pointer;
        &:hover {
          color: $color-primary;
          .svg-icon {
            color: $color-primary;
          }
        }
      }
    }
  }

  .left-menu {
    float: left;
    padding-left: 7px;

    .menu-item__hamburger,
    .menu-item__refresh {
      line-height: 46px;
      cursor: pointer;
      transition: background .3s;
      -webkit-tap-highlight-color:transparent;
    }

    .menu-item__hamburger {
      &.collapse {
        .svg-icon {
          transform: rotate(180deg);
        }
      }

      .svg-icon {
        width: 18px;
        height: 18px;
      }
    }

    .menu-item__store {
      color: $color-text-primary;
      font-size: 15px;
      font-weight: 600;

      &:hover {
        color: $color-primary;
      }
    }
  }

  .right-menu {
    float: right;
    padding-right: 15px;

    .el-dropdown:last-child .menu-item {
      padding-right: 0;
    }

    .menu-item__user .svg-icon {
      width: 18px;
      height: 18px;
      vertical-align: -4px;
    }
  }
}

.el-dropdown-menu {
  min-width: 108px;
  padding: 5px 0;
}
.el-dropdown-menu .el-dropdown-menu__item {
  line-height: 28px;
  padding: 0 15px;
  font-size: 14px;
}
</style>
