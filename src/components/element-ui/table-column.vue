<script>
import dayjs from 'dayjs'
import { TableColumn } from 'element-ui'
import { getPropByPath } from 'element-ui/src/utils/util'
import { cellForced, treeCellPrefix } from 'element-ui/packages/table/src/config'

function isEmpty(value) {
  return typeof value === 'undefined' || value === null || value === ''
}

/**
 * 自定义 defaultRenderCell
 * https://github.com/ElemeFE/element/blob/v2.12.0/packages/table/src/config.js
 */
function defaultRenderCell(h, { row, column, $index }) {
  const { property, formatter, emptyText, dateFormatter } = column
  const value = property && getPropByPath(row, property).v

  if (formatter) {
    return formatter(row, column, value, $index)
  }

  if (value && dateFormatter) {
    if (typeof dateFormatter === 'function') {
      return dateFormatter(row, column, value, $index)
    }

    const format = typeof dateFormatter === 'string' ? dateFormatter : 'YYYY-MM-DD HH:mm:ss'
    const timestamp = `${value}`.length === 13 ? value : value * 1000
    return dayjs(timestamp).format(format)
  }

  return property && isEmpty(value) ? emptyText : value
}

export default {
  name: 'ElTableColumn',
  extends: TableColumn,
  props: {
    // 当值为空时显示的值
    emptyText: {
      type: String,
      default: '--'
    },
    // 时间格式化
    // 设为 true 时，格式为 YYYY-MM-DD HH:mm:ss，可指定格式化字符串
    dateFormatter: {
      type: [Boolean, String, Function],
      default: false
    },
  },
  created() {
    // 把新增的 props 写到原 TableColumn.columnConfig 中
    this.columnConfig.emptyText = this.emptyText
    this.columnConfig.dateFormatter = this.dateFormatter
  },
  watch: {
    emptyText(newVal) {
      this.columnConfig.emptyText = newVal
    },
    dateFormatter(newVal) {
      this.columnConfig.dateFormatter = newVal
    }
  },
  methods: {
    /**
     * 由于 TableColumn 没有提供自定义的 renderCell，
     * 所以这里重载 setColumnRenders 方法，以便使用自定义的 renderCell
     * https://github.com/ElemeFE/element/blob/v2.12.0/packages/table/src/table-column.js
     */
    setColumnRenders(column) {
      const specialTypes = Object.keys(cellForced)

      // renderHeader 属性不推荐使用。
      if (this.renderHeader) {
        console.warn('[Element Warn][TableColumn]Comparing to render-header, scoped-slot header is easier to use. We recommend users to use scoped-slot header.')
      } else if (specialTypes.indexOf(column.type) === -1) {
        column.renderHeader = (h, scope) => {
          const renderHeader = this.$scopedSlots.header
          return renderHeader ? renderHeader(scope) : column.label
        }
      }

      let originRenderCell = column.renderCell

      if (column.type === 'expand') {
        // 对于展开行，renderCell 不允许配置的。在上一步中已经设置过，这里需要简单封装一下。
        column.renderCell = (h, data) => (
          <div class="cell">
            { originRenderCell(h, data) }
          </div>
        )
        this.owner.renderExpanded = (h, data) => (
          this.$scopedSlots.default
            ? this.$scopedSlots.default(data)
            : this.$slots.default
        )
      } else {
        originRenderCell = originRenderCell || defaultRenderCell
        // 对 renderCell 进行包装
        column.renderCell = (h, data) => {
          let children = null

          if (this.$scopedSlots.default) {
            children = this.$scopedSlots.default(data)
          } else {
            children = originRenderCell(h, data)
          }

          const prefix = treeCellPrefix(h, data)
          const props = {
            class: 'cell',
            style: {}
          }

          if (column.showOverflowTooltip) {
            props.class += ' el-tooltip'
            props.style = {width: (data.column.realWidth || data.column.width) - 1 + 'px'}
          }

          return (
            <div { ...props }>
              { prefix }
              { children }
            </div>
          )
        }
      }
      return column
    },
  }
}
</script>
