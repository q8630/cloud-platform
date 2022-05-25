<template>
  <div class="page-content">
    <el-tabs v-model="searchForm.op" @tab-click="changeTabs">
      <el-tab-pane label="开票完成" name="0" />
      <el-tab-pane label="开票未完成" name="1" />
    </el-tabs>
    <div class="tax-device-top">
      <el-button class="data-export" v-if="invoiceFinish" type="primary" plain @click="dataExport('1')">
        <i class="data-export-icon"/>
        明细汇总导出
      </el-button>
      <el-button class="data-export" v-if="invoiceFinish" type="primary" plain @click="dataExport('2')">
        <i class="data-export-icon"/>
        明细拆分导出
      </el-button>
      <el-button class="data-export" v-if="invoiceFinish" type="primary" plain @click="batchExportPdf">
        <i class="data-export-icon"/>
        批量导出PDF
      </el-button>
      <!-- <el-button v-if="invoiceFinish" type="primary" @click="sendInvoice">发送发票</el-button>
      <el-button v-if="invoiceFinish" type="primary" @click="printInvoice">打印发票</el-button>
      <el-button type="primary" @click="refreshList">刷新列表</el-button>
      <el-button v-if="invoiceNoFinish" type="primary" @click="printInvoice">重试提交开票</el-button> -->
    </div>
    <el-form id="invoice-form" :model="searchForm" ref="searchForm" inline class="page-search-form">
      <el-form-item v-if="invoiceFinish" label="发票号码" prop="ticket_sn">
        <div>
          <!-- <el-input class="number-input" v-model="searchForm.begin_ticket_sn" placeholder="起始发票号码" />
          -
          <el-input class="number-input" v-model="searchForm.end_ticket_sn" placeholder="终止发票号码" /> -->
          <el-input class="number-input" v-model="searchForm.ticket_sn" placeholder="请输入发票号码" />
        </div>
      </el-form-item>
      <el-form-item label="开票日期" prop="date" class="request-time-width">
        <el-date-picker
          v-model="searchForm.date"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :clearable="false"
          >
        </el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSearch()" :loading="loading" icon="el-icon-search">查询</el-button>
        <el-button @click="resetFrom('searchForm')">重置</el-button>
      </el-form-item>

      <collapse>
        <el-form-item label="购方名称" prop="buy_name">
          <el-input v-model="searchForm.buy_name" placeholder="请输入购方名称" />
        </el-form-item>
        <el-form-item label="购方税号" prop="buy_tax_code">
          <el-input v-model="searchForm.buy_tax_code" placeholder="请输入购方税号" />
        </el-form-item>
        <el-form-item v-if="invoiceFinish" label="发票代码" prop="ticket_code">
          <el-input v-model="searchForm.ticket_code" placeholder="请输入发票代码" />
        </el-form-item>
        <el-form-item label="开票人" prop="drawer">
          <el-input v-model="searchForm.drawer" placeholder="请输入开票人名称" />
        </el-form-item>
        <el-form-item label="订单号" prop="order_sn">
          <el-input v-model="searchForm.order_sn" placeholder="请输入订单号" />
        </el-form-item>
        <el-form-item v-if="selected_client_store.client_store_id === -1" label="所属门店" prop="store_id">
          <el-select v-model="searchForm.store_id">
            <el-option label="全部" value=""></el-option>
            <el-option
              v-for="item in storeList"
              :key="item.store_id"
              :label="item.store_name"
              :value="item.store_id" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="invoiceFinish" label="开票状态" prop="finished_status">
          <el-select v-model="searchForm.finished_status">
            <el-option label="全部" value="0"></el-option>
            <el-option
              v-for="item in finishedStatusList"
              :key="item.value"
              :label="item.name"
              :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="invoiceNoFinish" label="开票状态" prop="unfinished_status">
          <el-select v-model="searchForm.unfinished_status">
            <el-option label="全部" value="0"></el-option>
            <el-option
              v-for="item in unfinishedStatusList"
              :key="item.value"
              :label="item.name"
              :value="item.value" />
          </el-select>
        </el-form-item>
        <!-- <el-form-item label="税盘编码" prop="tax_num">
          <el-select v-model="searchForm.tax_num">
            <el-option label="全部" value=""></el-option>
            <el-option
              v-for="item in taxNumList"
              :key="item.value"
              :label="item.name"
              :value="item.value" />
          </el-select>
        </el-form-item> -->
        <el-form-item v-if="invoiceFinish" label="打印失败" prop="print_status">
          <el-select v-model="searchForm.print_status">
            <el-option label="全部" value="0"></el-option>
            <el-option
              v-for="item in printTypeList"
              :key="item.value"
              :label="item.name"
              :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="invoiceFinish" label="发票种类" prop="invoice_type_code">
          <el-select v-model="searchForm.invoice_type_code">
            <el-option label="全部" value=""></el-option>
            <el-option
                v-for="item in invoiceTypeCodeList"
                :key="item.key"
                :label="item.value"
                :value="item.key" />
          </el-select>
        </el-form-item>
        <el-form-item label="发票类型" prop="invoice_kind">
          <el-select multiple collapse-tags v-model="searchForm.invoice_kind">
            <el-option
                v-for="item in invoiceTypesList"
                :key="item.key"
                :label="item.value"
                :value="item.key" />
          </el-select>
        </el-form-item >
        <el-form-item v-if="invoiceFinish" label="开票方式" prop="scene">
          <el-select multiple collapse-tags v-model="searchForm.scene">
            <el-option
                v-for="item in sceneList"
                :key="item.key"
                :label="item.value"
                :value="item.key" />
          </el-select>
        </el-form-item>
      </collapse>
    </el-form>

    <el-table :key="searchForm.op" :data="list" v-loading="loading" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="44" />
      <el-table-column type="index" label="序号" width="48" />
      <el-table-column v-if="invoiceFinish" prop="ticket_sn" label="发票号码" width="84">
        <template slot-scope="scope">
          <el-button style="user-select: unset" type="text" @click="viewDetails(scope.row)">{{scope.row.ticket_sn}}</el-button>
        </template>
      </el-table-column>
      <el-table-column prop="order_sn" label="订单号"  width="150"/>
      <el-table-column v-if="invoiceFinish" prop="finished_status" label="开票状态" width="80">
        <template slot-scope="scope">
          {{scope.row.finished_status !== 0 ? finishedStatusList[scope.row.finished_status - 1].name : '--'}}
        </template>
      </el-table-column>
      <el-table-column v-if="invoiceNoFinish" prop="unfinished_status" label="开票状态" width="80">
        <template slot-scope="scope">
          {{scope.row.unfinished_status !== 0 ? unfinishedStatusList[scope.row.unfinished_status - 1].name : '--'}}
        </template>
      </el-table-column>
      <el-table-column prop="store_id" label="所属门店" :formatter="storeName" min-width="160"/>
      <!-- <el-table-column prop="tax_num" label="税盘编码" /> -->
      <el-table-column prop="invoice_type_code_desc" label="发票票种" width="110"/>
      <el-table-column prop="buy_name" label="发票抬头" min-width="160" />
      <el-table-column prop="amount_has_tax" label="开票金额" width="76" />
      <el-table-column prop="invoice_kind_desc" label="发票类型" width="76" />
      <el-table-column prop="drawer" label="开票人" width="90" />
      <el-table-column v-if="invoiceFinish" prop="print_status" label="打印失败" width="76">
        <template slot-scope="scope">
          {{scope.row.print_status !== 0 ? printTypeList[scope.row.print_status - 1].name : '--'}}
        </template>
      </el-table-column>
      <el-table-column prop="created_at" label="开票时间" width="140" dateFormatter />
      <el-table-column prop="data" label="操作" width="200" fixed="right">
        <template slot-scope="scope">
          <el-button v-if="invoiceNoFinish" type="text" @click="viewDetails(scope.row)">查看详情</el-button>
          <el-button v-if="retryInvoiceShow(scope.row)" type="text" @click="retryInvoice(scope.row)">重试开票</el-button>
          <el-button v-if="redDashedShow(scope.row)" type="text" @click="redDashed(scope.row)">红冲</el-button>
          <el-button v-if="cancellationShow(scope.row)" type="text" @click="cancellation(scope.row)">作废</el-button>
          <el-button v-if="sendmailShow(scope.row)" type="text" @click="sendmail(scope.row)">发送邮件</el-button>
          <el-button v-if="printInvoiceShow(scope.row)" type="text" @click="printInvoice(scope.row)">打印</el-button>
          <el-button v-if="downloadPdfShow(scope.row)" type="text" @click="downloadPdf(scope.row.pdf_url)">下载PDF</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      @size-change="_handleSizeChange"
      @current-change="_handlePageChange"
      :current-page="page"
      :page-size="page_size"
      :total="total" />

    <!-- 详情弹出窗 -->
    <invoice-info
      :visible="facilityModalVisible"
      :model="invoiceStoreForm"
      :actionType="invoiceType"
      @retry="requestRetry"
      @redDashed="requestRedDashed"
      @cancellation="requestCancellation"
      @cancel="facilityModalVisible = false"
      @ok="facilityOK"/>

    <!-- 查看PDF弹出窗 -->
    <look-pdf
      :visible="lookPdfVisible"
      :model="lookPdfStore"
      @cancel="lookPdfVisible = false"
      @ok="lookPdfOK"/>

    <!-- 发送邮件弹出窗 -->
    <send-email
      :visible="sendEmailVisible"
      :model="sendEmailStore"
      @cancel="sendEmailVisible = false"
      @ok="sendmailOk"/>

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

