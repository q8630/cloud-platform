<template>
  <div class="page-content">
    <!--<div class="toolbar">-->
      <!--<el-button plain type="primary" @click="exportFile">导出</el-button>-->
    <!--</div>-->

    <el-form ref="form" :model="searchForm" inline class="page-search-form">
      <el-form-item label="按月统计" prop="date">
        <el-date-picker v-model="searchForm.date" :clearable="false" type="month" placeholder="选择月" />
      </el-form-item>

      <!--<el-form-item label="业务组织" prop="rate">
        <el-select v-model="searchForm.store_id">
          <el-option label="全部" value="" />
          <el-option v-for="item in store_list" :key="item.store_id" :label="item.store_name" :value="item.store_id" />
        </el-select>
      </el-form-item>-->

      <el-form-item label="所属门店" prop="rate">
        <el-select v-model="searchForm.store_id">
          <el-option label="全部" value="" />
          <el-option v-for="item in store_list" :key="item.store_id" :label="item.store_name" :value="item.store_id" />
        </el-select>
      </el-form-item>

      <el-form-item label="发票种类" prop="rate">
        <el-select v-model="searchForm.invoice_type">
          <el-option label="全部" value="" />
          <el-option v-for="item in invoice_types" :key="item.value" :label="item.name" :value="item.value" />
        </el-select>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="onSearch" :loading="loading" icon="el-icon-search">查询</el-button>
        <el-button @click="resetForm">重置</el-button>
      </el-form-item>

      <!--<collapse>
        <el-form-item label="发票种类" prop="rate">
          <el-select v-model="searchForm.invoice_type">
            <el-option label="全部" value="" />
            <el-option v-for="item in invoice_types" :key="item.value" :label="item.name" :value="item.value" />
          </el-select>
        </el-form-item>
      </collapse>-->
    </el-form>

    <div class="stat-panel">
      <div class="item blue">
        <p><span class="title">蓝字发票份数：</span>{{ statPanel.blueNum || 0 }} 份</p>
        <p><span class="title">蓝字发票金额：</span>{{ statPanel.blueAmountHasTax || '0.00' }} 元</p>
      </div>
      <div class="item blue">
        <p><span class="title">蓝字作废份数：</span>{{ statPanel.invalidNum || 0 }} 份</p>
        <p><span class="title">蓝字作废金额：</span>{{ statPanel.invalidAmountHasTax || '0.00' }} 元</p>
      </div>
      <div class="item red">
        <p><span class="title">红字发票份数：</span>{{ statPanel.redNum || 0 }} 份</p>
        <p><span class="title">红字发票金额：</span>{{ statPanel.redAmountHasTax || '-0.00' }} 元</p>
      </div>
    </div>

    <el-table :data="statList" v-loading="loading">
      <el-table-column type="index" label="序号" width="50" />
      <el-table-column prop="taxRate" label="税率" min-width="50" />
      <el-table-column prop="blueAmountNoTax" label="销项蓝字金额" min-width="100" />
      <el-table-column prop="blueAmountTax" label="销项蓝字税额" min-width="100" />
      <el-table-column prop="blueAmountHasTax" label="销项蓝字合计" min-width="100" />
      <el-table-column prop="redAmountNoTax" label="销项红字金额" min-width="100" />
      <el-table-column prop="redAmountTax" label="销项红字税额" min-width="100" />
      <el-table-column prop="redAmountHasTax" label="销项红字合计" min-width="100" />
      <el-table-column prop="realityAmountNoTax" label="实际销售金额" min-width="100" />
      <el-table-column prop="realityAmountTax" label="实际销售税额" min-width="100" />
      <el-table-column prop="realityAmountHasTax" label="实际销售合计" min-width="100" />
      <el-table-column prop="count" label="份数" />
    </el-table>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { getStatList } from '@/services/query/invoice-stat'
import dayjs from 'dayjs'
import qs from 'qs'
import getBaseURL from '@/utils/baseURL'
import { getToken } from '@/utils/cookie-storage'
import mixinFetch from '@/views/mixins/mixin-fetch'

const DefaultForm = {
  store_id: '',
  date: dayjs(),
  invoice_type: ''
}

