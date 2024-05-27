<script>

import storage from "@/util/storage.js";
import hook from "@/util/hook.js";

export default {
  name: 'TableQuickQueryConf',
  data: () => {
    return {
      showAlert: false,
      alertText : '',
      mode: 'list',
      list: [],
      submitData: {
        keyword: '',
        desc: '',
        sql: '',
        dbConf: '',
        index : ''
      },
      rules: [
        value => {
          if (value) return true
          return '必填'
        }
      ],
    }
  },
  mounted: function () {
    this.lists()
  },
  computed: {

  },
  methods: {
    dbConfs(){
      let dbConfs = storage.getDbConfs()
      return dbConfs.map(e=>{
        return {
          label: e.user + '@' + e.host + ':' + e.port,
          value: e
        }
      })
    },
    alert(text){
      this.showAlert = true
      this.alertText = text
      setTimeout(()=>{
        this.showAlert = false
      }, 1500)
    },
    store() {
      return {
        save(newList) {
          utools.dbStorage.setItem(this.KEY, JSON.stringify(newList))
        },
        getList() {
          let list = utools.dbStorage.getItem(this.KEY)
          if (!list) {
            list = []
          } else {
            list = JSON.parse(list)
          }
          return list
        },
      }
    },
    clickAdd() {
      this.mode = 'add'
      this.submitData = {
        keyword: '',
        desc: '',
        sql: '',
        index: -1,
        dbConf: ''
      }
    },
    lists() {
      let list = storage.quickQueryStore().getList()
      console.log('list', list)
      this.list = list
    },
    edit(v) {
      this.mode = 'edit'
      let list = storage.quickQueryStore().getList()
      let index = list.findIndex(e => e.keyword === v.keyword)
      if (index === -1) {
        this.alert('找不到该关键字')
        return
      }
      if(!storage.checkDbConf(list[index].dbConf._id)){
          list[index].dbConf = ''
      }
      this.submitData = list[index]
      this.submitData.index = index
      console.log('submitdata', this.submitData)
    },
    deletes(v) {
      let list = storage.quickQueryStore().getList()
      let index = list.findIndex(e => e.keyword === v.keyword)
      if (index === -1) {
        this.alert('找不到该关键字')
        return
      }
      list.splice(index, 1)
      storage.quickQueryStore().save(list)
      this.lists()
      hook.reloadFeatures()
    },
    validate() {
      let success = true;
      for (let i in this.submitData) {
        if (typeof(this.submitData[i]) === 'string' && !this.submitData[i]) {
          success = false;
          break;
        }
      }
      return success;
    },
    clickSave() {
      console.log(this.submitData, '提交')
      if (this.validate()) {
        let list = storage.quickQueryStore().getList()
        let index = this.submitData.index;
        if (index === -1) {//新增
          console.log('新增')
          list.splice(0, 0, this.submitData)
        } else {//编辑
          console.log('编辑')
          list[index] = this.submitData
        }
        if(list.filter(e=>list.filter(ee=>ee.keyword === e.keyword).length > 1).length > 0){
          this.alert('关键字重复')
          return
        }
        storage.quickQueryStore().save(list)
        this.mode = 'list'
        this.lists()
        hook.reloadFeatures()
        window.utoolsLastTableQuickQueryCode = null
      }
    }
  }
}
</script>

<template>
  <div class="container mx-auto">
    <v-alert text="关键字重复" type="error" v-if="showAlert"></v-alert>
    <h1 class="text-2xl font-bold mb-4">预查询脚本</h1>
    <div>
      通过提前配置一些常用的SQL，可使用Utools的关键字进行快速查询 <span style="color: red">*</span>使用前请先添加数据库配置
    </div>
    <table class="table-auto w-full" v-if="mode === 'list'">
      <thead v-if="list.length > 0">
      <tr>
        <th class="px-4 py-2 bg-gray-200">关键字</th>
        <th class="px-4 py-2 bg-gray-200">描述</th>
        <th class="px-4 py-2 bg-gray-200">SQL语句</th>
        <th class="px-4 py-2 bg-gray-200">操作</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="s in list">
        <td class="border px-4 py-2">   <span class="ml-3 inline-flex items-center rounded-md bg-gray-50
       px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-purple-500/10">{{ s.keyword }}</span></td>
        <td class="border px-4 py-2">{{ s.desc }}</td>
        <td class="border px-4 py-2">{{ s.sql }}</td>
        <td class="border px-1 py-2 w-21">
          <a @click="edit(s)">编辑</a>
          <a @click="deletes(s)" class="ml-5">删除</a>
        </td>
      </tr>
      </tbody>
    </table>
    <v-form @submit.prevent v-if="mode === 'add' || mode === 'edit'">
      <v-text-field
          name="keyword"
          v-model="submitData.keyword"
          label="*关键字 Utools的查询关键字"
          :rules="rules"
          required
      ></v-text-field>
      <v-text-field
          name="desc"
          v-model="submitData.desc"
          label="*描述"
          :rules="rules"
          required

      ></v-text-field>
      <v-text-field
          name="sql"
          v-model="submitData.sql"
          label="*SQL语句 使用{}代替可传入参数 如 select * from user where user_id = {}"
          :rules="rules"
          required
      ></v-text-field>
      <v-select
          v-model="submitData.dbConf"
          item-title="label"
          item-value="value"
          label="*选择数据库配置"
          :items="dbConfs()"
      >
      </v-select>
      <v-btn class="mb-1 mt-3" @click="clickSave" type="submit">保存</v-btn>
      <v-btn class="mb-1 mt-3 ml-3" @click="mode = 'list'">取消</v-btn>
    </v-form>
    <v-btn class="mb-1 mt-3" @click="clickAdd" v-if="mode === 'list'">新增预查询脚本</v-btn>
  </div>
</template>

<style scoped>

</style>