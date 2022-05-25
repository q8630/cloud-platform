<template>
  <el-dialog width="520px" :title="title" :visible="visible" :before-close="handleClose">
    <el-form :model="facilityData" :rules="rules" v-loading="loading" ref="form" label-width="100px">
      <el-radio-group v-model="facilityData.tax_disk_type" prop="tax_disk_type" class='checkbox-margin-right' size="medium">
        <el-radio
            v-for="item in taxDevice"
            :key="item.value"
            :label="item.value"
            :value="item.value"
            border
        >
        {{ item.name }}
      </el-radio>
      </el-radio-group>
      <!--<el-form-item label="业务组织" prop="channel">-->
        <!--<el-select v-model="facilityData.channel">-->
          <!--<el-option v-for="item in channelList" :key="item.channel" :label="item.name" :value="item.channel" />-->
        <!--</el-select>-->
      <!--</el-form-item>-->
      <el-form-item label="开票产品" prop="channel">
        <el-select v-model="facilityData.channel">
          <el-option v-for="item in channelList" :key="item.channel" :label="item.name" :value="item.channel" />
        </el-select>
      </el-form-item>
      <el-form-item v-if="taxDiskType.taxDiskTypeShow" :label="taxDiskType.taxDiskTypeText" prop="tax_num">
        <el-input v-model="facilityData.tax_num" :placeholder="`请输入${taxDiskType.inputLeft}后面的12位数字`" class="input-width">
            <template slot="prepend">{{ taxDiskType.inputLeft }} -</template>
        </el-input>
      </el-form-item>
      <el-form-item v-if="taxDiskType.taxMachineShow" label="分机号" prop="tax_machine">
        <el-input v-model="facilityData.tax_machine" placeholder="请输入正确的分机号" class="input-width"></el-input>
      </el-form-item>
      <el-form-item label="开户银行" prop="bank_name">
        <el-input v-model="facilityData.bank_name" placeholder="请填写开户银行" class="input-width"></el-input>
      </el-form-item>
      <el-form-item label="银行账号" prop="bank_account">
        <el-input v-model="facilityData.bank_account" placeholder="请填写银行账号" class="input-width"></el-input>
      </el-form-item>
      <el-form-item label="电话" prop="phone">
        <el-input v-model="facilityData.phone" placeholder="请填写电话" class="input-width"></el-input>
      </el-form-item>
      <el-form-item label="详细地址" prop="address">
        <el-input v-model="facilityData.address" placeholder="请填写地址" class="input-width"></el-input>
      </el-form-item>
      <el-form-item label="可开票类型" prop="invoice_types">
        <el-checkbox-group v-model="facilityData.invoice_types" class="input-width">
          <el-checkbox
            v-for="item in invoiceTypes"
            :key="item.value"
            :label="item.value"
            >
            {{ item.name }}
          </el-checkbox>
        </el-checkbox-group>
      </el-form-item >
    </el-form>
    <div slot="footer">
      <el-button @click="$emit('cancel')">取消</el-button>
      <el-button @click="facilityClick" type="primary" :loading="loading">确定</el-button>
    </div>
  </el-dialog>
</template>

<style lang="scss" scoped>
  .checkbox-margin-right{
    margin-bottom: 20px;
    .el-radio--medium.is-bordered{
      margin-right: 0;
    }
  }
  .input-width{
    width: 90%;
  }
</style>

<script>
import {validateStringLength as validator} from '@/utils'
import { addOrEditfetchTaxDevice, getInvoiceChannel, getEquipmentSupport } from '@/services/device-project/tax-device'

const facilityForm = {
  tax_disk_type: 1,
  tax_num: '',
  tax_machine: '',
  bank_name: '',
  bank_account: '',
  phone: '',
  address: '',
  invoice_types: [],
  channel: ''
}

const formRules = {
  channel: [
    {required: true, message: '请选择开票产品'},
  ],
  tax_disk_type: [
    {required: true, message: '请输入税控盘类型'},
  ],
  tax_num: [
    {required: true, pattern: /^[0-9]{12}$/, message: '税盘号为12位数字'}
  ],
  tax_machine: [
    {required: true, pattern: /^[0-9]{1,12}$/, message: '请填正确的分机号，仅支持数字，长度不超过12位'}
  ],
  bank_name: [
    {required: true, max: 70, validator, message: '请填正确的开户银行，长度不能超过70位（汉字占两位）'}
  ],
  bank_account: [
    {required: true, pattern: /^[0-9]{8,30}$/, message: '请填写正确的银行账号，仅支持数字，长度为8到30位'}
  ],
  phone: [
    {required: true, pattern: /^[0-9-]{7,20}$/, message: '请填正确的电话，长度为7到20位'}
  ],
  address: [
    {required: true, max: 80, validator, message: '请填写正确的地址，长度不能超过80位（汉字占两位）'}
  ],
  invoice_types: [
    {required: true, message: '开票类型不能为空'}
  ]
}

export default {
  name: 'FacilityModal',
  props: {
    visible: {
      type: Boolean,
      required: true
    },
    taxDevice: Array,
    model: Object
  },
  data() {
    return {
      title: '新增开票设备',
      loading: false,
      facilityData: { ...facilityForm },
      rules: {...formRules},
      channelList: [],
      invoiceTypes: []
    }
  },
  computed: {
    taxDiskType() {
      let taxDiskTypeData = {}
      switch (this.facilityData.tax_disk_type) {
        case 1:
          taxDiskTypeData = {
            taxDiskTypeText: '航信税盘号',
            taxDiskTypeShow: true,
            taxMachineShow: true,
            inputLeft: '44'
          }
          break

        case 2:
          taxDiskTypeData = {
            taxDiskTypeText: '百望税盘号',
            taxDiskTypeShow: true,
            taxMachineShow: false,
            inputLeft: '33'
          }
          break

        case 3:
          taxDiskTypeData = {
            taxDiskTypeText: '区块链电子发票',
            taxDiskTypeShow: false,
            taxMachineShow: false,
            inputLeft: ''
          }
          break
        default:
          taxDiskTypeData = {
            taxDiskTypeText: '航信税盘号',
            taxDiskTypeShow: true,
            taxMachineShow: true,
            inputLeft: '44'
          }
      }
      return taxDiskTypeData
    },
  },
  created() {
    getInvoiceChannel().then(res => {
      this.channelList = res
    })
    this.$store.dispatch('business/clientInvoiceType').then(res => {
      this.invoiceTypes = res
    })
  },
  watch: {
    model(newVal) {
      this.facilityData = { ...facilityForm, ...newVal }
      this.$refs.form && this.$refs.form.resetFields()

      if (newVal && newVal.id) {
        this.loadData(newVal.id)
      }
    },
    invoiceTypes(newVal) {
      let arr = []
      if (newVal && newVal.length > 0) {
        arr = newVal.filter(item => item.selected === 1).map(item => item.value)
      }
      this.facilityData.invoice_types = arr
    }
  },
  methods: {
    loadData(id) {
      this.loading = true

      getEquipmentSupport({ id })
        .then(res => {
          this.invoiceTypes = res.invoice_types
        })
        .finally(() => {
          this.loading = false
        })
    },
    facilityClick() {
      const params = this.facilityData
      this.$refs['form'].validate(valid => {
        if (valid) {
          this.loading = true
          addOrEditfetchTaxDevice(params, { showLoading: false })
            .then(() => {
              this.$emit('ok')
            })
            .finally(() => {
              this.loading = false
            })
        }
      })
    },
    handleClose() {
      this.$emit('cancel')
    }
  }
}
</script>
