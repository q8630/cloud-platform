<template>
  <el-dialog class="modal-client-store" width="520px" :title="title" :visible="visible" @close="handleCancel">
    <el-form ref="form" :model="formData" :rules="rules" v-loading="loading" label-width="96px">
      <el-form-item prop="name" label="门店名称">
        <el-input clearable v-model="formData.name" placeholder="请输入门店名称"/>
      </el-form-item>

      <el-form-item prop="sub_no" label="门店编号">
        <el-input clearable v-model="formData.sub_no" placeholder="请输入门店编号"/>
      </el-form-item>

      <el-form-item prop="phone" label="门店电话">
        <el-input clearable v-model="formData.phone" placeholder="用于收票方有事联系您"/>
      </el-form-item>

      <el-form-item prop="tax_num_id_arr" label="税盘号">
        <el-select ref="select" clearable multiple collapse-tags v-model="formData.tax_num_id_arr" placeholder="请选择税盘号">
          <el-option
            v-for="tax in tax_list"
            :key="tax.id"
            :label="tax.tax_num"
            :value="+tax.id" />
        </el-select>
      </el-form-item>
      <el-form-item prop="drawer" label="开票人">
        <el-input clearable v-model="formData.drawer" placeholder="请输入开票人真实姓名"/>
      </el-form-item>
      <el-form-item prop="reviewer" label="复核人">
        <el-input clearable v-model="formData.reviewer" placeholder="请输入复核人"/>
      </el-form-item>
      <el-form-item prop="payee" label="收款人">
        <el-input clearable v-model="formData.payee" placeholder="请输入收款人"/>
      </el-form-item>
      <el-form-item prop="region" label="所属省份">
        <el-cascader
          ref="cascader"
          v-model="formData.region"
          :options="areaJson"
          placeholder="请输入所属省份" />
      </el-form-item>
      <el-form-item prop="address" label="详细地址">
        <el-input clearable v-model="formData.address" placeholder="请输入详细地址"/>
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
import { validateStringLength as validator, regionCodeToArray } from '@/utils'
import areaJson from '@/utils/area-code.json'
import { addOrUpdateClientStore } from '@/services/group/client-store'

const defaultFormData = {
  name: '',
  sub_no: '',
  phone: '',
  tax_num_id_arr: [],
  drawer: '',
  reviewer: '',
  payee: '',
  region: [],
  address: ''
}

const formRules = {
  name: {
    required: true, max: 100, validator, message: '必填，长度不能超过100位（汉字占2位）'
  },
  sub_no: {
    required: true, pattern: /^[0-9a-zA-Z]{1,30}$/, message: '必填，仅支持数字、字母，长度不超过30位'
  },
  phone: {
    required: true, pattern: /^[0-9-]{1,20}$/, message: '请输入1-20位的门店电话'
  },
  tax_num_id_arr: {
    required: true, type: 'array', message: '必填，请选择已经添加的税盘设备'
  },
  drawer: {
    required: true, max: 10, validator, message: '必填，长度不超过10位（汉字占2位）'
  },
  reviewer: {
    max: 10, validator, message: '长度不超过10位（汉字占2位）'
  },
  payee: {
    max: 10, validator, message: '长度不超过10位（汉字占2位）'
  },
  address: {
    max: 200, validator, message: '长度不超过200位（汉字占2位）'
  }
}

export default {
  name: 'ClientStoreModal',
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
      areaJson,
      loading: false,
      formData: { ...defaultFormData },
      rules: { ...formRules },
    }
  },
  computed: {
    ...mapGetters([
      'user_info',
      'user_store_list',
      'tax_list',
      'selected_client_store'
    ]),
    isEdit() {
      return this.model && this.model.client_store_id
    }
  },
  watch: {
    model(newVal) {
      let formData

      if (newVal) {
        formData = {
          ...defaultFormData,
          ...newVal,
          // 设置已选中的税盘号
          tax_num_id_arr: (newVal.tax_num_list || []).map(item => +item.tax_num_id),
          // 根据 region_code 组织省市区三级联动下拉框所需的 values
          region: regionCodeToArray(newVal.region_code)
        }
      } else {
        formData = this.getDefaultFormData()
      }

      this.formData = formData
      this.$refs.form && this.$refs.form.resetFields()
    },
  },
  created() {
    // 初始化默认数据
    this.$store.dispatch('user/getUserInfo')
      .then(res => {
        this.formData.drawer = res.nickname
      })

    this.$store.dispatch('business/getTaxboxs')
      .then(() => {
        this.formData.tax_num_id_arr = this.getDefaultSelectedTax()
      })
  },
  methods: {
    getDefaultFormData() {
      return {
        ...defaultFormData,
        // 设置当前登录用户为开票人
        drawer: this.user_info.nickname,
        // 设置默认选中的税盘
        tax_num_id_arr: this.getDefaultSelectedTax()
      }
    },
    getDefaultSelectedTax() {
      // 仅当税盘数据只有一个时，才设置默认选中的值
      if (this.tax_list && this.tax_list.length === 1) {
        return this.tax_list.map(tax => +tax.id)
      }

      return []
    },
    resetFields() {
      // 仅新增时，重置表单数据
      if (!this.isEdit) {
        this.formData = this.getDefaultFormData()
        this.$refs.form.resetFields()
      }
    },
    handleSubmit() {
      this.$refs.form.validate(valid => {
        if (valid) {
          const checkedNode = this.$refs.cascader.getCheckedNodes()[0] || { pathLabels: [] }
          const params = {
            ...this.formData,
            province: checkedNode.pathLabels[0],
            city: checkedNode.pathLabels[1],
            region_code: this.formData.region[2]
          }

          this.loading = true

          addOrUpdateClientStore(params)
            .then(res => {
              // 更新数据到 store
              this.updateClientStore(res)
              // 重置表单
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
    },
    updateClientStore(res) {
      const $taxNumSelected = this.$refs.select.selected
      const taxNum = $taxNumSelected.map(component => component.currentLabel).join(',')
      const taxNumList = $taxNumSelected.map(
        component => ({ tax_num: component.currentLabel, tax_num_id: component.currentValue })
      )
      const { client_store_id: clientStoreID } = this.formData
      let storeList

      if (clientStoreID) {
        storeList = this.user_store_list.map(item => {
          if (item.client_store_id === clientStoreID) {
            return {
              ...this.formData,
              tax_num: taxNum,
              tax_num_list: taxNumList
            }
          }

          return item
        })

        // 如果修改了当前门店，更新数据到 selected_client_store
        if (this.selected_client_store.client_store_id === clientStoreID) {
          this.$store.dispatch('user/setSelectedClientStore', { ...this.selected_client_store, name: this.formData.name })
        }
      } else {
        storeList = this.user_store_list.concat({
          ...this.formData,
          client_store_id: res.id,
          tax_num: taxNum,
          tax_num_list: taxNumList,
          is_deleted: 0,
          state: 0
        })
      }

      this.$store.dispatch('user/setUserStores', storeList)
    }
  }
}
</script>
