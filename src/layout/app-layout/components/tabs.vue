<template>
  <div :class="{ hidden: tabs.length <= 0 }" class="tabs-container">
    <el-tabs
      closable
      type="card"
      v-model="active"
      @tab-remove="removeTab"
      @tab-click="clickTab"
    >
      <el-tab-pane
        v-for="tab in tabs"
        :key="tab.path"
        :name="tab.path"
        :label="tab.title" />
    </el-tabs>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'Tabs',
  data() {
    return {
      active: '', // 当前激活的 tab 项，绑定的是 route.path
    }
  },
  computed: {
    ...mapGetters(['tabs'])
  },
  watch: {
    $route() {
      this.generateTabs()
    }
  },
  created() {
    this.generateTabs()
  },
  methods: {
    generateTabs() {
      const { name, fullPath, path, meta } = this.$route

      if (meta && meta.title) {
        // 当前激活的 tab 项，其标识为 path
        this.active = path

        // 判断当前路由是否已存在 tab 项，有就更新原缓存的 tab 数据，没有即新增 tab 到 this.tabs 中
        const tab = { name, fullPath, path, title: meta.title }
        const index = this.tabs.findIndex(tab => tab.path === path)

        if (index === -1) {
          this.$store.dispatch('app/addTab', tab)
        } else {
          this.$store.dispatch('app/updateTab', { tab, index })
        }
      }
    },
    removeTab(targetName) {
      const activeTabIndex = this.tabs.findIndex(tab => tab.path === targetName)

      // 删除 tab 数据
      this.$store.dispatch('app/removeTab', targetName)

      // 如果删除了当前激活的tab，默认路由到下一个 tab
      if (this.active === targetName && this.tabs.length) {
        const tab = this.tabs[Math.min(activeTabIndex, this.tabs.length - 1)]
        this.active = tab.path
        this.redirect(tab.fullPath)
      }
    },
    clickTab(target) {
      // 点击 tab 项后，需要通过 fullPath 跳转
      const tab = this.tabs.find(tab => tab.path === target.name)
      if (tab && tab.path !== this.$route.path) {
        this.redirect(tab.fullPath)
      }
    },
    redirect(path) {
      this.$router.push(path)
    }
  }
}
</script>

<style lang="scss" scoped>
@import "~@/styles/variables.scss";

.tabs-container {
  height: $tabsHeight;
  background-color: #fff;
  overflow-y: hidden;
  padding: 0 $padding-spacing;
  // box-shadow: 0 1px 4px rgba(0,21,41,.08);

  &.hidden {
    display: none;
  }

  /deep/ .el-tabs__header {
    border-bottom: none;
  }
  /deep/ .el-tabs__header .el-tabs__nav {
    border: none;
    margin-top: 10px;
  }
  /deep/ .el-tabs__header .el-tabs__item {
    height: 28px;
    line-height: 27px;
    border: 1px solid #E4E7ED !important;
    border-radius: 3px;
    color: #606266;

    & + .el-tabs__item {
      margin-left: 10px;
    }

    &.is-closable {
      padding-left: $padding-spacing !important;
      padding-right: $padding-spacing !important;
    }
    &.is-active,
    &:hover {
      color: $color-primary;
      border-color: #A3D0FD !important;
      background-color: #E6F1FC;
    }
    .el-icon-close {
      width: 14px;
      line-height: 14px;
      color: #fff;
      background-color: #C0C4CC;
      &:hover {
        background-color: #F56C6C;
      }
    }
  }
}
</style>
