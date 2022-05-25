<template>
  <el-dialog
    :visible="visible"
    width="400px"
    class="service-wrap"
    @close="$emit('close')"
    :append-to-body="true"
  >
    <div class="content">
      <p class="title">方式一. 关注公众号</p>
      <p class="desc">获取产品最新动态，回复数字「0」进入人工服务</p>
      <img src="../assets/yunpiao-b-qrcode.png" alt="">
      <div class="line" />

      <p class="title">方式二. 在线沟通</p>
      <a class="desc link" :href="serviceUrl" target="_blank">点击在线联系客服</a>
      <div class="line" />

      <p class="title">方式三. 致电我们</p>
      <p class="desc link">400-127-2200 (9:00-21:00)</p>
    </div>
  </el-dialog>
</template>

<script>
import qs from 'qs'

export default {
  name: 'Service',

  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      serviceUrl: ''
    }
  },

  created() {
    this.$store.dispatch('business/getClientInfo').then(res => {
      const {
        applicant_phone: phone,
        email,
        client_nickname: nickname,
        legal_person_name: legalName,
        user_id: userId,
        tax_code: taxCode,
        name
      } = res || {}

      // 智齿客服系统链接
      const params = {
        groupId: 'b525472c3476493c99ab5a9900b9dbfc',
        sysNum: 'b2acc5f8c1fe4f3c869c4352b04113b5',
        robotFlag: 7,
        titleFlag: 2,
        customTitle: '云票儿智税云',
        tel: phone, // 申请人
        email: email,
        uname: nickname, // 商户昵称
        realname: legalName, // 法人姓名
        customerFields: JSON.stringify({
          customField21: userId,
          customField24: taxCode, // 税号
          customField27: name, // 当前门店名称
          customField35: '云票儿智税云'
        })
      }
      this.serviceUrl = `https://zc.kf.gplqdb.com/chat/h5/index.html?${qs.stringify(params)}`
    })
  }
}
</script>

<style lang="scss" scoped>
@import "~@/styles/variables.scss";

.service-wrap {
  .content {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  p {
    margin: 0;
    line-height: 1;
  }

  :global(.el-dialog__header) {
    border-bottom: none;
  }

  .title {
    font-weight: 600;
  }

  .desc {
    color: #606266;
    font-size: 14px;
    margin: 10px 0;
  }

  .link {
    color: $color-primary;
    line-height: 1;
    text-decoration: none;
  }

  .line {
    height: 1px;
    width:340px;
    background-color: #EBEEF5;
    margin: 22px 0 27px 0;
  }
}
</style>
