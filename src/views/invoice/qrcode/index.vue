<template>
  <div class="page-content">
    <el-tabs v-model="qrcodeTab" @tab-click="changeTabs">
      <el-tab-pane label="生成二维码" name="0">
        <qrcode-invoice />
      </el-tab-pane>

      <el-tab-pane label="二维码管理" name="1">
        <el-form id="invoice-form" :model="searchForm" ref="searchForm" inline class="page-search-form">
          <el-form-item label="小票日期" prop="date" class="request-time-width">
            <el-date-picker
              v-model="searchForm.date"
              type="daterange"
              range-separator="-"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              >
            </el-date-picker>
          </el-form-item>
          <el-form-item label="小票单号" prop="samll_code_sn">
            <el-input class="number-input" v-model="searchForm.samll_code_sn" placeholder="请输入小票单号" />
          </el-form-item>
          <el-form-item>
              <el-button type="primary" @click="onSearch()" :loading="loading" icon="el-icon-search">查询</el-button>
              <el-button @click="resetFrom('searchForm')">重置</el-button>
          </el-form-item>

          <collapse>
            <el-form-item label="小票状态" prop="code_status">
              <el-select v-model="searchForm.code_status">
                <el-option label="全部" value=""></el-option>
                <el-option
                  v-for="item in codeStatusList"
                  :key="item.value"
                  :label="item.text"
                  :value="item.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="子账号" prop="code_drawer_id">
              <el-select v-model="searchForm.code_drawer_id">
                <el-option label="全部" value=""></el-option>
                <el-option
                  v-for="item in printTypeList"
                  :key="item.id"
                  :label="item.nickname"
                  :value="item.id" />
              </el-select>
            </el-form-item>
          </collapse>
        </el-form>

        <el-table :data="list" v-loading="loading">
          <el-table-column type="index" label="序号" width="50" />
          <el-table-column prop="created_at" label="小票日期" dateFormatter width="140" />
          <el-table-column prop="code_sn" label="小票单号" min-width="220" />
          <el-table-column prop="store_name" label="门店名称" min-width="120" />
          <el-table-column prop="nickname" label="子账号" width="120" />
          <el-table-column prop="consumer_phone" label="顾客手机号" width="120" />
          <el-table-column prop="order_amount" label="开票金额（元）" width="120" />
           <el-table-column prop="code_status" label="小票状态" :formatter="codeStatusType" width="80" />
          <el-table-column prop="data" label="操作" width="200" fixed="right">
            <template slot-scope="scope">
              <!-- <el-button v-if="scope.row.status === 2" type="text" @click="openPdf(scope.row.pdf_url)">查看发票</el-button> -->
              <el-button type="text" @click="lookQrcode(scope.row.code_sn)">查看小票</el-button>
              <el-button v-if="scope.row.code_status === '0'" type="text" @click="setCodeOrderInvalid(scope.row.code_sn)">作废</el-button>
              <!-- <el-button v-if="scope.row.status === 0" type="text" @click="setCodeOrderDelete(scope.row.code_sn)">删除</!-->
              <!-- <el-button v-if="scope.row.status === 3" type="text" @click="retryInvoice(scope.row.order_sn)">重试开票</el-button> -->
            </template>
          </el-table-column>
        </el-table>

        <el-pagination
          @size-change="_handleSizeChange"
          @current-change="_handlePageChange"
          :current-page="page"
          :page-size="page_size"
          :total="total" />

         <!-- 查看PDF弹出窗 -->
        <look-pdf
          :visible="lookPdfVisible"
          :model="lookPdfStore"
          @cancel="lookPdfVisible = false"
          @ok="lookPdfOK"/>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<style lang="scss" scoped>
.tax-device-top{
  margin-bottom: 20px;
}
.number-input{
  width:164px;
}
.request-time-width{
  .el-range-editor--mini.el-input__inner{
    width: 306px;
  }
}
</style>

<script>
import dayjs from 'dayjs'
import QrcodeInvoice from './invoice'
import { invoiceOperateRetryOne } from '@/services/query/invoice'
import {
  codeOrderList,
  clientAllEmployee,
  codeOrderDelete,
  codeOrderInvalid,
} from '@/services/invoice/qrcode'
import lookPdf from '@/components/look-pdf'
import mixinFetch from '@/views/mixins/mixin-fetch'

const codeStatusList = [
  { value: '0', text: '待开票' },
  { value: '1', text: '已开票' },
  { value: '4', text: '已作废' },
]

export default {
  name: 'QRCodeInvoice',
  components: { QrcodeInvoice, lookPdf },
  mixins: [ mixinFetch ],
  data() {
    return {
      loading: false,
      qrcodeTab: 0,
      // 子账号
      printTypeList: [],
      codeStatusList: [ ...codeStatusList ],
      // 查询数据
      searchForm: {
        date: [ dayjs().startOf('month'), dayjs() ], // 开票日期
        samll_code_sn: '', // 小票单号
        code_store_id: '-1', // 所属门店
        begin_at: '', // 开票起始日期
        end_at: '', // 开票结束日期
        code_status: '',
        code_drawer_id: '', // 子账号（开票员）
      },
      lookPdfVisible: false,
      lookPdfStore: null,
    }
  },
  methods: {
    changeTabs() {
      if (this.qrcodeTab === '1') {
        // 初始化
        this.loading = true
        clientAllEmployee()
          .then(res => {
            console.log('Employee', res)
            this.printTypeList = res
            this.fetchData()
          })
          .catch(() => {
            this.loading = false
          })
      }
    },
    codeStatusType(row, column) {
      const code = row[column.property]
      return codeStatusList.filter(item => item.value === code).map(item => item.text)[0]
    },
    fetchData() {
      const { date = [] } = this.searchForm
      const params = {
        ...this.searchForm,
        // 开始时间
        begin_at: date && dayjs(date[0]).unix(),
        end_at: date && dayjs(date[1]).endOf('day').unix(),
      }
      this._fetchData(codeOrderList)(params)
    },
    // 列表查询
    onSearch() {
      this.fetchData()
    },
    // 查询重置
    resetFrom(formName) {
      this.$refs[formName].resetFields()
    },
    lookQrcode(record) {
      console.log('lookQrcode', record)
      if (record) window.open(`/#/external/print-ticket?codeSn=${record}`)
    },
    // 重试开票
    retryInvoice(record) {
      const params = { order_sn: record }
      this._request(invoiceOperateRetryOne)(params)
        .then(() => {
          this.$message.success('重试开票请求成功')
          this._reload()
        })
    },
    // 作废
    setCodeOrderInvalid(record) {
      const params = { code_sn: record }
      console.log('cancellation', params)
      this._request(codeOrderInvalid)(params)
        .then(() => {
          this.$message.success('作废请求成功')
          this._reload()
        })
    },
    // 删除
    setCodeOrderDelete(record) {
      const params = { code_sn: record }
      console.log('Delete', params)
      this._request(codeOrderDelete)(params)
        .then(() => {
          this.$message.success('删除成功')
          this._reload()
        })
    },
    // 查看PDF
    openPdf(record) {
      this.lookPdfStore = APP_ENV === 'PROD' || APP_ENV === 'PREPROD'
        ? record.replace('upload.fapiaoer.cn', 'view-proxy.wetax.com.cn') // 线上环境
        : record.replace('upload.yewifi.com', 'view-proxy-dev.wetax.com.cn') // 测试环境
      this.lookPdfVisible = true
    },
    lookPdfOK() {
      this.lookPdfVisible = false
    },
  }
}
</script>
