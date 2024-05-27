<script>
import table from "@/components/Table.vue";
import storage from "@/util/storage.js";

export default {
  name: 'TableConf',
  computed: {
    table() {
      return table
    }
  },
  data() {
    return {
      snackbar: false,
      snackbarText: '',
      showSheet: false,
      showNew: true,
      showList: true,
      _id: null,
      host: '',
      port: '3306',
      user: '',
      password: '',
      database: '',
      items: [],
      rules1: [
        v => {
          if (!v) {
            return '填入数据库主机名称（无需端口号）如：127.0.0.1'
          }
        }
      ],
      rules2: [
        v => {
          if (!v) {
            return '填入数据库端口号 如：3306'
          }
          let number = parseInt(v);
          if (!(number > 0 && number <= 65535)) {
            return '端口范围1-65535'
          }
        }
      ]
    }
  },
  methods: {
    clickEdit(target) {
      let dbConf = storage.findDbConf(target.id);
      console.log('dbConf', dbConf)
      if (dbConf) {
        this._id = target.id
        this.host = dbConf.host;
        this.port = dbConf.port;
        this.user = dbConf.user;
        this.password = dbConf.password;
        this.database = dbConf.database;
        this.showSheet = true;
        this.showNew = false;
        this.showList = false;
      }
    },
    clickNew() {
      this.showSheet = true;
      this.showNew = false;
      this.showList = false;
      this._id = null;
      this.host = null;
      this.port = 3306;
      this.user = null;
      this.password = null;
      this.database = null;
    },
    removeConf(target, i) {
      // console.log('removeConf', target)
      let dbConfs = utools.dbStorage.getItem('dbConfs');
      let dbConf = dbConfs[i]
      dbConfs.splice(i, 1);
      utools.dbStorage.setItem('dbConfs', dbConfs);
      this.refreshList()
      window.removeFromPool(dbConf._id);
    },
    save() {
      let dbConfs = utools.dbStorage.getItem('dbConfs');
      if (!dbConfs) {
        dbConfs = [];
      }
      if (!this.host || !this.port) {
        this.snackbarText = '主机名或端口不能为空';
        this.snackbar = true;
        return
      }
      if (this._id) {
        let dbConf = dbConfs.find(e=>e._id === this._id)
        dbConf.host = this.host;
        dbConf.user = this.user;
        dbConf.password = this.password;
        dbConf.port = this.port;
        dbConf.database = this.database;
        storage.setUpdate()
      } else {
        dbConfs.push({
          _id: new Date().getTime(),
          host: this.host,
          port: this.port,
          user: this.user,
          password: this.password,
          database: this.database
        });
      }
      utools.dbStorage.setItem('dbConfs', dbConfs);
      this.showSheet = false;
      this.showNew = true;
      this.showList = true;
      this.refreshList()
    },
    refreshList() {
      // console.log('refreshList')
      this.items.splice(0, this.items.length)
      let dbConfs = utools.dbStorage.getItem('dbConfs');
      if (dbConfs && dbConfs.length > 0) {
        dbConfs.forEach((db) => {
          this.items.push({
            id: db._id,
            title: db.user + '@' + db.host + ':' + db.port,
            icon: 'mdi-database',
            closeIcon: 'mdi-close'
          })
        })
      }
    }
  },
  mounted() {
    this.refreshList();
  },
  activated() {
    console.log('activ')
  }
}
</script>

<template>
  <div>
    <v-card
        class="list"
        max-width="360"
        v-if="showList && items.length > 0"
    >
      <v-list :items="items" density="compact">
        <v-list-item
            v-for="(item, i) in items"
            :key="i"
            :value="item"
            color="primary"
            rounded="xl"
            @click="clickEdit(item)"
        >
          <template v-slot:prepend>
            <v-icon :icon="item.icon"/>
          </template>

          <template v-slot:default>
            {{ item.title }}
          </template>


          <template v-slot:append>
            <v-icon :icon="item.closeIcon" @click="removeConf(item, i)"/>
          </template>
        </v-list-item>
      </v-list>

    </v-card>
    <div v-if="items.length === 0 && !showSheet" style="padding-left: 10px">
      暂无数据库配置，点击下方新增配置
    </div>
    <div class="line" v-if="showNew">
      <v-btn prepend-icon="mdi-plus-box" class="mt-2" @click="clickNew">新增一条数据库配置</v-btn>
    </div>

    <v-sheet width="500" class="mx-0 sheet" v-if="showSheet">
      <v-form @submit.prevent>
        <v-text-field
            v-model="host"
            :rules="rules1"
            label="主机名"
        ></v-text-field>
        <v-text-field
            v-model="port"
            :rules="rules2"
            type="number"
            label="端口"
        ></v-text-field>
        <v-text-field
            v-model="user"
            label="用户名"
        ></v-text-field>
        <v-text-field
            v-model="password"
            type="password"
            label="密码"
        ></v-text-field>
        <v-text-field
            v-model="database"
            label="数据库"
        ></v-text-field>

        <div>
          <v-btn type="submit" prepend-icon="mdi-hand-okay" block class="mt-2" width="100" @click="save">保存</v-btn>
          <v-btn prepend-icon="mdi-cancel" block class="mt-2" width="100" @click="showNew=true;showSheet=false;showList=true">取消
          </v-btn>
        </div>
      </v-form>
    </v-sheet>

    <v-snackbar
        v-model="snackbar"
        multi-line
    >
      {{ snackbarText }}

      <template v-slot:actions>
        <v-btn
            color="red"
            variant="text"
            @click="snackbar = false"
        >
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<style scoped>
@import "@/assets/table-conf.css";
</style>