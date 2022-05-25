<template>
  <el-card class="enterprise-info" shadow="never">
    <div slot="header">
      企业信息
    </div>

    <el-form inline v-if="editing" class="form-wrapper" ref="form" :model="formData" :rules="rules" v-loading="loading">
      <el-row :gutter="16">
        <el-col :span="10">
          <el-form-item label="企业名称">
            <el-input disabled :value="formData.name" />
          </el-form-item>

          <el-form-item label="企业税号">
            <el-input disabled :value="formData.tax_code" />
          </el-form-item>

          <el-form-item prop="legal_person_name" label="法人代表">
            <el-input name="legal_person_name" v-model="formData.legal_person_name" placeholder="请输入法人代表" />
          </el-form-item>

          <el-form-item prop="email" label="申请人邮箱">
            <el-input name="email" v-model="formData.email" placeholder="请输入申请人邮箱地址" />
          </el-form-item>

          <el-form-item prop="region_code" label="所属省市区">
            <el-cascader
              ref="cascader"
              v-model="modelRegion"
              :options="areaJson"
              placeholder="请选择所属省市区" />
          </el-form-item>
        </el-col>

        <el-col :span="14">
          <el-form-item label="注册日期">
            <el-input disabled :value="dateFormat(formData.created_at)" />
          </el-form-item>

          <el-form-item label="营业执照" class="form-item-licence">
            <el-upload
              action=""
              name="sell_licence_image"
              list-type="picture-card"
              accept="image/png, image/jpeg"
              :file-list="fileList"
              :limit="1"
              :auto-upload="false"
              :on-preview="handlePicturePreview"
              :on-change="handleFileChange"
              :on-remove="handleFileRemove"
              :on-exceed="handleFileExceed"
            >
              <i class="el-icon-plus"></i>
              <p slot="tip" class="el-upload__tip">仅支持jpg/png格式图片，大小不超过3MB</p>
            </el-upload>
          </el-form-item>
        </el-col>
      </el-row>

      <div class="footer">
        <el-button @click="handleCancel">取 消</el-button>
        <el-button type="primary" @click="handleSubmit">保 存</el-button>
      </div>
    </el-form>

    <el-row v-else class="info-wrapper" :gutter="20" v-loading="loading">
      <el-col :span="6">
        <dl>
          <dt>企业名称：</dt>
          <dd>{{enterpriseInfo.name}}</dd>
        </dl>
        <dl>
          <dt>企业税号：</dt>
          <dd>{{enterpriseInfo.tax_code}}</dd>
        </dl>
        <dl>
          <dt>注册日期：</dt>
          <dd>{{dateFormat(enterpriseInfo.created_at)}}</dd>
        </dl>
        <dl>
          <dt>法人代表：</dt>
          <dd>{{enterpriseInfo.legal_person_name}}</dd>
        </dl>
        <dl>
          <dt>邮箱：</dt>
          <dd>{{enterpriseInfo.email}}</dd>
        </dl>
        <dl>
          <dt>所属地区：</dt>
          <dd>{{enterpriseInfo.areas}}</dd>
        </dl>
        <dl style="margin-top: 10px;">
          <dt></dt>
          <dd><el-button plain type="primary" @click="doEdit">修改</el-button></dd>
        </dl>
      </el-col>

      <el-col :span="6">
        <dl>
          <dt>注册协议：</dt>
          <dd><a href="/agreements/register.html" target="_brank">查看</a></dd>
        </dl>
        <dl>
          <dt>隐私政策：</dt>
          <dd><a href="/agreements/privacy.html" target="_brank">查看</a></dd>
        </dl>
        <dl>
          <dt>服务协议：</dt>
          <dd><a href="/agreements/service.html" target="_brank">查看</a></dd>
        </dl>
        <dl>
          <dt>营业执照：</dt>
          <dd><el-button type="text" @click="handlePicturePreview">查看</el-button></dd>
        </dl>
        <dl v-if="enterpriseInfo.need_contract === 0 && enterpriseInfo.contract_url">
          <dt>电子合同：</dt>
          <dd><a :href="enterpriseInfo.contract_url" target="_brank">查看</a></dd>
        </dl>
      </el-col>
    </el-row>

    <el-dialog class="dialog-picture-preview" :visible.sync="pictureDialogVisible">
      <img width="100%" :src="imageUrl" alt="">
    </el-dialog>
  </el-card>
