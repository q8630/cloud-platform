module.exports = {
  // 登录帐号，非纯数字，8-20位
  REG_ACCOUNT: /^(?!\d+$).{8,20}$/,
  // 邮箱地址
  REG_EMAIL: /^[\w.-]+@[\w-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,}$/,
  // 密码：8-18位数字、大小写字母、符号任意两种组合
  REG_PASS: /^(?![0-9]+$)(?![a-z]+$)(?![A-Z]+$)(?!([^(0-9a-zA-Z)]|[()])+$)([^(0-9a-zA-Z)]|[()]|[a-z]|[A-Z]|[0-9]){8,18}$/i,
  // 手机号码
  REG_MOBILE: /^1[0-9]{10}$/,
  // 电话号码（带区号），支持11位手机号码
  REG_PHONE: /^([0-9]{3,4}-?)?([0-9]{7,8})+(-[0-9]{2,8})?$/,
  // 税号：数字或大写字母组合，长度为15或18或20位
  RGE_TAX_CODE: /^([0-9A-Z]{15}|[0-9A-Z]{18}|[0-9A-Z]{20})$/,
  // 银行账号：纯数字，长度不超过30位
  REG_BANK_ACCOUNT: /^[0-9]{1,30}$/,
  // 企业电话（格式不定，支持手机号、座机、400等号码，这里只校验长度7-20）
  RGE_ENTERPRISE_PHONE: /^\d[\d-]{5,18}\d$/,
}
