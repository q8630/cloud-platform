<template>
  <div class="sign-contract-wrap" :class="{'signing': !!contractInfo}">
    <page-header />

    <!-- 合同信息已存在，直接显示法大大合同 -->
    <div v-if="contractInfo" class="contract-content" v-loading="loading">
      <iframe :src="contractInfo.url.viewpdf_url" />
      <div class="footer">
        <el-button @click="handleExit">退 出</el-button>
        <el-button type="primary" @click="handleSignContract" :loading="loading">签署协议</el-button>
      </div>
    </div>

    <div v-else-if="needSignContract" class="warning-content" v-loading="loading">
      <div class="logo">
        <img src="./assets/warning.png" alt="" />
      </div>
      <h1>{{needContractType ? '协议未签署' : '合同已过期'}}</h1>
      <p>{{needContractType ? '为保障您的合法权益，在使用海南高灯科技有限公司云票儿发票服务平台产品及服务前，请您务必仔细阅读并透彻理解、签署《“云票儿发票服务平台”服务协议》' : '系统查询到您的合同已过期，请您重新签署'}}</p>
      <el-form inline :rules="rules" class="form-wrapper" ref="form" :model="formData">
        <el-form-item prop="region_code" label="所属省市">
          <el-cascader
            ref="cascader"
            v-model="formData.region_code"
            :options="areaJson"
            placeholder="请选择所属省市" />
        </el-form-item>
      </el-form>
      <div class="button-wrapper">
        <el-button @click="handleExit">退 出</el-button>
        <el-button type="primary" @click="doSignContract">{{needContractType ? '签署协议' : '重新签署'}}</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import PageHeader from '@/components/page-header'
import mixinFetch from '@/views/mixins/mixin-fetch'
import { fetchContractInfo, signContract } from '@/services/contract'
import areaJson from '@/utils/provinceand-city.json'

export default {
  name: 'SignContract',
  components: { PageHeader },
  mixins: [ mixinFetch ],
  data() {
    return {
      contractInfo: null,
      areaJson, // 省市JSON数据
      formData: {}, // formData
      rules: {
        region_code: [
          { required: true, message: '请选择所属省市', trigger: 'change' }
        ],
      }
    }
  },
  computed: {
    ...mapGetters(['user_info']),
    needSignContract() {
      const { need_contract: status } = this.user_info
      return status === 1 || status === 2
    },
    needContractType() {
      const { need_contract: status } = this.user_info
      return status === 1
    },
  },
  created() {
    this._dispatch('user/getUserInfo')
  },
  methods: {
    handleExit() {
      this.$store.dispatch('user/logout')
      this.$router.push('/user/login')
    },
    doSignContract() {
      this.$refs.form.validate(valid => {
        if (valid) {
          // 设置省市2级联动
          const { region_code: regionCode } = this.formData
          const _regionCode = regionCode[1]
          console.log('_regionCode', _regionCode)
          this._request(fetchContractInfo)(_regionCode)
            .then(res => {
              this.contractInfo = res
            })
        }
      })
    },
    handleSignContract() {
      this._request(signContract)(this.contractInfo.contract_id)
        .then(() => {
          // 更新状态到 user_info
          const userInfo = { ...this.user_info, need_contract: 0 }
          this.$store.dispatch('user/setUserInfo', userInfo)
          // 跳转到签署结果页
          this.$router.push('/user/sign-contract-result')
        })

    }
  }
}
</script>

<style lang="scss" scoped>
@import "~@/styles/variables.scss";

.sign-contract-wrap.signing {
  /deep/ .page-header {
    height: 54px;
    .logo {
      width: 165px;
    }
  }
}

.contract-content {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 60px;
  width: 100%;
  background-color: #fff;

  iframe {
    width: 100%;
    height: 100%;
    border: 0 none;
  }

  .footer {
    text-align: right;
    /deep/ .el-button:last-child {
      margin-right: 30px;
    }
  }
}

.warning-content {
  width: 600px;
  margin: 0 auto;
  padding-top: 100px;
  text-align: center;
  color: $color-text-primary;

  .logo img {
    width: 80px;
  }

  h1 {
    font-size: 24px;
    font-weight: 500;
  }

  p {
    font-size: 14px;
    line-height: 30px;
  }

  .button-wrapper {
    margin-top: 30px;
  }
}
</style>
