<template>
  <div class="page-content">
    <div class="toolbar">
      <el-button plain type="primary" icon="el-icon-plus" @click="add">新增商品编码</el-button>
      <span class="tip">
        默认开票项目: {{ default_project ? default_project.firm_goods_name : '未设置（请在修改编码中设置）' }}
      </span>
    </div>

    <el-form ref="form" :model="searchForm" inline class="page-search-form">
      <el-form-item label="商品编码" prop="no">
        <el-input v-model="searchForm.code" placeholder="请输入" />
      </el-form-item>

      <el-form-item label="商品名称" prop="name">
        <el-input v-model="searchForm.name" placeholder="请输入" />
      </el-form-item>

      <el-form-item label="税率" prop="rate">
        <el-select v-model="searchForm.rate">
          <el-option label="全部" value=""></el-option>
          <el-option v-for="item in tax_rate_list" :key="item.id" :label="item.tax_rate" :value="item.tax_rate"></el-option>
        </el-select>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="onSearch" :loading="loading" icon="el-icon-search">查询</el-button>
        <el-button @click="resetForm">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table :data="list" v-loading="loading">
      <el-table-column type="index" label="序号" width="50" />
      <el-table-column prop="tax_code" label="税收商品编码" width="160" />
      <el-table-column prop="name" label="税收商品名称" min-width="120" />
      <el-table-column prop="firm_goods_no" label="企业商品编号" width="160" />
      <el-table-column prop="firm_goods_name" label="企业商品名称" min-width="120" />
      <el-table-column prop="models" label="规格型号" width="80" />
      <el-table-column prop="unit" label="计量单位" width="80" />
      <el-table-column prop="per_price" label="单价" :formatter="formatPrice" width="80" />
      <el-table-column prop="tax_rate" label="税率" width="80" />
      <el-table-column prop="vat_special_manager" label="增值税特殊管理" width="120" />
      <el-table-column label="操作" width="120" fixed="right">
        <template #default="{ row }">
          <el-button type="text" @click="edit(row)">修改</el-button>
          <el-button type="text" @click="deleteRow(row)">删除</el-button>
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

    <edit-modal
      :visible="visible"
      @cancel="closeModal"
      :data="editData"
      @refreshData="refreshData"
    />
  </div>
</template>

<script>
import EditModal from './edit-modal.vue'
import { mapGetters } from 'vuex'
import { deleteProject, getProjectList } from '@/services/device-project/project'
import { mixinFetch } from '@/views/mixins/mixin-fetch'

export default {
  name: 'Project',

  components: {
    EditModal
  },
  mixins: [ mixinFetch({
    dataKeys: { total: 'record_count' }
  }) ],

  data() {
    return {
      loading: false,
      searchForm: {
        name: '',
        rate: '',
        code: ''
      },
      // 新增编辑弹窗
      visible: false,
      editData: {}
    }
  },

  computed: {
    ...mapGetters([
      'tax_rate_list', 'default_project'
    ])
  },

  created() {
    this.onSearch()
    this.$store.dispatch('business/getTaxRateList')
    this.$store.dispatch('business/getDefaultProject')
  },

  methods: {
    onSearch() {
      const { name, rate, code } = this.searchForm
      this._fetchData(getProjectList)({
        firm_goods_no: code,
        firm_goods_name: name,
        tax_rate: rate
      })
    },

    refreshData() {
      this._reload()
      // 刷新默认开票项
      this._dispatch('business/getDefaultProject')
    },

    // 单价
    formatPrice(row) {
      return row.per_price && row.per_price.toFixed(2)
    },

    resetForm() {
      this.$refs.form.resetFields()
    },

    add() {
      this.editData = {}
      this.visible = true
    },

    closeModal() {
      this.visible = false
    },

    edit(data) {
      this.editData = data
      this.visible = true
    },

    deleteRow(data) {
      this.$confirm('确认删除该记录？').then(() => {
        this._request(deleteProject)({ id: data.id }).then(() => {
          this.$message.success('删除成功')
          this._reload()
        })
      })
    }
  }
}
</script>

<style lang="scss" scoped>
  .toolbar {
    margin-bottom: 10px;

    .tip {
      margin-left: 10px;
      font-size: 14px;
    }
  }
</style>
