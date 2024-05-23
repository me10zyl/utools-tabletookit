<script setup>
import storage from "@/util/storage.js";
import {bus} from "@/js/queue.js";
import SQLTable from "@/components/SQLTable.vue";
import {onActivated, ref} from "vue";
import _ from 'lodash'

const result = ref([])
const fields = ref([])
const sql = ref()
const errText = ref()
const size = ref(20)
const page = ref(1)

function reset(){
  console.log('reset')
  result.value.splice(0, result.value.length)
  fields.value.splice(0, fields.value.length)
  errText.value = ''
}
function rebuildSQL(sql){
    if(!sql.includes('limit')){
       sql += ` limit ${(page.value - 1) * size.value}, ${size.value}`
    }
    return sql
}
const queryData = (code, params) => {
  if(!code){
    return;
  }
  console.log('startQueryData,code=', code)
  let list = storage.quickQueryStore().getList()
  console.log(list, 'list')
  let filter = list.filter(e => e.keyword === code.trim());
  if (filter.length === 0) {
    console.log('not found keyword:' + code.trim())
    return
  }
  reset()
  let sql1 = filter[0].sql;
  console.log('prepared', sql1)
  sql.value = sql1
  if(sql1.includes('{}')){
    if(!params){
      console.log('no params')
      return;
    }else{
      sql1 = sql1.replace('{}', params);
      console.log('replaced', sql1)
    }
  }
  console.log('queryData', sql1)
  sql.value = sql1
  mysql.query(rebuildSQL(sql1), (err, result1, fields1) => {
    if(err){
      console.log('errText', err)
      errText.value = err
      return
    }else{
      errText.value = null
    }
    console.log('result1', result1)
    if(result1 && fields1) {
      console.log('result2222')
      result.value = result1;
      fields.value = fields1;
    }
  }, filter[0].dbConf._id);
}


const inputChanged = (text)=>{
  console.log('table QuickQueryInputChanged:')
  queryData(window.utoolsCode, text);
}

bus.on('_changeCode_', (obj)=>{
  queryData(window.utoolsCode);
})
bus.on('_inputChanged_', ( obj)=>{
  console.log('tableQuickQuery: bus.on(onInputChanged):',obj)
  const {tab, text} = obj;
  if(tab === 'tableQuickQuery'){
    console.log('text', text)
    inputChanged(text)
  }
})
// bus.on('changeTab', (val) => {
//   if (val === 'tableQuickQuery') {
//     utools.setSubInput(({text}) => {
//       window.onInputChanged(text);
//     }, 'SQL预查询参数', true);
//     return true
//   }
//   return false
// })

onActivated(()=>{
  console.log('activited')
})
</script>

<template>
  <div>
    <div v-if="!sql">无数据，请在utools中输入预查询关键字</div>
    <div>{{sql}}</div>
    <SQLTable :result="result" :fields="fields" :error-text="errText"></SQLTable>
  </div>
</template>

<style scoped>

</style>