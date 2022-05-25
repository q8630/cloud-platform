<template>
  <div class="menu-wrapper">
    <template v-if="onlyOneChild">
      <app-link :to="resolvePath(onlyOneChild.path)" :route="item">
        <el-menu-item :index="resolvePath(onlyOneChild.path)" :class="{'submenu-title-noDropdown': !isNest}">
          <item :icon="getIcon(onlyOneChild)" :title="onlyOneChild.meta.title" />
        </el-menu-item>
      </app-link>
    </template>

    <el-submenu v-else ref="subMenu" :index="resolvePath(item.path)" popper-append-to-body>
      <template slot="title">
        <item
          v-if="item.meta"
          :icon="getIcon(item)"
          :title="item.meta.title"
        />
      </template>

      <sidebar-item
        v-for="child in subMenus"
        :key="child.path"
        :is-nest="true"
        :item="child"
        :base-path="resolvePath(child.path)"
        class="nest-menu"
      />
    </el-submenu>
  </div>
</template>

<script>
import { Submenu, MenuItem } from 'element-ui'
import path from 'path'
import { isExternalUrl } from '@/utils'
import Item from './item'
import AppLink from './link'

export default {
  name: 'SidebarItem',
  components: { ElSubmenu: Submenu, ElMenuItem: MenuItem, Item, AppLink },
  props: {
    // route object
    item: {
      type: Object,
      required: true
    },
    isNest: {
      type: Boolean,
      default: false
    },
    basePath: {
      type: String,
      default: ''
    },
    active: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    subMenus() {
      // route.hidden if set true, item will not show in the sidebar
      return (this.item.children || []).filter(route => !route.hidden && route.meta && route.meta.title)
    },
    onlyOneChild() {
      const subMenus = this.subMenus

      // Show parent if there are no child router to display
      if (subMenus.length === 0) {
        return this.item
      }

      // When there is only one child router, the child router is displayed by default
      if (subMenus.length === 1 && this.item.alwaysShow === false) {
        const child = {
          ...subMenus[0],
          meta: {
            ...subMenus[0].meta,
            icon: (this.item.meta && this.item.meta.icon) || subMenus[0].meta.icon
          }
        }

        return child
      }

      return null
    },
  },
  methods: {
    resolvePath(routePath) {
      if (isExternalUrl(routePath)) {
        return routePath
      }

      if (isExternalUrl(this.basePath)) {
        return this.basePath
      }

      return path.resolve(this.basePath, routePath)
    },
    getIcon(route) {
      return route.meta && (this.active ? `${route.meta.icon}-highlight` : route.meta.icon)
    }
  }
}
</script>
