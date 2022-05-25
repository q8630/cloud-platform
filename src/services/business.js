import request from '@/utils/request'

// 获取当前商户关联的门店列表
export function fetchClientStores(requestOptions) {
  return request({
    ...requestOptions,
    method: 'post',
    url: 'v3/client/client-store-list',
  })
}

// 获取当前商户关联的税盘列表
export function fetchTaxboxs(requestOptions) {
  return request({
    ...requestOptions,
    url: 'v3/client/client-equ-list',
  })
}

// 税率列表
export function getTaxRateList(data) {
  return request({
    url: '/v3/client-project/tax-rate',
    method: 'post',
    data
  })
}

// 可开票类型
export function clientInvoiceType(requestOptions) {
  return request({
    ...requestOptions,
    url: 'v3/equipment/client-invoice-type',
  })
}

// 获取商户所有开票项目
export function getAllProject(data) {
  return request({
    url: '/v3/client-project/get-projects',
    data
  })
}

// 获取默认开票项
export function getDefaultProject(data) {
  return request({
    url: '/v3/client-project/default-project',
    data
  })
}

export function getClientInfo() {
  return request({ url: 'v3/client/get-client-info' })
}
