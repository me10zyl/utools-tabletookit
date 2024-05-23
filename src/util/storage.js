export default {
    // host: this.host,
    // port: this.port,
    // user: this.user,
    // password: this.password
    getDbConfs(){
        let dbConfs = utools.dbStorage.getItem('dbConfs');
        if (!dbConfs) {
            dbConfs = [];
        }
        return dbConfs;
    },

    findDbConf(id){
      return this.getDbConfs().find(item => item._id === id)
    },

    quickQueryStore() {
        return {
            KEY: 'quickQuery',
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
    }
}