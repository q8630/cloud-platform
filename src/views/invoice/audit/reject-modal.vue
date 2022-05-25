<template>
  <div>
    <el-dialog
      class="invoice-audit-modal"
      title="拒绝开票"
      width="500px"
      :visible="visible"
      @close="$emit('cancel')"
    >
      <el-form ref="form" label-width="96px" :rules="rules" :model="form" v-loading="loading">
        <el-form-item label="拒绝原因" prop="msg">
          <el-input type="textarea" :rows="3" v-model="form.msg" placeholder="请输入" />
        </el-form-item>
      </el-form>

      <div slot="footer">
        <el-button type="primary" @click="onSubmit" :loading="loading">确认</el-button>
        <el-button @click="$emit('cancel')">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { rejectInvoice } from '@/services/invoice/audit'
import mixinFetch from '@/views/mixins/mixin-fetch'

export default {
  name: 'RejectModal',
  mixins: [ mixinFetch ],

  props: {
    visible: Boolean,
    orderSn: String
  },

  data() {
    return {
      loading: false,
      form: {
        msg: ''
      },
      rules: {
        msg: {
          required: true, message: '请输入拒绝原因'
        }
      },
    }
  },

  methods: {
    onSubmit() {
      if (this.loading) return

      this.$refs.form.validate(valid => {
        if (valid) {
          this._request(rejectInvoice)({
            order_sn: this.orderSn,
            msg: this.form.msg

          }).then(() => {
            this.$message.success('拒绝成功')

          }).finally(() => {
            this.$emit('cancel')
            this.$emit('refreshList')
          })
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
  .invoice-audit-modal {
    :global(.el-form-item--mini.el-form-item) {
      margin-bottom: 10px;
    }
  }
</style>
