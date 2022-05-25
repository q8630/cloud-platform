<template>
  <el-dialog width="420px" title="发送邮件" :visible="visible" :before-close="handleClose" v-loading="loading" class="send-email-box">
    <el-form :model="formEmail" :rules="rules" ref="form" @submit.native.prevent="onEnter">
      <el-form-item label="请输入邮箱地址" prop="email">
        <el-input v-model="formEmail.email"></el-input>
      </el-form-item>
    </el-form>
    <div slot="footer">
      <el-button @click="$emit('cancel')">取消</el-button>
      <el-button @click="sendEmailClick" type="primary" :loading="loading" >确定</el-button>
    </div>
  </el-dialog>
</template>

<style lang="scss" scoped>
.send-email-box{
  /deep/ .el-form-item .el-form-item__label{
    width: 122px;
    text-align: left;
  }
  /deep/ .el-form-item .el-form-item__content{
    margin-left: 122px;
  }
}
</style>

<script>
import { invoiceOperateSendMail } from '@/services/query/invoice'
import { REG_EMAIL } from '@/utils/constants/regexp'
import mixinFetch from '@/views/mixins/mixin-fetch'

const formRules = {
  email: [
    { required: true, pattern: REG_EMAIL, message: '请输入正确的邮箱地址' },
  ]
}
export default {
  name: 'SendEmail',
  mixins: [ mixinFetch ],
  props: {
    visible: {
      type: Boolean,
      required: true
    },
    model: Object
  },
  data() {
    return {
      loading: false,
      rules: {...formRules},
      formEmail: {}
    }
  },
  watch: {
    model(newVal) {
      this.formEmail = { ...newVal }
    }
  },
  methods: {
    sendEmailClick() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          const params = this.formEmail
          console.log('sendmail', params)
          this._request(invoiceOperateSendMail)(params)
            .then(() => {
              this.$message.success('发送邮件成功')
              this.$emit('ok')
            })
        }
      })
    },
    onEnter() {
      this.sendEmailClick()
    },
    handleClose() {
      this.$emit('cancel')
    }
  }
}
</script>
