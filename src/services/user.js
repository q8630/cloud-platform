import request from '@/utils/request'

// 扫码登录
export function scanLogin(requestOptions) {
  return request({
    url: '/v3/user/scan-login',
    method: 'post',
    ...requestOptions
  })
}

// 账号密码登录
export function accountLogin(requestOptions) {
  return request({
    url: '/v3/user/account-login',
    method: 'post',
    ...requestOptions
  })
}

// 获取图形验证码
export function getPicCode() {
  return request({
    url: '/v3/user/picture-code',
    showLoading: false
  })
}

// 获取用户关联门店列表
export function getUserStores(options) {
  return request({
    ...options,
    url: '/v3/user/store-list',
    method: 'post'
  })
}

// 用户选择门店
export function selectStore(options) {
  return request({
    ...options,
    url: '/v3/user/choose-store',
    method: 'post'
  })
}

// 获取当前用户所允许访问的菜单列表
export function fetchMenus(options) {
  return request({
    ...options,
    url: '/v3/authority/menu-list',
  })
}

/**
 * 修改密码
 * @param  {String} oldPassword        原密码
 * @param  {String} newPassword        新密码
 * @param  {String} newPasswordConfirm 确认新密码
 * @return {Promise}
 */
export function updatePassword(oldPassword, newPassword, newPasswordConfirm) {
  return request({
    url: '/v3/user/reset-password',
    data: {
      old_password: oldPassword,
      new_password: newPassword,
      password_confirm: newPasswordConfirm
    },
    method: 'post'
  })
}

/**
 * 修改手机号
 * @param  {String} mobile      新手机号
 * @param  {String} smsCaptcha  短信验证码
 * @param  {String} password    当前登录密码
 * @return {Promise}
 */
export function updateMobile(mobile, smsCaptcha, password) {
  return request({
    url: '/v3/user/update-mobile',
    data: {
      mobile,
      smsCaptcha,
      password
    },
    method: 'post'
  })
}

/**
 * 发送短信验证码
 * @param  {String} mobile 手机号
 * @return {Promise}
 */
export function sendSMSCaptcha(mobile) {
  return request({
    url: '/v3/system/send-sms',
    data: { mobile },
    method: 'post'
  })
}

/**
 * 生成绑定微信的小程序码
 * @param  {String} employeeID  员工ID，不传时，后端默认取登录用户
 * @param  {Number} type        绑定码类型，1普通绑定，2换绑
 * @return {Promise}
 */
export function createWechatCode(employeeID, type = 1) {
  return request({
    url: '/v3/employee/bind-qr-code',
    data: { employee_id: employeeID, bind_type: type },
    method: 'post'
  })
}

/**
 * 解绑微信
 * @param  {String} employeeID 员工ID
 * @return {Promise}
 */
export function unbindWechat(employeeID) {
  return request({
    url: '/v3/employee/unbind',
    data: { employee_id: employeeID },
    method: 'post'
  })
}

// 获取用户信息
export function fetchUserInfo(options) {
  return request({
    url: '/v3/system/employee-info',
    ...options
  })
}

/**
 * 注册用户
 * @param  {String} options     注册信息
 * @return {Promise}
 */
export function clientRegister(options) {
  return request({
    url: '/v3/client/register',
    data: options,
    method: 'post'
  })
}

/**
 * 注册页面发送短信验证码
 * @param  {String} mobile 手机号
 * @return {Promise}
 */
export function clientRegSms(mobile) {
  return request({
    url: '/v3/client/reg-sms',
    data: { mobile },
    method: 'post'
  })
}

/**
 * 微信解绑
 * @param  {String} password 当前密码
 * @return {Promise}
 */
export function userUnbindWechat(password) {
  return request({
    url: '/v3/user/unbind-wechat',
    data: { password },
    method: 'post'
  })
}

