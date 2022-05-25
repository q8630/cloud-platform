import { asyncRoutes, constantRoutes } from '@/router'

function hasPermission(authorities, route) {
  if (route.path === '*' || (route.meta && route.meta.authorized === false)) {
    return true
  }

  return authorities.indexOf(route.path) > -1
}

function filterAsyncRoutes(routes, authorities = []) {
  const res = []

  routes.forEach(route => {
    if (hasPermission(authorities, route)) {
      const tmp = { ...route }
      if (tmp.children) {
        tmp.children = filterAsyncRoutes(tmp.children, authorities)
      }
      res.push(tmp)
    }
  })

  return res
}

function generateAccessedRoutes(authorities) {
  return filterAsyncRoutes(asyncRoutes, authorities)
}

function generateRouteMaps(routes = [], routeMap = {}) {
  const result = routeMap

  routes.forEach(r => {
    result[r.path] = r

    if (r.children && r.children.length) {
      generateRouteMaps(r.children, result)
    }
  })

  return result
}

const state = {
  routes: [],
  addedRoutes: [],
  routeMaps: {}
}

const mutations = {
  RESET_ROUTES(state) {
    state.addedRoutes = []
    state.routes = []
  },
  SET_ROUTES(state, routes) {
    state.routes = routes
    // 为方便后面取值，这里把所有路由转成 map 存储
    state.routeMaps = generateRouteMaps(routes)
  },
  SET_ACCESSED_ROUTES(state, accessedRoutes) {
    state.addedRoutes = accessedRoutes
  }
}

const actions = {
  resetRoutes({ commit }) {
    commit('RESET_ROUTES')
  },
  generateRoutes({ commit }, authorities) {
    const accessedRoutes = generateAccessedRoutes(authorities)
    const routes = constantRoutes.concat(accessedRoutes)
    commit('SET_ACCESSED_ROUTES', accessedRoutes)
    commit('SET_ROUTES', routes)
    return accessedRoutes
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
