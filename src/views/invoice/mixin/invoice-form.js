/* eslint-disable camelcase */
import { mapGetters } from 'vuex'
import { fetchInvoiceStyles } from '@/services/group/client-store'
import { getTaxList } from '@/services/invoice/online'

const defaultBuyerInfo = {
  name: '',
  tax_code: '',
  address: '',
  bank_name: '',
  phone: '',
  bank_account: '',
  email: ''
}
const defaultClientInfo = {
  name: '',
  tax_code: '',
  address: '',
  bank_name: '',
  phone: '',
  bank_account: '',
}
const defaultInvoiceInfo = {
  payee: '',
  reviewer: '',
  drawer: '',
  remark: ''
}

const blockInvoiceStyle = 4 // 区块链电子发票种类标识
const defaultInvoiceTitle = '普通（电子）发票'
const invoiceTitleMap = {
  0: defaultInvoiceTitle,
  1: '增值税普通发票',
  2: '增值税专用发票',
  6: '增值税普通发票（卷票）'
}

/**
 * 单张开票、扫码开票共用的 mixins
 * @param  {Number} mixinType 1单张开票，2扫码开票（扫码开票没有发票种类下拉框）
 */
export default function(mixinType = 1) {
  return {
    data() {
      return {
        title: defaultInvoiceTitle, // 开票组件的 title，根据 searchForm.invoice_style 变化
        loading: false,
        invoiceStyleLoading: false,
        taxLoading: false,
        searchForm: {
          store_id: '', // 门店ID
          invoice_style: '', // 发票种类
          tax_num_id: '', // 税盘ID
          title_type: 2, // 发票对象，1个人/非企业，2企业
        },
        formRules: {
          store_id: [{ required: true, message: '请选择门店' }],
          invoice_style: [{ required: true, message: '请选择发票种类' }],
          tax_num_id: [{ required: true, message: '请选择税盘' }],
        },
        invoiceStyleList: [], // 发票种类列表
        taxList: [], // 税盘列表
        cache: {
          invoiceStyle: {}, // 用于缓存已拉取过的发票种类数据，key 值为相关联的门店ID
          tax: {}, // 用于缓存已拉取过的税盘列表数据，key 值为相关联的发票种类ID
        },
        buyerInfo: { ...defaultBuyerInfo },
        clientInfo: { ...defaultClientInfo },
        invoiceInfo: { ...defaultInvoiceInfo },
        invoiceProjects: [],
      }
    },
    computed: {
      ...mapGetters(['user_info', 'client_info', 'selected_client_store']),
      user_store_list() {
        // 这里过滤已禁用或已删除的门店数据
        return (this.$store.getters.user_store_list || []).filter(store => store.state === 0 && store.is_deleted === 0)
      },
      isAdmin() {
        return this.selected_client_store.client_store_id === -1
      },
      /**
       * 标识是否为专票
       */
      isSpecialInvoice() {
        return +this.searchForm.invoice_style === 2
      },
    },
    watch: {
      selected_client_store(selectedClientStore) {
        this.initSelectData(selectedClientStore)
      },
      /**
       * 商户信息发生变化时，更新 this.clientInfo, this.invoiceInfo
       */
      client_info(clientInfo) {
        this.updateClientInfo(clientInfo)
      },
      /**
       * 税盘下拉框值发生变化时，更新 this.clientInfo, this.invoiceInfo
       */
      'searchForm.tax_num_id': function handler(taxID) {
        this.updateClientInfoByTaxId(taxID)
      },
      /**
       * 门店变更，更新 this.invoiceInfo 中的开票人、收款人、复核人信息
       * 没有值的，以当前商户的开票人、收款人、复核人信息为准
       */
      'searchForm.store_id': function handler(storeID) {
        this.updateInvoiceInfoByStoreId(storeID)
      }
    },
    created() {
      console.log('InvoiceFormMixin.created')

      this.$store.dispatch('user/getUserStores')
        .then(() => this.initSelectData(this.selected_client_store))

      // 更新商户信息
      this.$store.dispatch('business/getClientInfo')
        .then(res => this.updateClientInfo(res))
    },
    methods: {
      initSelectData(selectedClientStore) {
        const { client_store_id: storeID } = selectedClientStore

        if (storeID === -1) {
          // client_store_id=-1 时，设置默认选中的门店
          this.selectDefaultStore()
        } else if (storeID > 0) {
          this.searchForm.store_id = storeID

          if (mixinType === 1) {
            // 单张开票，拉取发票种类下拉框数据
            this.fetchInvoiceStyles(storeID)
          } else {
            // 扫码开票，直接触发发票种类 change 事件，以便让其更新税盘数据
            this.handleInvoiceStyleChange(this.searchForm.invoice_style)
          }
        }
      },
      updateClientInfo(clientInfo) {
        const {
          name,
          tax_code,
          sell_phone: phone,
          sell_bank_name: bank_name,
          sell_bank_account: bank_account,
          sell_address: address,
        } = clientInfo || {}

        // 更新开票方信息
        this.clientInfo = {
          ...this.clientInfo,
          name,
          tax_code,
          phone,
          bank_name,
          bank_account,
          address
        }
      },
      updateInvoiceInfoByStoreId(storeID) {
        const store = this.user_store_list.find(store => store.client_store_id === storeID)
        console.log('updateInvoiceInfoByStoreId', storeID, store, this.user_store_list)

        if (store) {
          const {
            payee,
            reviewer,
            drawer,
          } = store

          // 根据选择的门店更新开票人、收款人、复核人信息
          this.invoiceInfo = {
            ...this.invoiceInfo,
            payee,
            reviewer,
            drawer
          }
        }
      },
      updateClientInfoByTaxId(taxID) {
        const selected = this.taxList.find(tax => tax.id === taxID)

        if (selected) {
          const {
            sell_phone: phone,
            sell_bank_name: bank_name,
            sell_bank_account: bank_account,
            sell_address: address,
          } = this.client_info

          // 根据选中的税盘更新 client_info
          // 除企业名称、税号外，其它信息以税盘的为准
          this.clientInfo = {
            ...this.clientInfo,
            phone: selected.phone || phone,
            bank_name: selected.bank_name || bank_name,
            bank_account: selected.bank_account || bank_account,
            address: selected.address || address
          }
        }
      },
      handleSuccess(clearValidate) {
        this.$message.success('操作成功')
        // 清空开票表单数据
        this.initInvoiceData()
        // 清除表单域所有的校验结果
        // 为避免无效，在下次更新时（等待上面重置数据后）才执行
        this.$nextTick(function tick() {
          clearValidate && clearValidate()
        })
      },
      initInvoiceData() {
        this.invoiceProjects = []
        this.buyerInfo = { ...defaultBuyerInfo }
        this.invoiceInfo = { ...this.invoiceInfo, remark: '' }
      },
      selectDefaultStore() {
        const storeList = this.user_store_list
        if (storeList && storeList.length === 1) {
          const storeID = storeList[0].client_store_id
          this.searchForm.store_id = storeID
          // 触发门店 change 事件，以便让其更新发票种类数据
          this.handleStoreChange(storeID)
        }
      },
      selectDefaultInvoiceStyle(invoiceStyleList) {
        // 仅一种发票种类时，默认选中
        if (invoiceStyleList && invoiceStyleList.length === 1) {
          const invoiceStyle = invoiceStyleList[0].value
          this.searchForm.invoice_style = invoiceStyle
          // 触发发票种类 change 事件，以便让其更新税盘数据
          this.handleInvoiceStyleChange(invoiceStyle)
        }
      },
      selectDefaultTax(taxList) {
        // 仅一种税盘时，默认选中
        if (taxList && taxList.length === 1) {
          this.searchForm.tax_num_id = taxList[0].id
        }
      },
      /**
       * 门店发生变化时，级联更新其关联的发票种类、税盘数据
       * 在扫码开票页面中，其发票种类固定为电子发票，发票种类下拉框不存在，这里需要额外处理
       */
      handleStoreChange(storeID) {
        // 把发票种类、税盘列表置空
        if (mixinType === 1) {
          this.invoiceStyle = []
          this.searchForm.invoice_style = ''
        }

        this.taxList = []
        this.searchForm.tax_num_id = ''

        if (storeID !== '') {
          if (mixinType === 1) {
            // 如果缓存已有数据，直接从缓存中获取
            const invoiceStyleList = this.cache.invoiceStyle[storeID]

            if (invoiceStyleList && invoiceStyleList.length) {
              this.invoiceStyleList = invoiceStyleList
              this.selectDefaultInvoiceStyle(invoiceStyleList)
              return false
            }

            this.fetchInvoiceStyles(storeID)
          } else {
            // 扫码开票（没有发票种类），门店数据更新后，直接触发发票种类 change 事件，以便让其更新税盘数据
            this.handleInvoiceStyleChange(this.searchForm.invoice_style)
          }
        }
      },
      fetchInvoiceStyles(storeID) {
        this.invoiceStyleLoading = true

        fetchInvoiceStyles(storeID)
          .then(res => {
            // 发票种类，过滤掉区块链电子发票
            const invoiceStyleList = (res || []).filter(style => style.value !== blockInvoiceStyle)
            this.invoiceStyleList = invoiceStyleList
            // 选中默认项
            this.selectDefaultInvoiceStyle(invoiceStyleList)
            // 缓存数据
            this.cache.invoiceStyle[storeID] = invoiceStyleList
          })
          .finally(() => {
            this.invoiceStyleLoading = false
          })
      },
      handleInvoiceStyleChange(invoiceStyle) {
        const { store_id: storeID } = this.searchForm

        // 更新 title
        this.title = invoiceTitleMap[invoiceStyle] || defaultInvoiceTitle
        // 把税盘列表置空
        this.taxList = []
        this.searchForm.tax_num_id = ''

        // change 事件，在清空下拉框值时，也会触发，需要判断当前值是否为空
        if (invoiceStyle !== '') {
          // 专票，把发票对象重置为企业类型
          if (+invoiceStyle === 2) {
            this.searchForm.title_type = 2
          }

          // 如果缓存已有数据，直接从缓存中获取
          if (mixinType === 1) {
            const taxList = this.cache.tax[invoiceStyle]

            if (taxList && taxList.length) {
              this.taxList = taxList
              this.selectDefaultTax(taxList)
              return false
            }
          }

          this.fetchTaxList(storeID, invoiceStyle)
        }
      },
      fetchTaxList(storeID, invoiceStyle) {
        this.taxLoading = true

        getTaxList(storeID, invoiceStyle)
          .then(res => {
            const taxList = res || []
            this.taxList = taxList
            // 选中默认项
            this.selectDefaultTax(taxList)
            // 缓存数据
            this.cache.tax[invoiceStyle] = taxList
          })
          .finally(() => {
            this.taxLoading = false
          })
      },
    }
  }
}
