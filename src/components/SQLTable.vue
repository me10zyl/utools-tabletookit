<script setup>
import {ref, watchEffect} from "vue";

const props = defineProps({
  result: {
    type: Array,
    default: () => []
  },
  fields: {
    type: Array,
    default: () => []
  },
  errorText:{
    type: String,
    default: null
  }
})

console.log('sqlTable setup', props)

const tableData = ref({
  columnNames: [],
  datum: []
})

watchEffect(() => {
  if (props.result && props.fields) {
    console.log('fieldChanged', props.result, props.fields)
    tableData.value.columnNames.splice(0, tableData.value.columnNames.length)
    tableData.value.datum.splice(0, tableData.value.datum.length)
    props.fields.forEach((field) => {
      tableData.value.columnNames.push(field.name)
    })
    props.result.forEach((row) => {
      tableData.value.datum.push(row)
    });
  }
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
  <v-pagination :length="4" size="small" class="mt-3"></v-pagination>

</template>

<style scoped>
.data-table {
  margin-top: 10px;
  max-height: 350px;
}

.data-table tr {
  white-space: nowrap;
}

.data-table tr:hover {
  white-space: normal;
}

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