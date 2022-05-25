<!-- 税收类目树、查询表组件
 属性：visible
 事件：cancel() 关闭弹窗
      select(data) 选中表格数据，参数: data 当前行数据
 -->
<template>
  <el-dialog class="tree-modal" width="1100px" :visible="visible" @close="$emit('cancel')">
    <div slot="title">
      <el-input v-model="name" placeholder="请输入搜索名称">
        <el-button slot="append" @click="onSearch(name)" :loading="loading" icon="el-icon-search">搜索</el-button>
      </el-input>
    </div>

    <el-row>
      <el-col class="tree-wrap" :span="6">
        <el-tree :data="taxCateData" @node-click="onNodeClick" />
      </el-col>

      <el-col class="table-wrap" :span="18">
        <el-table :data="list" v-loading="loading">
          <el-table-column prop="spbm" label="税收分类编码" width="100" />
          <el-table-column prop="spmc" label="税收分类名称" />
          <el-table-column prop="zzssl" label="增值税税率" width="80" />
          <el-table-column prop="zzstsgl" label="增值税特殊管理" width="104" />
          <el-table-column prop="zzszcyj" label="增值税政策依据" width="110" />
          <el-table-column prop="gjz" label="关键字" />
          <el-table-column label="操作" width="60" fixed="right">
            <template #default="{ row }">
              <el-button type="text" @click="select(row)">选中</el-button>
            </template>
          </el-table-column>
        </el-table>

      </el-col>
    </el-row>
  </el-dialog>
</template>

<script>
import { Tree } from 'element-ui'
import { searchProject } from '@/services/device-project/project'
import { mapGetters } from 'vuex'
import taxCateData from './tax-cate.json'

export default {
  name: 'EditModal',
  components: { ElTree: Tree },

  props: {
    visible: Boolean
  },

  data() {
    return {
      name: '',
      taxCateData,
      list: [],
      loading: false
    }
  },

  computed: {
    ...mapGetters([
      'tax_rate_list'
    ])
  },

  methods: {
    onSearch(name) {
      if (!name || name === '') return
      this.loading = true
      searchProject({
        spmc: name
      }).then(res => {
        this.list = res || []
        this.loading = false
      })
    },

    onNodeClick(data, node) {
      // 叶子节点
      if (node.isLeaf) {
        this.onSearch(data.label)
      }
    },

    select(data) {
      this.$emit('cancel')
      this.$emit('select', data)
    }
  }
}
</script>

<style lang="scss" scoped>
  .tree-modal {
    :global(.el-dialog) {
      height: 700px;
    }

    :global(.el-dialog__body) {
      padding: 10px 20px;
    }

    :global(.el-input-group) {
      width: 400px;
    }

    .tree-wrap {
      height: 600px;
      background: rgb(243, 247, 250);
      padding: 10px 5px;
      overflow-y: scroll;

      :global(.el-tree) {
        background: rgb(243, 247, 250);
      }
    }

    .table-wrap {
      padding-left: 20px;
      max-height: 600px;
      overflow-y: scroll;
    }
  }
</style>
