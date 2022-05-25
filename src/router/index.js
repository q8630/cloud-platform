import Vue from 'vue'
import Router from 'vue-router'

/* Layout */
import Layout from '@/layout/app-layout'
import EmptyLayout from '@/layout/empty-layout'
import UserLayout from '@/layout/user-layout'
import HelpLayout from '@/layout/help-layout'

Vue.use(Router)

/**
 * name: 'router-name'            路由名称，必须设值！！！且必须和组件名称一致，否则 <keep-alive> 将无法缓存该路由所对应的组件
 * redirect: 'noRedirect'         vue-router 的 redirect，当值为 noRedirect 时，它在面包宵导航中将不会跳转
 * hidden: true                   当值为 true 时，在 sidebar 中不显示
 * alwaysShow: false              默认情况下，父菜单项总是会显示；仅当 alwaysShow 为 false ，且子菜单项只有一项时, 将直接显示子菜单项
 *
 * meta : {
    title: 'title'                路由 title，用于 sidebar, breadcrumb, tabs 导航显示，值为空时，会被忽略
    icon: 'svg-name'              用于 sidebar 显示的 ICON，对应 icons/svg/ 下的图标名称
    activeMenu: '/example/list'   如果设值，在激活当前路由后，sidebar 会高亮 activeMenu 所对应的菜单项
    keepAlive: false              当值为 false 时，该路由所对应的组件将不会被 <keep-alive> 缓存
    authorized: false             是否鉴权（仅对于 asyncRoutes 动态路由来说），当值为 false 时忽略
  }
 */

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
export const constantRoutes = [
  {
    path: '/user',
    component: UserLayout,
    redirect: '/user/login',
    children: [
      {
        name: 'Login',
        path: '/user/login',
        component: () => import('@/views/user/login')
      },
      {
        name: 'SwitchStore',
        path: '/user/switch-store',
        component: () => import('@/views/user/switch-store')
      },
      {
        name: 'Register',
        path: '/user/register',
        component: () => import('@/views/user/register')
      },
      {
        name: 'SignContract',
        path: '/user/sign-contract',
        component: () => import('@/views/user/sign-contract')
      },
      {
        name: 'SignContractResult',
        path: '/user/sign-contract-result',
        component: () => import('@/views/user/sign-contract-result')
      },
      {
        path: '/403',
        component: () => import('@/views/403'),
      },
      {
        path: '/404',
        component: () => import('@/views/404'),
      }
    ]
  },
  {
    path: '/external',
    component: EmptyLayout,
    children: [
      {
        name: 'PrintTicket',
        path: '/external/print-ticket',
        component: () => import('@/views/invoice/qrcode/print-ticket')
      }
    ]
  },
  // 帮助中心布局
  {
    path: '/help-center',
    component: HelpLayout,
    children: [
      {
        name: 'InstallDownload',
        path: '/help-center/install-download',
        component: () => import('@/views/help-center/install-download')
      },
      {
        name: 'Handbook',
        path: '/help-center/handbook',
        component: () => import('@/views/help-center/handbook')
      }
    ]
  },
  {
    path: '/',
    component: Layout,
    // 这里不配置 recirect , 由系统权限自动控制跳转
  },
]


/**
 * 动态路由，系统根据用户访问权限动态添加
 */
