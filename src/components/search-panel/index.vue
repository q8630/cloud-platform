<template>
  <div class="search-panel">
    <div class="switch">
      <el-button type="primary" :class="show ? 'active' : ''" @click="showPanel">筛选</el-button>
    </div>
  </div>

</template>

<script>
// 收缩面板内容元素
let el = null

export default {
  name: 'SearchPanel',

  data() {
    return {
      show: true
    }
  },

  props: {
    target: String,
    defaultShow: {
      type: Boolean,
      default: true
    }
  },

  mounted() {
    el = document.getElementById(this.target)
    el.classList.add('search-panel-content')

    if (!this.defaultShow) {
      this.show = false
    }
    el.style.display = this.show ? 'block' : 'none'
  },

  methods: {
    showPanel() {
      this.show = !this.show
      el.style.display = this.show ? 'block' : 'none'
    }
  }
}

</script>

<style lang="scss" scoped="">
  .search-panel {
    display: inline-block;
    position: relative;

    .tool-bar {
      margin-bottom: 12px;
    }

    .switch {
      position: relative;

    }
  }
</style>

<style lang="scss">
  .search-panel-content {
    width: 100%;
    padding: 12px;
    background: #F5F7FA;
    margin-top: 15px;
    transition: display 2s;
    -webkit-transition: display 2s;
    position: relative;

    &:before {
      content: '';
      display: block;
      width: 0;
      height: 0;
      position: absolute;
      top: -24px;
      border: 12px solid;
      border-color: transparent transparent #F5F7FA transparent;
    }
  }
</style>
