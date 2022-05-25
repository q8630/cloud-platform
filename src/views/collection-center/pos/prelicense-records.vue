<template>
  <frame-wrapper :src="frameSrc" />
</template>

<script>
import FrameWrapper from './frame-wrapper'

export default {
  name: 'PosPrelicenseRecords',
  components: { FrameWrapper },
  data() {
    return {
      frameSrc: APP_ENV === 'PROD' || APP_ENV === 'PREPROD' ? 'https://baidu.com' : 'https://baidu.com'
    }
  }
}
</script>
