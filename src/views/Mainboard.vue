<script setup>
import Table from "@/components/Table.vue";
import TableConf from "@/components/TableConf.vue";
import TableQuickQueryConf from "@/components/TableQuickQueryConf.vue";
import hook from "@/util/hook.js";
import {computed, getCurrentInstance, ref, watch, watchEffect} from "vue";
import {bus} from "@/js/queue.js";
import TableQuickQuery from "@/components/TableQuickQuery.vue";

const currentTab = ref('table')
const tabs = [
  {
    name: 'table',
    component: Table,
    code: 'table'
  },
  {
    name: 'tableConf',
    component: TableConf,
    code: 'table-conf'
  },
  {
    name: 'tableQuickQueryConf',
    component: TableQuickQueryConf,
    code: 'table-quick-query-conf'
  },
  {
    name: 'tableQuickQuery',
    component: TableQuickQuery,
    code: 'table-quick-query'
  }
]

const instance = getCurrentInstance();
const ctx = getCurrentInstance().ctx;
function getUtoolsLabelByTab(tab) {
  let filter = tabs.filter(e=>e.name===tab)
  if(filter.length > 0){
    return filter[0].code
  }
}
function getTableNameByCode(code) {
  console.log('tabs', tabs)
  let filter = tabs.filter(e=>e.code===code)
  if(filter.length > 0){
    return filter[0].name
  }
  return 'tableQuickQuery'
}
hook.reloadFeatures()
//输入改变
window.onInputChanged = (text) => {
  console.log('MainBoard: onInputChanged:', text)
  window.utoolsInput = text;
  bus.emit('_inputChanged_', {'tab': currentTab.value, 'text': text})
}
//CODE改变
window.onChangeCode = (code) => {
  console.log('MainBoard:window.onChangeCode', code)
  window.utoolsCode = code;
  currentTab.value = getTableNameByCode(code)
  if(currentTab.value === 'tableQuickQuery'){
    window.utoolsLastTableQuickQueryCode = code;
  }
  console.log('currentTab', currentTab.value)
  bus.emit('_changeCode_', {'tab': currentTab.value, 'code': code})
}


//切换TAB
const changeTab = (val) => {
  console.log('changeTab', val)
  utools.removeSubInput();
  let label = getUtoolsLabelByTab(val)
  if (label) {
    if(label === 'table-quick-query'){
      if(window.utoolsLastTableQuickQueryCode) {
        label = window.utoolsLastTableQuickQueryCode
      }else{
        return
      }
    }
    let a = ['SQL快速查看表信息', 'table-conf']
    a[1] = label
    utools.redirect(a)
  }
}
</script>

<template>
  <div class="main-board">
    <v-card style="height: 100vh">
      <v-tabs
          bg-color="primary"
          @update:model-value="changeTab"
          v-model="currentTab">
        <v-tab value="table">表结构查询</v-tab>
        <v-tab value="tableQuickQuery">预查询结果</v-tab>
        <v-tab value="tableQuickQueryConf">
          <v-tooltip text="构建快速查询SQL：如根据某个表的条件快速查询某个表的数据">
            <template v-slot:activator="{ props }">
              <span v-bind="props">预查询配置</span>
            </template>
          </v-tooltip>
        </v-tab>
        <v-tab value="tableConf">数据库配置</v-tab>
      </v-tabs>

      <v-card-text class="main">
        <v-window v-model="currentTab">
          <v-window-item v-for="tab in tabs" :key="tab.name" :value="tab.name">
            <keep-alive>
              <component :is="tab.component"/>
            </keep-alive>
          </v-window-item>
        </v-window>
      </v-card-text>
    </v-card>
  </div>
</template>

<style scoped>
.main-board{
  height: 100vh;
}
</style>
