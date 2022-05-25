<template>
  <div>
    <el-dialog
      class="project-modal"
      :title="`${form.id ? '修改' : '新增'}商品编码`"
      width="520px"
      :visible="visible"
      @close="$emit('cancel')"
    >
      <el-form ref="form" v-loading="loading" id="project-form" :model="form" :rules="rules" label-width="130px">
        <el-form-item label="税收商品编码" prop="tax_code">
          <el-input :value="form.tax_code" prefix-icon="el-icon-search" @focus="openTree" placeholder="请输入" />
        </el-form-item>

        <el-form-item label="税收商品名称" prop="name">
          <el-input v-model="form.name" disabled placeholder="请输入" />
        </el-form-item>

        <el-form-item label="企业商品编号" prop="firm_goods_no">
          <el-input v-model="form.firm_goods_no" placeholder="请输入" />
        </el-form-item>

        <el-form-item label="企业商品名称" prop="firm_goods_name">
          <el-input v-model="form.firm_goods_name" placeholder="请输入" />
        </el-form-item>

        <el-form-item label="规格型号" prop="models">
          <el-input v-model="form.models" placeholder="请输入" />
        </el-form-item>

        <el-form-item label="计量单位" prop="unit">
          <el-autocomplete
            v-model="form.unit"
            placeholder="请选择"
            :fetch-suggestions="unitSearch"
          />
        </el-form-item>

        <el-form-item label="单价" prop="per_price">
          <el-input v-model="form.per_price" placeholder="请输入" />
        </el-form-item>

        <el-form-item label="优惠政策" prop="perferential_mark">
          <el-select v-model="form.perferential_mark" @change="changeDiscount">
            <el-option label="不享受" :value="0" />
            <el-option label="享受" :value="1" />
          </el-select>
        </el-form-item>

        <el-form-item label="优惠类型" prop="vat_special_manager" v-show="form.perferential_mark === 1">
          <el-select v-model="form.vat_special_manager" @change="changeDiscountType">
            <el-option v-for="item in discountTypes" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>

        <el-form-item label="税率" prop="tax_rate">
          <el-select v-model="form.tax_rate" :disabled="disableRate">
            <el-option v-for="item in taxRateList" :key="item.id" :label="item.tax_rate" :value="item.tax_rate" />
          </el-select>
        </el-form-item>

        <el-form-item label="说明">
          <el-input v-model="form.description" placeholder="请输入" />
        </el-form-item>

        <el-form-item label="设置默认开票项目">
          <el-radio-group v-model="form.is_default">
            <el-radio :label="1">是</el-radio>
            <el-radio :label="0">否</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="是否成为成品油">
          <el-radio-group v-model="form.special_invoice_kind">
            <el-radio label="08">是</el-radio>
            <el-radio label="">否</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>

      <div slot="footer">
        <el-button type="primary" @click="onSubmit" :loading="loading">{{ form.id ? '修改' : '新增' }}</el-button>
        <el-button @click="$emit('cancel')">取 消</el-button>
      </div>
    </el-dialog>

    <code-tree
      :visible="treeVisible"
      @cancel="closeTree"
      @select="selectTree"
    />
  </div>
</template>

<script>
import { addProject, editProject } from '@/services/device-project/project'
import { validateStringLength as validator } from '@/utils'
import { mapGetters } from 'vuex'
import CodeTree from '@/components/code-tree'
import mixinFetch from '@/views/mixins/mixin-fetch'

