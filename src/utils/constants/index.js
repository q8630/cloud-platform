/**
 * 公共常量
 */
import Reg from './regexp'

// 默认分页大小
export const PAGE_SIZE = 10
// 默认分页大小集合
export const PAGE_SIZES = [10, 20, 30]

export default {
  PAGE_SIZE,
  PAGE_SIZES,
  ...Reg
}

