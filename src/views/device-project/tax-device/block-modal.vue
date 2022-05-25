<template>
  <el-dialog width="520px" title="同步成功" :visible="visible" @close="$emit('cancel')">
    <el-form label-suffix="：">
      <el-form-item label="开户银行">{{ data.bank_name }}</el-form-item>
      <el-form-item label="银行账号">{{ data.bank_account }}</el-form-item>
      <el-form-item label="电话">{{ data.phone }}</el-form-item>
      <el-form-item label="详细地址">{{ data.address }}</el-form-item>
    </el-form>
    <div slot="footer">
      <el-button type="primary" @click="$emit('ok')">确定</el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: 'BlockModal',
  props: {
    visible: {
      type: Boolean,
      required: true
    },
    data: {
      type: Object,
      required: true
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
