<script setup>
import {ref, toRef, watch, watchEffect} from "vue";
import {ca} from "vuetify/locale";

const props = defineProps({
  result: {
    type: Array,
    default: () => []
  },
  fields: {
    type: Array,
    default: () => []
  },
  errorText: {
    type: String,
    default: null
  },
  count: {
    type: Number,
    default: () => 0
  },
  currentConf:{
    type: Object,
    default: null
  }
})

const page = ref(1)
const size = ref(10)

console.log('sqlTable setup', props)

const tableData = ref({
  columnNames: [],
  datum: [],
  count: 0
})

let value = Math.ceil(props.count / size.value);
const totalPage = ref(value)


watchEffect(() => {
  if (props.result && props.fields) {
    tableData.value.columnNames = props.fields.map((field) => {
      return field.name;
    })
    tableData.value.datum = props.result.map((row) => {
      for (let k in row) {
        if (k === '_poolId') {
          delete row[k]
        }
        if (row[k] instanceof Date) {
          row[k] = row[k].getFullYear() + '-' + ((row[k].getMonth() + 1) + '').replace(/\b(\d)$/, '0$1')
              + '-' + (row[k].getDate() + '').replace(/\b(\d)$/, '0$1') + ' ' +
              (row[k].getHours() + '').padStart(2, '0') + ':' + (row[k].getMinutes() + '').padStart(2, '0') + ':' +
              (row[k].getSeconds() + '').padStart(2, '0')
        }
      }
      return row
    });
    tableData.value.count = props.count
    totalPage.value = Math.ceil(props.count / size.value)

  }
})

let emit = defineEmits(['pageChanged', 'sizeChanged']);


watch(page, (newValue, oldValue) => {
  emit('pageChanged', newValue)
})

watch(size, (newValue, oldValue) => {
  emit('sizeChanged', newValue)
})


const snackMsg = ref('')
const openSnack = ref(false)

const currentCol = ref(null)
const currentRow = ref(null)
const clickRight = (col, row) => {
  console.log('clickRight', row)
  isActive.value = true
  currentCol.value = col;
  currentRow.value = row;
}

const isActive = ref(false)


const copy = ()=>{
  utools.copyText(currentCol.value)
  openSnack.value = true
  snackMsg.value = '已复制'
}

const execJs = (row, col)=>{
  if(props.currentConf) {
    let string;
    try {
      string = eval(props.currentConf.jsScript)
    }catch (e){
      openSnack.value = true
      snackMsg.value = '执行出错:' + e
      return
    }
    utools.copyText(string + '')
    openSnack.value = true
    snackMsg.value = '已复制 ' + string
  }
}
</script>

<template>
  <div>
    <div
        v-if="errorText"
        type="warning"
        class="mt-5"
        style="color: red"
        dismissible
    >
      {{ errorText }}
    </div>
  </div>
  <div style="display: flex;justify-content: space-between;flex-direction: column">
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
        <td v-for="col in row">
          <v-tooltip :text="col">
            <template v-slot:activator="{ props }">
              <span v-bind="props" @click.right="clickRight(col, row)">{{ col }}</span>
            </template>
          </v-tooltip>
        </td>
      </tr>
      </tbody>
    </v-table>
    <v-pagination :length="totalPage" size="small" style="" v-if="tableData.count > 0"
                  v-model="page"></v-pagination>
  </div>

  <v-dialog max-width="500" v-model="isActive">

    <v-card :title="tableData.columnNames[0]">
      <v-card-text>
        {{currentCol}}
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
            v-if="props.currentConf"
            text="执行JS并复制"
            @click="execJs(currentRow, currentCol)"
        ></v-btn>
        <v-btn
            text="复制"
            @click="copy"
        ></v-btn>
        <v-btn
            text="关闭"
            @click="isActive = false"
        ></v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <v-snackbar
      v-model="openSnack"
  >
    {{ snackMsg }}

    <template v-slot:actions>
      <v-btn
          color="pink"
          variant="text"
          @click="openSnack = false"
      >
        关闭
      </v-btn>
    </template>
  </v-snackbar>


</template>

<style scoped>
.data-table {
  margin-top: 5px;
  max-height: 410px;
}

.data-table tr {
  white-space: nowrap;
  line-height: 9px;
}

/*.data-table tr:hover {
  white-space: normal;
}*/

.data-table th {
  padding: 0 11px !important;
}

.data-table tr td {
  padding: 0 11px !important;
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>