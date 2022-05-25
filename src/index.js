import 'babel-polyfill'
import Vue from 'vue'
import Cookies from 'js-cookie'

import install from './element-install'
import App from './App'
import store from './store'
import router from './router'

// global components
import SearchPanel from '@/components/search-panel'
import Collapse from '@/components/collapse'

import './permission' // permission control
import './analysis' // 数据分析埋点
import '@/icons' // icon

import '@/styles/element-variables.scss'
import 'normalize.css/normalize.css'
import '@/styles/index.scss'

// element-ui install
install(Vue, {
  size: Cookies.get('size') || 'mini' // set element-ui default size
})

// 查询收缩面板
Vue.component(SearchPanel.name, SearchPanel)
Vue.component(Collapse.name, Collapse)

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