export const asyncRoutes = [
  {
    path: '/invoice',
    component: Layout,
    redirect: '/invoice/online',
    name: 'Invoice',
    meta: { title: '开票管理', icon: 'menu-invoice' },
    children: [
      {
        path: '/invoice/online',
        name: 'OnlineInvoice',
        component: () => import('@/views/invoice/online'),
        meta: { title: '单张开票' }
      },
      {
        path: '/invoice/qrcode',
        name: 'QRCodeInvoice',
        component: () => import('@/views/invoice/qrcode'),
        meta: { title: '扫码开票' }
      },
      {
        path: '/invoice/audit',
        name: 'AuditInvoice',
        component: () => import('@/views/invoice/audit'),
        meta: { title: '开票审核' }
      }
    ]
  },

  {
    path: '/query',
    component: Layout,
    redirect: '/query/invoice',
    name: 'Query',
    meta: { title: '查询统计', icon: 'menu-stat' },
    children: [
      {
        path: '/query/invoice',
        name: 'InvoiceRecord',
        component: () => import('@/views/query/invoice'),
        meta: { title: '发票明细' }
      },
      {
        path: '/query/invoice-stat',
        name: 'InvoiceStat',
        component: () => import('@/views/query/invoice-stat'),
        meta: { title: '发票统计' }
      }
    ]
  },

  {
    path: '/group',
    component: Layout,
    redirect: '/group/client-store',
    name: 'Group',
    meta: { title: '集团管理', icon: 'menu-group' },
    children: [
      {
        path: '/group/client-store',
        name: 'ClientStore',
        component: () => import('@/views/group/client-store'),
        meta: { title: '门店管理' },
      },
      {
        path: '/group/employee',
        name: 'Employee',
        component: () => import('@/views/group/employee'),
        meta: { title: '员工管理' }
      },
      {
        path: '/group/authority',
        name: 'Authority',
        component: () => import('@/views/group/authority'),
        meta: { title: '权限管理' },
      },
      {
        path: '/group/authority/add-rule',
        name: 'AddRule',
        component: () => import('@/views/group/authority/add-rule'),
        meta: { title: '新增权限组', activeMenu: '/group/authority', authorized: false },
        hidden: true,
      },
      {
        path: '/group/authority/edit-rule',
        name: 'EditRule',
        component: () => import('@/views/group/authority/edit-rule'),
        meta: { title: '编辑权限组', activeMenu: '/group/authority', authorized: false },
        hidden: true,
      }
    ]
  },

  {
    path: '/device-project',
    component: Layout,
    redirect: '/device-project/device',
    name: 'DeviceProject',
    meta: { title: '设备编码', icon: 'menu-device' },
    children: [
      {
        path: '/device-project/device',
        name: 'TaxDevice',
        component: () => import('@/views/device-project/tax-device'),
        meta: { title: '开票设备' }
      },
      {
        path: '/device-project/project',
        name: 'Project',
        component: () => import('@/views/device-project/project'),
        meta: { title: '商品编码' }
      },
    ]
  },

  {
    path: '/collection-center',
    component: Layout,
    redirect: '/collection-center/pos/collection-records',
    name: 'DeviceProject',
    meta: { title: '收款中心', icon: 'menu-collection-center', authorized: false },
    children: [
      {
        path: '/collection-center/pos/collection-records',
        name: 'PosCollectionRecords',
        component: () => import('@/views/collection-center/pos/collection-records'),
        meta: { title: 'POS收款明细', authorized: false }
      },
      {
        path: '/collection-center/pos/refund-records',
        name: 'PosRefundRecords',
        component: () => import('@/views/collection-center/pos/refund-records'),
        meta: { title: 'POS退款明细', authorized: false }
      },
      {
        path: '/collection-center/pos/prelicense-records',
        name: 'PosPrelicenseRecords',
        component: () => import('@/views/collection-center/pos/prelicense-records'),
        meta: { title: '预授权明细', authorized: false }
      },
    ]
  },

  {
    path: '/system',
    component: Layout,
    redirect: '/system/settings',
    name: 'System',
    meta: { title: '系统设置', icon: 'menu-system' },
    alwaysShow: false,
    children: [
      {
        path: '/system/settings',
        name: 'SystemSettings',
        component: () => import('@/views/system/settings'),
        meta: { title: '系统设置' }
      },
    ]
  },

  // 此路由必须最后一个配置！
  { path: '*', redirect: '/404' }
]

const createRouter = () => new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
