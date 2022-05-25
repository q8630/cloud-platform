<template>
  <el-dialog width="880px" :visible="visible" :before-close="handleClose" v-loading="loading" class="look-pdf-box">
    <embed
      width="100%"
      height="620px"
      type="application/pdf"
      :src="pdfUrl"/>
  </el-dialog>
</template>

<style lang="scss" scoped>
  .look-pdf-box{
    /deep/ .el-dialog__header{
        padding-top: 36px;
    }
  }
</style>

<script>
export default {
  name: 'LookPdf',
  props: {
    visible: {
      type: Boolean,
      required: true
    },
    model: String
  },
  data() {
    return {
      loading: false,
      pdfUrl: ''
    }
  },
  watch: {
    model(newVal) {
      // console.log('change', newVal)
      this.pdfUrl = newVal
    }
  },
  methods: {
    handleClose() {
      this.$emit('cancel')
    }
  }
}
</script>
