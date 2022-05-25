module.exports = {
  /**
   * @type {String}
   * @description 页面 title，用于 webpack 构建 index.html，以及其它可能用到的地方，比如系统导航显示的 title
   */
  title: '云票儿智税云-智慧税务解决方案提供商',
  /**
   * @type {Array}
   * @description 预渲染的路由，用于 SEO 优化，如登录页，详见 build/webpack.prod.conf.js
   */
  prerenderRoutes: ['/user/login', '/user/register', '/404', '/403'],
  /**
   * @type {boolean} true | false
   * @description Whether fix the header
   */
  fixedHeader: true,
}
