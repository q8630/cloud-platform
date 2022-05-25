<template>
  <div class="switch-store-wrap" v-loading="loading">
    <page-header />

    <div class="store-list" v-if="store_list.length > 0">
      <p class="title">门店选择</p>
      <el-row>
        <el-card v-for="item in store_list" :key="item.client_store_id" class="box">
          <svg-icon icon-class="store" class-name="icon" />
          <div class="content">
            <p class="title">{{ item.name }}</p>
            <p class="desc">
              {{ item.sub_no }}<br/>
              <span v-if="item.tax_num">分机号：{{ item.tax_num }}</span>
            </p>
          </div>
          <el-button type="primary" class="enter-btn" @click="onEnter(item)">进入</el-button>
        </el-card>
      </el-row>
    </div>

    <div class="empty-wrap" v-else-if="loading === false">
      <svg-icon icon-class="logo-gray" class-name="logo" />
      <p>你还未配置门店或权限，请联系管理员进行相关门店权限配置在进行登录！</p>
      <el-button type="primary" @click="logout">退出登录</el-button>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import PageHeader from '@/components/page-header'

const defaultStore = [{ client_store_id: -1, name: '所有门店数据汇总' }]

export default {
  name: 'SwitchStore',

  components: {
    PageHeader
  },

  data() {
    return {
      loading: false
    }
  },

  computed: {
    ...mapGetters([
      'user_store_list'
    ]),
    store_list() {
      // 这里过滤已禁用或已删除的门店数据
      const storeList = (this.user_store_list || []).filter(store => store.state === 0 && store.is_deleted === 0)
      return storeList && storeList.length ? defaultStore.concat(storeList) : []
    }
  },

  async created() {
    this.loading = true

    if (!this.user_store_list || !this.user_store_list.length) {
      await this.$store.dispatch('user/getUserStores')
    }

    this.loading = false
  },

  methods: {
    onEnter(data) {
      const store = { client_store_id: data.client_store_id, name: data.name }
      // 更新数据到 store
      this.$store.dispatch('user/setSelectedClientStore', store)
      // 进入首页
      this.$router.push('/')
    },

    logout() {
      this.$store.dispatch('user/logout')
      this.$router.push('/user/login')
    }
  }
}
</script>

<style lang="scss" scoped>
  @import "~@/styles/variables.scss";

  .switch-store-wrap {
    height: 100%;

    .store-list {
      padding: 96px 0 0 137px;

      .title {
        font-size:16px;
        font-weight: 500;
      }

      .box {
        width: 210px;
        height: 290px;
        text-align: center;
        margin: 0 60px 60px 0;
        display: inline-block;
        position: relative;

        :global(.el-card__body) {
          padding: $padding-spacing;
        }

        .icon {
          width: 40px;
          height: 40px;
          margin: 45px auto;
        }

        .content {
          text-align: left;
          height: 100px;
          word-break: break-all;
          overflow: hidden;
          text-overflow: ellipsis;

          .title {
            margin: 5px 0 5px 0;
            font-size:16px;
            color: #000000;
          }

          .desc {
            font-size: 14px;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
            color:rgba(144,147,153,1);
            margin: 0;
          }
        }

        .enter-btn {
          position: absolute;
          bottom: $padding-spacing;
          left: 78px;
        }
      }
    }

    .empty-wrap {
      height: 100%;
      color: #5F6266;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 80vh;

      .logo {
        width: 170px;
        height: 170px;
        margin-bottom: 30px;
      }

      p {
        margin-bottom: 80px;
      }
    }
  }
</style>
