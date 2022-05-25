<template>
  <el-dialog class="modal-wxcode" width="500px" :title="title" :visible="visible" @close="$emit('close')">
    <el-image :src="wxcodeURL" fit="fill" v-loading="loading">
      <div slot="error" class="image-slot">
        <i class="el-icon-picture-outline"></i>
      </div>
    </el-image>
  </el-dialog>
</template>

<script>
import { Image } from 'element-ui'
import { debounce } from 'lodash'
import { createWechatCode } from '@/services/user'

export default {
  name: 'WxcodeModal',
  components: { ElImage: Image },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: '绑定微信'
    },
    // 绑定码类型，1普通绑定，2换绑
    type: {
      type: Number,
      default: 1
    },
    // 用于生成微信码的员工ID，不传时，后端默认取当前登录用户
    employeeId: Number,
  },
  data() {
    return {
      loading: false,
      wxcodeURL: null
    }
  },
  watch: {
    visible(newVal) {
      // 显示时，如果码为空，去重新拉取微信码，避免请求出错时，再次显示弹窗而没有重新去拉取
      if (newVal === true && !this.wxcodeURL) {
        this.getWechatCode(this.employeeId)
      }
    },
    employeeId(newVal) {
      this.wxcodeURL = null
      this.getWechatCode(newVal)
    }
  },
  methods: {
    getWechatCode: debounce(function create(employeeId) {
      this.loading = true

      createWechatCode(employeeId, this.type)
        .then(res => {
          if (res) {
            this.wxcodeURL = res
          }
        })
        .finally(() => {
          this.loading = false
        })
    }, 100)
  }
}
</script>

<style lang="scss" scoped>
  .modal-wxcode {
    /deep/ .el-dialog__body {
      text-align: center;
    }

    /deep/ .image-slot {
      font-size: 44px;
    }
  }
</style>
