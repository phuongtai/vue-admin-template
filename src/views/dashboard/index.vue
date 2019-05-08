// eslint-disable-next-line
/* eslint-disable */

<template>
  <div class="dashboard-container">
    <div class="dashboard-text">name : {{ username }}</div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'Dashboard',
  // data() {
  //   return {
  //     username: 'Tai'
  //     }
  // },
  computed: {
    ...mapGetters([
      'username'
    ])
  }
}
</script>

<style lang="scss" scoped>
.dashboard {
  &-container {
    margin: 30px;
  }
  &-text {
    font-size: 30px;
    line-height: 46px;
  }
}
</style>
