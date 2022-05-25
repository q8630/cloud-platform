import request from '@/utils/request'

/**
 * 获取发票明细列表
 * @param  {Object} params
 * @param  {Object} requestOptions
 * @return {Promise}
 */
export function invoiceDetailList(params, requestOptions) {
  return request({
    url: '/v3/invoice-detail/get-list',
    data: params,
    method: 'post',
    ...requestOptions
  })
}

/**
 * 获取列表查询条件
 * @param  {Object} params
 * @param  {Object} requestOptions
 * @return {Promise}
 */
export function invoiceDetailGetConfig(params, requestOptions) {
  return request({
    url: '/v3/invoice-detail/get-config',
    params,
    ...requestOptions
  })
}

/**
 * 获取发票详情
 * @param  {Object} params
 * @param  {Object} requestOptions
 * @return {Promise}
 */
export function getinvoiceDetailInfo(params, requestOptions) {
  return request({
    url: '/v3/invoice-detail/get-info',
    data: params,
    method: 'post',
    ...requestOptions
  })
}

/**
 * 红冲
 * @param  {Object} params
 * @param  {Object} requestOptions
 * @return {Promise}
 */
export function invoiceOperateRed(params, requestOptions) {
  return request({
    url: '/v3/invoice-operate/red',
    data: params,
    method: 'post',
    ...requestOptions
  })
}

/**
 * 作废
 * @param  {Object} params
 * @param  {Object} requestOptions
 * @return {Promise}
 */
export function invoiceOperateInvalid(params, requestOptions) {
  return request({
    url: '/v3/invoice-operate/invalid',
    data: params,
    method: 'post',
    ...requestOptions
  })
}

/**
 * 重试开票
 * @param  {Object} params
 * @param  {Object} requestOptions
 * @return {Promise}
 */
export function invoiceOperateRetryOne(params, requestOptions) {
  const url = params.is_red === '0' ? '/v3/invoice-operate/blue-retry-one' : '/v3/invoice-operate/red-retry-one'
  return request({
    url,
    data: { order_sn: params.order_sn },
    method: 'post',
    ...requestOptions
  })
}

/**
 * 发送邮件
 * @param  {Object} params
 * @param  {Object} requestOptions
 * @return {Promise}
 */
export function invoiceOperateSendMail(params, requestOptions) {
  return request({
    url: '/v3/detail-record/send-mail',
    data: params,
    method: 'post',
    ...requestOptions
  })
}

/**
 * 打印功能
 * @param  {Object} params
 * @param  {Object} requestOptions
 * @return {Promise}
 */
export function paperPrint(params, requestOptions) {
  return request({
    url: '/v3/paper/print',
    data: params,
    method: 'post',
    ...requestOptions
  })
}

