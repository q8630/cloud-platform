import request from '@/utils/request'

/**
 * 获取角色列表
 */
export function fetchRules(params) {
  return request({
    url: '/v3/authority/group-list',
    data: params,
    method: 'post'
  })
}

/**
 * 删除角色
 */
export function deleteRule(ruleID) {
  return request({
    url: '/v3/authority/delete-group',
    data: { group_id: ruleID },
    method: 'post'
  })
}


/**
 * 新增、修改角色
 */
export function addOrUpdateRule(params) {
  const url = params.group_id ? '/v3/authority/modify-group' : '/v3/authority/create-group'
  return request({
    url,
    data: params,
    method: 'post'
  })
}

/**
 * 根据角色ID获取权限列表
 */
export function fetchAuthorities(ruleID) {
  return request({
    url: '/v3/authority/group-permission-list',
    data: { group_id: ruleID },
    method: 'post'
  })
}

/**
 * 根据角色ID获取角色成员列表
 */
export function fetchMembers(ruleID) {
  return request({
    url: '/v3/authority/group-employee-list',
    data: { group_id: ruleID },
    method: 'post'
  })
}

/**
 * 修改角色权限
 */
export function updateAuthorities(params) {
  return request({
    url: '/v3/authority/modify-group-permission',
    data: params,
    method: 'post'
  })
}

/**
 * 修改角色成员
 */
export function updateMembers(params) {
  return request({
    url: '/v3/authority/modify-group-employee',
    data: params,
    method: 'post'
  })
}
