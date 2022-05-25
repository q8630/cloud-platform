<template>
  <el-tabs class="page-content tabs-rule" v-model="activeName" @tab-click="handleClickTab">
    <el-tab-pane name="rule" label="权限组描述" v-loading="loading">
      <el-form ref="ruleForm" :rules="ruleFormRules" :model="ruleForm" label-width="100px">
        <el-form-item prop="group_name" label="权限组名称">
          <el-input clearable v-model="ruleForm.group_name" placeholder="请输入权限组名称" :disabled="!canEdit" />
        </el-form-item>
        <el-form-item prop="desc" label="权限组描述">
          <el-input
            clearable
            type="textarea"
            v-model="ruleForm.desc"
            placeholder="请输入权限组描述"
            :autosize="{ minRows: 10, maxRows: 12 }"
            :disabled="!canEdit" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleRuleFormSubmit" :loading="loading" :disabled="!canEdit">确 定</el-button>
        </el-form-item>
      </el-form>
    </el-tab-pane>

    <el-tab-pane name="authority" label="权限设置" :disabled="!hasGroupID" v-loading="loading">
      <el-form ref="authorityForm" label-width="100px">
        <el-form-item label="权限组名称">
          <el-input disabled :value="ruleForm.group_name" />
        </el-form-item>
        <el-form-item label="权限组描述">
          <el-input disabled type="textarea" :value="ruleForm.desc" :autosize="{ minRows: 3 }" />
        </el-form-item>
        <template v-for="section in authorityList">
          <!-- 权限分类 -->
          <el-form-item class="form-item-authority" :label="section.source_desc" :key="section.source">
            <template v-for="authority in section.list">
              <!-- 权限大项，checkbox 用 indeterminate 实现半选、全选 -->
              <el-checkbox
                :indeterminate="authorityIndeterminateModel[authority.id]"
                v-model="authorityModel[authority.id]"
                :disabled="!canEdit"
                :key="authority.id"
                :label="authority.id"
                @change="handleCheckAllChange"
              >
                {{ authority.name }}
              </el-checkbox>

              <!-- 权限子项 -->
              <div :key="'sub_items_' + authority.id" class="sub-items">
                <el-checkbox-group
                  v-if="authority.sub_list && authority.sub_list.length"
                  v-model="subAuthorityModel[authority.id]"
                  @change="handleCheckChange($event, authority.id)"
                >
                  <el-checkbox
                    v-for="sub in authority.sub_list"
                    :disabled="!canEdit"
                    :key="sub.id"
                    :label="sub.id"
                    :name="`${authority.id}_${sub.id}`"
                  >
                    {{ sub.name }}
                  </el-checkbox>
                </el-checkbox-group>
              </div>
            </template>
          </el-form-item>
        </template>
        <el-form-item>
          <el-button type="primary" @click="handleAuthorityFormSubmit" :loading="loading" :disabled="!canEdit">确 定</el-button>
        </el-form-item>
      </el-form>
    </el-tab-pane>

    <el-tab-pane name="member" label="权限组名单" :disabled="!hasGroupID" v-loading="loading">
      <el-form ref="memberForm" :model="memberForm" label-width="100px">
        <el-form-item label="权限组名称">
          <el-input disabled :value="ruleForm.group_name" />
        </el-form-item>
        <el-form-item label="权限组描述">
          <el-input disabled type="textarea" :value="ruleForm.desc" :autosize="{ minRows: 3 }" />
        </el-form-item>
        <el-form-item label="员工选择">
          <el-transfer
            :titles="['员工列表', '已选员工']"
            v-model="memberForm.employee_list"
            :data="memberList" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleMemberFormSubmit" :loading="loading">确 定</el-button>
        </el-form-item>
      </el-form>
    </el-tab-pane>
  </el-tabs>
</template>

<script>
import { Transfer } from 'element-ui'
import {
  addOrUpdateRule,
  fetchAuthorities,
  fetchMembers,
  updateAuthorities,
  updateMembers
} from '@/services/group/authority'
import { validateStringLength as validator } from '@/utils'