</template>

<script>
import { Upload } from 'element-ui'
import dayjs from 'dayjs'
import { validateStringLength as validator, regionCodeToArray } from '@/utils'
import { REG_EMAIL } from '@/utils/constants/regexp'
import areaJson from '@/utils/area-code.json'
import { fetchEnterpriseInfo, updateEnterpriseInfo } from '@/services/system/settings'
import mixinFetch from '@/views/mixins/mixin-fetch'

export default {
  name: 'EnterpriseInfo',
  components: { ElUpload: Upload },
  mixins: [ mixinFetch ],
  data() {
    return {
      areaJson, // 省市区JSON数据
      enterpriseInfo: {}, // 企业信息
      editing: false, // 是否编辑标识
      pictureDialogVisible: false, // 图片预览弹窗显示标识
      imageUrl: '', // 图片预览的图片URL
      fileList: [], // el-upload 用的 file-list
      modelRegion: [], // 省市省三级联动用的 model
      formData: {}, // formData
      rules: { // form rules
        legal_person_name: [{ required: true, max: 50, validator, message: '必填，长度不超过50位（汉字占2位）' }],
        email: [{ pattern: REG_EMAIL, message: '请输入正确的邮箱地址' }],
      }
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    dateFormat(date) {
      return date ? dayjs.unix(+date).format('YYYY年MM月DD日') : '--'
    },
    fetchData() {
      this._request(fetchEnterpriseInfo)()
        .then(res => {
          this.enterpriseInfo = res || {}
        })
    },
    handlePicturePreview(file) {
      // 兼容el-upload的图片预览
      if (file && file.url) {
        this.imageUrl = file.url
      } else {
        this.imageUrl = this.enterpriseInfo.sell_licence_image
      }

      this.pictureDialogVisible = true
    },
    handleFileChange(file, fileList) {
      this.fileList = fileList
    },
    handleFileRemove(file, fileList) {
      this.fileList = fileList
    },
    handleFileExceed() {
      this.$message.error('只允许上传单张图片，请删除后再选取图片')
    },
    doEdit() {
      const enterpriseInfo = this.enterpriseInfo

      this.editing = true
      this.formData = { ...enterpriseInfo }
      // 设置省市区3级联动用的 v-model 值
      this.modelRegion = regionCodeToArray(enterpriseInfo.region_code)
      // 设置 el-upload 组件用的 fileList
      if (enterpriseInfo.sell_licence_image) {
        this.fileList = [{ name: '', url: enterpriseInfo.sell_licence_image }]
      }
    },
    handleCancel() {
      this.editing = false
      // 清空 el-upload 组件用的 fileList
      this.fileList = []
    },
    handleSubmit() {
      const $form = this.$refs.form

      $form.validate(valid => {
        if (valid) {
          const formData = new FormData($form.$el)
          formData.append('region_code', this.modelRegion[2])

          this._request(updateEnterpriseInfo)(formData)
            .then(res => {
              this.editing = false
              // 更新数据到 this.enterpriseInfo
              this.enterpriseInfo = res
              this.$message.success('数据修改成功')
            })
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
  @import "~@/styles/variables.scss";

  .company-logo-wrapper {
    width: 180px;

    .logo {
      width: 90px;
      height: 90px;
      margin: 15px 0;
      background: #ededed;
      display: flex;
      justify-content: center;
      align-items: center;

      img {
        width: 100%;
      }
    }
  }

  .info-wrapper {
    // width: 620px;

    .el-col-6 {
      min-width: 300px;
    }

    .el-button--text.el-button--mini {
      font-size: 13px;
    }

    a {
      font-size: 13px;
      text-decoration: none;
      color: $color-link;

      &:hover {
        color: $color-link--hover;
      }
    }
  }

  .form-wrapper {
    width: 820px;

    /deep/ .el-form-item__label {
      width: 84px;
      font-size: 13px;
    }

    /deep/ .el-form-item__content {
      width: 206px;
    }

    /deep/ .el-cascader {
      width: 100%;
    }

    .form-item-licence {
      width: 100%;
      /deep/ .el-form-item__content {
        width: calc(100% - 100px);
      }
    }

    .footer {
      padding-left: 84px;
    }
  }

  .dialog-picture-preview {
    /deep/ .el-dialog {
      max-width: 700px;
    }

    /deep/ .el-dialog__header {
      border-bottom: none;
    }
  }
</style>
