<template>
  <div class="page-register">
    <page-header theme="withe" />

    <div class="content">
      <div class="form-wrapper" v-if="!registerType">
        <el-form class="register-form" ref="form" v-loading="loading" :model="form" :rules="rules" label-width="100px" label-height="32px">
          <el-form-item label="企业名称" prop="name">
            <el-input v-model="form.name" placeholder="请输入企业名称" />
          </el-form-item>

          <el-form-item label="企业税号" prop="tax_code">
            <el-input v-model="form.tax_code" placeholder="请输入企业税号" />
          </el-form-item>

          <el-form-item label="手机号码" prop="mobile">
            <el-input v-model="form.mobile" placeholder="请输入手机号码" />
          </el-form-item>

          <el-form-item prop="mobile_code" label="短信验证码">
            <el-input v-model="form.mobile_code" name="mobile_code" placeholder="请输入短信验证码" autocomplete="off">
              <template v-if="timer && second > 0" slot="append">{{second}} s后重试</template>
              <el-button v-else slot="append" v-loading="smsCaptchaLoading" @click="handleSendSMSCaptcha">获取短信验证码</el-button>
            </el-input>
         </el-form-item>

          <el-form-item label="密码" prop="password">
            <el-input v-model="form.password" placeholder="请输入当前登录密码" autocomplete="new-password"/>
          </el-form-item>

          <el-form-item label="法人姓名" prop="legal_person_name">
            <el-input v-model="form.legal_person_name" placeholder="请输入法人名称" />
          </el-form-item>

          <el-form-item label="注册码" prop="register_code">
            <el-input v-model="form.register_code" placeholder="请输入注册码" />
          </el-form-item>

          <el-form-item>
            <el-checkbox-group v-model="is_default">
              <el-checkbox name="is_default">我已认真阅读并同意
                <el-link class="protocol-open" href="/agreements/register.html" :underline="false">《云票儿用户注册使用协议》</el-link>
                和
                <el-link class="protocol-open" href="/agreements/auth-protocol.html" :underline="false">《云票儿用户授权协议》</el-link>
              </el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </el-form>
        <div class="footer">
          <el-button :disabled="!is_default" type="primary" @click="handleOk" class="submit-btn" size="medium" :loading="loading">注册</el-button>
          <el-button @click="handleCancel" size="medium">取消</el-button>
        </div>
      </div>

      <div class="register-open-page" v-if="registerType">
        <svg-icon icon-class="success" />
        <p>恭喜您，注册申请提交成功！ 我们会尽快为您审核。</p>
        <el-link class="protocol-open" href="#/user/login" :underline="false">返回首页 ></el-link>
      </div>
    </div>

    <page-footer />
  </div>
</template>

<style lang="scss" scoped>
@import "~@/styles/variables.scss";

.page-register {
  text-align: center;
}

.content {
  min-height: calc(100vh - 94px);
  padding-top: $navbarHeight;
}

.form-wrapper {
  display: inline-block;
  min-width: 480px;
  margin-top: 60px;
}

.register-open-page {
  display: inline-block;
  width: 312px;
  margin-top: 100px;

  .svg-icon-success {
    font-size: 72px;
  }

  p {
    color: $color-text-primary;
    font-size: 24px;
    font-weight: 400;
    line-height: 33px;
    margin: 27px 0;
  }
}

.register-form {
  /deep/ .el-input--mini .el-input__inner {
    height: 32px;
  }
  /deep/ .el-form-item--mini.el-form-item {
    margin-bottom: 32px;
  }
  /deep/ .el-form-item--mini.el-form-item:last-child {
    margin-top: 52px;
  }
}
.protocol-open {
  color: $color-link;
}

.footer {
  text-align: left;
  margin-left: 100px;
}
</style>

<script>
import { clientRegSms, clientRegister } from '@/services/user'
import { validateStringLength as validator } from '@/utils'
import { REG_MOBILE, REG_PASS } from '@/utils/constants/regexp'
import PageHeader from '@/components/page-header'
import PageFooter from '@/components/page-footer'

const maxTime = 120

export default{
  name: 'Register',
  components: { PageHeader, PageFooter },
  data() {
    return {
      registerType: false,
      is_default: false, // 协议勾选
      form: {
        name: '', // 企业名称
        tax_code: '', // 企业税号
        mobile: '', // 手机号
        mobile_code: '', // 短信验证码
        password: '', // 登录密码
        legal_person_name: '', // 法人名称
        register_code: '', // 注册码
      },
      timer: null,
      smsCaptchaLoading: false,
      second: 0,
      rules: {
        name: [
          {required: true, min: 2, max: 50, validator, message: '必填，长度不少于2位并且不能超过50位（汉字占两位）'}
        ],
        tax_code: [
          {required: true, pattern: /^([A-Z0-9]{15}|[A-Z0-9]{18}|[A-Z0-9]{20})$/, message: '必填。支持15、18、20位数字、大写字母组合'}
        ],
        mobile: [
          {required: true, pattern: REG_MOBILE, message: '必填，请输入正确的手机号码'}
        ],
        mobile_code: [
          {required: true, message: '必填，请输入短信验证码'}
        ],
        password: [
          {required: true, pattern: REG_PASS, message: '必填，8-18位数字、大小写字母、符号任意两种'}
        ],
        legal_person_name: [
          {required: true, max: 50, validator, message: '必填，长度不能超过50位（汉字占两位）'}
        ]
      },
      loading: false,
    }
  },
  methods: {
    handleSendSMSCaptcha() {
      this.$refs.form.validateField('mobile', error => {
        if (!error) {
          this.smsCaptchaLoading = true
          clientRegSms(this.form.mobile)
            .then(() => {
              this.timer = window.setInterval(this.intervalHandler, 1000)
              this.second = maxTime
              this.$message.success('短信验证码已发送到您的手机，请注意查收')
            })
            .finally(() => {
              this.smsCaptchaLoading = false
            })
        }
      })
    },
    intervalHandler() {
      const time = this.second

      if (time <= 1) {
        window.clearInterval(this.timer)
        this.timer = null
        return false
      }

      this.second = time - 1
    },
    handleCancel() {
      this.$router.push('/user/login')
    },
    handleOk() {
      this.$refs.form.validate(valid => {
        if (valid) {
          console.log('ok', this.form)

          this.loading = true
          clientRegister(this.form)
            .then(() => {
              this.registerType = true
            })
            .finally(() => {
              this.loading = false
            })
        }
      })
    }
  }
}
</script>
