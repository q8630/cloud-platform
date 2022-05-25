/**
 * 商品编码（开票项）管理接口
 */
import request from '@/utils/request'

// 商品编码列表
export function getProjectList(data) {
  return request({
    url: '/v3/client-project/projects',
    method: 'post',
    data
  })
}

// 新增商品编码
export function addProject(data) {
  return request({
    url: '/v3/client-project/create',
    method: 'post',
    data
  })
}

// 编辑商品编码
export function editProject(data) {
  return request({
    url: '/v3/client-project/edit',
    method: 'post',
    data
  })
}

// 删除商品编码
export function deleteProject(data) {
  return request({
    url: '/v3/client-project/delete',
    method: 'post',
    data
  })
}

// 查询特定商品编码
export function searchProject(data) {
  return request({
    url: '/v3/client-project/search',
    method: 'post',
    data
  })
}
