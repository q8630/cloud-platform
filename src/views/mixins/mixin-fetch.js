import { merge } from 'lodash'
import { PAGE_SIZE } from '@/utils/constants'

const defaultOptions = {
  dataKeys: {
    list: 'list',
    page: 'page',
    total: 'total_count',
  }
}

/**
 * mixinFetch
 * @param  {Object} options 可配置 _fetchData 所返回的数据的 dataKeys，默认为 list, page, total_count
 * @return {Object}         mixins object
 */
export function mixinFetch(options) {
  const fetchOptions = merge({}, defaultOptions, options)

  return {
    data() {
      return {
        loading: false,
        list: [],
        total: 0,
        page: 1,
        page_size: PAGE_SIZE,
      }
    },
    beforeCreate() {
      // 初始化内部参数
      this._fetchHandler = null
      this._searchParams = null
      this._requestCount = 0
    },
    methods: {
      _pending() {
        this.loading = true
        this._requestCount += 1
      },
      _done() {
        this._requestCount -= 1

        // 仅在当前并发请求数小于等于0时才关闭 loading
        if (this._requestCount <= 0) {
          this._requestCount = 0
          this.loading = false
        }
      },
      /**
       * 基于 this.$store.dispatch 封装，便于处理 loading 状态
       * @param  {String}  action 原 Action 名称
       * @return {Promise}        返回原 this.$store.dispatch 后得到的 Promise
       */
      _dispatch(action) {
        if (typeof action !== 'string') {
          throw new TypeError('"action" must be a string')
        }

        if (!this.$store || !this.$store.dispatch) {
          throw new Error('"this.$store" cannot be empty')
        }

        this._pending()

        return this.$store.dispatch(action).finally(this._done)
      },
      /**
       * 基于业务方法封装，统一处理页面 loading 状态
       *
       * @param  {Function} handler 需要执行的业务方法
       * @return {Function}         返回一个包装后的函数，用于接收参数
       */
      _request(handler) {
        if (typeof handler !== 'function') {
          throw new TypeError('"handler" must be a function')
        }

        this._pending()

        return (...args) => handler(...args).finally(this._done)
      },
      /**
       * 封装列表加载数据的 fetchData 方法
       * 1. 统一处理加载数据时的 loading
       * 2. 统一处理 ElPagination 用的 total, page, pageSize
       * 3. 统一处理列表用的 list
       *
       * @param  {Function} handler 加载列表数据时的业务方法
       * @return {Function}         返回一个包装后的函数，用于接收查询参数
       */
      _fetchData(handler) {
        // 返回一个包装函数，用于接收原业务方法参数
        return (params, ...args) => {
          // 缓存 fetchHandler
          this._fetchHandler = handler
          // 缓存查询参数，便于在 _reload 或 _handlePageChange 时带上原查询条件
          this._searchParams = { ...this._searchParams, page_size: this.page_size, ...params }

          return this._request(handler)(this._searchParams, ...args)
            .then(res => {
              const { dataKeys } = fetchOptions
              const list = res[dataKeys.list] || []
              const total = res[dataKeys.total] || 0
              const page = res[dataKeys.page] || 1

              this.list = list
              this.total = +total
              this.page = +page

              return res
            })
        }
      },
      /**
       * 重载列表数据
       */
      _reload(page) {
        if (page) {
          this.page = page
        }

        this._fetchData(this._fetchHandler)({ page: this.page })
      },
      /**
       * 用于 ElPagination 绑定的 size-change 事件
       */
      _handleSizeChange(val) {
        this.page_size = val
        this._fetchData(this._fetchHandler)()
      },
      /**
       * 用于 ElPagination 绑定的 current-change 事件
       */
      _handlePageChange(page) {
        this.page = page
        this._fetchData(this._fetchHandler)({ page })
      },
    },
  }
}

export default mixinFetch()
