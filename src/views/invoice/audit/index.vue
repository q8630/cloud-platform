<template>
  <div class="page-content audit-wrap">
    <el-form ref="form" :model="searchForm" class="audit-form page-search-form" inline>
      <el-form-item label="申请日期">
        <el-date-picker
          v-model="searchForm.date"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="timestamp"
          :picker-options="pickerOptions"
        />
      </el-form-item>

      <el-form-item label="开票抬头">
        <el-input v-model="searchForm.buyer_title" placeholder="请输入"/>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="onSearch" :loading="loading" icon="el-icon-search">查询</el-button>
        <el-button @click="resetForm">重置</el-button>
      </el-form-item>

      <collapse>
          <el-form-item label="抬头类型">
            <el-select v-model="searchForm.buyer_title_type">
              <el-option v-for="item in titleTypes" :key="item.value" :label="item.text"
                         :value="item.value"></el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="发票种类">
            <el-select v-model="searchForm.invoice_style">
              <el-option label="全部" value=""></el-option>
              <el-option v-for="item in invoice_types" :key="item.value" :label="item.name"
                         :value="item.value + ''"></el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="所属门店" v-if="+selected_client_store.client_store_id === -1">
            <el-select v-model="searchForm.store_id">
              <el-option label="全部" value=""/>
              <el-option
                v-for="store in store_list"
                :key="store.store_id"
                :label="store.store_name"
                :value="store.store_id"/>
            </el-select>
          </el-form-item>
      </collapse>
    </el-form>

    <el-tabs v-model="searchForm.examine_status" @tab-click="changeTabs">
      <el-tab-pane label="全部" name="-1" />
      <el-tab-pane label="待审核" name="0" />
      <el-tab-pane label="已审核" name="1" />
      <el-tab-pane label="拒绝开票" name="2" />
    </el-tabs>

    <el-table :data="list" v-loading="loading">
      <el-table-column prop="list_id" label="序号" width="50" />
      <el-table-column prop="order_time" label="申请时间" dateFormatter width="132" />
      <el-table-column prop="store_name" label="所属门店" min-width="100" />
      <el-table-column prop="invoice_style_desc" label="发票种类" width="120" />
      <el-table-column prop="order_amount" label="开票金额" width="100" />
      <el-table-column prop="buyer_title" label="开票抬头" min-width="130">
        <template #default="{ row }">
          <span :title="row.buyer_title">{{ row.buyer_title }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="project_name" label="抬头类型" :formatter="formatTitleType" width="140" />
      <el-table-column prop="name" label="开票项目" min-width="120" />
      <el-table-column prop="phone" label="联系方式" />
      <el-table-column label="操作" width="130" fixed="right">
        <template #default="{ row }">
          <template v-if="+row.examine_status === 0">
            <el-button type="text" @click="openModal(row)">审核</el-button>
            <el-button type="text" @click="showReject(row)">拒绝</el-button>
          </template>

          <el-button v-else type="text" @click="showDetail(row)">查看</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      :current-page="page"
      :page-size="page_size"
      :total="total"
      @size-change="_handleSizeChange"
      @current-change="_handlePageChange"
    />

    <audit-modal
      :visible="visible"
      :data="auditData"
      @cancel="closeModal"
      @refreshList="onSearch"
    />
    <detail
      :visible="detailVisible"
      :data="detailData"
      @cancel="closeDetail"
    />
    <reject-modal
      :visible="rejectVisible"
      :orderSn="detailData.order_sn"
      @cancel="closeReject"
      @refreshList="onSearch"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { getInvoiceList } from '@/services/invoice/audit'
import dayjs from 'dayjs'
import AuditModal from './audit-modal.vue'
import Detail from './detail.vue'
import RejectModal from './reject-modal.vue'
import mixinFetch from '@/views/mixins/mixin-fetch'

export default {
  name: 'AuditInvoice',

  components: {
    AuditModal, Detail, RejectModal
  },
  mixins: [ mixinFetch ],

  data() {
    return {
      loading: false,
      searchForm: {
        begin_at: '',
        end_at: '',
        buyer_title: '',
        buyer_title_type: '',
        examine_status: '0',
        invoice_style: '',
        store_id: '',
        date: []
      },
      titleTypes: [
        {
          text: '全部',
          value: ''
        },
        {
          text: '企业',
          value: '2'
        },
        {
          text: '个人及政府事业机构',
          value: '1'
        }
      ],
      // 审核弹窗
      visible: false,
      auditData: {},
      // 详情弹窗
      detailVisible: false,
      detailData: {},
      // 拒绝弹窗
      rejectVisible: false,
      // 时间控件选项
      pickerOptions: {
        disabledDate(date) {
          return dayjs(date).isAfter(dayjs())
        }
      }
    }
  },

  computed: {
    ...mapGetters([
      'store_list', 'invoice_types', 'selected_client_store'
    ])
  },

  created() {
    this.onSearch()
    this.$store.dispatch('business/getClientStores')
    this.$store.dispatch('business/clientInvoiceType')
  },

  methods: {
    onSearch() {
      const { examine_status: examineStatus, date = [] } = this.searchForm

      this._fetchData(getInvoiceList)({
        ...this.searchForm,
        // 实际审核状态值 -1 为空
        examine_status: examineStatus === '-1' ? '' : examineStatus,
        // 开始时间
        begin_at: date[0] && date[0] / 1000,
        end_at: date[1] && dayjs(date[1]).endOf('day').unix()
      })
    },

    resetForm() {
      this.searchForm = {
        ...this.searchForm,
        begin_at: '',
        end_at: '',
        buyer_title: '',
        buyer_title_type: '',
        invoice_style: '',
        store_id: '',
        date: []
      }
    },

    closeModal() {
      this.visible = false
    },

    openModal(data) {
      this.auditData = data
      this.visible = true
    },

    changeTabs() {
      this.onSearch()
    },

    formatTitleType(data) {
      return data.buyer_title_type === '1' ? '个人及政府事业机构' : '企业'
    },

    showDetail(data) {
      this.detailData = data
      this.detailVisible = true
    },

    closeDetail() {
      this.detailVisible = false
    },

    showReject(data) {
      this.detailData = data
      this.rejectVisible = true
    },

    closeReject() {
      this.rejectVisible = false
    }
  }
}
</script>

<style lang="scss" scoped>
  .audit-wrap {
    :global(.el-table .cell) {
      white-space: nowrap;
    }
  }
</style>
