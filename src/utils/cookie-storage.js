import Cookies from 'js-cookie'

const TokenKey = '__token__'
const StoreKey = '__client_store__'

export function generateExpires() {
  // token 在后端默认2小时后失效（这里取小于2小时的值），在每次接口请求成功后，会刷新失效时间
  const expires = new Date()
  expires.setTime(expires.getTime() + 2 * 60 * 60 * 1000 - 10000)

  return expires
}

export function getToken() {
  return Cookies.get(TokenKey)
}

export function setToken(token) {
  return Cookies.set(TokenKey, token, { expires: generateExpires() })
}

export function removeToken() {
  return Cookies.remove(TokenKey)
}

export function setClientStore(clientStore) {
  return Cookies.set(StoreKey, clientStore)
}

export function getClientStore() {
  const clientStore = Cookies.get(StoreKey)
  return clientStore ? JSON.parse(clientStore) : {}
}

export function removeClientStore() {
  return Cookies.remove(StoreKey)
}

/**
 * 更新 token 的有效期
 */
export function updateTokenExpires() {
  // 这里直接调用 setToken 保存原来的 token 值即可
  const token = getToken()
  if (token) {
    setToken(token)
  }
}
