<template>
  <el-dialog class="modal-password-modify" width="500px" title="修改密码" :visible="visible" :append-to-body="true" @close="handleCancel">
    <el-form ref="form" :model="formData" :rules="rules" v-loading="loading">
      <el-form-item prop="old_password" label="当前密码">
        <el-input v-model="formData.old_password" type="password" placeholder="请输入当前登录密码" autocomplete="off" />
      </el-form-item>
      <el-form-item prop="new_password" label="新密码">
        <el-input v-model="formData.new_password" type="password" placeholder="请输入新密码" autocomplete="off" />
      </el-form-item>
      <el-form-item prop="confirm_new_password" label="确认新密码">
        <el-input v-model="formData.confirm_new_password" type="password" placeholder="请再次确认新密码" autocomplete="off" />
      </el-form-item>
    </el-form>

    <div slot="footer">
      <el-button @click="handleCancel">取 消</el-button>
      <el-button type="primary" @click="handleOk" :loading="loading">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { updatePassword } from '@/services/user'
import { REG_PASS } from '@/utils/constants/regexp'

const passwordValidateMessage = '必填，8-18位数字、大小写字母、符号任意两种及以上组合'
const defaultFormData = {
  old_password: '',
  new_password: '',
  confirm_new_password: ''
}

export default {
  name: 'PasswordModifyModal',
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      loading: false,
      formData: { ...defaultFormData },
      rules: {
        old_password: [{ required: true, message: '必填，请输入当前登录密码' }],
        new_password: [
          { required: true, pattern: REG_PASS, message: passwordValidateMessage },
          { validator: this.validateToNextPassword }
        ],
        confirm_new_password: [
          { required: true, pattern: REG_PASS, message: passwordValidateMessage },
          { validator: this.compareToFirstPassword }
        ],
      }
    }
  },
  watch: {
    visible(value) {
      // reset fields
      if (value === false && this.$refs.form) {
        this.formData = { ...defaultFormData }
        this.$refs.form.resetFields()
      }
    }
  },
  methods: {
    validateToNextPassword(rule, value, callback) {
      if (!value) {
        callback(new Error(passwordValidateMessage))
      } else {
        if (this.formData.confirm_new_password) {
          this.$refs.form.validateField('confirm_new_password')
        }
        callback()
      }
    },
    compareToFirstPassword(rule, value, callback) {
      if (!value) {
        callback(new Error(passwordValidateMessage))
      } else if (value !== this.formData.new_password) {
        callback(new Error('两次输入的密码不一致，请重新输入'))
      } else {
        callback()
      }
    },
    handleCancel() {
      this.$emit('cancel')
    },
    handleOk() {
      this.$refs.form.validate(valid => {
        if (valid) {
          const { old_password: oPwd, new_password: nPwd, confirm_new_password: cPwd } = this.formData

          this.loading = true
          updatePassword(oPwd, nPwd, cPwd)
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
