<template>
  <div class="page-system-settings">
    <user-info />
    <enterprise-info />
  </div>
</template>

<script>
import UserInfo from './user-info'
import EnterpriseInfo from './enterprise-info'

export default {
  name: 'SystemSettings',
  components: { UserInfo, EnterpriseInfo },
}
</script>

<style lang="scss" scoped>
  @import "~@/styles/variables.scss";

  :global(.el-card + .el-card) {
    margin-top: $padding-spacing;
  }

  /deep/ .el-card__body {
    font-size: 13px;

    dl {
      margin: 0;
      line-height: 28px;
    }
    dt {
      min-width: 66px;
      text-align: right;
    }
    dd {
      padding-left: 5px;
      margin-left: 0;
    }
    dt, dd {
      display: inline-block;
    }
  }
</style>
