import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css'
import Table from "@/components/Table.vue";
import TableConf from "@/components/TableConf.vue";
import TableQuickQueryConf from "@/components/TableQuickQueryConf.vue";
import TableQuickQuery from "@/components/TableQuickQuery.vue";

import eventBus from 'vue3-eventbus'



const vuetify = createVuetify({
    components,
    directives,
    ssr: true
})

const app = createApp(App)


app.use(router)
app.use(eventBus)
app.use(vuetify)

app.component('Table', Table)
app.component('TableConf', TableConf)
app.component('TableQuickQueryConf', TableQuickQueryConf)
app.component('TableQuickQuery', TableQuickQuery)

app.mount('#app')
