<template>
  <el-dialog class="modal-employee" width="520px" :title="title" :visible="visible" @close="handleCancel">
    <el-form ref="form" :model="formData" :rules="formRules" v-loading="loading" label-width="96px">
      <el-form-item prop="nickname" label="员工名称">
        <el-input clearable v-model="formData.nickname" placeholder="请输入员工名称"/>
      </el-form-item>

      <el-form-item :prop="isAdd ? 'user_name' : ''" label="登录帐号">
        <el-input clearable v-model="formData.user_name" placeholder="8-20位数字、字母、符号任意组合" :disabled="!isAdd" />
      </el-form-item>

      <el-form-item prop="password" label="登录密码" :rules="validatePassword">
        <el-input
          clearable
          v-model="formData.password"
          :placeholder="isAdd ? '请输入密码' : '原密码不可见'"
        >
          <el-button v-if="!isAdd" slot="append" @click="handleInitPassword">初始化密码</el-button>
        </el-input>
      </el-form-item>

      <el-form-item prop="state" label="帐号状态">
        <el-radio-group v-model="formData.state">
          <el-radio :label="0">启用</el-radio>
          <el-radio :label="1">禁用</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="帐号权限">
        <div class="panel-auth-list">
          <el-card>
            <div slot="header" class="title">
              <span>可选门店</span>
            </div>
            <div>
              <el-checkbox-group v-model="formData.store_ids">
                <el-checkbox
                  v-for="store in store_list"
                  :key="store.store_id"
                  :label="store.store_id"
                  :disabled="store.disable === 1"
                >
                  {{store.store_name}}
                </el-checkbox>
              </el-checkbox-group>
            </div>
          </el-card>

          <el-card>
            <div slot="header" class="title">
              <span>权限组配置</span>
            </div>
            <div>
              <el-checkbox-group v-model="formData.group_ids">
                <el-checkbox
                  v-for="rule in rules"
                  :key="rule.id"
                  :label="rule.id"
                >
                  {{rule.group_name}}
                </el-checkbox>
              </el-checkbox-group>
            </div>
          </el-card>
        </div>
      </el-form-item>
    </el-form>

    <div slot="footer" class="dialog-footer">
      <el-button @click="handleCancel">取 消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="loading">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { mapGetters } from 'vuex'
import { validateStringLength as validator } from '@/utils'
import { fetchRules, addOrUpdateEmployee } from '@/services/group/employee'
import { REG_ACCOUNT, REG_PASS } from '@/utils/constants/regexp'

const defaultPassword = 'kp123456'
const defaultFormData = {
  nickname: '',
  user_name: '',
  password: defaultPassword,
  state: 0,
  store_ids: [],
  group_ids: []
}

const formRules = {
  nickname: [
    { required: true, max: 50, validator, message: '必填，任意字符，长度不超过50位（汉字占2位）' },
  ],
  user_name: [
    { required: true, pattern: REG_ACCOUNT, message: '8-20位数字、字母、符号任意组合均可' },
  ],
  passwordIsRequired: [
    { required: true, pattern: REG_PASS, message: '必填，8-18位数字、大小写字母、符号任意两种或两种以上组合' },
  ],
  password: [
    { pattern: REG_PASS, message: '8-18位数字、大小写字母、符号任意两种或两种以上组合' },
  ]
}

export default {
  name: 'EmployeeModal',
  props: {
    title: {
      type: String,
      required: true
    },
    visible: {
      type: Boolean,
      required: true
    },
    model: Object
  },
  data() {
    return {
      loading: false,
      rules: [],
      formData: { ...defaultFormData },
      formRules: { ...formRules },
    }
  },
  computed: {
    ...mapGetters(['store_list']),
    isAdd() {
      return !(this.model && this.model.employee_id)
    },
    validatePassword() {
      return this.isAdd ? formRules.passwordIsRequired : formRules.password
    }
  },
  watch: {
    model(newVal) {
      this.initFormData(newVal)
    }
  },
  created() {
    if (!this.store_list || !this.store_list.length) {
      this.$store.dispatch('business/getClientStores')
    }

    fetchRules().then(res => {
      this.rules = res
    })
  },
  methods: {
    handleInitPassword() {
      this.formData.password = defaultPassword
    },
    initFormData(model) {
      const formData = { ...defaultFormData, ...model }

      // 更新 form 表单数据
      if (model) {
        // 密码重设为空
        formData.password = ''

        // 门店IDs
        if (model.store_list && model.store_list.length) {
          formData.store_ids = model.store_list.map(store => store.store_id)
        }

        // 权限IDs
        if (model.group_list && model.group_list.length) {
          formData.group_ids = model.group_list.map(group => group.group_id)
        }
      }

      this.formData = formData
      this.$refs.form && this.$refs.form.resetFields()
    },
    resetFields() {
      // 仅新增时，重置表单数据
      if (this.isAdd) {
        this.formData = { ...defaultFormData }
        this.$refs.form.resetFields()
      }
    },
    handleSubmit() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          console.log('handleSubmit', this.formData)
          const formData = this.formData
          const params = {
            ...formData,
            store_ids: formData.store_ids.join(','),
            group_ids: formData.group_ids.join(',')
          }

          this.loading = true

          addOrUpdateEmployee(params)
            .then(() => {
              this.resetFields()
              this.$emit('ok')
            })
            .finally(() => {
              this.loading = false
            })
        }
      })
    },
    handleCancel() {
      this.$emit('cancel')
    }
  }
}
</script>

<style lang="scss" scoped>
.modal-employee {
  .panel-auth-list {
    width: 90%;
    border: 1px solid #DCDFE6;
    border-radius: 4px;
  }

  /deep/ .el-card {
    border: none;
    box-shadow: none;
  }
  /deep/ .el-card__header {
    padding-bottom: 0;
    border-bottom: none;
    .title {
      font-weight: 600;
      border-bottom: 1px solid #EBEEF5;
    }
  }
}
</style>
