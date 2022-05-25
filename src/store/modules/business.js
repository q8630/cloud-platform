import { cloneDeep } from 'lodash'
import {
  fetchClientStores,
  fetchTaxboxs,
  getTaxRateList,
  clientInvoiceType,
  getAllProject,
  getDefaultProject,
  getClientInfo,
} from '@/services/business'

const defaultState = {
  tax_rate_list: [], // 税率列表
  store_list: [], // 当前用户所关联的门店列表
  tax_list: [], // 当前用户所关联的门店所关联的税盘列表
  invoice_types: [], // 获取可开发票类型
  all_project: [], // 所有开票项
  default_project: [], // 默认开票项
  client_info: {}, // 商户信息
}

const state = { ...defaultState }

const mutations = {
  RESET(state) {
    Object.keys(defaultState).forEach(key => {
      state[key] = cloneDeep(defaultState[key])
    })
  },
  SET_RATE_LIST(state, taxRateList) {
    state.tax_rate_list = taxRateList
  },
  SET_STORE_LIST(state, storeList) {
    state.store_list = storeList
  },
  SET_TAX_LIST(state, taxList) {
    state.tax_list = taxList
  },
  SET_ALL_PROJECT(state, data) {
    state.all_project = data
  },
  SET_INVOICE_TYPE(state, invoiceTypes) {
    state.invoice_types = invoiceTypes
  },
  SET_DEFAULT_PROJECT(state, data) {
    state.default_project = data
  },
  SET_CLIENT_INFO(state, data) {
    state.client_info = data
  }
}

const actions = {
  resetState({ commit }) {
    commit('RESET')
  },

  getTaxRateList({ commit, state }, data) {
    if (state.tax_rate_list && state.tax_rate_list.length) {
      return state.tax_rate_list
    }

    return getTaxRateList(data).then(res => {
      commit('SET_RATE_LIST', res || [])
      return res
    })
  },

  // 获取所有商品编码（开票项）
  getAllProject({ commit, state }, data) {
    if (state.all_project && state.all_project.length) {
      return state.all_project
    }

    return getAllProject(data).then(res => {
      commit('SET_ALL_PROJECT', res || [])
      return res
    })
  },

  // 获取当前商户关联的门店列表
  getClientStores({ commit, state }, option) {
    if (state.store_list && state.store_list.length) {
      return state.store_list
    }

    return fetchClientStores(option).then(res => {
      commit('SET_STORE_LIST', res.list || [])
      return res
    })
  },

  // 获取当前商户关联的税盘列表
  getTaxboxs({ commit, state }) {
    if (state.tax_list && state.tax_list.length) {
      return state.tax_list
    }

    return fetchTaxboxs().then(res => {
      commit('SET_TAX_LIST', res)
      return res
    })
  },

  // 获取可开发票类型
  clientInvoiceType({ commit, state }) {
    if (state.invoice_types && state.invoice_types.length) {
      return state.invoice_types
    }

    return clientInvoiceType().then(res => {
      commit('SET_INVOICE_TYPE', res)
      return res
    })
  },

  // 获取默认开票项
  getDefaultProject({ commit }) {
    return getDefaultProject().then(res => {
      commit('SET_DEFAULT_PROJECT', res)
      return res
    })
  },

  getClientInfo({ commit, state }) {
    if (state.client_info.id) {
      return state.client_info
    }

    return getClientInfo().then(res => {
      commit('SET_CLIENT_INFO', res)
      return res
    })
  }

}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
