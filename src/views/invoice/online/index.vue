<template>
  <div class="page-content">
    <with-transform>
      <div class="online-invoice" v-loading="loading">
        <div class="search-form">
          <el-form inline ref="form" :model="searchForm" :rules="formRules">
            <el-row>
              <el-form-item v-if="isAdmin" prop="store_id" label="选择门店">
                <el-select
                  clearable
                  v-model="searchForm.store_id"
                  placeholder="请选择"
                  @change="handleStoreChange"
                >
                  <el-option
                    v-for="store in user_store_list"
                    :key="store.client_store_id"
                    :label="store.name"
                    :value="store.client_store_id" />
                </el-select>
              </el-form-item>

              <el-form-item prop="invoice_style" label="发票种类">
                <el-select
                  ref="invoice_style_select"
                  clearable
                  v-model="searchForm.invoice_style"
                  placeholder="请选择"
                  loading-text="加载中..."
                  v-loading="invoiceStyleLoading"
                  :disabled="invoiceStyleLoading || searchForm.store_id === ''"
                  @change="handleInvoiceStyleChange"
                >
                  <el-option
                    v-for="invoiceStyle in invoiceStyleList"
                    :key="invoiceStyle.value"
                    :label="invoiceStyle.name"
                    :value="invoiceStyle.value" />
                </el-select>
              </el-form-item>

              <el-form-item prop="tax_num_id" label="选择税盘">
                <el-select
                  clearable
                  v-model="searchForm.tax_num_id"
                  placeholder="请选择"
                  loading-text="加载中..."
                  v-loading="taxLoading"
                  :disabled="taxLoading || searchForm.invoice_style === ''"
                >
                  <el-option
                    v-for="tax in taxList"
                    :key="tax.id"
                    :label="tax.tax_num"
                    :value="tax.id" />
                </el-select>
              </el-form-item>
            </el-row>

            <el-row v-show="!isSpecialInvoice">
              <el-form-item label="发票对象">
                <el-radio-group v-model="searchForm.title_type">
                  <el-radio :label="2">企业</el-radio>
                  <el-radio :label="1">个人 / 非企业</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-row>
          </el-form>
        </div>

        <invoice-form
          :title="title"
          :special-invoice="isSpecialInvoice"
          :invoice-title-type="searchForm.title_type"
          :buyer-info="buyerInfo"
          :invoice-projects="invoiceProjects"
          :client-info="clientInfo"
          :invoice-info="invoiceInfo"
        >
          <template v-slot:footer="slotProps">
            <el-button type="primary" @click="handleSubmit(slotProps, 0)" :loading="loading">{{paperInvoiceShow()? '仅开票' : '提交开票'}}</el-button>
            <el-button type="primary" v-if="paperInvoiceShow()" @click="handleSubmit(slotProps, 1)" :loading="loading">开票并打印</el-button>
          </template>
        </invoice-form>
      </div>
    </with-transform>
  </div>
</template>

<script>
import invoiceFormMixin from '../mixin/invoice-form'
import WithTransform from '@/components/with-transform'
import InvoiceForm from '@/components/invoice-form/normal-invoice'
import { invoice as onlineInvoice } from '@/services/invoice/online'

export default {
  name: 'OnlineInvoice',
  components: { WithTransform, InvoiceForm },
  mixins: [ invoiceFormMixin(1) ],
  methods: {
    // 纸票判断
    paperInvoiceShow() {
      const { invoice_style: style } = this.searchForm
      return style === 1 || style === 2 || style === 6
    },
    handleSubmit(slotProps, isPrint) {
      this.$refs.form.validate(valid => {
        if (valid) {
          const { validate, clearValidate } = slotProps.$form
          // 调用 invoice-form 中的 $form.validate 方法校验开票数据
          validate(values => {
            console.log('handleSubmit', values)
            const invoiceData = {
              ...values,
              invoice_info: {
                ...values.invoice_info,
                ...this.searchForm
              },
              is_print: isPrint
            }
            this.loading = true

            onlineInvoice(invoiceData)
              .then(() => this.handleSuccess(clearValidate))
              .finally(() => {
                this.loading = false
              })
          })
        }
      })
    },
  }
}
</script>

<style lang="scss" scoped>
@import "~@/styles/variables.scss";

// 避免下拉框的loading层显示不全，这里把 .page-content 的 padding-top 改在 .search-form 中实现
.page-content {
  padding-top: 0;
}
.online-invoice .search-form {
  padding-top: $padding-spacing;
}

.online-invoice {
  .search-form {
    /deep/ .el-form-item__label {
      width: 84px;
      &::before {
        content: none !important;
      }
    }

    /deep/ .el-form-item__content {
      width: 220px;

      .el-select,
      .el-input {
        width: 100%;
      }
    }
  }
}
</style>
