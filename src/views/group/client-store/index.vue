<template>
  <div class="page-content">
    <div class="toolbar">
      <el-button plain type="primary" icon="el-icon-plus" @click="handleAdd">新增门店</el-button>
      <el-button plain type="primary" icon="el-icon-download" @click="handleDownload">下载二维码</el-button>
      <el-popover ref="popover" placement="right-start" trigger="click">
        <img src="./assets/egImg.jpg" width="700px" alt="">
      </el-popover>
      <el-button v-popover:popover type="text">预览二维码模板</el-button>
    </div>

    <el-form :model="searchForm" :inline="true" class="page-search-form">
      <el-form-item label="税盘编号">
        <el-select v-model="searchForm.tax_num">
          <el-option label="全部" value="" />
          <el-option
            v-for="tax in tax_list"
            :key="tax.id"
            :label="tax.tax_num"
            :value="tax.tax_num" />
        </el-select>
      </el-form-item>

      <el-form-item label="门店">
        <el-select v-model="searchForm.name">
          <el-option label="全部" value="" />
          <el-option
            v-for="store in store_list"
            :key="store.store_id"
            :label="store.store_name"
            :value="store.store_name" />
        </el-select>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleSearch" :loading="loading">查询</el-button>
      </el-form-item>
    </el-form>

    <el-table :data="list" v-loading="loading" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="50" />
      <el-table-column prop="sub_no" label="门店编号" min-width="120" />
      <el-table-column prop="name" label="门店名称" min-width="140" />
      <el-table-column prop="phone" label="门店电话" width="120" />
      <el-table-column prop="tax_num" label="税盘编号" min-width="120" />
      <el-table-column prop="state" label="状态" width="80">
        <template #default="{ row }">
          {{ +row.state === 0 ? '已启用' : '已禁用' }}
        </template>
      </el-table-column>
      <el-table-column prop="drawer" label="开票人" width="90" />
      <el-table-column prop="reviewer" label="复核人" width="90" />
      <el-table-column prop="payee" label="收款人" width="90" />
      <el-table-column prop="created_at" label="创建时间" width="140" dateFormatter />
      <el-table-column fixed="right" label="操作" width="140">
        <template #default="{ row }">
          <el-button v-if="row.state === 0" type="text" @click="handleEdit(row)">修改</el-button>
          <el-button type="text" @click="handleStateChange(row)">{{row.state === 0 ? '禁用' : '启用'}}</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      @size-change="_handleSizeChange"
      @current-change="_handlePageChange"
      :current-page="page"
      :page-size="page_size"
      :total="total" />

    <client-store-modal
      :title="dialogTitle"
      :visible="dialogVisible"
      :model="clientStoreForm"
      @cancel="dialogVisible = false"
      @ok="handleOk" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import qs from 'qs'
import clientStoreModal from './client-store-modal'
import { fetchClientStores, updateState } from '@/services/group/client-store'
import { getToken } from '@/utils/cookie-storage'
import mixinFetch from '@/views/mixins/mixin-fetch'

export default {
  name: 'ClientStore',
  components: { clientStoreModal },
  mixins: [ mixinFetch ],
  data() {
    return {
      searchForm: {
        tax_num: '',
        name: ''
      },
      multipleSelection: [],
      dialogTitle: '',
      dialogVisible: false,
      clientStoreForm: null
    }
  },
  computed: {
    ...mapGetters([
      'store_list',
      'tax_list',
    ])
  },
  created() {
    this.$store.dispatch('business/getClientStores')
    this.$store.dispatch('business/getTaxboxs')
    this.fetchData()
  },
  methods: {
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    handleSearch() {
      this.fetchData(1)
    },
    handleAdd() {
      this.dialogTitle = '新增门店'
      this.dialogVisible = true
      this.clientStoreForm = null
    },
    handleEdit(record) {
      this.dialogTitle = '修改门店'
      this.dialogVisible = true
      this.clientStoreForm = record
    },
    handleOk() {
      this.dialogVisible = false
      this._reload()
    },
    handleDownload() {
      if (!this.multipleSelection || !this.multipleSelection.length) {
        return this.$alert('请先选择门店')
      }

      const storeIDs = this.multipleSelection.map(store => store.client_store_id)
      const queryParams = qs.stringify({
        token: getToken(),
        store_id: storeIDs
      }, { encode: false })

      const baseURL = APP_ENV === 'PROD' || APP_ENV === 'PREPROD'
        ? 'https://adminyp.fapiaoer.cn' : 'https://shanghu-backend-test.wetax.com.cn/'

      window.open(`${baseURL}/v1/store/pack-download-qrcode?${queryParams}`)
    },
    fetchData(pageIndex) {
      const params = { ...this.searchForm, page: pageIndex || this.page }
      this._fetchData(fetchClientStores)(params)
    },
    getSearchParams() {
      return { ...this.searchForm }
    },
    handleStateChange(record) {
      const { client_store_id: storeID, state } = record
      // state, 0启用，1禁用
      const message = state === 0 ? '确定禁用该门店吗？' : '确定要启用该门店吗？'

      this.$confirm(message)
        .then(() => updateState(storeID, state === 0 ? 1 : 0))
        .then(() => {
          this.$message.success('操作成功')
          this._reload()
        })
    }
  }
}
</script>

<style lang="scss">

</style>
