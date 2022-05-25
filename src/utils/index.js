/* eslint-disable */

export function uuid(len, radix) {
  var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
  var uuid = [], i;
  radix = radix || chars.length;

  if (len) {
    // Compact form
    for (i = 0; i < len; i++) uuid[i] = chars[0 | Math.random()*radix];
  } else {
    // rfc4122, version 4 form
    var r;

    // rfc4122 requires these characters
    uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
    uuid[14] = '4';

    // Fill in random data.  At i==19 set the high bits of clock sequence as
    // per rfc4122, sec. 4.1.5
    for (i = 0; i < 36; i++) {
      if (!uuid[i]) {
        r = 0 | Math.random()*16;
        uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
      }
    }
  }

  return uuid.join('');
}

export function trim(str) {
  return typeof str === 'string' ? str.replace(/(^\s*)|(\s*$)/g, '') : str
}

/**
 * @param {any} obj The object to inspect.
 * @returns {boolean} True if the argument appears to be a plain object.
 */
export function isPlainObject(obj) {
  if (typeof obj !== 'object' || obj === null) {
    return false
  }

  // 普通的对象while循环结束后proto的值是：Object.prototype，
  // 通过Object.create(null)生成的对象proto的值是：null
  // 不直接使用 Object.getPrototypeOf(obj) === Object.prototype || Object.getPrototypeOf(obj) === null 判断
  // 是为了防止一些边界情况的出现，如frame访问变量时
  let proto = obj
  while (Object.getPrototypeOf(proto) !== null) {
    proto = Object.getPrototypeOf(proto)
  }

  return Object.getPrototypeOf(obj) === proto
}

/**
 * 去除 data 所有的属性值的空格，不考虑深层次属性，主要用于表单提交
 */
export function trimFieldValues(data) {
  if (data && isPlainObject(data)) {
    const newData = {}
    for (const key in data) {
      newData[key] = trim(data[key])
    }
    return newData
  }
  return data
}

/**
 * 获取字符串长度，中文+2
 */
export function getStringLength(str) {
  if (!str || typeof str !== 'string') {
    return 0
  }

  /* eslint-disable no-control-regex */
  return trim(str).replace(/[^\x00-\xff]/g, '01').length
}

/**
 * Form Validator
 * 字符长度校验，中文按2位计算，并且判断是否为required
 * @param  {Object}   rule     原validator rule
 * @param  {String}   value    原validator value
 * @param  {Function} callback 原validator callback
 */
export function validateStringLength(rule, value, callback) {
  if (
    (rule.required && !trim(value)) ||
    (rule.min && getStringLength(value) < rule.min) ||
    (rule.max && getStringLength(value) > rule.max)
  ) {
    callback(rule.message)
  }
  callback()
}

/**
 * 数字大写转换
 * @param  {String}   Money    原validator Money
 */
export function convertCurrency(Money) {
  let money = Money
  // 汉字的数字
  const cnNums = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖']
  // 基本单位
  const cnIntRadice = ['', '拾', '佰', '仟']
  // 对应整数部分扩展单位
  const cnIntUnits = ['', '万', '亿', '兆']
  // 对应小数部分单位
  const cnDecUnits = ['角', '分', '毫', '厘']
  // 整数金额时后面跟的字符
  const cnInteger = '整'
  // 整型完以后的单位
  const cnIntLast = '元'
  // 最大处理的数字
  const maxNum = 999999999999999.9999
  // 金额整数部分
  let integerNum
  // 金额小数部分
  let decimalNum
  // 输出的中文金额字符串
  let chineseStr = ''
  // 分离金额后用的数组，预定义
  let parts
  if (money === '') {
    return ''
  }
  money = parseFloat(money)
  if (money >= maxNum) {
    // 超出最大处理数字
    return ''
  }
  if (money === 0) {
    chineseStr = cnNums[0] + cnIntLast + cnInteger
    return chineseStr
  }
  // 转换为字符串
  money = money.toString()
  if (money.indexOf('.') === -1) {
    integerNum = money
    decimalNum = ''
  } else {
    parts = money.split('.')
    integerNum = parts[0]
    decimalNum = parts[1].substr(0, 4)
  }
  // 获取整型部分转换
  if (parseInt(integerNum, 10) > 0) {
    let zeroCount = 0
    const IntLen = integerNum.length
    for (let i = 0; i < IntLen; i++) {
      const n = integerNum.substr(i, 1)
      const p = IntLen - i - 1
      const q = p / 4
      const m = p % 4
      if (n === '0') {
        zeroCount += 1
      } else {
        if (zeroCount > 0) {
          chineseStr += cnNums[0]
        }
        // 归零
        zeroCount = 0
        chineseStr += cnNums[parseInt(n, 0)] + cnIntRadice[m]
      }
      if (m === 0 && zeroCount < 4) {
        chineseStr += cnIntUnits[q]
      }
    }
    chineseStr += cnIntLast
  }
  // 小数部分
  if (decimalNum !== '') {
    const decLen = decimalNum.length
    for (let i = 0; i < decLen; i++) {
      const n = decimalNum.substr(i, 1)
      if (n !== '0') {
        chineseStr += cnNums[Number(n)] + cnDecUnits[i]
      }
    }
  }
  if (chineseStr === '') {
    chineseStr += cnNums[0] + cnIntLast + cnInteger
  } else if (decimalNum === '') {
    chineseStr += cnInteger
  }
  return chineseStr
}

/**
 * urlToList
 * /userinfo/2144/id => ['/userinfo', '/useinfo/2144', '/userindo/2144/id']
 * @param  {String} url
 * @return {Array}
 */
export function urlToList(url = '') {
  const urls = url.split('/').filter(i => i)
  return urls.map((urlItem, index) => `/${urls.slice(0, index + 1).join('/')}`)
}

/**
 * 手机号脱敏处理
 * @param  {String} mobile 手机号
 * @return {String}        返回脱敏后的手机号
 */
export function moblieEncrypt(mobile) {
  if (!mobile || typeof mobile !== 'string') {
    return ''
  }

  const pat = /^(\d{3})\d*(\d{4})$/

  return mobile.replace(pat, '$1****$2')
}

/**
 * 根据地区编码 region_code 组织省市区三级联动下拉框所需的 values
 * @param  {String} regionCode 9位或6位数字的地区编码
 * @return {Array}
 */
export function regionCodeToArray(regionCode) {
  let region = []
  let code = regionCode

  if (code) {
    // 9位编码，截取前6位（省市区编码）
    if (code.length === 9) {
      code = code.substring(0, 6)
    }

    if (code.length === 6) {
      region = [
        `${code.substring(0, 2)}0000`,
        `${code.substring(0, 4)}00`,
        code
      ]
    }
  }

  return region
}

/**
 * 判断URL是否为外部链接
 */
export function isExternalUrl(url) {
  return /^(https?:|mailto:|tel:)/.test(url)
}
