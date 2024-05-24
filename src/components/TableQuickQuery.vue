<script setup>
import storage from "@/util/storage.js";
import {bus} from "@/js/queue.js";
import SQLTable from "@/components/SQLTable.vue";
import {onActivated, reactive, ref, toRefs} from "vue";
import _ from 'lodash'
const result = ref([])
const fields = ref([])
const sql = ref()
const errText = ref()
const count = ref(0)

let page = 1;
let size = 10;

function reset(){
  errText.value = ''
}
function rebuildSQL(sql, page, size){
    if(!sql.includes('limit')){
       sql += ` limit ${(page - 1) * size}, ${size}`
    }
    return sql
}
function countSQL(sql1) {
  return `select count(*) from (${sql1.replace(/limit.+/, '')}) as t`;
}
const queryData = (code, params, page, size) => {
  if(!code){
    return;
  }
  console.log('startQueryData,code', code, page,size)
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
      sql1 = sql1.replace(/where.+/, '')
    }else{
      sql1 = sql1.replaceAll('{}', params);
      console.log('replaced', sql1)
    }
  }
  console.log('queryData', sql1)
  sql.value = sql1
  mysql.query(rebuildSQL(sql1, page, size), (err, result1, fields1) => {
    if(err){
      errText.value = err
      result.value = []
      fields.value = []
      return
    }else{
      errText.value = null
    }
    if(result1 && fields1) {
      mysql.query(countSQL(sql1), (err2, result2, fields2)=>{
        if(err2){
          errText.value = err2
          return
        }else{
          errText.value = null
        }
        count.value = result2[0]['count(*)']
        result.value = result1;
        fields.value = fields1;
        console.log('final: count=', count.value)
      }, filter[0].dbConf._id)
    }
  }, filter[0].dbConf._id);
}
const inputChanged = (text)=>{
  console.log('table QuickQueryInputChanged:')
  queryData(window.utoolsCode, text, page, size);
}
bus.on('_changeCode_', (obj)=>{
  console.log('page...', page, size)
  queryData(window.utoolsCode, null, page, size);
})
bus.on('_inputChanged_', ( obj)=>{
  console.log('tableQuickQuery: bus.on(onInputChanged):',obj)
  const {tab, text} = obj;
  if(tab === 'tableQuickQuery'){
    console.log('text', text)
    inputChanged(text)
  }
})
const pageChanged = (newPage)=>{
  page = newPage
  queryData(window.utoolsCode, window.utoolsInput, page, size);
}
const sizeChanged = (newSize)=>{
  size = newSize
  queryData(window.utoolsCode, window.utoolsInput, page, size);
}
</script>

<template>
  <div>
    <div v-if="!sql">无数据，请在utools中输入预查询关键字</div>
    <div>{{sql}}</div>
    <div>
      <SQLTable :result="result" :fields="fields" :error-text="errText" :count="count" @page-changed="pageChanged" @size-changed="sizeChanged"></SQLTable>
    </div>
  </div>
</template>

<style scoped>
</style>