import router from './router'

/**
 * 腾讯云分析 MTA
 * 由于 hash 路由的自动上报有问题，所以统一在 router.afterEach 后手动上报
 */
router.afterEach((to) => {
  if (window.MtaH5) {
    // 延时执行，避免获取到的 window.location 是路由跳转前的地址
    setTimeout(() => {
      // 路由可能会被 redirect，这里仅当 to.path 和 locatio.href 是相同路径时才上报
      if (to.path !== '/' && window.location.hash.indexOf(to.path) !== -1) {
        window.MtaH5.pgv()
      }
    }, 500)
  }
})
