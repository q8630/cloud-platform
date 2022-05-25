const baseURL = {
  // DEV: '//rap2api.taobao.org/app/mock/231054/', // rap2
  // DEV: 'https://cloud-backend-dev.wetax.com.cn',
  DEV: [
    'https://cloud-backend-test.wetax.com.cn', // 云平台域名
    'http://backend-test.wetax.com.cn', // 后台管理资料域名
  ],
  TEST: [
    'https://cloud-backend-test.wetax.com.cn',
    'http://backend-test.wetax.com.cn'
  ],
  PREPROD: [
    'https://cloud-backend-uat.wetax.com.cn',
    'https://backend.fapiaoer.cn'
  ],
  PROD: [
    'https://cloud-backend.wetax.com.cn',
    'https://backend.fapiaoer.cn'
  ],
}

/**
 * 根据环境变量获取域名
 */
export default function getBaseURL(i = 0, env = APP_ENV) {
  let index = i
  if (typeof i !== 'number') {
    console.error('getBaseURL：i 参数值必须是一个int类型')
    index = 0
  }
  // 根据环境变量获取域名
  const url = baseURL[env || 'PROD']
  return url[index]
}
