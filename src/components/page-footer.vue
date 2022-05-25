<template>
  <div class="page-footer" :class="{'fixed-bottom': fixedBottom}">
    <a href="http://www.beian.miit.gov.cn" target="_blank">琼ICP备18002958号-1</a><br/>
    版权所有 © 海南高灯科技有限公司
  </div>
</template>

<script>
export default {
  name: 'PageFooter',
  props: {
    fixedBottom: Boolean
  }
}
</script>

<style lang="scss" scoped>
@import "~@/styles/variables.scss";

.page-footer {
  width: 100%;
  line-height: 16px;
  text-align: center;
  font-size: 12px;
  color: $color-text-secondary;
  padding: 40px 0 20px;
  z-index: 9;

  a {
    text-decoration: none;
    color: $color-text-secondary;
  }

  &.fixed-bottom {
    position: fixed;
    bottom: 0
  }
}
</style>
