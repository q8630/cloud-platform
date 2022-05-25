<template>
  <el-dialog width="880px" :title="title" :visible="visible" :before-close="handleClose">
    <div class="invoice-info-top">
      <el-row :gutter="20">
        <el-col :span="12"><div class="info-top-box">店员开票请求日期：{{this.formatDate(invoiceData)}}</div></el-col>
        <el-col :span="12"><div class="info-top-box">原蓝票代码/号码：{{invoiceData.ticket_code || '暂无'}} / {{invoiceData.ticket_sn || '暂无'}}</div></el-col>
      </el-row>
      <!-- 开票状态, 3|开票失败，4|取消订单，5|等待订单, 6|订单异常，7|打印失败 -->
      <el-row :gutter="20">
        <el-col :span="12" v-if="(invoiceData.status === '3' || invoiceData.status === '5' || invoiceData.status === '6' ) && invoiceData.fail_msg"><div class="info-top-box text-red">失败原因：{{invoiceData.fail_msg}}</div></el-col>
        <el-col :span="12"><div class="info-top-box">请求流水号：{{invoiceData.g_unique_id}}</div></el-col>
      </el-row>
    </div>
    <div class="invoice-info-center" v-loading="loading">
      <div class="info-center-buy">
        <p class="info-text">购买方</p>
        <table class='radius'>
          <thead>
            <tr>
              <td class='bg-f7 bold'>名称</td>
              <td>{{invoiceData.buyer_title}}</td>
              <td class='bg-f7 bold'>纳税人识别号</td>
              <td>{{invoiceData.buyer_taxcode}}</td>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class='bg-f7 bold'>开户行及账号</td>
              <td>{{invoiceData.buyer_bank_name}}<br>{{invoiceData.buyer_bank_account}}</td>
              <td class='bg-f7 bold'>地址、电话及购方邮箱</td>
              <td>{{invoiceData.buyer_address}} {{invoiceData.buyer_address_phone}}<br>{{invoiceData.buyer_email}}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div>
        <p class="info-text">购买物品</p>
        <el-table
          :data="itemInfoPlus"
          border
          style="width: 100%">
          <el-table-column
            prop="name"
            label="货物或应税劳务、服务名称"
            width="180">
          </el-table-column>
          <el-table-column
            prop="models"
            label="规格型号">
          </el-table-column>
          <el-table-column
            prop="unit"
            label="单位">
          </el-table-column>
          <el-table-column
            prop="total"
            sortable
            label="数量">
          </el-table-column>
          <el-table-column
            prop="price"
            sortable
            label="单价(不含税）"
            >
          </el-table-column>
          <el-table-column
            prop="total_price"
            label="金额(不含税）">
          </el-table-column>
          <el-table-column
            prop="tax_rate"
            label="税率(%）">
          </el-table-column>
          <el-table-column
            prop="tax_amount"
            label="税额">
          </el-table-column>
        </el-table>
        <div slot="append" style="text-align: right">
          <div class='flex justify-end'>
            <div class='bold'>
              金额合计: <span class="span-red">¥{{invoiceData.fee_without_tax}}</span>
            </div>
            <div class='bold ml-48px'>
              税额合计：<span class="span-red">¥{{invoiceData.tax}}</span>
            </div>
            <div class='bold ml-48px'>
              价税合计 <span class="span-red">¥{{invoiceData.fee}}</span>
            </div>
            <div class='bold ml-48px'>
              <!-- 价税合计 <span>(大写)</span> : ¥{{this.digitUppercase(invoiceData.fee)}} -->
              价税合计 <span>(大写)</span> : ¥{{convertCurrencyName(invoiceData.fee)}}
            </div>
          </div>
        </div>
      </div>
      <div class="info-center-buy">
        <p class="info-text">销售方</p>
        <table class='radius'>
          <thead>
            <tr>
              <td class='bg-f7 bold'>名称</td>
              <td>{{invoiceData.seller_name}}</td>
              <td class='bg-f7 bold'>纳税人识别号</td>
              <td>{{invoiceData.seller_taxcode}}</td>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class='bg-f7 bold'>开户行及账号</td>
              <td>{{invoiceData.sell_bank_name}} {{invoiceData.sell_bank_account}}</td>
              <td class='bg-f7 bold'>地址及电话</td>
              <td>{{invoiceData.sell_address}}; {{invoiceData.sell_phone}}</td>
            </tr>
            <tr>
              <td class='bg-f7 bold'>备注</td>
              <td colspan="3" v-if="this.actionType === 0">{{invoiceData.remark}}</td>
              <td colspan="3" v-if="this.actionType !== 0"><el-input v-model="remark" class="input-width" placeholder="请输入内容"/></td>
            </tr>
          </tbody>
        </table>
        <div class='flex justify-end'>
            <div class='bold ml-48px'>
              收款人: <span>{{invoiceData.payee}}</span>
            </div>
            <div class='bold ml-48px'>
              复核人：<span>{{invoiceData.reviewer}}</span>
            </div>
            <div class='bold ml-48px'>
              开票人：<span>{{invoiceData.drawer}}</span>
            </div>
          </div>
      </div>
    </div>
    <div slot="footer">
      <el-button @click="$emit('cancel')">取消</el-button>
      <el-button type="primary" v-if="this.actionType === 0 && invoiceData.status === '3'" @click="invoiceOperateRetryOneClick()" :loading="loading" >重试开票</el-button>
      <el-button type="primary" v-if="this.actionType === 1" @click="redDashedClick()" :loading="loading">红冲</el-button>
      <el-button type="primary" v-if="this.actionType === 2" @click="cancellationClick()" :loading="loading">作废</el-button>
    </div>
  </el-dialog>
