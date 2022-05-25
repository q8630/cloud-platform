<template>
  <div>
    <el-dialog
      class="invoice-audit-modal"
      title="待审核"
      width="520px"
      :visible="visible"
      @close="$emit('cancel')"
    >
      <el-form label-suffix="：" ref="form" :model="form" :rules="rules" v-loading="loading" label-width="96px">
        <el-form-item label="发票种类" prop="invoice_style">
          <el-select v-model="form.invoice_style" @change="getTaxDisc">
            <el-option v-for="item in invoiceTypes" :key="item.value" :label="item.name" :value="item.value" />
          </el-select>
        </el-form-item>

        <el-form-item label="税盘编号" prop="tax_num_id">
          <el-select v-model="form.tax_num_id">
            <el-option
              v-for="item in taxList"
              :key="item.id"
              :label="item.tax_num"
              :value="item.id"
            />
          </el-select>
        </el-form-item>

        <div class="detail">
          <el-form-item label="抬头类型">
            {{ data.buyer_title_type === '1' ? '个人及政府事业机构' : '企业' }}
          </el-form-item>

          <el-form-item label="发票抬头">
            {{ data.buyer_title }}
          </el-form-item>

          <el-form-item label="开票税号">
            {{ data.buyer_taxcode }}
          </el-form-item>

          <el-form-item label="地址">
            {{ data.buyer_address }}
          </el-form-item>

          <el-form-item label="电话">
            {{ data.buyer_address_phone }}
          </el-form-item>

          <el-form-item label="开户行">
            {{ data.buyer_bank_name }}
          </el-form-item>

          <el-form-item label="银行账号">
            {{ data.buyer_bank_account }}
          </el-form-item>
        </div>

        <el-form-item label="开票金额" prop="order_amount">
          <el-input v-model="form.order_amount" @input="changeAmount" placeholder="请输入" />
        </el-form-item>

        <el-form-item label="开票项目">
          <el-select v-model="form.projectIndex" @change="changeProject">
            <el-option
              v-for="(item, index) in all_project"
              :key="item.id"
              :label="item.firm_goods_name"
              :value="index"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="单位" prop="unit">
          <el-select v-model="form.unit" placeholder="请选择" v-if="form.special_invoice_kind === '08'">
            <el-option
              v-for="item in unitList"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>

          <el-autocomplete
            v-else
            v-model="form.unit"
            placeholder="请选择"
            :fetch-suggestions="unitSearch"
          />
        </el-form-item>

        <el-form-item label="单价" prop="price_with_tax">
          <el-input v-model="form.price_with_tax" @input="changePrice" placeholder="请输入" />
        </el-form-item>

        <el-form-item label="数量" prop="total">
          <el-input v-model="form.total" @input="changeTotal" placeholder="请输入" />
        </el-form-item>

        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" placeholder="请输入" />
        </el-form-item>
      </el-form>

      <div slot="footer">
        <el-button type="primary" @click="onSubmit(0)" :loading="loading">{{paperInvoiceShow() ? '仅开票': '确认'}}</el-button>
        <el-button type="primary" v-if="paperInvoiceShow()" @click="onSubmit(1)" :loading="loading">开票并打印</el-button>
        <el-button @click="$emit('cancel')">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { debounce } from 'lodash'
import { countInvoice, getInvoiceTypes, getTypeTaxs, invoiceAudit } from '@/services/invoice/audit'
import mixinFetch from '@/views/mixins/mixin-fetch'

