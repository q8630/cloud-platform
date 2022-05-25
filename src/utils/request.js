import axios from 'axios'
import { MessageBox, Loading } from 'element-ui'
import getBaseURL from '@/utils/baseURL'

import { trimFieldValues } from './index'
import { getToken, updateTokenExpires, getClientStore } from './cookie-storage'
import store from '@/store'

const defaultErrorMessage = '系统出错了，请稍候重试'
const service = axios.create({
  baseURL: getBaseURL(),
  timeout: 15000
})
let loadingInstance = null

service.interceptors.request.use(
  options => {
    console.log('request: ', options.url, options)
    const config = options
    const method = options.method.toUpperCase()
    const field = 'params' // method === 'GET' ? 'params' : 'data'
    const token = getToken() || ''
    const storeId = getClientStore().client_store_id || ''

    // 添加token, 门店ID到查询参数中
    config[field] = { ...config[field], sid: storeId, token }

    // post请求时，并且参数为普通对象的话，过滤参数的空格
    if (method === 'POST') {
      config.data = trimFieldValues(config.data)
    }

    return config
  },
  error => Promise.reject(error)
)

service.interceptors.response.use(
  response => {
    console.log('response: ', response.data)
    const { data } = response
    const code = +data.code

    // Do something
    if (code === 0) {
      return data.data
    }

    return Promise.reject(response)
  },
  error => Promise.reject(error)
)

function wrap(errorMessage) {
  return { message: errorMessage }
}

/**
 * 请求未发出，如：
 * 1. interceptors.request拦截器reject的错误
 * 2. 跨域请求，在OPTIONS请求出错后，真实的请求将不会发送，会直接报错
 * 3. 请求地址错误
 * 4. 其它未知情况
 *
 * @param  {Object} error 错误对象
 * @return {Object}       返回包装后的错识信息对象，如 { message: '' }
 */
function handleRequestError(error) {
  console.error('handleRequestError', error)
  let reason
  const errorMessage = error.message

  if (errorMessage === 'Network Error') { // Axios.onerror 拦截后，统一返回 Network Error
    reason = wrap('网络开小差了，请稍候重试')
  } else if (errorMessage && errorMessage.indexOf('timeout of') !== -1) { // 请求超时
    reason = wrap('请求超时了，请稍候重试')
  } else {
    reason = error
  }

  return reason
}

/**
 * 请求已发出，但http状态码不为2xx的错误
 *
 * @param  {Object} error 错误对象
 * @return {Object}       返回包装后的错识信息对象，如 { message: '' }
 */
function handleResponseError(error) {
  console.error('handleResponseError', error)
  const status = error.response.status

  return wrap(`[${status}]${defaultErrorMessage}`)
}

/**
 * 业务异常，由interceptors.response拦截器reject的错误
 *
 * @param  {Object} error 错误对象
 * @return {Object}       返回包装后的错识信息对象，如 { message: '' }
 */
function handleServiceError(error) {
  console.error('handleServiceError', error)
  // data 为服务器端返回的报文
  const data = error.data || {}
  const code = +data.code
  const exceptionCodes = [401, 403]

  // 其它业务异常，由外边处理
  if (!exceptionCodes.includes(code)) {
    return data
  }

  // 401 token失效
  if (code === 401) {
    store.dispatch('user/logout')
      .then(() => {
        if (data.message) {
          return MessageBox.alert(data.message, '提示', { type: 'error', showClose: false })
            .then(() => {
              window.location.href = '/#/user/login'
            })
        }

        window.location.href = '/#/user/login'
      })
  } else if (code === 403) {
    // 403 没有权限
    window.location.href = '/#/403'
  }

  return null
}

/**
 * 异常处理
 * @param  {Object} error        错误对象
 * @param  {Boolean} showError   是否显示错误
 * @return {Promise}             返回一个异常处理的promise对象
 */
function handleError(error, requestOptions) {
  handleAfterSend()

  let reason

  if (error.response) {
    reason = handleResponseError(error)
  } else if (error.status >= 200 && error.status < 300) {
    reason = handleServiceError(error)
  } else {
    reason = handleRequestError(error)
  }

  if (reason && requestOptions.showError) {
    MessageBox.alert(
      reason.message || reason,
      '提示',
      {
        type: 'error',
        showClose: false,
      }
    )
  }

  return Promise.reject(reason)
}

/**
 * 成功处理
 * @param  {Object} res response对象
 * @return {Object}     返回一个response对象，以便在外层捕获
 */
function handleSuccess(res) {
  updateTokenExpires()
  handleAfterSend()
  return res
}

function handleAfterSend() {
  if (loadingInstance) {
    loadingInstance.close()
    loadingInstance = null
  }
}

/**
 * 发送请求前的处理
 * 不直接在 axios.request 拦截器中处理，以便可以在外边重置
 */
function handleBeforeSend(requestOptions) {
  if (requestOptions.showLoading) {
    loadingInstance = Loading.service()
  }
}

const defaultOptions = {
  showError: true, // 是否弹窗显示错误
  showLoading: false, // 是否显示 loading
  beforeSend: handleBeforeSend, // request 前执行的操作
}

/**
 * axios封装
 * @param  {Object} options      axios 的请求参数
 * @param  {String} method       axios 的请求方式，可在 options 中设置，这里方便 request.get 重置
 * @return {Promise}             返回一个Promise对象
 */
function request(options = {}, method = 'get') {
  const requestOptions = Object.assign({}, defaultOptions, { method }, options)
  // beforeSend
  requestOptions.beforeSend(requestOptions)
  return service(requestOptions).then(res => handleSuccess(res)).catch(error => handleError(error, requestOptions))
}

request.get = options => request(options, 'get')

request.post = options => request(options, 'post')

export default request
