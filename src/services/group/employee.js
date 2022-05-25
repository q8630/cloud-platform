import request from '@/utils/request'

export function fetchEmployees(params, requestOptions) {
  return request({
    ...requestOptions,
    url: '/v3/employee/list',
    params,
  })
}

export function addOrUpdateEmployee(params, requestOptions) {
  const url = params.employee_id ? '/v3/employee/update' : '/v3/employee/add'
  return request.post({
    ...requestOptions,
    url,
    data: params,
  })
}

export function deleteEmployee(employeeID, requestOptions) {
  return request.post({
    ...requestOptions,
    url: '/v3/employee/delete',
    data: { employee_id: employeeID },
  })
}

/**
 * 获取角色（权限组）列表
 */
export function fetchRules() {
  return request({
    url: '/v3/authority/group-all',
  })
}
