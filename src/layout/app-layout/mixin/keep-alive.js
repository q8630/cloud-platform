/**
 * 系统使用了 <keep-alive /> 缓存页面，
 * 默认情况下，打开的页面，都会被缓存，在点击系统 tabs 导航栏时，打开的是缓存的页面，
 * 但点击左侧导航菜单时，需要刷新并重新加载当前页面，
 * 这里利用 Router 的钩子，在路由发生变化时，给 app.keepAliveRoute 加入当前路由，以便缓存
 * 点击左侧系统菜单导航时，会清除相应路由项，以便刷新页面，详见 app-layout/components/link.vue
 */
export default {
  beforeRouteEnter(to, from, next) {
    // console.log('Layout.beforeRouteEnter', from.path, to.path)
    next(vm => {
      if (to.meta && to.meta.keepAlive !== false) {
        vm.$store.dispatch('app/addKeepAliveRoute', to.name)
      }
    })
  },
  beforeRouteUpdate(to, from, next) {
    // console.log('Layout.beforeRouteUpdate', from.path, to)
    if (to.meta && to.meta.keepAlive !== false) {
      this.$store.dispatch('app/addKeepAliveRoute', to.name)
    }

    next()
  },
}
