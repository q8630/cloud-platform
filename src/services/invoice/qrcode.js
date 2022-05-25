import request from '@/utils/request'

/**
 * 获取小票码列表
 * @param  {Object} params
 * @param  {Object} requestOptions
 * @return {Promise}
 */
export function codeOrderList(params, requestOptions) {
  return request({
    url: '/v3/code-order/list',
    data: params,
    method: 'post',
    ...requestOptions
  })
}

/**
 * 获取小票码信息
 * @param  {Object} params
 * @param  {Object} requestOptions
 * @return {Promise}
 */
export function codeOrderInfo(params, requestOptions) {
  return request({
    url: '/v3/code-order/info',
    params,
    ...requestOptions
  })
}

/**
 * 转换成老接口(提交开票接口)的开票数据
 */
function parseInvoiceData(invoiceData) {
  const { client_info: clientInfo, goods_info: goods, invoice_info: invoiceInfo } = invoiceData

  return {
    // 销方信息
    seller_name: clientInfo.name,
    taxpayer_num: clientInfo.tax_code,
    seller_address: clientInfo.address,
    seller_tel: clientInfo.phone,
    seller_bank_name: clientInfo.bank_name,
    seller_bank_account: clientInfo.bank_account,

    // 开票项目
    goods_info: JSON.stringify(goods),

    // 发票信息
    ...invoiceInfo,
    amount: invoiceInfo.total_price_with_tax, // 总价
    invoicer: invoiceInfo.drawer, // 开票人
    extra: invoiceInfo.remark, // 备注
  }
}

/**
 * 新增二维码小票
 * @param  {Object} invoiceData
 * @param  {Object} requestOptions
 * @return {Promise}
 */
export function codeOrderCreate(invoiceData, requestOptions) {
  return request({
    url: '/v3/code-order/create',
    data: parseInvoiceData(invoiceData),
    method: 'post',
    ...requestOptions
  })
}

/**
 * 小票作废
 * @param  {Object} params
 * @param  {Object} requestOptions
 * @return {Promise}
 */
export function codeOrderInvalid(params, requestOptions) {
  return request({
    url: '/v3/code-order/invalid',
    data: params,
    method: 'post',
    ...requestOptions
  })
}

/**
 * 小票删除
 * @param  {Object} params
 * @param  {Object} requestOptions
 * @return {Promise}
 */
export function codeOrderDelete(params, requestOptions) {
  return request({
    url: '/v3/code-order/delete',
    data: params,
    method: 'post',
    ...requestOptions
  })
}

/**
 * 获取商户下的所有员工
 * @param  {Object} params
 * @param  {Object} requestOptions
 * @return {Promise}
 */
export function clientAllEmployee(params, requestOptions) {
  return request({
    url: '/v3/client/all-employee',
    params,
    ...requestOptions
  })
}

/**
 * 获取小票码信息
 */
export function getTicketInfo(data) {
  return request({
    url: '/v3/code-order/info',
    method: 'post',
    data
  })
}

