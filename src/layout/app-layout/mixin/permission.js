import { mapGetters } from 'vuex'

export default {
  computed: {
    ...mapGetters([
      'auth_list',
    ])
  },
  beforeRouteEnter(to, from, next) {
    console.log('Layout.beforeRouteEnter', from.path, to.path)
    next(vm => vm.init())
  },
  methods: {
    async init() {
      let accessedRoutes = this.$store.state.permission.addedRoutes

      // 用户权限不存在时，拉取用户权限并生成系统路由
      if (!this.auth_list) {
        // 获取用户权限列表
        const authorities = await this.$store.dispatch('user/getAuthorities')
        // 根据用户访问权限生成可访问的路由列表
        accessedRoutes = await this.$store.dispatch('permission/generateRoutes', authorities)

        // 添加允许访问的路由到 router
        this.$router.addRoutes(accessedRoutes)
      }

      this.redirect(accessedRoutes)
    },
    redirect(routes = []) {
      let accessedRoutes = routes

      // 访问根路由的时候，重定到可访问路由列表中的第1个路由
      if (this.$route.path === '/') {
        // 过滤掉 path: '*' 的路由
        accessedRoutes = accessedRoutes.filter(route => route.path !== '*')

        // 默认重定向到第1个匹配的路由
        if (accessedRoutes && accessedRoutes.length) {
          let first = accessedRoutes[0]

          // 该路由的子项菜单可能没有被分配访问权限，它本身配置的 redirect 或 path 会无效，
          // 这里取它的子项路由（暂只考虑它的直接子项）
          if (first.children && first.children.length) {
            first = first.children[0]
          }

          this.$router.replace({ path: first.redirect || first.path })
        } else {
          // 重定到没有访问权限的页面
          this.$router.replace({ path: '/403' })
        }
      }
    }
  }
}
