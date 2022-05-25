import request from '@/utils/request'

/**
 * 根据门店ID, 发票种类获取相关的税盘列表
 * @param  {String} storeID      门店ID
 * @param  {String} invoiceStyle 发票种类
 */
export function getTaxList(storeID, invoiceStyle) {
  return request({
    url: '/v3/client-store/get-tax-equipment',
    params: {
      store_id: storeID,
      invoice_style: invoiceStyle
    }
  })
}

/**
 * 转换成老接口(提交开票接口)的开票数据
 */
function parseInvoiceData(invoiceData) {
  const { buyer_info: buyerInfo, client_info: clientInfo, goods_info: goods, invoice_info: invoiceInfo, is_print: isPrint } = invoiceData

  return {
    // 购方信息
    buyer_title_type: buyerInfo.title_type,
    buyer_title: buyerInfo.name,
    buyer_taxcode: buyerInfo.tax_code,
    buyer_email: buyerInfo.email,
    buyer_address: buyerInfo.address,
    buyer_phone: buyerInfo.phone,
    buyer_bank_name: buyerInfo.bank_name,
    buyer_bank_account: buyerInfo.bank_account,

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
    extra: invoiceInfo.remark, // 备注
    is_print: isPrint // 是否打印
  }
}

export function invoice(invoiceData) {
  return request({
    url: 'v3/online-invoicing/blue',
    data: parseInvoiceData(invoiceData),
    method: 'post'
  })
}
