import request from '@/utils/request'

/**
 * 获取门店列表
 * @param  {Object} params           查询参数
 * @param  {Object} requestOptions
 * @return {Promise}
 */
export function fetchClientStores(params, requestOptions) {
  return request({
    url: 'v3/client-store/list',
    data: params,
    method: 'post',
    ...requestOptions
  })
}

/**
 * 新增、编辑门店
 * @param  {Object} params
 * @param  {Object} requestOptions
 * @return {Promise}
 */
export function addOrUpdateClientStore(params, requestOptions) {
  const url = params.client_store_id ? 'v3/client-store/edit' : 'v3/client-store/add'
  return request({
    url,
    data: params,
    method: 'post',
    ...requestOptions
  })
}

/**
 * 启用、禁用门店
 * @param  {String} storeID 门店ID
 * @param  {String} state   0启用，1禁用
 */
export function updateState(storeID, state) {
  const url = +state === 0 ? '/v3/client-store/enable' : '/v3/client-store/disable'
  return request({
    url,
    data: { client_store_id: storeID },
    method: 'post'
  })
}

/**
 * 获取门店所关联的发票种类列表
 */
export function fetchInvoiceStyles(storeID) {
  return request({
    url: 'v3/client-store/get-invoice-type',
    params: { store_id: storeID }
  })
}
