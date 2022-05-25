<script>
/**
 * 基于 element-ui Pagination 封装，便于统一页面显示的分页标签
 * 1. 设置默认的 layout, pageSizes
 * 2. 仅当 total > 0 时才显示
 */
import { Pagination } from 'element-ui'
import Constants from '@/utils/constants'

export default {
  name: 'ElPagination',
  extends: Pagination,
  props: {
    layout: {
      type: String,
      default: 'total, sizes, prev, pager, next, jumper'
    },
    total: {
      type: Number,
      default: 0
    },
    pageSizes: {
      type: Array,
      default() {
        return Constants.PAGE_SIZES
      }
    }
  },
  render() {
    const wraperProps = {
      class: { 'pagination-wrapper': true },
      style: {
        // 仅在 total 大于 0 时才显示
        display: this.total > 0 ? '' : 'none'
      }
    }

    // 调用 ElPagination.render 得到 VNode
    const vnode = this.$options.extends.render.apply(this, arguments)

    return (
      <div {...wraperProps}>{vnode}</div>
    )
  },
}
</script>

<style lang="scss" scoped>
  @import "~@/styles/variables.scss";

  .el-table + .pagination-wrapper {
    margin-top: $padding-spacing;
    text-align: right;
  }
</style>
