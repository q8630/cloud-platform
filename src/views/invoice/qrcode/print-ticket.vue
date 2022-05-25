<template>
  <div class="print-ticket-wrap">
    <div class="tool" ref="tool">
      <el-button type="primary" @click="print">打印</el-button>
    </div>

    <div class="card">
      <img class="border" src="./assets/sawtooth_up.png" alt=""/>
      <div class="content-wrap">
        <p>欢迎光临 <br/> ====================</p>

        <div class="content">
          <p>小票单号：{{ info.code_sn }}</p>
          <p>小票日期：{{ info.created_at }}</p>
          <p>截止日期：{{ info.invalid_at }}</p>

          <table cellSpacing="0">
            <thead>
              <tr>
                <th>名称</th>
                <th>单价</th>
                <th>数量</th>
                <th>金额</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in info.projectList" :key="item.id">
                <td>{{ item.name }}</td>
                <td>{{ item.price }}</td>
                <td>{{ item.total }}</td>
                <td>{{ item.total_price }}</td>
              </tr>
            </tbody>
          </table>
          <p>合计金额（可开票）<span style="float: right;">¥{{ info.order_amount }}</span></p>

          <div class="remark">
            <p>备注：{{ info.remark }}</p>
            <p>企业名称：{{ info.seller_name }}</p>
            <p>请使用微信扫描二维码申请开具电子发票</p>
          </div>
        </div>

        <img class="qrcode" :src="info.qrcode" alt=""/>
        <p>- 云票儿提供技术支持 -</p>
        <svg-icon icon-class="yunpiaoer" class="logo mt-6px" />
      </div>

      <img class="border" src="./assets/sawtooth_down.png" alt=""/>
    </div>
  </div>
</template>

<script>
import { getTicketInfo } from '@/services/invoice/qrcode'
import dayjs from 'dayjs'

export default {
  name: 'PrintTicket',

  data() {
    return {
      info: {}
    }
  },

  created() {
    const { codeSn } = this.$route.query
    if (codeSn) {
      getTicketInfo({
        code_sn: codeSn
      }).then(res => {
        const projectList = []
        res.item_info.forEach(item => {
          // 开票行
          projectList.push({
            ...item,
            type: 1
          })
          const { discount } = item
          // 折扣行处理
          if (discount && discount !== '0.00' && +discount !== 0) {
            projectList.push({
              type: 2,
              name: '折扣',
              total_price: discount // 金额
            })
          }
        })

        this.info = {
          ...res,
          created_at: dayjs.unix(+res.created_at).format('YYYY-MM-DD'),
          invalid_at: dayjs.unix(+res.invalid_at).format('YYYY-MM-DD'),
          projectList
        }
      })
    }
  },

  methods: {
    print() {
      // 打印时隐藏打印按钮
      this.$refs.tool.style.display = 'none'
      window.print()
      this.$refs.tool.style.display = 'block'
    }
  }
}
</script>

<style lang="scss" scoped>
.print-ticket-wrap {
  background-color: rgb(204, 204, 204);
  word-break: break-all;
  width: 176px;
  color: #000000;
  font-size: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;

  p {
    margin: 4px 0;
  }

  .tool {
    margin: 20px;
  }

  .card {
    margin-bottom: 20px;
    width: 172px;
    overflow: hidden;

    .border {
      width: 172px;
      display: block;
    }

    .content-wrap {
      background-color: #ffffff;
      padding: 12px 2px;
      text-align: center;

      .content {
        text-align: left;
        margin-top: 6px;
      }

      table {
        width: 100%;
        margin: 10px 0;
        border-top: 1px dotted rgb(0, 0, 0);

        thead tr {
          white-space: nowrap;
        }

        th, td {
          padding: 4px 0;
          border-bottom: 1px dotted rgb(0, 0, 0);
        }
      }

      .remark {
        margin-top: 8px;
        line-height: 18px;
      }

      .qrcode {
        width: 150px;
        height: 150px;
        margin: 4px 0;
      }

      .logo {
        width: 65px;
        height: 19px;
        margin-top: 8px;
      }
    }
  }
}
</style>
