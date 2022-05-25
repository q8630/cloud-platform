import request from '@/utils/request'

/**
 * 获取开票审核列表
 */
export function getInvoiceList(data) {
  return request({
    url: '/v3/invoice-record/list',
    method: 'post',
    data
  })
}

/**
 * 获取某个门店可选的发票类型
 */
export function getInvoiceTypes(params) {
  return request({
    url: '/v3/client-store/get-invoice-type',
    params
  })
}

/**
 * 获取某个门店指定开票类型可选的税盘
 */
export function getTypeTaxs(params) {
  return request({
    url: '/v3/client-store/get-tax-equipment',
    params
  })
}

/**
 * 计算开票金额、单价、数量
 */
export function countInvoice(data) {
  return request({
    url: '/v3/online-invoicing/tax-handle',
    method: 'post',
    data
  })
}

/**
 * 审核开票
 */
export function invoiceAudit(data) {
  return request({
    url: '/v3/invoice-record/confirm',
    method: 'post',
    data
  })
}

/**
 * 拒绝开票
 */
export function rejectInvoice(data) {
  return request({
    url: '/v3/invoice-record/reject',
    method: 'post',
    data
  })
}
