<script>
import Table from "@/components/Table.vue";
import TableConf from "@/components/TableConf.vue";

export default {
  name: 'MainBoard',
  components: {TableConf, Table},
  data() {
    return {
      tab: null
    }
  },
  methods: {
    changeTab(val) {
      // console.log('changeTab', this.$refs[val])
      if (this.$refs[val] && typeof this.$refs[val].$options.changeTab === 'function') {
        let $options = this.$refs[val].$options;
        $options.changeTab.call(this.$refs[val], val);
      }
    }
  }
}
</script>

<template>
  <div>
    <v-card>
      <v-tabs
          bg-color="primary"
          @update:model-value="changeTab"
          v-model="tab">
        <v-tab value="table">表结构查询</v-tab>
        <v-tab value="tableConf">数据库配置</v-tab>
      </v-tabs>

      <v-card-text>
        <v-window v-model="tab">
          <v-window-item value="table">
            <Table ref="table"/>
          </v-window-item>
          <v-window-item value="tableConf">
            <TableConf ref="tableConf"/>
          </v-window-item>

        </v-window>
      </v-card-text>
    </v-card>
  </div>
</template>
