<template>
  <el-dialog class="modal-mobile-modify" width="500px" :title="title" :visible="visible" :append-to-body="true" @close="handleCancel">
    <el-form ref="form" :model="formData" :rules="rules" v-loading="loading">
      <el-form-item prop="mobile" :label="type === 3 ? '手机号' : '新手机号'">
        <el-input v-model="formData.mobile" name="mobile" placeholder="请输入手机号码" />
      </el-form-item>

      <el-form-item prop="sms_captcha" label="短信验证码">
        <el-input v-model="formData.sms_captcha" name="sms_captcha" placeholder="请输入短信验证码" autocomplete="off">
          <template v-if="timer && second > 0" slot="append">{{second}} s后重试</template>
          <el-button v-else slot="append" v-loading="smsCaptchaLoading" @click="handleSendSMSCaptcha">获取短信验证码</el-button>
        </el-input>
      </el-form-item>

      <el-form-item prop="password" label="登录密码">
        <el-input v-model="formData.password" type="password" placeholder="请输入当前登录密码" autocomplete="new-password" />
      </el-form-item>
    </el-form>

    <div slot="footer">
      <el-button @click="handleCancel">取 消</el-button>
      <el-button type="primary" @click="handleOk" :loading="loading">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { sendSMSCaptcha, updateMobile } from '@/services/user'
import { REG_MOBILE } from '@/utils/constants/regexp'

const defaultFormData = {
  mobile: '', // 手机号
  sms_captcha: '', // 短信验证码
  password: '', // 登录密码
}
const maxTime = 120

export default {
  name: 'ModalMobileModify',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    // 1绑定手机，2更换手机，3验证手机
    type: Number,
    title: String,
    mobile: String,
  },
  data() {
    return {
      loading: false,
      smsCaptchaLoading: false,
      timer: null,
      second: 0,
      formData: this.getDefaultFormData(),
      rules: {
        mobile: [{ required: true, pattern: REG_MOBILE, message: '必填，请输入正确的手机号码' }],
        sms_captcha: [{ required: true, message: '必填，请输入短信验证码' }],
        password: [{ required: true, message: '必填，请输入当前登录密码' }],
      },
    }
  },
  watch: {
    visible(value) {
      // reset fields
      if (value === true && this.$refs.form) {
        this.formData = this.getDefaultFormData()
        this.$refs.form.resetFields()
      }
    },
    // 用户在验证手机号时，type会变更，这里需要监听，以便更新 formData.mobile （仅验证手机的场景下，才默认显示原手机号）
    type() {
      this.formData.mobile = this.getMobile()
    },
    mobile() {
      this.formData.mobile = this.getMobile()
    },
  },
  methods: {
    getDefaultFormData() {
      return { ...defaultFormData, mobile: this.getMobile() }
    },
    getMobile() {
      // 仅验证手机的情景下，才设值 formData.mobile
      return this.type === 3 ? this.mobile : ''
    },
    handleSendSMSCaptcha() {
      this.$refs.form.validateField('mobile', error => {
        if (!error) {
          this.smsCaptchaLoading = true

          sendSMSCaptcha(this.formData.mobile)
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
      this.$emit('cancel')
    },
    handleOk() {
      this.$refs.form.validate(valid => {
        if (valid) {
          const { mobile, sms_captcha: smsCaptcha, password } = this.formData

          this.loading = true
          updateMobile(mobile, smsCaptcha, password)
            .then(() => this.$emit('ok', mobile))
            .finally(() => {
              this.loading = false
            })
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
  /deep/ .form-item-captcha .el-input-group__append {
    width: 64px;
    line-height: 0;
    padding: 1px 0;
    cursor: pointer;
  }
</style>
