<template>
  <div class="login-wrap">
    <page-header theme="withe" />

    <div class="content">
      <el-tabs stretch>
        <el-tab-pane label="扫码登录">
          <div class="qrcode-wrap">
            <iframe sandbox="allow-scripts allow-top-navigation allow-same-origin" :src="qrcodeUrl" />
            <p class="desc">微信扫码快速登录</p>
          </div>
        </el-tab-pane>

        <el-tab-pane label="账户登录">
          <el-form :model="form" size="medium" :rules="rules" ref="from" class="form" v-loading="loading">
            <el-form-item prop="user" class="field">
              <el-input
                @keyup.enter.native="accountLogin"
                name="user"
                v-model="form.user"
                placeholder="账号"
                @focus="clearError"
                prefix-icon="el-icon-user"
              />
            </el-form-item>

            <el-form-item prop="password" class="field">
              <el-input
                @keyup.enter.native="accountLogin"
                name="password"
                v-model="form.password"
                placeholder="密码"
                type="password"
                @focus="clearError"
                prefix-icon="el-icon-lock"
              />
            </el-form-item>

            <el-form-item prop="picCode" class="field">
              <el-input
                @keyup.enter.native="accountLogin"
                v-model="form.picCode"
                placeholder="验证码"
                @focus="clearError"
                prefix-icon="el-icon-picture-outline"
              >
                <img slot="append" @click="getPicCode" :src="form.picture" />
              </el-input>
            </el-form-item>

            <p class="error-msg" v-if="errorMsg">{{ errorMsg }}</p>

            <el-button type="primary" @click="accountLogin" class="btn" size="medium" :loading="loading">登录</el-button>

          </el-form>
        </el-tab-pane>
      </el-tabs>
    </div>

    <p class="registry-entry">还没有账户？
      <el-button type="text" class="protocol-open" @click="protocolOpen">立即注册</el-button>
    </p>

    <page-footer fixed-bottom />
  </div>
</template>

<script>
import { setToken } from '@/utils/cookie-storage'
import { scanLogin, accountLogin, getPicCode } from '@/services/user'
import PageHeader from '@/components/page-header'
import PageFooter from '@/components/page-footer'

export default {
  name: 'Login',

  components: { PageHeader, PageFooter },

  data() {
    // 微信二维码生成地址
    const qrcodeUrl = APP_ENV === 'PROD' || APP_ENV === 'PREPROD'
      ? 'https://adminyp.fapiaoer.cn' : 'https://shanghu-backend-test.wetax.com.cn'

    return {
      qrcodeUrl: `${qrcodeUrl}/wx-scan/qrcode?after_scan_login_url=${encodeURIComponent(`https://${window.location.host}/#/user/login`)}`,

      form: {
        user: '',
        password: '',
        picCode: '', // 验证码
        uniqueCode: '', // 验证码图片唯一标识
        picture: ''
      },
      loading: false,
      // 表单校验
      rules: {
        user: {
          required: true,
          message: '请输入账号'
        },
        password: [
          {
            required: true,
            message: '请输入密码'
          },
          {
            pattern: /^.{8,18}$/g,
            message: '密码为8-18位'
          }
        ],
        picCode: {
          required: true,
          pattern: /^.{4}$/g,
          message: '请输入4位验证码'
        }
      },
      errorMsg: ''
    }
  },

  created() {
    // 从扫码后进入。携带参数 code, state
    const { code, token } = this.$route.query

    // 带token免登录
    if (token && token !== '') {
      return this.loginSuccess({
        token,
        user: {}
      })
    }

    if (code) {
      return this.scanLogin(code)
    }

    this.getPicCode()
  },

  methods: {
    // 账号密码登录
    accountLogin() {
      this.$refs.from.validate(valid => {
        if (valid) {
          this.loading = true

          const { user, password, picCode, uniqueCode } = this.form
          accountLogin({
            data: {
              tax_code: user.trim(),
              password,
              picture_code: picCode,
              unique_code: uniqueCode
            },
            showError: false
          }).then(data => {
            this.loginSuccess(data)
          }).catch(res => {
            this.getPicCode()
            this.errorMsg = res.message
          }).finally(() => {
            this.loading = false
          })
        }
      })
    },

    // 扫码登录
    scanLogin(code, isRegister = false) {
      scanLogin({
        data: {
          app_id: APP_ENV === 'PROD' || APP_ENV === 'PREPROD' ? 'wx078f0866eeb53869' : 'wx6e03cb99dac81373',
          code,
          is_register: isRegister ? 1 : 0
        },
        showLoading: true,
        showError: false
      }).then(data => {
        this.loginSuccess(data)
      }).catch(error => {
        // 扫码登录异常，清掉浏览器中的查询参数，避免用户刷新浏览器后报错（微信 code 已无效）
        this.$alert(
          error.message || error, { type: 'error', showClose: false, }
        ).then(() => {
          window.location.href = '/#/user/login'
        })
      })
    },

    // 登录成功处理
    loginSuccess(data) {
      const { token, user = {} } = data

      // 缓存 token
      setToken(token)
      // 缓存 userInfo
      this.$store.dispatch('user/setUserInfo', user)

      // 判断是否需要签署合同，1未签署，2合同已过期
      if (+user.need_contract === 1 || +user.need_contract === 2) {
        return this.$router.push('/user/sign-contract')
      }

      this.$router.replace('/')
    },

    getPicCode() {
      getPicCode().then(res => {
        this.form.picture = 'data:image/jpeg;base64,' + res.picture
        this.form.uniqueCode = res.unique_code
      })
    },

    clearError() {
      this.errorMsg = ''
    },

    protocolOpen() {
      this.$router.replace('/user/register')
    }
  }
}
</script>

<style lang="scss" scoped>
  .login-wrap {
    width: 100%;
    height: 100%;
    background: url("../../../assets/bg.jpg") no-repeat;
    background-size: cover;
    padding: 1px;

    :global(.page-header) {
      background-color: transparent;
      border-bottom: none;
    }

    .content {
      margin: 100px auto 20px auto;
      width: 310px;
      height: 328px;
      border-radius: 4px;
      display: flex;
      box-shadow: 0px 6px 11px rgba(30,46,61,0.17);
      background-color: #ffffff;

      :global(.el-tabs) {
        width: 100%;
      }

      :global(.el-tabs__header) {
        margin-bottom: 0;
      }

      :global(.el-tabs__item) {
        font-size: 14px;
        font-weight: 600;
        height: 50px;
        line-height: 50px;
        padding-left: 0;
        padding-right: 0;
      }

      .qrcode-wrap {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 277px;

        iframe {
          width:      180px;
          height:     180px;
          overflow:   hidden;
          margin:     30px 0 0 10px;
          text-align: center;
          border: none;
        }

        .desc {
          font-size:12px;
          color:rgba(0,0,0,0.45);
          margin: 0 0 30px 0;
        }
      }

      .form {
        margin: 30px;
        position: relative;

        .field {
          margin: 0 0 18px 0;
        }

        /* 验证码 */
        :global(.el-input-group__append) {
          padding: 0;
          cursor: pointer;

          img {
            width: 86px;
            height: 34px;
            display: block;
          }
        }

        .error-msg {
          color: #ff0000;
          font-size: 14px;
          position: absolute;
          bottom: 30px;
        }

        .btn {
          width: 100%;
          margin-top: 25px;
        }
      }
    }
    .registry-entry {
      color:#000000;
      font-size:14px;
      text-align: center;
      margin-top: 8px;
      margin-bottom: 0;
      .protocol-open {
        font-size:14px;
      }
    }
  }
</style>
