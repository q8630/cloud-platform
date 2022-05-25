import request from '@/utils/request'

/**
 * 获取开票设备列表
 * @param  {Object} params           查询参数
 * @param  {Object} requestOptions
 * @return {Promise}
 */
export function fetchTaxDevice(params, requestOptions) {
  return request({
    url: '/v3/equipment/list',
    data: params,
    method: 'post',
    ...requestOptions
  })
}

/**
 * 新增、编辑税盘
 * @param  {Object} params
 * @param  {Object} requestOptions
 * @return {Promise}
 */
export function addOrEditfetchTaxDevice(params, requestOptions) {
  const url = params.client_store_id ? '/v3/equipment/edit' : '/v3/equipment/create'
  return request({
    url,
    data: params,
    method: 'post',
    ...requestOptions
  })
}

/**
 * 删除税盘
 * @param  {Object} params
 * @param  {Object} requestOptions
 * @return {Promise}
 */
export function delfetchTaxDevice(params, requestOptions) {
  return request({
    url: '/v3/equipment/delete',
    data: params,
    method: 'post',
    ...requestOptions
  })
}

/**
 * 获取税盘详情
 * @param  {Object} params
 * @param  {Object} requestOptions
 * @return {Promise}
 */
export function getEquipmentSupport(params, requestOptions) {
  return request({
    url: '/v3/equipment/get-equipment-support',
    params,
    ...requestOptions
  })
}

// 新建区块链税盘
export function createBlockDisc(data) {
  return request({
    url: '/v3/equipment/create-block',
    method: 'post',
    data
  })
}

// 区块链税盘同步
export function syncBlockDisc(data) {
  return request({
    url: '/v3/equipment/sync-block',
    method: 'post',
    data
  })
}

// 停用税盘
export function disableBlockDisc(data) {
  return request({
    url: '/v3/equipment/disable',
    method: 'post',
    data
  })
}

// 启用税盘
export function enableBlockDisc(data) {
  return request({
    url: '/v3/equipment/enable',
    method: 'post',
    data
  })
}

// 获取开票渠道
export function getInvoiceChannel() {
  return request({
    url: '/v3/equipment/channel'
  })
}

