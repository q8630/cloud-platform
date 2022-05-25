<template>
  <div class="invoice-project-info">
    <el-form ref="form" :model="model" :rules="model.rules">
      <el-table border :data="model.invoiceProjects" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="60" />

        <el-table-column prop="name" label="货物或应税劳务、服务名称" width="220">
          <template #default="scope">
            <span v-if="scope.row._type === 'discount'">{{scope.row.name}}</span>
            <el-form-item
              v-else
              :prop="'invoiceProjects.' + scope.$index + '.name'"
              :rules="model.rules.name"
            >
              <el-input readonly v-model="scope.row.name" @focus="showGoodsModal(scope.$index)">
                <i slot="suffix" class="el-input__icon el-icon-tickets" @click="showGoodsModal(scope.$index)"></i>
              </el-input>
            </el-form-item>
          </template>
        </el-table-column>

        <el-table-column prop="models" label="规格型号" min-width="90">
          <template #default="scope">
            <el-form-item v-if="scope.row._type !== 'discount'">
              <el-input v-model="scope.row.models" />
            </el-form-item>
          </template>
        </el-table-column>

        <el-table-column prop="unit" label="单位" min-width="90">
          <template #default="scope">
            <el-form-item
              v-if="scope.row._type !== 'discount'"
              :prop="'invoiceProjects.' + scope.$index + '.unit'"
              :rules="model.rules.unit"
            >
              <el-input v-model="scope.row.unit" />
            </el-form-item>
          </template>
        </el-table-column>

        <el-table-column prop="total" label="数量" min-width="90">
          <template #default="scope">
            <el-form-item
              v-if="scope.row._type !== 'discount'"
              :prop="'invoiceProjects.' + scope.$index + '.total'"
              :rules="model.rules.total"
            >
              <el-input v-model="scope.row.total" @input="handleChangeFieldValue('total', scope.$index)" />
            </el-form-item>
          </template>
        </el-table-column>

        <el-table-column prop="price_with_tax" label="单价（含税）" min-width="100">
          <template #default="scope">
            <el-form-item
              v-if="scope.row._type !== 'discount'"
              :prop="'invoiceProjects.' + scope.$index + '.price_with_tax'"
              :rules="model.rules.price_with_tax"
            >
              <el-input v-model="scope.row.price_with_tax" @input="handleChangeFieldValue('price_with_tax', scope.$index)" />
            </el-form-item>
          </template>
        </el-table-column>

        <el-table-column prop="total_price_with_tax" label="金额（含税）" width="160">
          <template #default="scope">
            <el-form-item
              :prop="'invoiceProjects.' + scope.$index + '.total_price_with_tax'"
              :rules="scope.row._type === 'discount' ? model.rules.total_price_with_tax2 : model.rules.total_price_with_tax"
            >
              <el-input v-model="scope.row.total_price_with_tax" @input="handleChangeFieldValue('total_price_with_tax', scope.$index)" />
            </el-form-item>
          </template>
        </el-table-column>

        <el-table-column prop="tax_rate" label="税率" width="110">
          <template #default="scope">
            <span v-if="scope.row._type === 'discount'">{{scope.row.tax_rate}}</span>

            <el-form-item
              v-else
              :prop="'invoiceProjects.' + scope.$index + '.tax_rate'"
              :rules="model.rules.tax_rate"
            >
              <el-select v-model="scope.row.tax_rate" @change="handleChangeFieldValue('tax_rate', scope.$index)">
                <el-option
                  v-for="tax in tax_rate_list"
                  :key="tax.tax_rate"
                  :label="tax.tax_rate"
                  :value="tax.tax_rate" />
              </el-select>
            </el-form-item>
          </template>
        </el-table-column>

        <el-table-column prop="tax_amount" label="税额" width="100" />

        <el-table-column width="110">
          <template #default="{ row, $index }">
            <el-button
              v-if="row._type !=='discount' && row.name && row.total && row.price_with_tax"
              type="text"
              @click="doAddDiscount(row, $index)"
            >
              增加折扣行
            </el-button>
          </template>
        </el-table-column>

        <template v-slot:append>
          <el-button plain type="primary" icon="el-icon-plus" @click="handleAddProject">添加开票行</el-button>
          <el-button plain icon="el-icon-delete" @click="handleDeleteProject" :disabled="selected.length <= 0">删除选中行</el-button>
        </template>
      </el-table>
    </el-form>

    <table class="table-bordered invoice-count-table">
      <tbody>
        <tr>
          <td width="280">合计</td>
          <td></td>
          <td width="160">¥ {{model.invoiceCountInfo.total_price_with_tax}}</td>
          <td width="110"></td>
          <td width="210">¥ {{model.invoiceCountInfo.total_tax}}</td>
        </tr>
        <tr>
          <td>价税合计（大写）</td>
          <td style="padding: 5px 10px;"><span style="font-size: 16px;">⊗</span> {{model.invoiceCountInfo.total_rmb}}</td>
          <td colSpan="3">（小写）¥ {{model.invoiceCountInfo.total_price_with_tax}}</td>
        </tr>
      </tbody>
    </table>

    <goods-list-modal :visible="visibleGoodsModal" @cancel="hideGoodsModal" @ok="handleSelectGoods" />
    <discount-modal :visible="visibleDiscountModal" @cancel="hideDiscountModal" @ok="handleAddDiscount" />
  </div>
