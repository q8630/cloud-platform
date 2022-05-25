const getters = {
  sidebar: state => state.app.sidebar,
  device: state => state.app.device,
  keepAliveRoute: state => state.app.keepAliveRoute,
  tabs: state => state.app.tabs,

  token: state => state.user.token,
  user_info: state => state.user.user_info,
  auth_list: state => state.user.auth_list,
  user_store_list: state => state.user.user_store_list,
  selected_client_store: state => state.user.selected_client_store,

  client_info: state => state.business.client_info,
  store_list: state => state.business.store_list,
  tax_list: state => state.business.tax_list,
  project_data: state => state.business.project_data,
  all_project: state => state.business.all_project,
  tax_rate_list: state => state.business.tax_rate_list,
  invoice_types: state => state.business.invoice_types,
  default_project: state => state.business.default_project,

  routes: state => state.permission.routes,
  routeMaps: state => state.permission.routeMaps,
}

export default getters
