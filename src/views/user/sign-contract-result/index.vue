<template>
  <div>
    <page-header />
    <div class="content">
      <svg-icon icon-class="success" />
      <h1>签署成功</h1>
      <p>我们定当竭诚为您服务，<router-link to="/">开始使用</router-link></p>
    </div>
  </div>
</template>

<script>
import PageHeader from '@/components/page-header'
export default {
  name: 'SignContractResult',
  components: { PageHeader }
}
</script>

<style lang="scss" scoped>
@import "~@/styles/variables.scss";

.content {
  width: 600px;
  margin: 0 auto;
  padding-top: 100px;
  text-align: center;
  color: $color-text-primary;

  .svg-icon {
    font-size: 80px;
  }

  h1 {
    font-size: 24px;
    font-weight: 500;
  }

  a {
    color: $color-primary;
  }
}
</style>
