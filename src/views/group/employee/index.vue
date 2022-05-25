<template>
  <div class="page-content">
    <div class="toolbar">
      <el-button plain type="primary" icon="el-icon-plus" @click="handleAdd">新增员工</el-button>
    </div>

    <el-form :model="searchForm" :inline="true" class="page-search-form">
      <el-form-item label="员工姓名">
        <el-input v-model="searchForm.nickname" placeholder="请输入员工姓名" />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleSearch" :loading="loading">查询</el-button>
      </el-form-item>
    </el-form>

    <el-table :data="list" v-loading="loading">
      <el-table-column type="index" label="序号" width="50" />
      <el-table-column prop="nickname" label="员工姓名" min-width="120" />
      <el-table-column prop="user_name" label="登录帐号" min-width="120" />
      <el-table-column prop="store_names" label="所属门店" min-width="200" />
      <el-table-column prop="mobile" label="手机号码" width="120" />
      <el-table-column prop="state" label="帐号状态" width="120">
        <template #default="{ row }">
          {{ +row.state === 0 ? '正常' : '已禁用' }}
        </template>
      </el-table-column>
      <el-table-column fixed="right" label="操作" width="180">
        <template #default="{ row }">
          <el-button type="text" @click="handleEdit(row)">修改</el-button>
          <el-button type="text" @click="handleDelete(row)">删除</el-button>
          <el-button v-if="+row.is_bind === 1" type="text" @click="handleUnbindWechat(row)">解绑微信</el-button>
          <el-button v-if="+row.is_bind === 0" type="text" @click="handleBindWechat(row)">绑定微信</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      @size-change="_handleSizeChange"
      @current-change="_handlePageChange"
      :current-page="page"
      :page-size="page_size"
      :total="total" />

    <employee-modal
      :title="dialogTitle"
      :visible="dialogVisible"
      :model="employeeForm"
      @cancel="dialogVisible = false"
      @ok="handleOk" />

    <wxcode-modal :employee-id="selectedRow.employee_id" :visible="wxcodeDialogVisible" @close="hideWechatCodeDialog" />
  </div>
</template>

<script>
import employeeModal from './employee-modal'
import wxcodeModal from '@/components/wxcode-modal'
import { unbindWechat } from '@/services/user'
import { fetchEmployees, deleteEmployee } from '@/services/group/employee'
import mixinFetch from '@/views/mixins/mixin-fetch'

export default {
  name: 'Employee',
  components: { employeeModal, wxcodeModal },
  mixins: [ mixinFetch ],
  data() {
    return {
      searchForm: {
        nickname: ''
      },
      multipleSelection: [],
      dialogTitle: '',
      dialogVisible: false,
      employeeForm: null,
      wxcodeDialogVisible: false,
      selectedRow: {},
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    handleSearch() {
      this.fetchData(1)
    },
    handleAdd() {
      this.dialogTitle = '新增员工'
      this.dialogVisible = true
      this.employeeForm = null
    },
    handleEdit(record) {
      this.dialogTitle = '修改员工'
      this.dialogVisible = true
      this.employeeForm = record
    },
    handleDelete(record) {
      this.$confirm('该用户删除之后将无法登录，确定要删除？')
        .then(() => this._request(deleteEmployee)(record.employee_id))
        .then(this.handleSuccess)
    },
    handleOk() {
      this.dialogVisible = false
      this.handleSuccess()
    },
    handleSuccess() {
      this.$message.success('操作成功')
      this._reload()
    },
    fetchData(pageIndex) {
      const params = { ...this.searchForm, page: pageIndex || this.page }
      this._fetchData(fetchEmployees)(params)
    },
    hideWechatCodeDialog() {
      this.wxcodeDialogVisible = false
    },
    /**
     * 绑定微信，调用接口生成小程序二维码，在B端小程序中绑定
     */
    handleBindWechat(record) {
      this.selectedRow = record
      this.wxcodeDialogVisible = true
    },
    handleUnbindWechat(record) {
      this.$confirm('解绑微信后，员工将无法扫码登录，确定要解绑？')
        .then(() => this._request(unbindWechat)(record.employee_id))
        .then(this.handleSuccess)
    }
  }
}
</script>
