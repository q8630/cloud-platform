import Cookies from 'js-cookie'

const state = {
  // <keep-alive> include 用来动态控制页面缓存的数组
  // 需要注意的是，<keep-alive> 缓存的组件是通过组件名称来缓存的
  keepAliveRoute: [],
  sidebar: {
    opened: Cookies.get('sidebarStatus') ? !!+Cookies.get('sidebarStatus') : true,
    withoutAnimation: false
  },
  device: 'desktop',
  // 系统 tabs 导航
  // { name, fullPath, path, title }
  tabs: []
}

const mutations = {
  ADD_KEEP_ALIVE_ROUTE(state, keepAliveRoute) {
    state.keepAliveRoute = state.keepAliveRoute.concat(keepAliveRoute)
  },
  SET_KEEP_ALIVE_ROUTE(state, keepAliveRoute) {
    state.keepAliveRoute = keepAliveRoute
  },
  TOGGLE_SIDEBAR(state) {
    state.sidebar.opened = !state.sidebar.opened
    state.sidebar.withoutAnimation = false
    if (state.sidebar.opened) {
      Cookies.set('sidebarStatus', 1)
    } else {
      Cookies.set('sidebarStatus', 0)
    }
  },
  CLOSE_SIDEBAR(state, withoutAnimation) {
    Cookies.set('sidebarStatus', 0)
    state.sidebar.opened = false
    state.sidebar.withoutAnimation = withoutAnimation
  },
  TOGGLE_DEVICE(state, device) {
    state.device = device
  },
  ADD_TAB(state, tab) {
    state.tabs = state.tabs.concat(tab)
  },
  REMOVE_TAB(state, path) {
    state.tabs = state.tabs.filter(tab => tab.path !== path)
  },
  UPDATE_TAB(state, { tab, index }) {
    state.tabs[index] = tab
  }
}

const actions = {
  addKeepAliveRoute({ commit, state }, keepAliveRoute) {
    if (keepAliveRoute) {
      const found = state.keepAliveRoute.find(route => route === keepAliveRoute)

      if (!found) {
        commit('ADD_KEEP_ALIVE_ROUTE', keepAliveRoute)
      }
    }
  },
  removeKeepAliveRoute({ commit, state }, keepAliveRoute) {
    const routes = state.keepAliveRoute.filter(route => route !== keepAliveRoute)
    commit('SET_KEEP_ALIVE_ROUTE', routes)
  },
  setKeepAliveRoute({ commit }, keepAliveRoute) {
    commit('SET_KEEP_ALIVE_ROUTE', keepAliveRoute)
  },
  toggleSideBar({ commit }) {
    commit('TOGGLE_SIDEBAR')
  },
  closeSideBar({ commit }, { withoutAnimation }) {
    commit('CLOSE_SIDEBAR', withoutAnimation)
  },
  toggleDevice({ commit }, device) {
    commit('TOGGLE_DEVICE', device)
  },
  addTab({ commit, state }, tab) {
    if (tab && tab.path) {
      const found = state.tabs.find(t => t.path === tab.path)

      if (!found) {
        commit('ADD_TAB', tab)
      }
    }
  },
  removeTab({ dispatch, commit, state }, path) {
    const tab = state.tabs.find(tab => tab.path === path)

    // 级联删除它在 keepAliveRoute 中的数据
    if (tab) {
      dispatch('removeKeepAliveRoute', tab.name)
    }

    commit('REMOVE_TAB', path)
  },
  updateTab({ commit }, payload) {
    commit('UPDATE_TAB', payload)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