// 优惠类型
const DiscountTypes = [
  '免税',
  '不征税',
  '先征后退',
  '100%先征后退',
  '50%先征后退',
  '简易征收',
  '即征即退30%',
  '即征即退50%',
  '即征即退70%',
  '即征即退100%',
  '超税负3%即征即退',
  '超税负8%即征即退',
  '超税负12%即征即退稀土产品',
  '按5%简易征收按1.5%计征',
  '按5%简易征',
  '按3%简易征'
]
const Rules = {
  tax_code: {
    required: true, message: '请输入税收商品编码'
  },
  name: {
    required: true, message: '请输入税收商品名称'
  },
  firm_goods_no: {
    required: true, message: '请输入企业商品编号'
  },
  firm_goods_name: [{
    required: true, message: '请输入企业商品名称'
  }, {
    max: 50, validator, message: '名称不能超过50个字符'
  }],
  unit: { max: 10, validator, message: '最长10个汉字' },
  per_price: {
    pattern: /^([1-9]|0)(\d{0,7})(\.\d{1,2})?$/,
    message: '单价个位数不超过8位，小数不超过2位'
  },
  vat_special_manager: {
    required: false, message: '请选择优惠类型'
  },
  tax_rate: {
    required: true, message: '请选择税率'
  }
}
const DefaultForm = {
  is_default: 0,
  special_invoice_kind: '',
  perferential_mark: 0, // 优惠政策，0 不享受， 1 享受
  vat_special_manager: '' // 优惠类型
}

export default {
  name: 'EditModal',
  mixins: [ mixinFetch ],

  components: {
    CodeTree
  },

  props: {
    visible: Boolean,
    data: Object
  },

  data() {
    return {
      form: DefaultForm,
      rules: Rules,
      treeVisible: false,
      loading: false,
      discountTypes: DiscountTypes, // 优惠类型列表
      disableRate: false, // 是否允许编辑税率，免税时值为0不可修改
      taxRateList: []
    }
  },

  computed: {
    ...mapGetters([
      'tax_rate_list'
    ])
  },

  created() {
    this.taxRateList = this.tax_rate_list
  },

  watch: {
    data() {
      if (this.$refs.form && !this.data.id) {
        this.$refs.form.resetFields()
      }
      this.form = {
        ...DefaultForm,
        ...this.data
      }
      this.discountHandler(this.form.vat_special_manager)
    },

    tax_rate_list(newVal) {
      this.taxRateList = newVal
    }
  },

  methods: {
    onSubmit() {
      this.$refs.form.validate(valid => {
        if (valid) {
          if (this.form.id) {
            this._request(editProject)(this.form).then(() => {
              this.successHandler('修改成功')
            })
            return
          }
          this._request(addProject)(this.form).then(() => {
            this.successHandler()
          })
        }
      })
    },

    successHandler(title) {
      this.$emit('cancel')
      this.$message.success(title || '新增成功')
      this.$emit('refreshData')
    },

    openTree() {
      this.treeVisible = true
    },

    closeTree() {
      this.treeVisible = false
    },

    selectTree(data) {
      this.form = {
        ...this.form,
        firm_goods_name: data.spmc,
        firm_goods_no: data.spbm,
        name: data.spmc,
        tax_code: data.spbm,
        tax_rate: data.zzssl
      }
    },

    // 生成单位列表
    unitSearch(value, callback) {
      const unitList = [
        { value: '升' },
        { value: '个' },
        { value: '天' },
        { value: '米' },
        { value: '千克' },
        { value: '吨' },
        { value: '次' },
        { value: '批' }
      ]
      callback(unitList)
    },

    // 优惠政策改变
    changeDiscount(val) {
      this.disableRate = false
      this.form.vat_special_manager = ''
      this.taxRateList = this.tax_rate_list

      // 享受优惠政策时，必填
      if (val === 1) {
        this.rules.vat_special_manager.required = true
        return
      }
      this.rules.vat_special_manager.required = false
    },

    // 优惠类型改变
    changeDiscountType(val) {
      this.discountHandler(val)
    },

    /**
     * 免税政策处理
     * @param type 优惠类型
     */
    discountHandler(type) {
      const { perferential_mark: perferential } = this.form
      if (+perferential === 1) {
        // 优惠类型选择免税、不征税时，税率显示0，并且不可修改
        if (type === '免税' || type === '不征税') {
          this.form = {
            ...this.form,
            tax_rate: '0'
          }
          this.disableRate = true
          return
        }
        // 非0税率
        const { tax_rate: taxRate } = this.form
        this.form = {
          ...this.form,
          tax_rate: taxRate === '0' ? '' : taxRate
        }
        this.taxRateList = this.tax_rate_list.filter(item => item.tax_rate !== '0')
      }
      this.disableRate = false
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
