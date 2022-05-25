// All components
import {
  // Pagination,
  Dialog,
  Autocomplete,
  Dropdown,
  DropdownMenu,
  DropdownItem,
  // Menu,
  // Submenu,
  // MenuItem,
  // MenuItemGroup,
  Input,
  InputNumber,
  Radio,
  RadioGroup,
  RadioButton,
  Checkbox,
  CheckboxButton,
  CheckboxGroup,
  // Switch,
  Select,
  Option,
  OptionGroup,
  Button,
  ButtonGroup,
  Table,
  // TableColumn,
  DatePicker,
  // TimeSelect,
  // TimePicker,
  Popover,
  Tooltip,
  MessageBox,
  // Breadcrumb,
  // BreadcrumbItem,
  Form,
  FormItem,
  Tabs,
  TabPane,
  // Tag,
  // Tree,
  Alert,
  Notification,
  // Slider,
  Loading,
  Icon,
  Row,
  Col,
  // Upload,
  // Progress,
  // Spinner,
  Message,
  // Badge,
  Card,
  // Rate,
  // Steps,
  // Step,
  // Carousel,
  // Scrollbar,
  // CarouselItem,
  Collapse,
  CollapseItem,
  Cascader,
  // ColorPicker,
  // Transfer,
  Container,
  Header,
  Aside,
  Main,
  Footer,
  // Timeline,
  // TimelineItem,
  Link,
  // Divider,
  // Image,
  // Calendar,
  // Backtop,
  // InfiniteScroll,
  // PageHeader,
  CascaderPanel,
  // Avatar,
  // Drawer,
  // CollapseTransition,
} from 'element-ui'
import locale from 'element-ui/lib/locale'
import Pagination from '@/components/element-ui/pagination'
import TableColumn from '@/components/element-ui/table-column'

const components = [
  // Pagination,
  Dialog,
  Autocomplete,
  Dropdown,
  DropdownMenu,
  DropdownItem,
  // Menu,
  // Submenu,
  // MenuItem,
  // MenuItemGroup,
  Input,
  InputNumber,
  Radio,
  RadioGroup,
  RadioButton,
  Checkbox,
  CheckboxButton,
  CheckboxGroup,
  // Switch,
  Select,
  Option,
  OptionGroup,
  Button,
  ButtonGroup,
  Table,
  // TableColumn,
  DatePicker,
  // TimeSelect,
  // TimePicker,
  Popover,
  Tooltip,
  MessageBox,
  // Breadcrumb,
  // BreadcrumbItem,
  Form,
  FormItem,
  Tabs,
  TabPane,
  // Tag,
  // Tree,
  Alert,
  Notification,
  // Slider,
  Icon,
  Row,
  Col,
  // Upload,
  // Progress,
  // Spinner,
  Message,
  // Badge,
  Card,
  // Rate,
  // Steps,
  // Step,
  // Carousel,
  // Scrollbar,
  // CarouselItem,
  Collapse,
  CollapseItem,
  Cascader,
  // ColorPicker,
  // Transfer,
  Container,
  Header,
  Aside,
  Main,
  Footer,
  // Timeline,
  // TimelineItem,
  Link,
  // Divider,
  // Image,
  // Calendar,
  // Backtop,
  // InfiniteScroll,
  // PageHeader,
  CascaderPanel,
  // Avatar,
  // Drawer,
  // CollapseTransition,
]

export default function install(Vue, opts = {}) {
  locale.use(opts.locale)
  locale.i18n(opts.i18n)

  components.forEach(component => {
    Vue.component(component.name, component)
  })

  // custom components
  Vue.component('ElPagination', Pagination)
  Vue.component('ElTableColumn', TableColumn)

  // Vue.use(InfiniteScroll)
  Vue.use(Loading.directive)

  Vue.prototype.$ELEMENT = {
    size: opts.size || '',
    zIndex: opts.zIndex || 2000
  }

  function $alert(msg, t, opt, invoke) {
    let title = t
    let options = opt

    if (title === undefined && options === undefined) {
      title = '提示'
      options = { type: 'warning', showClose: false }
    } else if (typeof title === 'object') {
      options = title
      title = '提示'
    }

    return MessageBox[invoke](msg, title, options)
  }

  // 重写 Vue.prototype.$alert, Vue.prototype.$confirm 方法，加入默认 title, icon
  Vue.prototype.$alert = function alert(msg, title, options) {
    return $alert(msg, title, options, 'alert')
  }

  Vue.prototype.$confirm = function confirm(msg, title, options) {
    return $alert(msg, title, options, 'confirm')
  }

  Vue.prototype.$loading = Loading.service
  Vue.prototype.$msgbox = MessageBox
  // Vue.prototype.$alert = MessageBox.alert
  // Vue.prototype.$confirm = MessageBox.confirm
  Vue.prototype.$prompt = MessageBox.prompt
  Vue.prototype.$notify = Notification
  Vue.prototype.$message = Message
}
