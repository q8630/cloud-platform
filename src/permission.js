import router, { constantRoutes } from './router'
import store from './store'
import NProgress from 'nprogress' // progress bar
import { getToken, setToken } from '@/utils/cookie-storage' // get token from cookie

import 'nprogress/nprogress.css' // progress bar style

NProgress.configure({ showSpinner: false }) // NProgress Configuration

// 路由白名单
// 默认所有在 router/constantRoutes 配置的路由都在白名单内
const whiteList = (function generateWhiteList(routes) {
  let list = []

  if (routes && routes.length) {
    routes.forEach(route => {
      list.push(route.path)
      // loop child
      if (route.children && route.children.length) {
        list = list.concat(generateWhiteList(route.children))
      }
    })
  }

  return list
})(constantRoutes)

router.beforeEach(async(to, from, next) => {
  console.log('router.beforeEach', from.path, to.path)
  // start progress bar
  NProgress.start()

  // 携带参数 token，免登录
  const { token: newToken } = to.query
  if (newToken && newToken !== '') {
    // 缓存 token
    setToken(newToken)

    next({ ...to, query: {} })
    return
  }

  const token = getToken()

  // token 存在，即认为是已登录
  if (token) {
    // 登录页重定向到根路由
    if (to.path === '/user/login') {
      return next('/')
    }

    // 白名单，直接放行
    // 登录后进入的根路由，也在白名单内，这里不处理，
    // 避免后面在拉取菜单权限时，出现在登录页卡顿的错觉，
    // 具体控制逻辑见 layout/app-layout
    if (whiteList.indexOf(to.path) !== -1) {
      return next()
    }

    const hasRoles = store.getters.auth_list && store.getters.auth_list.length

    // 已经拉取过用户权限，直接放行
    if (hasRoles) {
      return next()
    }

    // 其它情况，拉取用户访问权限后，刷新当前路由
    try {
      // 获取用户权限列表
      const authorities = await store.dispatch('user/getAuthorities')
      // 根据用户访问权限生成可访问的路由列表
      const accessedRoutes = await store.dispatch('permission/generateRoutes', authorities)

      // 添加允许访问的路由到 router
      router.addRoutes(accessedRoutes)

      // hack method to ensure that addRoutes is complete
      // set the replace: true, so the navigation will not leave a history record
      next({ ...to, replace: true })
    } catch (error) {
      // 这里需要捕获异常，避免接口出错而终止了
      console.error(error)
      // 重置 token，以便在刷新页面时，会自动重定向到登录页
      await store.dispatch('user/resetToken')
      next(`/user/login?redirect=${to.path}`)
      NProgress.done()
    }
  } else {
    // token 不存在
    if (to.path === '/' || whiteList.indexOf(to.path) === -1) {
      // 根路由或非白名单的，重定向到登录页
      next(`/user/login?redirect=${to.path}`)
    } else {
      // 其它，不需要登录权限的，直接放行
      next()
    }
  }
})

router.afterEach((to) => {
  console.log('router.afterEach', to.path)
  // finish progress bar
  NProgress.done()
})
