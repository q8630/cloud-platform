
<template>
  <!-- eslint-disable vue/require-component-is -->
  <!-- 绑定的 click.native.capture 事件，在路由导航触发前，先触发点击事件 -->
  <component v-bind="linkProps()" @click.native.capture="handleClick">
    <slot />
  </component>
</template>

<script>
import { mapGetters } from 'vuex'
import { isExternalUrl } from '@/utils'

export default {
  props: {
    to: {
      type: String,
      required: true
    },
    route: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      routeMap: null
    }
  },
  computed: {
    ...mapGetters(['routeMaps']),
    isExternalUrl() {
      return isExternalUrl(this.to)
    },
    isActive() {
      const { path, redirect } = this.route
      return this.$route.path === path || this.$route.path === redirect
    }
  },
  methods: {
    linkProps() {
      const url = this.to

      if (this.isExternalUrl) {
        return {
          is: 'a',
          href: url,
          target: '_blank',
          rel: 'noopener'
        }
      }

      return {
        is: 'router-link',
        to: url,
      }
    },
    handleClick() {
      if (!this.isExternalUrl && !this.isActive) {
        // 从 keepAliveRoute 中移除当前路由
        // 以便在 <keep-alive /> 中能刷新该页面（默认约定 route.name 与 组件名称相同）
        this.$store.dispatch('app/removeKeepAliveRoute', this.route.name)
      }
    },
  }
}
</script>