</template>

<script>
/* eslint-disable camelcase */
import { debounce } from 'lodash'
import request from '@/utils/request'
import { uuid, validateStringLength as validator } from '@/utils'
import GoodsListModal from './goods-list-modal'
import DiscountModal from './discount-modal'

// 折扣行数据的 type 标识
const DISCOUNT_TYPE_KEY = 'discount'

// 默认的开票项目数据
const defaultInvoiceProject = {
  name: '', // 货物或应税劳务、服务名称
  models: '', // 规格型号
  unit: '', // 单位
  total: '', // 数量
  price: '', // 单价（不含税）
  price_with_tax: '', // 单价（含税）
  total_price: '', // 总金额（不含税）
  total_price_with_tax: '', // 总金额（含税）
  tax_rate: '0', // 税率
  tax_amount: '', // 税额
}

// 默认的开票汇总数据
const defaultInvoiceCountInfo = {
  total_tax: '0.00', // 总税额
  total_price: '0.00', // 总金额（不含税）
  total_price_with_tax: '0.00', // 总金额（价税合计）
  total_rmb: '零', // 总金额（价税合计，大写）
}

const formRules = {
  name: [{ required: true, message: '请输入货物或应税劳务、服务名称' }],
  unit: [{ max: 16, validator, message: '单位不能超过16个位（汉字占2位）' }],
  total: [{ required: true, pattern: /^\d+(\.\d+)?$/, message: '请输入数量' }],
  price_with_tax: [{ required: true, pattern: /^\d+(\.\d+)?$/, message: '请输入单价' }],
  total_price_with_tax: [{ required: true, pattern: /^\d+(\.\d+)?$/, message: '请输入金额' }],
  total_price_with_tax2: [{ required: true, pattern: /^(-?\d+)(\.\d+)?$/, message: '请输入金额' }],
  tax_rate: [{ required: true, message: '请输入税率' }],
}

