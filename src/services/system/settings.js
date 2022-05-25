import request from '@/utils/request'

/**
 * 获取企业信息
 * @return {Promise}
 */
export function fetchEnterpriseInfo() {
  return request({
    url: '/v3/system/enterprise-info'
  })
}

/**
 * 企业信息修改
 * @param  {FormData} formData multipart/form-data 表单的 FormData 对象
 * @return {Promise}
 */
export function updateEnterpriseInfo(formData) {
  return request({
    url: '/v3/system/enterprise-edit',
    headers: { 'Content-Type': 'multipart/form-data' },
    method: 'post',
    data: formData
  })
}
