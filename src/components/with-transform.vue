<template>
  <div class="with-transform-wrapped" style="width: 100%; overflow-x: auto; transform-origin: 0px 0px 0px;">
    <slot></slot>
  </div>
</template>

<script>
import style from 'dom-helpers/css'
import addEventListener from 'dom-helpers/addEventListener'
import removeEventListener from 'dom-helpers/removeEventListener'
import { debounce } from 'lodash'

export default {
  name: 'WithTransform',
  data() {
    return {
      $tryCount: 0
    }
  },
  computed: {
    sidebarOpened() {
      return this.$store.getters.sidebar.opened
    }
  },
  watch: {
    sidebarOpened() {
      // sidebar 切换带有动画效果，这里延时执行，避免动效还没完成，取到的容器宽度不正确
      window.setTimeout(this._resizeHandler, 200)
    }
  },
  mounted() {
    this._initStyle()
    this._resizeHandler()
    this._addEventListener()
  },
  beforeDestroy() {
    this._removeEventListener()
  },
  /**
   * 页面会被 <keep-alive /> 缓存，
   * 这里需要在 <keep-alive /> 包裹后提供的生命周期 activated, deactivated 中也处理 resize 事件
   */
  activated() {
    this._resizeHandler()
    this._addEventListener()
  },
  deactivated() {
    this._removeEventListener()
  },
  methods: {
    _initStyle() {
      const $wrapped = this._getWrappedComponent()

      if ($wrapped) {
        // 给 WrappedComponent 添加style，避免获取不到 this.$el.scrollWidth
        style($wrapped, {'overflow-x': 'initial'})
      }
    },
    _getWrappedComponent() {
      const $slots = this.$slots.default

      // only children
      if ($slots.length === 1) {
        return $slots[0].elm
      }

      return null
    },
    _addEventListener() {
      addEventListener(window, 'resize', this._resizeHandler)
    },
    _removeEventListener() {
      removeEventListener(window, 'resize', this._resizeHandler)
    },
    _resizeHandler: debounce(function resize() {
      const $wrapper = this.$el
      const $parent = $wrapper.parentNode
      const parentPaddingLeft = Number(style($parent, 'paddingLeft').replace('px', '') || 0)
      const parentPaddingRight = Number(style($parent, 'paddingRight').replace('px', '') || 0)
      let parentWidth = 0
      let wrapperScrollWidth = 0

      if (!$wrapper || !$parent) {
        return false
      }

      const check = () => {
        this.$data.$tryCount += 1
        parentWidth = $parent.clientWidth - parentPaddingLeft - parentPaddingRight
        wrapperScrollWidth = $wrapper.scrollWidth

        // 重试 10 次，直到 wrapperScrollWidth != parentWidth 时结束
        return this.$data.$tryCount > 10 || wrapperScrollWidth !== parentWidth
      }

      const pollHandle = () => {
        // console.log('resize', parentWidth, wrapperScrollWidth)
        // 重置 $tryCount
        this.$data.$tryCount = 0
        // 默认样式，在 rate >= 1 时不缩放，让 width 自适应即可
        let width = 'auto'
        let scale = 'scale(1)'
        const rate = parentWidth / wrapperScrollWidth

        if (rate < 1) {
          width = `${wrapperScrollWidth}px`
          scale = `scale(${rate})`
        }

        const wrapperStyles = {
          width,
          '-webkit-transform': scale,
          '-moz-transform': scale,
          '-ms-transform': scale,
          transform: scale,
        }

        style($wrapper, wrapperStyles)

        return true
      }

      (function poll(handle) {
        check() && (handle() || window.setTimeout(() => poll(handle), 100))
      })(pollHandle)
    }, 200)
  }
}
</script>