</template>

<style lang="scss" scoped>
  /deep/ .el-dialog__header {
    height: 55px;
  }
  .text-red{
    color:red;
  }
  .info-top-box{
    padding: 5px 0;
  }
  .info-text{
    font-size:16px;
    font-weight:500;
    color:rgba(48,49,51,1);
    line-height:22px;
  }
  .info-center-buy{
    table {
      border-collapse: collapse;
    }
    table, td, th {
      border: 1px solid #EBEEF5;
    }
    td, th {
      padding: 12px 0 14px 11px;
    }
    th {
      color:#909399
    }
    td {
      color:#606266
    }
  }
  .radius {
    width: 100%;
    border-radius: 4px;
  }
  .bold {
    font-weight: 400
  }
  .bg-f7 {
    width: 100px;
    background: #F4F7FA;
  }
  .justify-end {
    justify-content: flex-end;
    width:100%;
    height:40px;
    background:rgba(244,247,250,1);
    padding: 11px 19px 0 19px;
  }
  .flex {
    display: flex;
  }
  .ml-48px {
    margin-left: 20px;
    font-size:14px;
    font-weight:400;
    color:rgba(48,49,51,1);
  }
  .span-red {
    color:rgba(255,0,0,1);
  }
  .input-width{
    width: 400px;
  }
</style>

<script>
import dayjs from 'dayjs'
import {
  invoiceOperateRed,
  invoiceOperateInvalid,
  getinvoiceDetailInfo,
  invoiceOperateRetryOne
} from '@/services/query/invoice'
import { convertCurrency } from '@/utils'
import mixinFetch from '@/views/mixins/mixin-fetch'

const invoiceType = {
  0: '详情',
  1: '红冲',
  2: '作废',
}

export default {
  name: 'InvoiceInfo',
  mixins: [ mixinFetch ],
  props: {
    visible: {
      type: Boolean,
      required: true
    },
    actionType: Number,
    model: Object
  },
  data() {
    return {
      title: '',
      loading: false,
      itemInfoPlus: [],
      invoiceData: {},
      remark: '',
      invoiceStoreForm: null,
    }
  },
  watch: {
    visible(newVal) {
      console.log('change', newVal)
      if (newVal) {
        this.infoQuery(this.model, this.actionType)
      } else {
        this.title = ''
        this.invoiceData = {}
        this.itemInfoPlus = []
        this.remark = ''
      }
    }
  },
  methods: {
    infoQuery(record, type) {
      const infoParams = {
        invoice_id: record.invoice_id,
        order_sn: record.order_sn
      }
      console.log('info', record, type)
      this._request(getinvoiceDetailInfo)(infoParams)
        .then(res => {
          this.title = type === 0 ? `${invoiceType[type]}（${res.status_msg}）` : `${invoiceType[type]}`
          this.invoiceData = res
          const itemInfoPlus = res || {}
          this.itemInfoPlusList(itemInfoPlus)
        })
    },
    itemInfoPlusList(model) {
      const itemInfo = model.item_info || []
      const itemInfoPlus = []
      // 扩展table，添加折扣行
      itemInfo.forEach(item => {
        itemInfoPlus.push(item)
        this.itemInfoPlus = itemInfoPlus
        // let row = {name: item.name, tax_amount: item.dis_tax, price: item.discount};
        if (+item.dis_tax === 0) {
          return
        }
        const row = {
          name: item.name,
          tax_amount: item.dis_tax,
          tax_rate: item.tax_rate,
          total_price: item.discount_no_tax,
        }
        let _item = Object.assign({}, item)
        for (const k in _item) {
          _item[k] = ''
        }
        _item = Object.assign(_item, row)
        itemInfoPlus.push(_item)
        this.itemInfoPlus = itemInfoPlus
      })
      // console.log('itemInfoPlus', this.itemInfoPlus)
    },
    // 重试开票
    invoiceOperateRetryOneClick() {
      const params = {
        order_sn: this.invoiceData.order_sn,
        is_red: this.invoiceData.invoice_type
      }
      this._request(invoiceOperateRetryOne)(params)
        .then(() => {
          this.$message.success('重试开票请求成功')
          this.$emit('retry')
        })
    },
    // 红冲
    redDashedClick() {
      const params = {
        order_sn: this.invoiceData.order_sn,
        remark: this.remark
      }
      console.log('red', params)
      if (this.remark.length === 0) {
        return this.$message.error('没有输入备注信息')
      }
      this._request(invoiceOperateRed)(params)
        .then(() => {
          this.$message.success('红冲请求成功')
          this.$emit('redDashed')
        })
    },
    // 作废
    cancellationClick() {
      const params = {
        order_sn: this.invoiceData.order_sn,
        remark: this.remark
      }
      console.log('cancellation', params)
      if (params.remark.length === 0) {
        return this.$message.error('没有输入备注信息')
      }
      this._request(invoiceOperateInvalid)(params)
        .then(() => {
          this.$message.success('作废请求成功')
          this.$emit('cancellation')
        })
    },
    // 转化日期
    formatDate(model) {
      if (!model) return
      const date = model.created_at
      return date && dayjs.unix(+date).format('YYYY-MM-DD HH:mm:ss')
    },
    handleClose() {
      this.$emit('cancel')
    },
    convertCurrencyName(text) {
      return convertCurrency(text)
    }
  }
}
</script>
