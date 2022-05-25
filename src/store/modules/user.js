import { cloneDeep } from 'lodash'
import { fetchMenus, getUserStores, fetchUserInfo } from '@/services/user'
import { getToken, removeToken, setClientStore, getClientStore, removeClientStore } from '@/utils/cookie-storage'
import { resetRouter } from '@/router'

function generateAuthorities(menus) {
  let authorities = []

  if (menus && menus.length) {
    menus.forEach(menu => {
      if (menu.url) {
        authorities.push(menu.url)
      }

      if (menu.children) {
        authorities = authorities.concat(generateAuthorities(menu.children))
      }
    })
  }

  return authorities
}

// 当前用户选择的门店数据，默认为“所有门店数据汇总”
const defaultClientStore = { client_store_id: -1, name: '所有门店数据汇总' }
const defaultState = {
  token: '',
  user_info: {},
  auth_list: null, // 当前用户关联的权限列表（实际就是系统菜单 url 组成的数组）
  selected_client_store: defaultClientStore, // 当前用户选择的门店数据
  user_store_list: [], // 获取用户关联门店列表
}

const state = {
  ...defaultState,
  token: getToken(),
  selected_client_store: { ...defaultClientStore, ...getClientStore() }
}

const mutations = {
  RESET(state) {
    Object.keys(defaultState).forEach(key => {
      state[key] = cloneDeep(defaultState[key])
    })
  },
  SET_TOKEN(state, token) {
    state.token = token
  },
  SET_USER(state, user) {
    state.user_info = user
  },
  SET_AUTH_LIST(state, authList) {
    state.auth_list = authList
  },
  SET_USER_STORES(state, list) {
    state.user_store_list = list
  },
  SET_SELECTED_CLIENT_STORE(state, clientStore) {
    state.selected_client_store = clientStore
  }
}

const actions = {
  // reset state
  resetState({ commit }) {
    commit('RESET')
  },

  // user logout
  logout({ dispatch }) {
    return new Promise((resolve, reject) => {
      try {
        dispatch('resetState')
        // 清除 routes 数据，避免存在脏数据（系统会根据它生成菜单导航）
        dispatch('permission/resetRoutes', null, { root: true })
        // 清除商户相关信息
        dispatch('business/resetState', null, { root: true })
        removeToken()
        removeClientStore()
        resetRouter()

        resolve()
      } catch (e) {
        reject(e)
      }
    })
  },

  // remove token
  resetToken({ commit }) {
    return new Promise(resolve => {
      commit('SET_TOKEN', '')
      removeToken()
      resolve()
    })
  },

  getAuthorities({ commit }) {
    return fetchMenus({ showLoading: true }).then(res => {
      const authorities = generateAuthorities(res)
      commit('SET_AUTH_LIST', authorities)
      return authorities
    })
  },

  getUserStores({ commit, state }) {
    if (state.user_store_list && state.user_store_list.length) {
      return state.user_store_list
    }

    return getUserStores().then(res => {
      commit('SET_USER_STORES', res || [])
      return res
    })
  },

  setUserStores({ commit }, data) {
    commit('SET_USER_STORES', data)
  },

  getUserInfo({ commit, state }, options) {
    if (state.user_info && state.user_info.user_id) {
      return state.user_info
    }

    return fetchUserInfo(options).then(res => {
      commit('SET_USER', res)
      return res
    })
  },

  setUserInfo({ commit }, data) {
    commit('SET_USER', data)
  },

  getSelectedClientStore({ state }) {
    return state.selected_client_store
  },

  setSelectedClientStore({ commit }, clientStore) {
    setClientStore(clientStore)
    commit('SET_SELECTED_CLIENT_STORE', clientStore)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
