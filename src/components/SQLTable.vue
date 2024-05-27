<script setup>
import {ref, toRef, watch, watchEffect} from "vue";

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
      for(let k in row){
        if(row[k] instanceof Date){
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
        <td v-for="col in row">{{ col }}</td>
      </tr>
      </tbody>
    </v-table>
    <v-pagination :length="totalPage" size="small" style="" v-if="tableData.count > 0"
                  v-model="page"></v-pagination>
  </div>

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