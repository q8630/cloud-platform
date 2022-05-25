<template>
  <el-dialog class="modal-mobile-modify" width="500px" title="解绑微信" :visible="visible" :append-to-body="true" @close="handleCancel">
    <el-form ref="form" :model="formData" :rules="rules" v-loading="loading">
      <el-form-item prop="password" label="登录密码">
        <el-input v-model="formData.password" type="password" placeholder="请输入当前登录密码" autocomplete="off" />
      </el-form-item>
    </el-form>

    <div slot="footer">
      <el-button @click="handleCancel">取 消</el-button>
      <el-button type="primary" @click="handleOk" :loading="loading">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { userUnbindWechat } from '@/services/user'
import { REG_PASS } from '@/utils/constants/regexp'
const passwordValidateMessage = '必填，8-18位数字、大小写字母、符号任意两种及以上组合'

const defaultFormData = {
  password: '', // 登录密码
}

export default {
  name: 'ModalMobileModify',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    title: String,
  },
  data() {
    return {
      loading: false,
      rules: {
        password: [{ required: true, pattern: REG_PASS, message: passwordValidateMessage }],
      },
      formData: this.getDefaultFormData(),
    }
  },
  watch: {
    visible(value) {
      // reset fields
      if (value === false && this.$refs.form) {
        this.formData = this.getDefaultFormData()
        this.$refs.form.resetFields()
      }
    }
  },
  methods: {
    getDefaultFormData() {
      return { ...defaultFormData }
    },
    handleCancel() {
      this.$emit('cancel')
    },
    handleOk() {
      this.$refs.form.validate(valid => {
        if (valid) {
          const { password } = this.formData
          console.log('password', password)

          this.loading = true
          userUnbindWechat(password)
            .then(() => this.$emit('ok'))
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
