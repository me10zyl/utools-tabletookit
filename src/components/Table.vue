<script>
import {basicSetup, EditorView} from "codemirror"
import {sql} from "@codemirror/lang-sql"
import {bus} from "@/js/queue.js";
import lodash from 'lodash'

export default {
  name: 'Table',
  computed: {
    items() {
      let val = this.tables;
      let items = [];
      let dbNames = {};
      for (let i = 0; i < val.length; i++) {
        if (!dbNames[val[i].dbName]) {
          dbNames[val[i].dbName] = [];
        }
        dbNames[val[i].dbName].push(val[i])
      }
      for (let dbName in dbNames) {
        items.push({type: 'subheader', title: dbName})
        dbNames[dbName].forEach((row) => {
          items.push({
            title: row.tableName,
            value: row,
          })
        })
        items.push({type: 'divider'})
      }
      if (items.length > 0) {
        items.pop()
      }
      return items;
    },
    statusText() {
      if (this.noConf) {
        return {
          icon: 'mdi-database-off',
          text: '请先配置数据库连接'
        }
      }
      if (this.errorText != null) {
        return {
          icon: 'mdi-database-off',
          text: this.errorText
        }
      }
      if (this.lastQueryString === '') {
        return {
          text: '请输入表名进行搜索'
        }
      }
      if (this.tables.length === 0) {
        return {
          text: '无表结构数据，搜索关键字:' + this.lastQueryString
        }
      }
    },
  },
  data() {
    return {
      errorText: null,
      noConf: true,
      tables: [],
      selectItem: {},
      eidtorView: null,
      tableData: {
        columnNames: [],
        datum: []
      },
      lastQueryString: ''
    }
  },
  methods: {
    inputChanged(queryString) {
      if (queryString != null && queryString.trim().length > 0) {
        this.errorText = null
        this.selectItem = {}
        mysql.query(`select 1`, (err) => {
          if (err) {
            this.errorText = err;
          }
        })

        if (queryString && queryString.trim().length > 0) {
          queryString = queryString.trim()
          mysql.query(`select *
                     from information_schema.TABLES
                     where TABLE_TYPE = 'BASE TABLE'
                       and TABLE_SCHEMA != 'performance_schema'
                       and TABLE_SCHEMA != 'mysql'
                       and TABLE_SCHEMA != 'information_schema'
                       and TABLE_NAME like CONCAT('%', '${queryString}', '%')`, (err, result, fields) => {
            this.tables.splice(0, this.tables.length)
            if (err) {
              this.errorText = err;
              return
            }
            result.forEach((row) => {
              this.tables.push({
                tableName: row.TABLE_NAME,
                dbName: row.TABLE_SCHEMA,
                poolId: row._poolId
              })
            })
          })
        } else {
          this.tables.splice(0, this.tables.length)
        }
      }
    },
    judgeConf() {
      let dbConfs = utools.dbStorage.getItem('dbConfs');
      if (!dbConfs || dbConfs.length === 0) {
        this.noConf = true;
      } else {
        this.noConf = false;
      }
    },
    rebuildEditorView() {
      if (!this.eidtorView || !document.body.contains(this.eidtorView.dom)) {
        this.eidtorView = new EditorView({
          doc: this.selectItem.createTable,
          extensions: [basicSetup, sql()],
          parent: document.getElementById('code')
        });
      } else {
        this.eidtorView.dispatch({
          changes: {
            from: 0,
            to: this.eidtorView.state.doc.length,
            insert: this.selectItem.createTable
          }
        })
      }
    },
    select(item) {
      this.selectItem = item.id
      mysql.query(`show create table ${item.id.dbName}.${item.id.tableName}`, (err, result, fields) => {
        if (err) {
          this.errorText = err;
          return
        }
        if (result.length > 0) {
          this.selectItem.createTable = result[0]['Create Table']
          //change ddl
          this.rebuildEditorView()
        }
      }, item.id.poolId);

      function queryData(priColName) {
        mysql.query(`select *
                     from ${item.id.dbName}.${item.id.tableName} ${priColName == null ? '' : ' order by ' + priColName + ' desc'}
                     limit 10`, (err, result, fields) => {
          if (err) {
            this.errorText = err;
            return
          }
          this.tableData.datum.splice(0, this.tableData.datum.length)
          this.tableData.columnNames.splice(0, this.tableData.columnNames.length)
          // console.log('queryData result', result, fields)
          let pushColNames = false;
          result.forEach((row) => {
            let newRow = [];
            for(let k in newRow){
              if(newRow[k] instanceof Date){
                newRow[k] = newRow[k].getFullYear() + '-' + ((newRow[k].getMonth() + 1) + '').replace(/\b(\d)$/, '0$1')
                    + '-' + (newRow[k].getDate() + '').replace(/\b(\d)$/, '0$1') + ' ' +
                    (newRow[k].getHours() + '').padStart(2, '0') + ':' + (newRow[k].getMinutes() + '').padStart(2, '0') + ':' +
                    (newRow[k].getSeconds() + '').padStart(2, '0')
              }
            }
            this.tableData.datum.push(newRow);
            for (let colName in row) {
              if (colName == '_poolId') {
                continue;
              }
              let colValue = row[colName];
              if (!pushColNames) {
                this.tableData.columnNames.push(colName)
              }
              if (colValue instanceof Date) {
                colValue = colValue.getFullYear() + "-" +
                    ("0" + (colValue.getMonth() + 1)).slice(-2) + "-" +
                    ("0" + colValue.getDate()).slice(-2) + " " +
                    ("0" + colValue.getHours()).slice(-2) + ":" +
                    ("0" + colValue.getMinutes()).slice(-2) + ":" +
                    ("0" + colValue.getSeconds()).slice(-2);
              }
              newRow.push(colValue)
            }
            pushColNames = true;
          })
        }, item.id.poolId)
      }

      mysql.query(`SELECT COLUMN_NAME
                   FROM INFORMATION_SCHEMA.COLUMNS
                   WHERE TABLE_SCHEMA = '${item.id.dbName}'
                     AND TABLE_NAME = '${item.id.tableName}'
                     and COLUMN_KEY = 'PRI'
                   limit 1`, (err, result, fields) => {
        if (err) {
          this.errorText = err;
          return
        }
        //change data
        queryData.call(this, result.length > 0 ? result[0]['COLUMN_NAME'] : null);
      }, item.id.poolId)
    }
  },
  activated() {
    this.judgeConf();
  },
  updated() {
    // console.log('update')
  },

  mounted() {
    // console.log('mounted')
    this.judgeConf();

    const debouncedFunc = lodash.debounce((text)=>{
      console.log('debounce ok')
      this.inputChanged(text)
    }, 100);

    bus.on('_inputChanged_', ( obj)=>{
      console.log('table: bus.on(onInputChanged)')
      const {tab, text} = obj;
      this.lastQueryString = text
      if(text === ''){
        this.tables.splice(0, this.tables.length)
      }else {
        debouncedFunc(text)
      }
    })
  }
}

</script>

<template>
  <div>
    <div v-if="statusText" class="none">
      <v-icon v-if="statusText.icon" :icon="statusText.icon" style="color: red"></v-icon>
      <span>{{ statusText.text }}</span>
    </div>
    <div class="card-top" v-if="tables.length > 0">
      <v-card
          class="mx-0 left"
          width="240"
      >
        <v-list :items="items" width="240" @click:select="select"></v-list>
      </v-card>
      <div class="right" v-if="selectItem.tableName">
        <v-card>
          <template v-slot:title>
            <div style="padding-top: 20px">
              {{ selectItem.tableName }}
            </div>
          </template>

          <template v-slot:subtitle>
            {{ selectItem.dbName }}
          </template>

          <template v-slot:text>
            <div id="code">
            </div>
          </template>
        </v-card>
        <v-table
            class="data-table"
            fixed-header
            density="compact">
          <thead>
          <tr>
            <th class="text-left" v-for="item in tableData.columnNames">
              {{ item }}
            </th>
          </tr>
          </thead>
          <tbody>
          <tr
              v-for="row in tableData.datum"
              :key="row">
            <td v-for="col in row">{{ col }}</td>
          </tr>
          </tbody>
        </v-table>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import "@/assets/table.css";
</style>