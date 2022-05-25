<template>
  <el-autocomplete
    v-model="title"
    valueKey="buyer_title"
    :placeholder="placeholder"
    :trigger-on-focus="false"
    :fetch-suggestions="handleSearch"
    @select="handleSelect" />
</template>

<script>
import request from '@/utils/request'

export default {
  name: 'InvoiceTitleCombobox',
  props: {
    value: {
      type: String,
      required: true
    },
    // 标识是否为专票，专票信息查询会包含企业地址等信息
    specialInvoice: {
      type: Boolean,
      default: false
    },
    placeholder: {
      type: String,
      default: '请输入抬头名称'
    }
  },
  data() {
    return {
      loading: false,
      title: this.value,
    }
  },
  watch: {
    value(val) {
      this.title = val
    },
    // auto-complete 绑定了 this.title，
    // 而在组件外边用的 v-model 绑定了 this.value，
    // 这里需要把 $emit input event
    title(val) {
      this.$emit('input', val)
    }
  },
  methods: {
    handleSearch(query, callback) {
      // 小于 2 个字符的，不处理
      if (!query || query.trim().length < 2) {
        /* eslint-disable-next-line */
        return callback([])
      }

      this.fetchTitle({ buyer_title: query }, callback)
    },
    handleSelect(value) {
      // 如果是专票查询，在选中后，再次调用抬头搜索接口，查询专票数据后，再触发回调
      if (this.specialInvoice) {
        const params = { ...value, invoice_style: 'c' }

        return this.fetchTitle(params, res => {
          this.$emit('select', (res && res[0]) || value)
        })
      }

      this.$emit('select', value)
    },
    fetchTitle(params, callback) {
      request({ url: '/small/title/get-title', data: params, method: 'post' })
        .then(res => callback(res || []))
    }
  }
}
</script>
