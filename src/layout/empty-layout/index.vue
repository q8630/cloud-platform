<template>
  <router-view :key="key" />
</template>

<script>
export default {
  name: 'EmptyLayout',
  computed: {
    key() {
      return this.$route.path
    }
  }
}
</script>
