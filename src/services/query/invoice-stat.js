import request from '@/utils/request'

/**
 * 已开发票统计
 * @param data
 */
export function getStatList(data) {
  return request({
    url: '/v3/statistics/invoice',
    method: 'post',
    data
  })
}