const tabNames = ['rule', 'authority', 'member']
const ruleFormRules = {
  group_name: [
    { required: true, max: 20, validator, message: '必填，任意字符，长度不超过20位（汉字占2位）' },
  ],
  desc: [
    { required: true, max: 200, validator, message: '必填，任意字符，长度不超过200位（汉字占2位）' },
  ]
}

export default {
  name: 'AddRule',
  components: { ElTransfer: Transfer },
  data() {
    const { query } = this.$route

    return {
      activeName: tabNames[0],
      loading: false,
      ruleForm: {
        group_id: query.id,
        group_name: query.group_name,
        desc: query.desc
      },
      ruleFormRules: { ...ruleFormRules },
      authorityList: [], // 权限列表数据，由接口返回
      authorityMap: {}, // 权限项 map 数据，便于后面根据父权限ID取值
      authorityModel: {}, // 权限项（父）checkbox model
      authorityIndeterminateModel: {}, // 权限项（父）checkbox 的 indeterminate 状态值 model
      subAuthorityModel: {}, // 权限项（子）checkbox model
      memberForm: {
        employee_list: [],
      },
      memberList: [],
    }
  },
  computed: {
    isAdd() {
      return !this.$route.query.id
    },
    canEdit() {
      const { query } = this.$route
      // 编辑模式时，仅 level === 0 的数据能编辑（除添加员工外）
      // query 参数，在页面刷新时，会从 location.search 中转译过来，数据类型为 String，这里需要兼容下
      return this.isAdd || +query.level === 0
    },
    hasGroupID() {
      return this.ruleForm.group_id
    }
  },
  methods: {
    gotoNext() {
      let next

      if (this.activeName === tabNames[0]) {
        next = {name: tabNames[1]}
      } else if (this.activeName === tabNames[1]) {
        next = {name: tabNames[2]}
      }

      if (next) {
        this.activeName = next.name
        this.handleClickTab(next)
      }
    },
    handleClickTab(tab) {
      if (tab.name === tabNames[1] && (!this.authorityList || !this.authorityList.length)) {
        this.fetchAuthorities()
      } else if (tab.name === tabNames[2] && (!this.memberList || !this.memberList.length)) {
        this.fetchMembers()
      }
    },
    handleRuleFormSubmit() {
      this.$refs['ruleForm'].validate(valid => {
        if (valid) {
          this.loading = true
          addOrUpdateRule(this.ruleForm)
            .then(res => {
              if (res && res.group_id) {
                this.ruleForm.group_id = res.group_id
              }

              this.gotoNext()
              this.$message.success('操作成功')
            })
            .finally(() => {
              this.loading = false
            })
        }
      })
    },
    handleAuthorityFormSubmit() {
      let authorityIDs = []

      Object.keys(this.subAuthorityModel).forEach(pid => {
        // 有选中的子项，获取其父项ID，及其选中的子项
        if (this.subAuthorityModel[pid].length) {
          authorityIDs.push(pid)
          authorityIDs = authorityIDs.concat(this.subAuthorityModel[pid])
        } else if (this.authorityModel[pid]) {
          // 不存在子项的，如果父项选中即添加到 authorityIDs
          authorityIDs.push(pid)
        }
      })

      const params = {
        group_id: this.ruleForm.group_id,
        permission_list: authorityIDs.map(id => ({ permission_id: id, selected: 1 }))
      }

      this.loading = true

      updateAuthorities(params)
        .then(() => {
          this.gotoNext()
          this.$message.success('操作成功')
        })
        .finally(() => {
          this.loading = false
        })
    },
    /**
     * 根据权限列表初始化各 model 数据
     */
    initAuthorityModel(authorities) {
      const authorityMap = {}
      const authorityModel = {}
      const authorityIndeterminateModel = {}
      const subAuthorityModel = {}

      // 权限分类
      authorities.forEach(section => {
        if (section.list && section.list.length) {
          // 权限列表
          section.list.forEach(authority => {
            const authorityID = authority.id
            // 初始化数据
            authorityMap[authorityID] = []
            authorityModel[authorityID] = !!authority.selected
            authorityIndeterminateModel[authorityID] = false
            subAuthorityModel[authorityID] = []

            // 如果存在子项，根据子项设置父项是否选中, 以及它的 indeterminate 状态
            if (authority.sub_list && authority.sub_list.length) {
              const subList = authority.sub_list
              const selectedAll = subList.every(sub => sub.selected === 1)
              authorityModel[authorityID] = selectedAll

              const selected = subList.filter(sub => sub.selected === 1)
              const selectedCount = selected.length
              authorityIndeterminateModel[authorityID] = selectedCount > 0 && selectedCount < subList.length

              authorityMap[authorityID] = subList.map(sub => sub.id)
              subAuthorityModel[authorityID] = selected.map(sub => sub.id)
            }
          })
        }
      })

      // console.log('authorityMap', authorityMap)
      // console.log('authorityModel', authorityModel)
      // console.log('authorityIndeterminateModel', authorityIndeterminateModel)
      // console.log('subAuthorityModel', subAuthorityModel)

      this.authorityMap = authorityMap
      this.authorityModel = authorityModel
      this.authorityIndeterminateModel = authorityIndeterminateModel
      this.subAuthorityModel = subAuthorityModel
    },
    fetchAuthorities() {
      this.loading = true
      fetchAuthorities(this.ruleForm.group_id)
        .then(res => {
          const list = res.list || []
          this.authorityList = list
          this.initAuthorityModel(list)
        })
        .finally(() => {
          this.loading = false
        })
    },
    fetchMembers() {
      this.loading = true
      fetchMembers(this.ruleForm.group_id)
        .then(res => {
          const list = res.list || []

          // 为方便后面 transfer 组件使用，这里把数据处理下
          this.memberList = list.map(m => ({
            key: m.id,
            label: m.nickname,
            disabled: !!m.disable
          }))

          // 把已选中的数据设值到 form，用于组件 model 绑定
          this.memberForm.employee_list = list.filter(item => item.selected === 1).map(item => item.id)
        })
        .finally(() => {
          this.loading = false
        })
    },
    handleCheckAllChange(checked, event) {
      const id = event.target.value
      this.subAuthorityModel[id] = checked ? this.authorityMap[id] : []
      this.authorityIndeterminateModel[id] = false
    },
    handleCheckChange(values, pid) {
      const checkedCount = values.length
      this.authorityModel[pid] = checkedCount === this.authorityMap[pid].length
      this.authorityIndeterminateModel[pid] = checkedCount > 0 && checkedCount < this.authorityMap[pid].length
    },
    handleMemberFormSubmit() {
      const params = {
        group_id: this.ruleForm.group_id,
        employee_list: this.memberForm.employee_list.map(id => ({ employee_id: id, selected: 1 }))
      }

      this.loading = true

      updateMembers(params)
        .then(() => {
          this.$message.success('操作成功')
        })
        .finally(() => {
          this.loading = false
        })
    }
  }
}
</script>

<style lang="scss" scoped>
@import "~@/styles/variables.scss";

.tabs-rule {
  /deep/ .el-tabs__content {
    padding: $padding-spacing 0;
  }

  /deep/ .el-form-item__content {
    .el-input {
      width: 340px;
    }
    .el-textarea {
      width: 500px;
    }
  }

  /deep/ .form-item-authority {
    .el-checkbox .el-checkbox__label {
      color: #606266;
      font-weight: 600;
    }

    .el-checkbox.is-disabled .el-checkbox__label {
      color: #C8C8C8;
    }

    .sub-items {
      padding-left: 24px;
      .el-checkbox .el-checkbox__label {
        font-weight: 400;
      }
    }
  }

  /deep/ .form-item-authority .el-form-item__content {
    max-width: 500px;
  }
}
</style>
