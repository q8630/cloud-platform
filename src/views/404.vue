<template>
  <div class="content-box">
    <div class="error-servers">
      <img class="icon-img" src="../assets/icon-404.png" />
      <p class="error-servers-text">您访问的页面已丢失，请稍后重试！</p>
      <el-button type="primary" @click="backHome" class="error-servers-btn" size="medium" :loading="loading">返回首页</el-button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.content-box {
  text-align: center;
}
.error-servers{
  display: inline-block;
  width: 259px;
  height: 300px;
  margin-top: 180px;
  .icon-img{
    width: 259px;
    height: 223px;
  }
  .error-servers-text{
    margin-top: 30px;
    font-size:16px;
  }
  .error-servers-btn{
    margin-top: 40px;
  }
}
</style>

<script>
export default{
  name: 'ErrorServers',
  data() {
    return {
      loading: false,
    }
  },
  methods: {
    backHome() {
      this.$router.push('/')
    }
  }
}
</script>
