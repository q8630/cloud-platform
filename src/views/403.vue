<template>
  <div class="content-box">
    <div class="error-page">
      <img class="icon-img" src="../assets/icon-403.png" />
      <p class="error-page-text">您没有访问权限，请联系管理员。</p>
      <el-button type="primary" @click="logOut" class="error-page-btn" size="medium" :loading="loading">退出登录</el-button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.content-box {
  text-align: center;
}
.error-page{
  display: inline-block;
  width: 259px;
  height: 300px;
  margin-top: 180px;
  .icon-img{
    width: 259px;
    height: 223px;
  }
  .error-page-text{
    margin-top: 30px;
    font-size:16px;
  }
  .error-page-btn{
    margin-top: 40px;
  }
}
</style>

<script>
export default{
  name: 'ErrorPage',
  data() {
    return {
      loading: false,
    }
  },
  methods: {
    logOut() {
      this.$store.dispatch('user/logout').then(() => {
        this.$router.push('/login')
      })
    }
  }
}
</script>

