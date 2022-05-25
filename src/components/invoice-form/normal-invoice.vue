<template>
  <div class="invoice-form normal-invoice-form">
    <header>
      <slot name="header">
        <p><span>{{title}}<hr/></span></p>
      </slot>
    </header>

    <main>
      <buyer-info-table
        v-if="visibleBuyerInfo"
        ref="buyer-info-table"
        :special-invoice="specialInvoice"
        :title-type="invoiceTitleType"
        :buyer-info="buyerInfo" />

      <invoice-project-table
        ref="invoice-project-table"
        :invoice-projects="invoiceProjects"
        :invoice-info="invoiceInfo" />

      <el-form ref="form" :model="model.invoiceInfo" :rules="model.invoiceInfoRules">
        <table class="table-bordered client-info">
          <tbody>
            <tr>
              <td class="text-vertical-lr">开票方</td>
              <td width="60%" style="padding: 0 15px">
                <p>企&ensp;业&emsp;名&ensp;称： {{clientInfo.name}}</p>
                <p>纳税人识别号： {{clientInfo.tax_code}}</p>
                <p>开户行及帐号： {{clientInfo.bank_name}}&emsp;{{clientInfo.bank_account}}</p>
                <p>地址&ensp;及&ensp;电话： {{clientInfo.address}}&emsp;{{clientInfo.phone}}</p>
              </td>
              <td class="text-vertical-lr">备注</td>
              <td style="padding: 8px 15px">
                <el-form-item prop="remark">
                  <el-input v-model="model.invoiceInfo.remark" type="textarea" :autosize="{ minRows: 4, maxRows: 8}" />
                </el-form-item>
              </td>
            </tr>
          </tbody>
        </table>

        <div class="invoice-info">
          <el-row>
            <el-col :span="8">
              <el-form-item prop="payee">
                <template v-slot:label>收&ensp;款&ensp;人</template>
                <el-input v-model="model.invoiceInfo.payee" placeholder="请输入收款人" />
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item prop="reviewer">
                <template v-slot:label>复&ensp;核&ensp;人</template>
                <el-input v-model="model.invoiceInfo.reviewer" placeholder="请输入复核人" />
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item prop="drawer">
                <template v-slot:label>开&ensp;票&ensp;人</template>
                <el-input v-model="model.invoiceInfo.drawer" placeholder="请输入开票人" />
              </el-form-item>
            </el-col>
          </el-row>
        </div>
      </el-form>
    </main>

    <footer>
      <slot name="footer" v-bind:$form="$data.$form">
        <el-button type="primary" @click="handleSubmit">开 票</el-button>
      </slot>
    </footer>
  </div>
</template>

<script>
import BuyerInfoTable from './buyer-info-table'
import InvoiceProjectTable from './invoice-project-table'
import { validateStringLength as validator } from '@/utils'

import './style.scss'

// 默认的发票数据
const defaultInvoiceData = {
  client_info: {
    name: '',
    tax_code: '',
    address: '',
    bank_name: '',
    phone: '',
    bank_account: '',
  }, // 开票方（商户）信息
  buyer_info: {
    name: '',
    tax_code: '',
    address: '',
    bank_name: '',
    phone: '',
    bank_account: '',
    email: ''
  }, // 购方信息
  invoice_info: {
    payee: '',
    reviewer: '',
    drawer: '',
    remark: ''
  }, // 发票信息
}

export default {
  name: 'NormalInvoiceForm',
  components: { BuyerInfoTable, InvoiceProjectTable },
  props: {
    buyerInfo: {
      type: Object,
      default() {
        return { ...defaultInvoiceData.buyer_info }
      },
    },
    clientInfo: {
      type: Object,
      default() {
        return { ...defaultInvoiceData.client_info }
      },
    },
    invoiceInfo: {
      type: Object,
      default() {
        return { ...defaultInvoiceData.invoice_info }
      },
    },
    invoiceProjects: {
      type: Array,
      default() {
        return []
      },
    },
    // 标题
    title: {
      type: String,
      default: '普通（电子）发票'
    },
    // 抬头类型，1个人，2企业
    invoiceTitleType: {
      type: Number,
      default: 2
    },
    // 标识是否为专票类型
    specialInvoice: {
      type: Boolean,
      default: false
    },
    // 是否显示收票方信息
    visibleBuyerInfo: {
      type: Boolean,
      default: true
    },
  },
  data() {
    return {
      // 用于给 slot 提供访问的 $form 对象，封装 this.validate, this.clearValidate 等方法，
      // 这里不提供 form.resetFields 方法，它只能重置表单域数据，其它的如发票汇总数据不会被清除，
      // 如果需要重置所有数据，还是必须得通过 props 来控制
      $form: {
        validate: this.validate,
        clearValidate: this.clearValidate
      },
      // invoiceData: { ...defaultInvoiceData },
      model: {
        invoiceInfo: { ...this.invoiceInfo },
        invoiceInfoRules: {
          payee: [{ max: 10, validator, message: '长度不超过10位（汉字占2位）' }],
          reviewer: [{ max: 10, validator, message: '长度不超过10位（汉字占2位）' }],
          drawer: [{ required: true, max: 10, validator, message: '长度不超过10位（汉字占2位）' }],
        },
      }
    }
  },
  watch: {
    invoiceInfo(value) {
      console.log('watch.invoiceInfo', value)
      this.model.invoiceInfo = { ...value }
    },
  },
  methods: {
    getForm() {
      const $invoiceProjectTable = this.$refs['invoice-project-table']
      const $buyerInfoTable = this.$refs['buyer-info-table']

      const $form = []

      if (this.visibleBuyerInfo) {
        $form.push($buyerInfoTable.$refs['form'])
      }

      $form.push($invoiceProjectTable.$refs['form'])
      $form.push(this.$refs['form'])

      return $form
    },
    handleSubmit() {
      this.validate((values) => {
        this.$emit('submit', values)
      })
    },
    validate(callback) {
      const $invoiceProjectTable = this.$refs['invoice-project-table']
      const $buyerInfoTable = this.$refs['buyer-info-table']
      const $form = this.getForm()
      let result = []

      const addResult = function addResult(valid) {
        result.push(valid)
      }

      for (let i = 0; i < $form.length; i++) {
        $form[i].validate(addResult)
      }

      const valid = result.every(v => !!v)

      if (valid) {
        // 开票数据需要过滤掉用于表单显示的折扣行数据
        const invoiceProjects = $invoiceProjectTable.model.invoiceProjects.filter(project => project._type !== 'discount')

        if (!invoiceProjects || !invoiceProjects.length) {
          return this.$alert('请添加开票项目')
        }

        const invoiceCountInfo = $invoiceProjectTable.model.invoiceCountInfo

        result = {
          buyer_info: this.visibleBuyerInfo ? { ...$buyerInfoTable.model } : { ...this.buyerInfo },
          client_info: { ...this.clientInfo },
          goods_info: invoiceProjects,
          invoice_info: {
            ...this.model.invoiceInfo,
            // 合并开票汇总信息
            total_tax: invoiceCountInfo.total_tax, // 总税额
            total_price: invoiceCountInfo.total_price, // 总金额（不含税）
            total_price_with_tax: invoiceCountInfo.total_price_with_tax, // 总金额（价税合计）
            total_rmb: invoiceCountInfo.total_rmb, // 总金额（价税合计，大写
          }
        }

        callback(result)
      }
    },
    clearValidate() {
      this.getForm().forEach(form => {
        form.clearValidate()
      })
    }
  }
}
</script>
