<template>
  <div class="page-content">
    <div class="toolbar">
      <el-button plain type="primary" icon="el-icon-plus" @click="handleAdd">增加权限组</el-button>
    </div>

    <el-form :model="searchForm" :inline="true" class="page-search-form">
      <el-form-item label="权限组名称">
        <el-input v-model="searchForm.group_name" placeholder="请输入权限组名称" />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleSearch" :loading="loading">查询</el-button>
      </el-form-item>
    </el-form>

    <el-table :data="list" v-loading="loading">
      <el-table-column type="index" label="序号" width="55" />
      <el-table-column prop="group_name" label="权限组名称" width="200" />
      <el-table-column prop="created_at" label="创建时间" dateFormatter width="160" />
      <el-table-column prop="desc" label="权限组描述" min-width="300" />
      <el-table-column prop="employee_count" label="成员数量" width="100" />
      <el-table-column fixed="right" label="操作" width="140">
        <template #default="{ row }">
          <el-button type="text" @click="handleEdit(row)">修改</el-button>
          <!-- level 非零的为默认、初始化数据，不能删除 -->
          <el-button v-if="row.level === 0" type="text" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      @size-change="_handleSizeChange"
      @current-change="_handlePageChange"
      :current-page="page"
      :page-size="page_size"
      :total="total" />
  </div>
</template>

<script>
import { fetchRules, deleteRule } from '@/services/group/authority'
import mixinFetch from '@/views/mixins/mixin-fetch'

export default {
  name: 'Authority',
  mixins: [ mixinFetch ],
  data() {
    return {
      searchForm: {
        group_name: ''
      },
      multipleSelection: [],
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
      this.$router.push({ path: '/group/authority/add-rule' })
    },
    handleEdit(record) {
      const path = '/group/authority/edit-rule'
      // 删除当前可能已打开的 tab 页（它会自动删除关联的 keepAlive 数据）
      // TODO: 是否提示用户当前已打开了编辑页面？因为这里是直接覆盖了已打开的页面
      this.$store.dispatch('app/removeTab', path)
      // 在 nextTick 才跳转，避免没能正确渲染
      this.$nextTick(() => this.$router.push({ path, query: record }))
    },
    handleDelete(record) {
      this.$confirm('是否确定删除权限组？')
        .then(() => this._request(deleteRule)(record.id))
        .then(this.handleSuccess)
    },
    handleOk() {
      this.handleSuccess()
    },
    handleSuccess() {
      this.$message.success('操作成功')
      this._reload()
    },
    fetchData(pageIndex) {
      const params = { ...this.searchForm, page: pageIndex || this.page }
      this._fetchData(fetchRules)(params)
    }
  }
}
</script>
