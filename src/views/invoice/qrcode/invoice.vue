<template>
  <with-transform>
    <div class="qrcode-invoice" v-loading="loading">
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

          <el-row>
            <el-form-item prop="invalid_at" label="小票有效期">
              <el-input v-model="searchForm.invalid_at">
                <template slot="append">天</template>
              </el-input>
            </el-form-item>

            <el-form-item prop="consumer_phone" label="顾客手机号">
              <el-input v-model="searchForm.consumer_phone" placeholder="请输入顾客手机号" />
              <div class="el-form-item__desc">为防止发票被虚开、盗开，务必输入此项</div>
            </el-form-item>
          </el-row>
        </el-form>
      </div>

      <invoice-form
        :title="title"
        :visibleBuyerInfo="false"
        :special-invoice="isSpecialInvoice"
        :invoice-title-type="searchForm.title_type"
        :invoice-projects="invoiceProjects"
        :client-info="clientInfo"
        :invoice-info="invoiceInfo"
      >
        <template v-slot:footer="slotProps">
          <el-button type="primary" @click="handleSubmit(slotProps)" :loading="loading">生成二维码小票</el-button>
        </template>
      </invoice-form>
    </div>
  </with-transform>
</template>

<script>
import WithTransform from '@/components/with-transform'
import invoiceFormMixin from '../mixin/invoice-form'
import InvoiceForm from '@/components/invoice-form/normal-invoice'
import { codeOrderCreate } from '@/services/invoice/qrcode'
import { REG_MOBILE } from '@/utils/constants/regexp'

function validateExpiryDate(rule, value, callback) {
  const regDigit = /^\d+$/
  if (!value || !regDigit.test(value) || parseInt(value, 10) < 1 || parseInt(value, 10) > 90) {
    callback(rule.message)
  }

  callback()
}

export default {
  name: 'QRcodeInvoice',
  components: { WithTransform, InvoiceForm },
  mixins: [ invoiceFormMixin(2) ],
  data() {
    return {
      searchForm: {
        invoice_style: 0, // 发票种类，写死为：0电子发票
        invalid_at: 30,
        consumer_phone: ''
      },
      formRules: {
        invalid_at: [{ required: true, validator: validateExpiryDate, message: '请输入1-90间的整数' }],
        consumer_phone: [{ pattern: REG_MOBILE, message: '请输入正确的手机号码' }]
      },
    }
  },
  methods: {
    handleSubmit(slotProps) {
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
              }
            }

            this.loading = true

            codeOrderCreate(invoiceData)
              .then(res => {
                this.handleSuccess(clearValidate)
                // 打开二维码小票预览窗口
                if (res && res.code_sn) {
                  window.open(`/#/external/print-ticket?codeSn=${res.code_sn}`)
                }
              })
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
.qrcode-invoice {
  .search-form {
    padding: 15px;

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

    .el-form-item__desc {
      width: 300px;
      position: absolute;
      left: 230px;
      top: 0;
      font-size: 13px;
      color: #999;
    }
  }
}
</style>
