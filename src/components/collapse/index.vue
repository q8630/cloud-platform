<!-- 查询折叠面板组件 -->
<template>
  <el-collapse class="custom-collapse" v-model="activeItems">
    <el-collapse-item name="item1">
      <slot />
    </el-collapse-item>

    <div class="toolbar">
      <div class="btn" @click="_onActive">
        <template v-if="active"><p class="arrow">︽</p> 收起筛选项</template>
        <template v-else>更多筛选项 <p class="arrow">︾</p></template>
      </div>
    </div>
  </el-collapse>
</template>

<script>
export default {
  name: 'Collapse',

  data() {
    return {
      activeItems: []
    }
  },

  computed: {
    // 激活状态
    active: {
      get() {
        return this.activeItems[0] && this.activeItems[0] === 'item1'
      },
      set() {}
    }
  },

  methods: {
    // 激活面板
    _onActive() {
      if (!this.active) {
        this.activeItems = ['item1']
        this.active = true
        return
      }
      this.activeItems = []
    }
  }
}
</script>

<style lang="scss" scoped>
  @import "~@/styles/variables.scss";

  .custom-collapse {
    border: none;
    background: #F5F7FA;

    :global(.el-collapse-item__header) {
      display: none;
    }

    .toolbar {
      width: 100%;
      height: 28px;
      color: $color-link;
      font-size: 12px;
      text-align: center;
      line-height: 14px;
      padding: 0;

      .btn {
        display: inline-block;
        cursor: pointer;
      }

      .arrow {
        margin: 0;
        font-size: 16px;
      }
    }

    :global(.el-collapse-item__wrap) {
      border: none;
    }

    :global(.el-collapse-item__content) {
      background: #F5F7FA;
      padding: 0;
    }
  }
</style>
