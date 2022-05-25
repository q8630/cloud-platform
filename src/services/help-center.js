import request from '@/utils/request'
import getBaseURL from '@/utils/baseURL'


// 获取下载包列表
export function getInstallList(data) {
  return request({
    baseURL: getBaseURL(1),
    url: '/api/material/install-package',
    data
  })
}

// 获取操作手册列表
export function getHandbookList(data) {
  return request({
    baseURL: getBaseURL(1),
    url: '/api/material/operation-manual',
    data
  })
}
