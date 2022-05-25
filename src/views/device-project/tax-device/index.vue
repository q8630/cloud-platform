<template>
  <div class="page-content">
    <div class="tax-device-top">
      <el-button plain type="primary" icon="el-icon-plus" @click="addFacility">新增设备信息</el-button>
      <el-button plain type="primary" @click="bindBlockDisc" :loading="loading">绑定区块链电子发票</el-button>
    </div>

    <el-table :data="list" v-loading="loading" class="tax-device-box">
      <el-table-column type="index" label="序号" width="48" />
      <el-table-column prop="tax_num" label="税盘号" width="210">
        <div slot-scope="scope" class="icon-tax-disc">
          <svg-icon class-name="tax-num-icon" :icon-class="scope.row.is_main_disk === 1 ? 'icon-main-tax-disc':'icon-rests-tax-disc'"/>
          {{scope.row.tax_num}}
        </div>
      </el-table-column>
      <el-table-column prop="tax_disk_type" label="税盘类型" :formatter="typeFormat" width="110"/>
      <el-table-column prop="created_at" label="注册系统时间" width="140" dateFormatter />
      <el-table-column prop="address" label="地址" min-width="160"/>
      <el-table-column prop="phone" label="电话" width="120" />
      <el-table-column prop="bank_name" label="开户银行" min-width="120" />
      <el-table-column prop="bank_account" label="银行账号" min-width="120" />
      <el-table-column prop="date" label="操作" width="130" fixed="right">
        <template #default="{ row }">
          <!-- 税盘类型 1|航天金税盘; 2|百望税控盘; 3|区块链盘 -->
          <template v-if="+row.tax_disk_type === 3">
            <!-- 税盘状态: 1|有效 2|已禁用 3|已删除' -->
            <el-button v-if="+row.status === 1" type="text" @click="disableDisc(row.id)">停用</el-button>
            <el-button v-else type="text" @click="enableDisc(row.id)">启用</el-button>
            <el-button type="text" @click="syncDisc(row.id)">同步</el-button>
          </template>
          <template v-else>
            <el-button type="text" @click="editFacility(row)">修改</el-button>
            <el-button type="text" @click="delFacility(row)">删除</el-button>
          </template>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      @size-change="_handleSizeChange"
      @current-change="_handlePageChange"
      :current-page="page"
      :page-size="page_size"
      :total="total" />

    <!-- 税盘弹出窗 -->
    <facility-modal
      :visible="facilityModalVisible"
      :title="facilityModalTitle"
      :taxDevice="taxDeviceList"
      :model="taxDeviceStoreForm"
      @cancel="facilityModalVisible = false"
      @ok="facilityOK"/>

    <!-- 区块链同步信息 -->
    <block-modal
      :data="blockTax"
      :visible="blockModalVisible"
      @cancel="closeBlockModal"
      @ok="closeBlockModal"
    />
  </div>
</template>

<style lang="scss" scoped>
  .tax-device-top{
    margin-bottom: 20px;
  }

  .icon-tax-disc {
    // display: flex;
    // justify-content: space-between;
    // align-items: center;

    .tax-num-icon{
      width: 40px;
      height: 20px;
      vertical-align: -5px;
      // flex: 0 0 40px;
    }
  }
</style>

<script>
import {
  fetchTaxDevice,
  delfetchTaxDevice,
  createBlockDisc,
  syncBlockDisc,
  disableBlockDisc,
  enableBlockDisc
} from '@/services/device-project/tax-device'
import facilityModal from './facility-modal'
import BlockModal from './block-modal'
import { mixinFetch } from '@/views/mixins/mixin-fetch'

const facility = [
  { name: '金税盘', value: 1 },
  { name: '税控盘', value: 2 }
]

const taxDevice = [
  { name: '航天金税盘', value: 1 },
  { name: '百旺税控盘', value: 2 }
]

export default {
  name: 'TaxDevice',
  mixins: [ mixinFetch({ dataKeys: {total: 'record_count'} }) ],
  components: { facilityModal, BlockModal },
  data() {
    return {
      loading: false,
      // 设备列表
      facilityList: [...facility],
      // 查询数据
      searchForm: {
        provider: '',
        type: '',
        number: ''
      },
      facilityModalTitle: '',
      facilityModalVisible: false,
      taxDeviceList: [...taxDevice],
      taxDeviceStoreForm: null,
      blockModalVisible: false,
      blockTax: {}
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    // 税盘类型
    typeFormat(row, column) {
      // 1|航天金税盘; 2|百望税控盘; 3|区块链盘
      const type = row[column.property]
      switch (type) {
        case 1:
          return '航天金税盘'
        case 2:
          return '百望税控盘'
        case 3:
          return '区块链电子发票'
        default:
          return '--'
      }
    },
    addFacility() {
      this.facilityModalVisible = true
      this.facilityModalTitle = '新增开票设备'
      this.taxDeviceStoreForm = null
    },
    editFacility(record) {
      this.taxDeviceStoreForm = record
      this.facilityModalTitle = '修改开票设备'
      this.facilityModalVisible = true
    },
    delFacility(record) {
      const params = { id: record.id }
      console.log('Del', params)

      this.$confirm('删除税盘会将门店中的税盘同步删除，是否确认删除？').then(() => {
        this._request(delfetchTaxDevice)(params)
          .then(() => {
            this._reload()
          })
      })
    },
    facilityOK() {
      this.facilityModalVisible = false
      this._reload()
    },
    fetchData(pageIndex) {
      const params = { ...this.searchForm, page: pageIndex || this.page, page_size: this.page_size }
      this._fetchData(fetchTaxDevice)(params)
    },
    // 列表查询
    onSearch(formName) {
      this.fetchData(formName)
    },
    // 查询重置
    resetFrom(formName) {
      this.$refs[formName].resetFields()
    },

    // 绑定区块链税盘
    bindBlockDisc() {
      this._dispatch('business/getClientInfo').then(res => {
        this._request(createBlockDisc)({
          client_id: res.id
        }).then(() => {
          this.$alert('添加区块链虚拟盘成功，您可以开具区块链电子发票了！！！')
          this._reload()
        })
      })
    },

    // 同步区块链税盘
    syncDisc(id) {
      this._request(syncBlockDisc)({ id }).then(res => {
        this.blockTax = res
        this.blockModalVisible = true
        this._reload()
      })
    },

    // 停用区块链税盘
    disableDisc(id) {
      this._request(disableBlockDisc)({ id }).then(() => {
        this.$message.success('停用成功')
        this._reload()
      })
    },

    // 启用区块链税盘
    enableDisc(id) {
      this._request(enableBlockDisc)({ id }).then(() => {
        this.$message.success('启用成功')
        this._reload()
      })
    },

    closeBlockModal() {
      this.blockModalVisible = false
    }
  }
}
</script>
