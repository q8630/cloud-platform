<template>
  <el-dialog class="modal-goods-list" width="800px" title="选择商品" :visible="visible" :append-to-body="true" @close="handleCancel">
    <el-input v-model="searchForm.firm_goods_name" placeholder="输入商品名称进行搜索" @keyup.enter.native="handleSearch">
      <el-button slot="append" @click="handleSearch" :loading="loading">搜 索</el-button>
    </el-input>

    <el-table
      ref="table"
      :data="list"
      v-loading="loading"
      @selection-change="handleSelectionChange"
      @row-click="handleRowClick"
    >
      <el-table-column type="selection" width="46" />
      <!-- <el-table-column type="index" label="#" width="46" /> -->
      <el-table-column prop="firm_goods_no" label="企业商品编码" min-width="140" />
      <el-table-column prop="firm_goods_name" label="商品名称" min-width="160" />
      <el-table-column prop="models" label="规格" />
      <el-table-column prop="unit" label="单位" />
      <el-table-column prop="per_price" label="单价" />
      <el-table-column prop="tax_rate" label="税率" />
      <el-table-column label="操作" width="80">
        <template #default="{ row }">
          <el-button type="text" @click.stop="handleSelect(row)">选中</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      v-if="totalPage > 1"
      @current-change="handleCurrentChange"
      :current-page="page"
      :page-size="page_size"
      layout="total, prev, pager, next"
      :total="total" />

    <div slot="footer">
      <el-button @click="handleCancel">取 消</el-button>
      <el-button type="primary" @click="handleOk">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { getProjectList } from '@/services/device-project/project'

export default {
  name: 'GoodsListModal',
  props: {
    visible: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
      loading: false,
      searchForm: {
        firm_goods_name: ''
      },
      list: [],
      total: 0,
      page: 1,
      page_size: 10,
      multipleSelection: []
    }
  },
  computed: {
    totalPage() {
      return Math.floor((this.total + this.page_size - 1) / this.page_size)
    }
  },
  watch: {
    visible(newVal) {
      console.log('watch.visible', newVal)
      // 隐藏弹窗时，把列表选中数据重置
      if (newVal === false) {
        this.multipleSelection = []
        this.$refs['table'].clearSelection()
      }
    },
    page(newVal) {
      this.fetchData(newVal)
    },
  },
  created() {
    this.fetchData(1)
  },
  methods: {
    handleSearch() {
      this.fetchData(1)
    },
    handleCurrentChange(value) {
      this.page = value
    },
    fetchData(pageIndex) {
      const params = { ...this.searchForm, page: pageIndex || this.page, page_size: this.page_size }

      this.loading = true

      getProjectList(params)
        .then(res => {
          const { list = [], record_count: total = 0, page = 1 } = res || {}
          // 这里把 name 设置为 firm_goods_name 的值，方便外面使用
          this.list = list.map(item => ({ ...item, name: item.firm_goods_name }))
          this.total = +total
          this.page = +page
        })
        .finally(() => {
          this.loading = false
        })
    },
    handleRowClick(row) {
      const selected = this.multipleSelection.find(selection => selection.id === row.id)
      this.$refs.table.toggleRowSelection(row, !selected)
    },
    handleSelectionChange(value) {
      this.multipleSelection = value
    },
    handleSelect(record) {
      this.$emit('ok', [record])
    },
    handleCancel() {
      this.$emit('cancel')
    },
    handleOk() {
      this.$emit('ok', this.multipleSelection)
    }
  }
}
</script>

<style lang="scss" scoped>
  .el-input {
    width: 380px;
    margin-bottom: 30px;
  }

  /deep/ .el-table__body .el-table__row {
    cursor: pointer;
  }
</style>