.data-export-icon {
  display: inline-block;
  width: 14px;
  height: 14px;
  background: url('../../../assets/export.png') no-repeat center 0;
  background-size: 14px 14px;
  vertical-align: bottom;
}

.data-export:hover,.data-export:focus {
  .data-export-icon {
    background: url('../../../assets/export_1.png') no-repeat center 0;
    background-size: 14px 14px;
  }
}

</style>

<script>
import { mapGetters } from 'vuex'
import dayjs from 'dayjs'
import { invoiceDetailList,
  invoiceOperateRetryOne,
  paperPrint,
  invoiceDetailGetConfig
} from '@/services/query/invoice'
import getBaseURL from '@/utils/baseURL'
import qs from 'qs'
import { getToken } from '@/utils/cookie-storage'
import invoiceInfo from './invoice-info'
import lookPdf from '@/components/look-pdf'
import sendEmail from './send-email'
import mixinFetch from '@/views/mixins/mixin-fetch'

const finished = [
  { name: '开票成功', value: 1 },
  { name: '已作废', value: 2 }
]

const unfinished = [
  { name: '开票中', value: 1 },
  { name: '开票失败', value: 2 }
]

const printStatus = [
  { name: '否', value: 1 },
  { name: '是', value: 2 }
]

export default {
  name: 'InvoiceRecord',
  components: { invoiceInfo, lookPdf, sendEmail },
  mixins: [ mixinFetch ],
  data() {
    return {
      loading: false,
      // 发票类型
      invoiceTypesList: [],
      // // 税盘编码
      // taxNumList: [
      //   { name: '1111111111', value: 1 },
      //   { name: '222222222', value: 2 },
      //   { name: '333333333', value: 3 }
      // ],
      // 所属门店
      storeList: [],
      // 打印状态
      printTypeList: { ...printStatus },
      finishedStatusList: { ...finished },
      unfinishedStatusList: { ...unfinished },
      // 开票方式
      sceneList: [],
      // 发票种类
      invoiceTypeCodeList: [],
      // 查询数据
      searchForm: {
        op: '0', // 列表类型 已完成|0，未完成|1 默认：已完成
        date: [ dayjs().startOf('month'), dayjs() ], // 开票日期
        ticket_sn: '', // 发票号码
        // begin_ticket_sn: '', // 发票起始号码
        // end_ticket_sn: '', // 发票结束号码
        begin_at: '', // 开票起始日期
        end_at: '', // 开票结束日期
        is_request_time: 1, // 时间类型 开票请求|1 开票成功|0
        buy_name: '', // 购方名称
        buy_tax_code: '', // 购方税号
        ticket_code: '', // 发票代码
        drawer: '', // 开票人
        order_sn: '', // 订单号
        store_id: '', // 所属门店
        print_status: '0', // 打印状态
        invoice_type_code: '', // 发票种类
        invoice_kind: [], // 发票类型
        scene: [], // 开票方式
        // tax_num: '', // 税盘编码
        finished_status: '0', // 开票完成状态
        unfinished_status: '0', // 开票未完成状态
      },
      // 发票明细
      dialogTitle: '',
      multipleSelection: [],
      invoiceType: 0,
      facilityModalVisible: false,
      invoiceStoreForm: null,
      lookPdfVisible: false,
      lookPdfStore: null,
      sendEmailVisible: false,
      sendEmailStore: null,
      orderSn: '',
      invoiceId: '',
      exportIconName: 'export',
      splitExportName: 'export'
    }
  },
  created() {
    // 初始化
    this._request(invoiceDetailGetConfig)()
      .then(res => {
        console.log('Config', res)
        this.invoiceTypesList = res.invoice_kind
        this.invoiceTypeCodeList = res.invoice_type_code
        this.storeList = res.store_list
        this.sceneList = res.scene
        this.fetchData()
      })
  },
  computed: {
    ...mapGetters(['user_info', 'selected_client_store']),
    invoiceFinish() {
      return this.searchForm.op === '0'
    },
    invoiceNoFinish() {
      return this.searchForm.op === '1'
    }
  },
  methods: {
    changeTabs() {
      this.fetchData(1)
    },
    isSameMonth(data) {
      // 纸票当月作废，跨月红冲。
      // console.log('isSame',data, dayjs().isSame(dayjs(data * 1000), 'month'))
      return dayjs().isSame(dayjs(data * 1000), 'month')
    },
    storeName(row, column) {
      const storeId = row[column.property]
      const storeName = this.storeList.filter(item => item.store_id === storeId)[0]
      return storeName ? storeName.store_name : '--'
    },
    // has_red是否已冲红：0|未冲红 1|已冲红
    // is_paper纸票标识 非纸票|0 纸票|1
    // is_red 发票类型： 0 蓝票，1 红票
    // status 开票状态：0未开票，1开票中，2开票成功，3开票失败
    // state 开票新状态：0未开票，1开票中，2开票失败，3已开票待签章，4签章失败，5开票成功，6待作废，7作废失败，8作废成功，9打印失败
    // invoice_style 发票类型: 0.电子发票; 1.纸质发票(普票); 2.纸质发票(专票); 4.区块链发票 6.卷票
    // invoice_type_code 发票类型: 004:增值税专用发票，007:增值税普通发票，026：增值税电子发票，025：增值税卷式发票，032：区块链数字发票
    retryInvoiceShow(row) {
      return this.searchForm.op === '1' && row.status === '3'
    },
    redDashedShow(row) {
      // 电票只能红冲，不受跨月限制。纸票普票、卷票跨月红冲。专票不能红冲
      // 满足开票完成，蓝票，未红冲，开票成功
      const redBlunt = this.searchForm.op === '0' && row.is_red === '0' && row.has_red === '0' && row.status === '2'
      // 不受当月限制票种类(026：增值税电子发票, 032：区块链数字发票)
      const monthInvoice = row.invoice_type_code === '026' || row.invoice_type_code === '032'
      // 受当月限制票种类(007:增值税普通发票, 025：增值税卷式发票)
      const noMonthInvoice = (row.invoice_type_code === '007' || row.invoice_type_code === '025') && !this.isSameMonth(row.ticket_date)
      return redBlunt && (monthInvoice || noMonthInvoice)
    },
    cancellationShow(row) {
      return row.is_paper === 1 && row.is_red === '0' && (row.state >= '5' && row.state !== '8') && this.isSameMonth(row.ticket_date)
    },
    sendmailShow(row) {
      return this.searchForm.op === '0' && row.is_paper === 0 && row.is_red === '0' && row.status === '2' && row.pdf_url
    },
    printInvoiceShow(row) {
      return (row.status === '2' || row.status === '7') && row.is_paper === 1
    },
    downloadPdfShow(row) {
      return this.searchForm.op === '0' && row.status === '2' && row.is_paper === 0 && row.pdf_url
    },
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    getSearchParams() {
      const { date, invoice_type_code: invoiceType, storeId } = this.searchForm
      const beginTime = date.length === 0 ? dayjs().startOf('month').format('YYYY-MM-DD HH:mm:ss') : dayjs(date[0]).format('YYYY-MM-DD HH:mm:ss')
      const endTime = date.length === 0 ? dayjs().format('YYYY-MM-DD HH:mm:ss') : dayjs(date[1]).format('YYYY-MM-DD HH:mm:ss')
      const invoice = invoiceType ? `s${invoiceType}` : ''
      return {
        store_id: storeId || '',
        client_id: this.user_info.client_id,
        // 开始时间
        s_begin_at: beginTime,
        s_end_at: endTime,
        invoice_type: invoice,
      }
    },
    dataExport(type) {
      if (this.list.length === 0) return this.$alert('您当前选择时间段没有开票数据，请选择其他开票日期！')
      const getParams = this.getSearchParams()
      const params = qs.stringify({...getParams, type})
      console.log('dataExport', params)
      window.open(`${getBaseURL()}/v3/statistics/invoice-export?token=${getToken()}&${params}`)
    },
    // 批量导出
    batchExportPdf() {
      console.log('Pdf', this.multipleSelection.length)
      this.$confirm('pdf导出只能导出电子发票，是否导出').then(() => {
        if (!this.multipleSelection || !this.multipleSelection.length) return this.dataExport('3')
        const filter = this.multipleSelection.filter(item => item.invoice_type_code === '026' || item.invoice_type_code === '032')
        if (filter.length === 0) return this.$alert('只能导出电子发票或者区块链发票')
        const lists = this.multipleSelection.map(store => ({order_sn: store.order_sn, invoice_id: store.invoice_id}))
        const params = qs.stringify({list: lists})
        window.open(`${getBaseURL()}/v3/statistics/pdf-export?token=${getToken()}&${params}`)
      }).catch(() => {})
    },
    // 发送邮件
    sendInvoice() {
      if (!this.multipleSelection || !this.multipleSelection.length) {
        return this.$alert('请先选择发票')
      }
      // const storeIDs = this.multipleSelection.map(store => store.client_store_id)
      console.log('发送邮件')
    },
    // 刷新列表
    refreshList() {
      this._reload()
    },
    fetchData(pageIndex) {
      const { date = [] } = this.searchForm
      const params = {
        ...this.searchForm,
        // 开始时间
        begin_at: date && dayjs(date[0]).unix(),
        end_at: date && dayjs(date[1]).endOf('day').unix(),
        page: pageIndex || this.page,
        page_size: this.page_size
      }
      this._fetchData(invoiceDetailList)(params)
    },
    // 分页操作
    handleSizeChange(val) {
      this.page_size = val
    },
    handleCurrentChange(val) {
      this.page = val
    },
    // 列表查询
    onSearch() {
      this.fetchData(1)
    },
    // 查询重置
    resetFrom(formName) {
      this.$refs[formName].resetFields()
    },
    // 详情功能
    viewDetails(record) {
      // invoice_style 发票类型: 0.电子发票; 1.纸质发票(普票); 2.纸质发票(专票); 4.区块链发票
      if (record.status === '2' && record.is_paper === 0 && record.pdf_url) {
        this.openPdf(record.pdf_url)
      } else {
        this.invoiceInfoOpen(record, 0)
      }
    },
    invoiceInfoOpen(record, type) {
      this.invoiceType = type
      this.invoiceStoreForm = record
      this.facilityModalVisible = true
    },
    facilityOK() {
      this.facilityModalVisible = false
      this._reload()
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
    // 重试开票
    retryInvoice(record) {
      const params = {
        order_sn: record.order_sn,
        is_red: record.is_red
      }
      this._request(invoiceOperateRetryOne)(params)
        .then(() => {
          this.$message.success('重试开票请求成功')
          this.facilityModalVisible = false
          this._reload()
        })
    },
    requestRetry() {
      this.facilityModalVisible = false
      this._reload()
    },
    // 红冲
    redDashed(record) {
      this.invoiceInfoOpen(record, 1)
    },
    requestRedDashed() {
      this.facilityModalVisible = false
      this._reload()
    },
    // 作废
    cancellation(record) {
      this.invoiceInfoOpen(record, 2)
    },
    requestCancellation() {
      this.facilityModalVisible = false
      this._reload()
    },
    // 打印
    printInvoice(params) {
      this.requestPrintInvoice(params)
    },
    requestPrintInvoice(data) {
      console.log('printInvoice', data)
      const params = { order_sn: data.order_sn }
      this._request(paperPrint)(params)
        .then(() => {
          this.$message.success('已发送打印请求')
          this._reload()
        })
    },
    // 发送邮件
    sendmail(params) {
      this.sendEmailStore = {
        order_sn: params.order_sn,
        invoice_id: params.invoice_id,
        email: params.buy_email
      }
      this.sendEmailVisible = true
    },
    sendmailOk() {
      this.sendEmailVisible = false
      this._reload()
    },
    // 下载PDF
    downloadPdf(params) {
      window.open(params)
    }
  }
}
</script>
