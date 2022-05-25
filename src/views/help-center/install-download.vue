<template>
  <div class="install-download-wrap">
    <div class="title">
      <p>安装包下载</p>
      <p class="desc">这里为您提供关于云票儿使用的相关管理工具、用户接入手册以及安装视频教程等资料打包下载。</p>
    </div>

    <el-card class="download-card" v-for="(item, index) in list" :key="index">
      <template slot="header">
        <div class="header">
          <span>{{ item.title }}</span>
          <a :href="item.url"><el-button type="primary">下载</el-button></a>
        </div>
      </template>

      <div class="content">
        <p>版本号: {{ item.version }}</p>
        <p>更新时间: {{ item.updated_at }}</p>
        <p>下载量：{{ item.view }}</p>
        <code>简介：{{ item.description }}</code>
      </div>
    </el-card>
  </div>
</template>

<script>
import { getInstallList } from '@/services/help-center'

export default {
  name: 'InstallDownload',

  data() {
    return {
      list: []
    }
  },

  created() {
    getInstallList().then(res => {
      this.list = res || []
    })
  }
}
</script>

<style lang="scss" scoped>
  .install-download-wrap {
    padding: 30px 76px;

    .title {
      font-size: 22px;
      margin-bottom: 30px;

      .desc {
        font-size: 12px;
        color: #606266;
      }
    }

    .download-card {
      width: 450px;
      height: 240px;
      display: inline-block;
      margin: 0 20px 24px 0;
      overflow: auto;

      :global(.el-card__header) {
        border: none;
      }

      .header {
        font-size: 18px;
        font-weight: 600;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      :global(.el-card__body) {
        padding-top: 0;
      }

      .content {
        font-size: 14px;

        p {
          margin-top: 0;
        }
      }
    }
  }
</style>
