<template>
  <div class="buyer-info">
    <el-form ref="form" :model="model" :rules="rules">
      <table class="table-bordered">
        <tbody>
          <tr>
            <td class="text-vertical-lr">收票方</td>
            <td width="60%" style="padding: 8px 0">
              <el-row>
                <el-col :span="12">
                  <el-form-item prop="name">
                    <template v-slot:label>名&emsp;&emsp;称</template>
                    <invoice-title-combobox
                      v-if="isEnterpriseTitle"
                      :special-invoice="specialInvoice"
                      v-model="model.name"
                      placeholder="请输入收票方名称"
                      @select="handleSelectInvoiceTitle" />
                    <el-input v-else v-model="model.name" placeholder="请输入收票方名称" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item prop="tax_code" label="纳税人识别号">
                    <el-input v-model="model.tax_code" placeholder="请输入纳税人识别号" />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row>
                <el-col :span="12">
                  <el-form-item prop="address">
                    <template v-slot:label>地&emsp;&emsp;址</template>
                    <el-input v-model="model.address" placeholder="请输入地址" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item prop="bank_name">
                    <template v-slot:label>开&emsp;&ensp;户&ensp;&emsp;行</template>
                    <el-input v-model="model.bank_name" placeholder="请输入开户银行" />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row>
                <el-col :span="12">
                  <el-form-item prop="phone">
                    <template v-slot:label>电&emsp;&emsp;话</template>
                    <el-input v-model="model.phone" placeholder="请输入电话" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item prop="bank_account">
                    <template v-slot:label>开&ensp;户&emsp;账&ensp;号</template>
                    <el-input v-model="model.bank_account" placeholder="请输入开户帐号" />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row>
                <el-col :span="12">
                  <el-form-item prop="email">
                    <template v-slot:label>邮&emsp;&emsp;箱</template>
                    <el-input v-model="model.email" placeholder="建议录入便于收票" />
                  </el-form-item>
                </el-col>
                <el-col :span="12"></el-col>
              </el-row>
            </td>
            <td class="text-vertical-lr">密码区</td>
            <td style="text-align: center;">
              *****************
              *****************
            </td>
          </tr>
        </tbody>
      </table>
    </el-form>
  </div>
</template>

<script>
import InvoiceTitleCombobox from '@/components/invoice-title-combobox'
import { validateStringLength as validator } from '@/utils'
import { RGE_ENTERPRISE_PHONE } from '@/utils/constants/regexp'

export default {
  name: 'BuyerInfoTable',
  components: { InvoiceTitleCombobox },
  props: {
    specialInvoice: {
      type: Boolean,
      default: false
    },
    titleType: {
      type: Number,
      required: true
    },
    buyerInfo: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      model: { ...this.buyerInfo, title_type: this.titleType },
    }
  },
  computed: {
    isEnterpriseTitle() {
      return this.model.title_type === 2
    },
    rules() {
      // 根据 specialInvoice, titleType 更新表单 rules
      return {
        name: [{ required: true, max: 100, validator, message: '长度不超过100位（汉字占2位）' }],
        tax_code: [
          { required: this.specialInvoice || this.isEnterpriseTitle, pattern: /^[0-9A-Z]{15,20}$/, message: '15-20位的数字、大写字母组合' }
        ],
        address: [{ required: this.specialInvoice, max: 80, validator, message: '长度不能超过80位（汉字占2位）' }],
        bank_name: [{ required: this.specialInvoice, max: 70, validator, message: '长度不能超过70位（汉字占2位）' }],
        bank_account: [{ required: this.specialInvoice, pattern: /^\d{8,30}$/, message: '请输入开户帐号，仅支持8-30位数字' }],
        phone: [{ required: this.specialInvoice, pattern: RGE_ENTERPRISE_PHONE, message: '请输入电话号码，长度7-20位' }],
        email: [{ type: 'email', message: '请输入正确的邮箱地址' }],
      }
    }
  },
  watch: {
    buyerInfo(value) {
      console.log('watch.buyerInfo', value)
      this.model = { ...this.model, ...value }
    },
    titleType(value) {
      this.model.title_type = value
    }
  },
  methods: {
    handleSelectInvoiceTitle(value) {
      const {
        buyer_taxcode: taxcode,
        buyer_address: address,
        buyer_address_phone: phone,
        buyer_bank_account: bankAccount,
        buyer_bank_name: bankName,
      } = value

      this.model.tax_code = taxcode

      // 专票接口返回的数据
      address && (this.model.address = address)
      phone && (this.model.phone = phone)
      bankAccount && (this.model.bank_account = bankAccount)
      bankName && (this.model.bank_name = bankName)
    }
  }
}
</script>