export default {
  name: 'InvoiceProjectTable',
  components: { GoodsListModal, DiscountModal },
  props: {
    invoiceProjects: {
      type: Array,
      required: true,
    },
    invoiceInfo: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      model: {
        rules: { ...formRules },
        invoiceProjects: [],
        invoiceCountInfo: {}
      },
      editingIndex: -1, // 缓存当前修改的行索引，便于后面取值
      selected: [], // 当前勾选的数据
      selectedMap: {}, // 当前勾选的数据，key 值为行索引，便于后面处理
      visibleGoodsModal: false,
      visibleDiscountModal: false,
    }
  },
  computed: {
    // 税率列表，过滤掉 is_deleted 的数据项
    tax_rate_list() {
      return (this.$store.getters.tax_rate_list || []).filter(r => r.is_deleted === '0')
    },
  },
  watch: {
    invoiceProjects(value) {
      console.log('watch.invoiceProjects', value)
      this.initInvoiceProjects(value)
      // 更新发票汇总信息
      if (value && value.length) {
        this._countInvoice()
      } else {
        this.initInvoiceCountInfo()
      }
    },
  },
  created() {
    console.log('InvoiceProjectTable.created')
    this.initInvoiceProjects(this.invoiceProjects)
    this.initInvoiceCountInfo()
    this.$store.dispatch('business/getTaxRateList')
  },
  methods: {
    /**
     * 初始化开票数据
     */
    initInvoiceProjects(value = []) {
      let invoiceProjects = value.slice(0)

      if (invoiceProjects.length) {
        // 添加默认uuid标识，以及处理折扣行数据
        for (let i = 0; i < invoiceProjects.length; i++) {
          const project = invoiceProjects[i]
          // 给数据添加唯一标识key值
          project._key = uuid(16)

          // 判断是否存在折扣信息，如果存在，向数组添加折扣行数据
          // 这里需要判断 discount 的值是否大于0，避免初始化数据为空串时，而使得页面出现了空的折扣行信息
          if (this._isDiscountProject(project) && Math.abs(project.discount) > 0) {
            const discountData = this._newDiscount(project)
            // 插入折扣行数据，这里直接把索引值i＋1，以便下次循环跳过该行
            invoiceProjects.splice(i + 1, 0, discountData)
            i += 1
          }
        }
      } else {
        // 添加默认开票行
        invoiceProjects = [this._newInvoiceProject()]
      }

      this.model.invoiceProjects = invoiceProjects
    },
    initInvoiceCountInfo() {
      this.model.invoiceCountInfo = { ...defaultInvoiceCountInfo, ...this.invoiceInfo }
    },
    handleSelectionChange(records) {
      // 为方便后面处理，这里把选中的行数据索引取到并缓存起来
      const selectedMap = {}

      if (records && records.length) {
        this.model.invoiceProjects.forEach((project, index) => {
          const found = records.find(r => r._key === project._key)
          if (found) {
            selectedMap[index] = project
          }
        })
      }

      this.selected = records
      this.selectedMap = selectedMap
    },
    hideGoodsModal() {
      this.visibleGoodsModal = false
    },
    showGoodsModal(rowIndex) {
      console.log('showGoodsModal', rowIndex)
      this.editingIndex = rowIndex
      this.visibleGoodsModal = true
    },
    cloneInvoiceProjects() {
      return this.model.invoiceProjects.slice(0)
    },
    handleChangeFieldValue(fieldName, rowIndex) {
      const invoiceProjects = this.cloneInvoiceProjects()
      const project = invoiceProjects[rowIndex]
      const value = project[fieldName]

      if (this._isDiscountRecord(project)) {
        // 如果当前是折扣行数据，修改其关联的开票项目的dis_value，后面计算时用到
        const sourceProject = invoiceProjects[rowIndex - 1]
        sourceProject.dis_value = value
      } else {

        const fields = ['total', 'price_with_tax', 'total_price_with_tax']

        // 数量、单价、金额三个输入框，改了任意一个后，可能需要重新计算另两个的值
        if (fields.includes(fieldName)) {
          // 数量、单价、金额输入值小于0时，不处理，避免计算接口报错
          if (Number.isNaN(Number(value)) || Number(value) < 0) {
            return false
          }

          const emptyLength = fields.filter(field => this._isEmptyField(project, field)).length
          // 非成品油计算逻辑
          // 都不为空时，输入数量或单价时，计算金额；当输入金额时，计算数量
          // 其它情况，这里不需要处理，有任意一个不为空的时候，按正常逻辑计算即可
          // 成品油计算逻辑
          // 总金额保持不变，当输入单价的时候改变数量，输入数量的时候改变单价
          // 当改变总金额的时候，保留数量的值，更改单价
          if (emptyLength === 0) {
            if (project.special_invoice_kind === '08') {
              if (fieldName === 'price_with_tax') { // 单价
                project['total'] = ''
              } else if (fieldName === 'total' || fieldName === 'total_price_with_tax') { // 数量金额
                project['price_with_tax'] = ''
              }
            } else {
              if (fieldName === 'total' || fieldName === 'price_with_tax') { // 数量单价
                project['total_price_with_tax'] = ''
              } else if (fieldName === 'total_price_with_tax') { // 金额
                project['total'] = ''
              }
            }
          }
        }
      }

      invoiceProjects.splice(rowIndex, 1, project)
      this._updateInvoiceProjects(invoiceProjects)
    },
    _newInvoiceProject() {
      return { ...defaultInvoiceProject, _key: uuid(16) }
    },
    /**
     * 根据开票行数据生成折扣行数据
     */
    _newDiscount(invoiceProject) {
      const { name, tax_rate, dis_type, discount, dis_total_price, dis_tax, dis_value } = invoiceProject

      return {
        _key: uuid(16),
        _type: DISCOUNT_TYPE_KEY, // 折扣行标识，方便外边判断
        name,
        tax_rate, // 税率
        dis_type, // 折扣类型，1折扣率，2折扣金额
        discount, // 折扣金额（含税）
        dis_total_price, // 折扣金额（不含税）
        dis_value: dis_value || discount, // 折扣率或折扣金额，用户输入的值，计算时用到
        dis_tax, // 折扣税额
        total_price_with_tax: discount, // 折扣金额（含税），仅界面显示时用到
        tax_amount: dis_tax, // 折扣税额，仅界面显示用
      }
    },
    /**
     * 判断开票项目是否包含折扣行信息，以dis_type为准，1折扣率，2折扣金额
     */
    _isDiscountProject(invoiceProject) {
      return invoiceProject.dis_type === 1 || invoiceProject.dis_type === 2
    },
    /**
     * 判断记录是否为折扣行数据，以_type为准
     */
    _isDiscountRecord(record) {
      return record._type === DISCOUNT_TYPE_KEY
    },
    handleAddProject() {
      this.model.invoiceProjects.push(this._newInvoiceProject())
    },
    handleDeleteProject() {
      this.$confirm('确认删除开票行或折扣行吗？')
        .then(this.batchDeleteInvoiceProject)
    },
    batchDeleteInvoiceProject() {
      console.log('batchDeleteInvoiceProject', this.selectedMap)

      const invoiceProjects = this.cloneInvoiceProjects()
      const rowIndex = Object.keys(this.selectedMap)
      // 累计当前已删除的数据量
      let deleteCount = 0

      for (let i = 0; i < rowIndex.length; i++) {
        const index = rowIndex[i] - deleteCount
        deleteCount += this._deleteInvoiceProject(invoiceProjects, index)
      }

      this._updateInvoiceProjects(invoiceProjects)
    },
    _deleteInvoiceProject(invoiceProjects, rowIndex) {
      const project = invoiceProjects[rowIndex]
      let deleteCount = 0

      // 如果同时选择了开票项目及其折扣行，可能上一次操作已同时删除了它的折扣行数据，
      if (!project) {
        return deleteCount
      }

      // 删除折扣行数据需要清除其关联的开票项目的折扣信息
      if (this._isDiscountRecord(project)) {
        invoiceProjects[rowIndex - 1] = this._clearDiscountData(invoiceProjects[rowIndex - 1])
        invoiceProjects.splice(rowIndex, 1)
        deleteCount = 1
      } else {
        // 开票项目，判断它是否存在折扣信息，如果存在，连同一起删除它的折扣行数据
        if (this._isDiscountProject(project) && this._isDiscountRecord(invoiceProjects[rowIndex + 1])) {
          invoiceProjects.splice(rowIndex, 2)
          deleteCount = 2
        } else {
          invoiceProjects.splice(rowIndex, 1)
          deleteCount = 1
        }
      }

      return deleteCount
    },
    /**
     * 清除开票项目的折扣信息
     */
    _clearDiscountData(project) {
      return {
        ...project,
        _type: undefined,
        dis_type: undefined,
        dis_total_price: undefined,
        dis_tax: undefined,
        dis_value: undefined,
        discount: undefined
      }
    },
    handleSelectGoods(records) {
      console.log('handleSelectGoods', records)
      this.hideGoodsModal()

      if (records && records.length) {
        // 为方便后面处理，对选中的商品信息做数据转换处理
        const goods = records.map(record => ({
          ...record,
          price_with_tax: record.per_price || '', // 单价（含税），过滤0的值，用空字符串代替
        }))

        // 更新开票行数据
        this.updateInvoiceProjectByGoodsInfo(goods, this.editingIndex)
      }
    },
    /**
     * 根据选择的商品信息来修改开票项目数据
     */
    updateInvoiceProjectByGoodsInfo(goods, rowIndex) {
      let invoiceProjects = this.cloneInvoiceProjects()
      const project = invoiceProjects[rowIndex]
      const nextProject = invoiceProjects[rowIndex + 1]

      // 如果存在折扣行数据即删除
      if (this._isDiscountProject(project) && this._isDiscountRecord(nextProject)) {
        invoiceProjects.splice(rowIndex + 1, 1)
      }

      // 更新当前开票项目
      // 这里用默认的开票项目数据和选中数据合并
      const currentProject = { ...defaultInvoiceProject, ...goods[0], _key: project._key }
      invoiceProjects.splice(rowIndex, 1, currentProject)

      // 如果选中的商品信息有多条，在修改当前开票行数据后，额外新增剩下的
      if (goods.length > 1) {
        // 添加的数据，以默认行数据 defaultInvoiceProject 为准，并添加key值
        const newProjects = goods.slice(1).map(record => ({
          ...defaultInvoiceProject,
          ...record,
          _key: uuid(16)
        }))

        invoiceProjects = invoiceProjects.concat(newProjects)
      }

      console.log('updateInvoiceProjectByGoodsInfo', invoiceProjects)

      this._updateInvoiceProjects(invoiceProjects)
    },
    _updateInvoiceProjects(invoiceProjects) {
      this.model.invoiceProjects = invoiceProjects
      // 重新计算开票行汇总数据
      this._countInvoice()
    },
    hideDiscountModal() {
      this.visibleDiscountModal = false
    },
    doAddDiscount(record, index) {
      this.visibleDiscountModal = true
      this.editingIndex = index
    },
    handleAddDiscount(discountData) {
      this.hideDiscountModal()

      const invoiceProjects = this.cloneInvoiceProjects()

      const { invoiceCountInfo } = this.model

      if (this.editingIndex >= invoiceProjects.length) {
        return false
      }

      const project = invoiceProjects[this.editingIndex]

      // 原开票数据中的商品名称、数量、单价不能为空
      if (!project.name || !project.total || !project.price_with_tax) {
        return false
      }

      // 折扣金额不能大于原价
      if (discountData.type === 2 && discountData.discount > invoiceCountInfo.total_price_with_tax) {
        return this.$alert('折扣金额不能大于原开票项目价格')
      }

      // 折扣类型，1折扣率，2折扣金额
      project.dis_type = discountData.type
      // 折扣率或折扣金额，这里直接赋值，该值会在调用计算接口后，更新其 dis_total_price
      project.dis_value = discountData.discount

      const insertIndex = this.editingIndex + 1
      const newDiscountData = this._newDiscount(project)
      const nextRecord = invoiceProjects[insertIndex]
      const deleteCount = nextRecord && this._isDiscountRecord(nextRecord) ? 1 : 0

      // 利用 Array.splice 添加或更新折扣信息到原数组
      invoiceProjects.splice(insertIndex, deleteCount, newDiscountData)

      // 更新原数组数据
      this._updateInvoiceProjects(invoiceProjects)
    },
    _isEmptyField(project, field) {
      return typeof project[field] === 'undefined' || project[field] === ''
    },
    /**
     * 计算开票行税额、金额、折扣等数据，计算逻辑分为3种情况：
     *
     * 1. 当3个输入框都为空时，不处理
     * 2. 当任意两个有值，而另一个为空时，计算另一个的值
     * 3. 当都不为空时，输入数量或单价时，计算金额；当输入金额时，计算数量
     */
    _countInvoice: debounce(function count() {
      const invoiceProjects = this.model.invoiceProjects
      const records = []

      for (let i = 0; i < invoiceProjects.length; i++) {
        const project = invoiceProjects[i]
        const fields = ['total', 'price_with_tax', 'total_price_with_tax']
        const emptyLength = fields.filter(field => this._isEmptyField(project, field)).length

        // 商品名称或数量为空，或者数量、单价、金额三者任意二者为空时，直接忽略，不做计算处理
        if (this._isDiscountRecord(project) || !project.name || emptyLength > 1) {
          continue
        }

        // 组装计算接口需要的数据
        const record = {
          list_id: i, // 当前行索引，方便在请求计算接口回来后做数据更新
          total_price_with_tax: project.total_price_with_tax, // 金额
          price_with_tax: project.price_with_tax, // 单价
          tax_rate: project.tax_rate, // 税率
          total: project.total, // 数量
        }

        // 针对折扣数据的处理
        if (this._isDiscountProject(project)) {
          record.dis_type = project.dis_type
          record.dis_value = Math.abs(project.dis_value || 0)
        }

        records.push(record)
      }

      // 如果存在需要计算的开票项目数据，则进行计算，否则就清零汇总信息
      if (records.length) {
        this._requestCountInvoice(records)
      } else {
        // 清零汇总信息
        this.model.invoiceCountInfo = {
          ...this.model.invoiceCountInfo,
          ...defaultInvoiceCountInfo
        }
      }
    }, 1000),
    _requestCountInvoice(params) {
      request({
        url: 'v3/online-invoicing/tax-handle',
        method: 'post',
        data: { detail: JSON.stringify(params) },
      }).then(res => {
        const { status, detail } = res || {}
        // 计算结果状态，0成功，1失败
        if (+status !== 0) {
          // TODO: 提示错误？
          return false
        }

        // 更新计算后的开票项目数据
        const invoiceProjects = this.cloneInvoiceProjects()

        if (detail && detail.length) {
          detail.forEach(item => {
            const invoiceProjectIndex = item.list_id
            const project = invoiceProjects[invoiceProjectIndex]
            // 更新开票项目的数量、单价、金额、税额以及折扣数据（其它与计算无关，不做变动）
            project.price = item.price
            project.total = item.total
            project.price_with_tax = item.price_with_tax
            project.total_price = item.total_price
            project.total_price_with_tax = item.total_price_with_tax
            project.tax_amount = item.tax

            // 接口总是返回折扣数据，这里需要先判断原数据是否有折扣数据才更新折扣数据
            if (this._isDiscountProject(project)) {
              // 折扣类型，计算后，把折扣类型写死为折扣金额
              project.dis_type = 2
              // 折扣率或折扣金额，计算用，上面把折扣类型写死为2后，这里需要重它的值，避免在下次计算时有误
              project.dis_value = item.discount
              // 折扣金额（含税）
              project.discount = item.discount
              // 折扣金额(不含税)
              project.dis_total_price = item.dis_total_price
              // 折扣税额
              project.dis_tax = item.dis_tax

              // 更新其对应的折扣行数据
              if (this._isDiscountRecord(invoiceProjects[invoiceProjectIndex + 1])) {
                const newDiscountData = this._newDiscount(project)
                invoiceProjects.splice(invoiceProjectIndex + 1, 1, newDiscountData)
              }
            }
          })
        }

        // 更新计算后的汇总数据
        const invoiceCountInfo = {
          ...this.model.invoiceCountInfo,
          total_tax: res.total_tax, // 总税额
          total_price: res.total_price, // 总金额（不含税）
          total_price_with_tax: res.total_price_with_tax, // 价税合计金额
          total_rmb: res.total_rmb, // 价税合计金额（大写）
        }

        this.model.invoiceProjects = invoiceProjects
        this.model.invoiceCountInfo = invoiceCountInfo
      })
    }
  }
}
</script>
