import storage from "@/util/storage.js";

export default {
    reloadFeatures() {
        //  keyword: '',
        //  desc: '',
        //  sql: '',
        //  dbConf: ''
        let quickQueryList = storage.quickQueryStore().getList()
        const features = []
        console.log(quickQueryList, 'quickQueryList')
        quickQueryList.forEach(item=>{
            features.push({
                "code": item.keyword,
                "explain": item.desc,
                "cmds": [item.keyword]
            })
        })
        console.log(features, 'setFeatures')
        let oldFeatures = utools.getFeatures();
        oldFeatures.forEach(item=>{
            utools.removeFeature(item.code)
        })
        features.forEach(item=>{
            utools.setFeature(item)
        })
    }
}