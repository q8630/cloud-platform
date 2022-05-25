<template>
  <el-dialog class="modal-discount" title="添加折扣行" width="460px" :visible="visible" :append-to-body="true" @close="handleCancel">
    <el-form ref="form" :model="formData" @submit.native.prevent>
      <el-row>
        <el-radio-group v-model="formData.type">
          <el-radio :label="1">
            折扣率（%）
          </el-radio>

          <el-radio :label="2">
            折扣金额
          </el-radio>
        </el-radio-group>
      </el-row>
      <el-row>
        <el-form-item prop="discount" :rules="rules.discount[formData.type]">
          <el-input v-model="formData.discount" placeholder="请输入相应的折扣率或折扣金额" @input="onInput" @keyup.enter.native="onEnter" />
        </el-form-item>
      </el-row>
    </el-form>

    <div slot="footer">
      <el-button @click="handleCancel">取 消</el-button>
      <el-button type="primary" @click="handleOk">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
function validateDiscount(rule, value, callback) {
  if (!value || parseFloat(value) <= 0 || parseFloat(value) > 100) {
    callback(rule.message)
  }

  callback()
}

export default {
  name: 'DiscountModal',
  props: {
    visible: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
      formData: {
        type: 1,
        discount: ''
      },
      rules: {
        discount: {
          1: [{ required: true, validator: validateDiscount, message: '必填，折扣率应该大于0，小于100' }],
          2: [{ required: true, message: '必填，请输入相应的折扣金额' }]
        },
      }
    }
  },
  watch: {
    visible(newVal) {
      // 隐藏弹窗时，把 formData 重置
      if (newVal === false) {
        this.$refs.form.resetFields()
      }
    },
    'formData.type': function watchType() {
      // 重置表单，以刷新表单的校验规则
      this.$refs.form.resetFields()
    }
  },
  methods: {
    onEnter() {
      this.handleOk()
    },
    onInput(value) {
      this.formData.discount = value.replace(/[^.\d]/g, '')
    },
    handleCancel() {
      this.$emit('cancel')
    },
    handleOk() {
      this.$refs.form.validate(valid => {
        if (valid) {
          const res = {
            ...this.formData,
            discount: parseFloat(this.formData.discount)
          }
          this.$emit('ok', res)
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.modal-discount {
  .el-row {
    padding-left: 30px;
  }
  .el-row + .el-row {
    margin-top: 15px;
  }
  /deep/ .el-form-item .el-form-item__content {
    margin-left: 0;
  }
}
</style>
