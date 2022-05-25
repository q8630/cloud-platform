<template>
  <el-card class="user-info" shadow="never">
    <div slot="header">
      用户信息
    </div>

    <el-row>
      <el-col>
        <dl>
          <dt>用户名：</dt>
          <dd>{{user_info.nickname}}</dd>
        </dl>
        <dl>
          <dt>手机号：</dt>
          <dd>
            <span class="mobile-wrap">{{moblieEncrypt(user_info.mobile) || '--'}}</span>
            <el-button type="text" @click="toggleMobileModifyModal(true)" style="margin-left: 15px;">{{mobileModalTitle}}</el-button>
          </dd>
        </dl>
        <dl>
          <dt>登录密码：</dt>
          <dd>
            *********
            <el-button type="text" @click="togglePasswordModifyModal(true)" style="margin-left: 40px;">修改密码</el-button>
          </dd>
        </dl>
        <dl style="margin-top: 10px;">
          <dt></dt>
          <dd>
            <el-button plain type="primary" v-if="+user_info.is_bind === 1" @click="handleUnbindWechat">解绑微信</el-button>
            <el-button plain type="primary" v-if="+user_info.is_bind === 0" @click="handleBindWechat">绑定微信</el-button>
          </dd>
        </dl>
      </el-col>
    </el-row>

    <mobile-modify-modal
      :visible="mobileModifyModalVisible"
      :title="mobileModalTitle"
      :type="mobileBindType"
      :mobile="user_info.mobile"
      @cancel="toggleMobileModifyModal(false)"
      @ok="handleMobileChanged" />

    <password-modify-modal
      :visible="passwordModifyModalVisible"
      @cancel="togglePasswordModifyModal(false)"
      @ok="handlePasswordChanged" />

    <wxcode-modal
      :visible="wxcodeModalVisible"
      @close="wxcodeModalVisible = false" />

    <user-unbind-wechat
      :visible="userUnbindWechatVisible"
      @ok="handleBindWechatChanged"
      @cancel="userUnbindWechatVisibleHide"/>
  </el-card>
</template>

<script>
import { mapGetters } from 'vuex'
import MobileModifyModal from './mobile-modify-modal'
import UserUnbindWechat from './user-unbind-wechat'
import PasswordModifyModal from '@/components/password-modify-modal'
import wxcodeModal from '@/components/wxcode-modal'
import { moblieEncrypt } from '@/utils'

const mobileModalTitle = {
  1: '绑定手机',
  2: '更换手机',
  3: '验证手机'
}

export default {
  name: 'UserInfo',
  components: { MobileModifyModal, PasswordModifyModal, wxcodeModal, UserUnbindWechat },
  data() {
    return {
      mobileModifyModalVisible: false,
      passwordModifyModalVisible: false,
      wxcodeModalVisible: false,
      userUnbindWechatVisible: false,
      selectedRow: {},
    }
  },
  computed: {
    ...mapGetters(['user_info']),
    // 1绑定手机，2更换手机，3验证手机
    mobileBindType() {
      const userInfo = this.user_info

      if (userInfo && userInfo.mobile) {
        return userInfo.mobile_state === 1 ? 2 : 3
      }

      return 1
    },
    mobileModalTitle() {
      return mobileModalTitle[this.mobileBindType]
    }
  },
  methods: {
    moblieEncrypt(mobile) {
      return moblieEncrypt(mobile)
    },
    toggleMobileModifyModal(visible) {
      this.mobileModifyModalVisible = typeof visible !== 'undefined' ? visible : !this.mobileModifyModalVisible
    },
    handleMobileChanged(mobile) {
      this.toggleMobileModifyModal(false)
      this.$message.success('操作成功')
      // 更新 store 中的手机号和状态
      this.$store.dispatch('user/setUserInfo', { ...this.user_info, mobile, mobile_state: 1 })
    },
    togglePasswordModifyModal(visible) {
      this.passwordModifyModalVisible = typeof visible !== 'undefined' ? visible : !this.passwordModifyModalVisible
    },
    handlePasswordChanged() {
      this.togglePasswordModifyModal(false)
      this.$message.success('密码修改成功')
    },
    userUnbindWechatVisibleHide() {
      this.userUnbindWechatVisible = false
    },
    handleBindWechatChanged() {
      this.userUnbindWechatVisibleHide()
      this.$message.success('操作成功')
      // 更新 store 中的状态
      this.$store.dispatch('user/setUserInfo', { ...this.user_info, is_bind: 0 })
    },
    handleBindWechat() {
      this.wxcodeModalVisible = true
    },
    handleUnbindWechat() {
      this.userUnbindWechatVisible = true
    }
  }
}
</script>

<style lang="scss" scoped>
  .mobile-wrap {
    display: inline-block;
    width: 70px;
  }
  .el-button--text.el-button--mini {
    font-size: 13px;
  }
</style>