export default {
  name: 'InvoiceStat',
  mixins: [ mixinFetch ],

  data() {
    return {
      loading: false,
      searchForm: DefaultForm,
      // 统计数据
      statList: [],
      statPanel: {}
    }
  },

  computed: {
    ...mapGetters([
      'store_list', 'invoice_types', 'user_info'
    ])
  },

  created() {
    this.$store.dispatch('business/getClientStores')
    this.$store.dispatch('business/clientInvoiceType')
    this.onSearch()
  },

  methods: {
    // 生成查询参数
    genSearchParams() {
      const { date, store_id: storeId, invoice_type: type } = this.searchForm
      const d = date ? dayjs(date) : dayjs()

      return {
        store_id: storeId,
        invoice_type: type,
        client_id: this.user_info.client_id,
        s_begin_at: d.startOf('month').format('YYYY-MM-DD HH:mm:ss'),
        s_end_at: d.endOf('month').format('YYYY-MM-DD HH:mm:ss')
      }
    },

    onSearch() {
      if (this.loading) return
      this.loading = true
      this.statList = []
      this._fetchData(getStatList)(this.genSearchParams()).then(res => {
        // 统计列表数据处理
        const data = res.taxRateStatistics || {}
        for (const key in data) {
          const { blue, red, invalid } = data[key]
          this.statList.push({
            taxRate: `${key.substr(8)}%`,
            blueAmountTax: blue.sum_amount_tax.toFixed(2),
            blueAmountNoTax: blue.sum_amount_no_tax.toFixed(2),
            blueAmountHasTax: blue.sum_amount_has_tax.toFixed(2),
            redAmountTax: red.sum_amount_tax.toFixed(2),
            redAmountNoTax: red.sum_amount_no_tax.toFixed(2),
            redAmountHasTax: red.sum_amount_has_tax.toFixed(2),
            invalidAmountTax: invalid.sum_amount_tax.toFixed(2),
            invalidAmountNoTax: invalid.sum_amount_no_tax.toFixed(2),
            invalidAmountHasTax: invalid.sum_amount_has_tax.toFixed(2),
            // 实际销售税额（蓝字税额 - 作废税额 - 红冲税额）红冲返回的是负数
            realityAmountTax: (blue.sum_amount_tax + red.sum_amount_tax - invalid.sum_amount_tax).toFixed(2),
            // 实际销售金额（蓝字金额 - 作废金额 - 红冲金额）
            realityAmountNoTax: (blue.sum_amount_no_tax + red.sum_amount_no_tax - invalid.sum_amount_no_tax).toFixed(2),
            // 实际销售合计（蓝字价税合计 - 红字价税合计 - 作废价税合计）
            realityAmountHasTax: (blue.sum_amount_has_tax + red.sum_amount_has_tax - invalid.sum_amount_has_tax).toFixed(2),
            // 份数
            count: (blue.sum_doc_count + red.sum_doc_count + invalid.sum_doc_count).toFixed(2)
          })
        }
        // 统计面板
        this.statPanel = res.simpleStatistics || {}
      })
    },

    exportFile() {
      const params = qs.stringify(this.genSearchParams())
      window.open(`${getBaseURL()}/v3/statistics/invoice-export?token=${getToken()}&${params}`)
    },

    refreshData() {
      this.onSearch()
    },

    resetForm() {
      this.searchForm = {
        date: dayjs()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
  @import "~@/styles/variables.scss";

  .toolbar {
    margin-bottom: 10px;
  }

  .stat-panel {
    display: flex;
    margin: 12px 0;

    .item {
      padding: 10px 10px 14px 10px;
      font-size: 12px;
      width: 220px;
      height: 63px;
      background: rgba(245,247,250,1);
      border-radius: 5px;
      border: 1px solid rgba(220,223,230,1);
      margin-right: 20px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;

      p {
        margin: 0;
      }

      &.blue .title {
        color: $color-primary;
      }

      &.red .title {
        color: $color-danger;
      }
    }
  }

  .el-form.page-search-form .el-form-item .el-form-item__content > .el-date-editor {
    width: 190px;
  }
</style>
