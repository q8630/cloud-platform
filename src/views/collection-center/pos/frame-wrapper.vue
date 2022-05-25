<template>
  <div class="frame-wrapper">
    <iframe ref="frame" :src="frameSrc" scrolling="0" />
  </div>
</template>

<script>
import style from 'dom-helpers/css'
import addEventListener from 'dom-helpers/addEventListener'
import removeEventListener from 'dom-helpers/removeEventListener'
import { debounce } from 'lodash'
import { getToken } from '@/utils/cookie-storage'

export default {
  name: 'FrameWrapper',
  props: {
    src: {
      type: String,
      required: true
    }
  },
  computed: {
    frameSrc() {
      if (this.src) {
        const frameSrc = this.src
        const baseURL = frameSrc.indexOf('?') === -1 ? `${frameSrc}?` : `${frameSrc}&`
        return `${baseURL}token=${getToken()}`
      }

      return ''
    }
  },
  mounted() {
    addEventListener(window, 'message', this.resetFrameHeight)
  },
  beforeDestroy() {
    removeEventListener(window, 'message', this.resetFrameHeight)
  },
  methods: {
    resetFrameHeight: debounce(function handler(event) {
      const $frame = this.$refs.frame

      if ($frame && event.data) {
        style($frame, { height: `${event.data}px` })
      }
    }, 200)
  }
}
</script>

<style lang="scss" scoped>
.frame-wrapper {
  position: relative;
  width: 100%;

  iframe {
    width: 100%;
    min-height: calc(100vh - 132px);
    border: 0;
  }
}
</style>
