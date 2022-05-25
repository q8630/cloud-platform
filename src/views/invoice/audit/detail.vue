<template>
  <div>
    <el-dialog
      class="invoice-audit-modal"
      :title="data.status_msg"
      width="600px"
      :visible="visible"
      @close="$emit('cancel')"
    >
      <el-form label-suffix="：" label-width="96px">
        <el-form-item label="抬头类型">
          {{ data.buyer_title_type === '1' ? '个人及政府事业机构' : '企业' }}
        </el-form-item>

        <el-form-item label="发票抬头">
          {{ data.buyer_title }}
        </el-form-item>

        <el-form-item label="开票税号">
          {{ data.buyer_taxcode }}
        </el-form-item>

        <el-form-item label="开票金额">
          {{ data.order_amount }}
        </el-form-item>

        <el-form-item label="开票项目">
          {{ data.name }}
        </el-form-item>

        <el-form-item label="失败原因" v-if="+data.examine_status === 2" style="color: #ff0000;">
          {{ data.fail_msg }}
        </el-form-item>
      </el-form>

      <div v-if="data.pdf_url" slot="footer">
        <a :href="data.pdf_url" target="_blank">
          <el-button type="primary" icon="el-icon-download">查看发票</el-button>
        </a>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'AuditDetail',

  props: {
    visible: Boolean,
    data: {
      type: Object,
      default() {
        return {}
      }
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
