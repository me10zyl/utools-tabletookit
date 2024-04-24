<script>
export default {
  name: 'TableQuickQuery'
}
</script>

<template>
<div>

  <v-card>
    <template v-slot:title>
      <span class="font-weight-black">快速查询顾客</span>
    </template>
    <v-card-text>
      select * from eq_mall_info where mall_id = 9014 limit 10
    </v-card-text>
  </v-card>
</div>
</template>

<style scoped>

</style>