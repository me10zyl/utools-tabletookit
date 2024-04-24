<script>
import Table from "@/components/Table.vue";
import TableConf from "@/components/TableConf.vue";
import TableQuickQuery from "@/components/TableQuickQuery.vue";

export default {
  name: 'MainBoard',
  components: {TableConf, TableQuickQuery, Table},
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
        <v-tab value="tableQuickQuery">
          <v-tooltip text="构建快速查询SQL：如根据某个表的条件快速查询某个表的数据">
            <template v-slot:activator="{ props }">
              <span v-bind="props">预查询</span>
            </template>
          </v-tooltip>
        </v-tab>
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
          <v-window-item value="tableQuickQuery">
            <TableQuickQuery ref="tableQuickQuery"/>
          </v-window-item>

        </v-window>
      </v-card-text>
    </v-card>
  </div>
</template>