export default {
  name: 'AuditModal',
  mixins: [ mixinFetch ],

  props: {
    visible: Boolean,
    data: Object
  },

  data() {
    return {
      form: {
        order_sn: '',
        order_amount: '', // 开票金额
        price_with_tax: '', // 单价
        total: '', // 数量
        project_id: '',
        projectIndex: '', // 当前选中开票项下标
        remark: '',
        invoice_style: '',
        unit: '',
        tax_rate: '',
        tax_num_id: '',
        store_id: ''
      },
      rules: {
        invoice_style: {
          required: true, message: '请选择发票种类'
        },
        tax_num_id: {
          required: true, message: '请选择税盘编号'
        },
        order_amount: {
          validator: (rule, value, callback) => {
            if (!value) {
              callback(new Error('请输入金额'))
            }
            if (+value <= 0) {
              callback(new Error('金额需大于0'))
            }
            callback()
          }
        },
        price_with_tax: {
          required: true, message: '请输入单价'
        },
        total: {
          required: true, message: '请输入数量'
        },
      },
      loading: false,
      unitList: ['升', '吨'],
      oilUnitList: ['升', '吨'],
      // 默认开票项
      defaultProject: {},
      // 发票种类列表
      invoiceTypes: [],
      // 税盘列表
      taxList: []
    }
  },

  computed: {
    ...mapGetters([
      'tax_rate_list', 'user_info', 'all_project'
    ])
  },

  created() {
    this._dispatch('business/getAllProject').then(res => {
      const data = res || []
      // 设置默认开票项
      let hasDefault = false
      data.forEach((item, index) => {
        if (+item.is_default === 1) {
          hasDefault = true
          this.defaultProject = {
            ...item,
            index
          }
        }
      })
      if (!hasDefault) {
        this.defaultProject = {
          ...data[0],
          index: 0
        }
      }
    })
    this._dispatch('business/getTaxboxs')
  },

  watch: {
    // 审核表单数据变化
    data(newData) {
      const { order_amount: amount, invoice_style: style, store_id: storeId, order_sn: orderSn, remark } = newData
      const { per_price: price, id, special_invoice_kind: type, unit, index, tax_rate: rate } = this.defaultProject
      let unitPrice = price

      // 单价为0或不存在时，设置为开票金额
      if (!price || price === '0.00') {
        unitPrice = amount
      }

      // 设置默认开票项
      this.form = {
        order_sn: orderSn,
        project_id: id,
        projectIndex: index,
        unit,
        // 单价
        price_with_tax: unitPrice,
        order_amount: amount,
        // 默认数量为1
        total: 1,
        tax_rate: rate,
        store_id: storeId,
        tax_num_id: '',
        invoice_style: '',
        remark
      }

      // 成品油默认单位为 升
      if (!unit && type === '08') {
        this.form.unit = '升'
      }
      this.countPrice('order_amount', amount)

      // 获取可开发票种类
      this._request(getInvoiceTypes)({
        store_id: storeId
      }).then(res => {
        this.invoiceTypes = res

        // 检测该订单的发票种类是否存在
        if (res && res.length > 0) {
          const arr = res.filter(item => +item.value === +style)
          if (arr.length > 0) {
            this.form.invoice_style = +style
            this.getTaxDisc(style)
          }
        }
      }).catch(() => {
        this.invoiceTypes = []
      })
    }
  },

  methods: {
    // 纸票判断
    paperInvoiceShow() {
      const { invoice_style: style } = this.form
      return style === 1 || style === 2 || style === 6
    },

    changeAmount(value) {
      this.countPrice('order_amount', value)
    },

    changePrice(value) {
      this.countPrice('price_with_tax', value)
    },

    changeTotal(value) {
      this.countPrice('total', value)
    },

    // 根据发票种类获取税盘列表
    getTaxDisc(style) {
      const { store_id: storeId } = this.data

      this._request(getTypeTaxs)({
        store_id: storeId,
        invoice_style: style
      }).then(res => {
        this.taxList = res || []
        const taxId = res.length > 0 ? res[0].id : ''
        this.form.tax_num_id = taxId
      })
    },

    // 改变开票项
    changeProject(value) {
      const { order_amount: amount } = this.form
      // 当前选中项
      const { per_price: price, special_invoice_kind: type, unit, id } = this.all_project[value]
      let unitPrice = price

      // 单价为0或不存在时，设置为开票金额
      if (!price || price === '0.00') {
        unitPrice = amount
      }

      // 设置开票数据
      const data = {
        ...this.form,
        total: 1,
        project_id: id,
        price_with_tax: unitPrice,
        special_invoice_kind: type,
        unit
      }
      // 成品油默认单位为 升
      if (!unit && type === '08') {
        data.unit = '升'
      }
      this.form = data

      this.countPrice('price_with_tax', unitPrice)
    },

    // 自动计算金额、单价、数量
    countPrice: debounce(function count(name, value) {
      const data = this.form
      // 输入为金额或金额有值时，清空数量
      if (name === 'order_amount' || data.order_amount) data.total = ''
      // 如果输入为数量时，清空单价
      if (name === 'total') data.price_with_tax = ''

      data[name] = value

      const params = [{
        list_id: data.list_id,
        total: data.total || '', // 数量
        unit_price: data.price_with_tax || '', // 单价
        total_price_with_tax: data.order_amount || '', // 金额
        price_with_tax: data.price_with_tax || '', // 含税单价
        tax_rate: data.tax_rate || '', // 税率
      }]

      countInvoice({
        detail: JSON.stringify(params)
      }).then(res => {
        const result = res.detail[0] || {}
        this.form = {
          ...this.form,
          list_id: result.list_id,
          order_amount: result.total_price_with_tax, // 金额
          price_with_tax: result.price_with_tax, // 单价
          tax_rate: result.tax_rate, // 税率
          total: result.total, // 数量
        }
      })
    }, 1000),

    // 生成单位列表
    unitSearch(value, callback) {
      const unitList = [
        { value: '升' },
        { value: '个' },
        { value: '天' },
        { value: '米' },
        { value: '千克' },
        { value: '吨' },
        { value: '次' },
        { value: '批' }
      ]
      callback(unitList)
    },

    onSubmit(isPrint) {
      this.$refs.form.validate(valid => {
        if (valid) {
          const _form = {...this.form, is_print: isPrint}
          console.log('isPrint', _form)
          this.loading = true
          this._request(invoiceAudit)(_form).then(() => {
            this.$emit('cancel')
            this.$message.success('审核成功')
            setTimeout(() => {
              this.$emit('refreshList')
            }, 1000)
          })
        }
      })
    }
  },
}
</script>

<style lang="scss" scoped>
  .invoice-audit-modal .detail {
    :global(.el-form-item--mini.el-form-item) {
      margin-bottom: 2px;
    }
  }
</style>
