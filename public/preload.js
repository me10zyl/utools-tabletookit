console.log('init preload.js')
//{code: 'table-conf', type: 'text', payload: 'table-conf'}
utools.onPluginEnter((val) => {
    console.log(val, 'enterPlugin')
    if(val.code === 'table') {
        utools.setSubInput(({text}) => {
            window.onInputChanged(text);
        }, '搜索表名称', true);
    } else if (val.code !== 'table-conf' && val.code !== 'table-conf' && val.code !== 'table-quick-query-conf') {
        utools.setSubInput(({text}) => {
            window.onInputChanged(text);
        }, 'SQL预查询参数', true);
    }
    console.log('preload.js: change window.code=' + val.code)
    window.onChangeCode(val.code);
})
const mysql = require('mysql2');
let pools = [];
const createPools = () => {
    let dbConfs = utools.dbStorage.getItem('dbConfs');
    if (!dbConfs || dbConfs.length === 0) {
        return;
    }
    let needUpdatePool = utools.dbStorage.getItem('needUpdatePool');
    if(needUpdatePool){
        pools = []
    }
    dbConfs.forEach((conf) => {
        if (pools.filter(e => e._id === conf._id).length === 0) {
            console.log('createPool', conf)
            let id = conf._id;
            delete conf._id;
            let pool = mysql.createPool(conf);
            pools.push({
                _id: id,
                pool: pool,
                conf: conf
            })
        }
    })
    utools.dbStorage.setItem('needUpdatePool', false)
}
window.removeFromPool = function (id) {
    console.log('removeFromPool', id)
    let deleteIndex = pools.findIndex(e => e._id === id);
    pools.filter(e => e._id === id).forEach(e => {
        e.pool.end();
    });
    if (deleteIndex === -1) {
        return;
    }
    pools.splice(deleteIndex, 1);
}
window.getPoolFromId = function (id){
    let index = pools.findIndex(e => e._id === id);
    let r = pools.filter(e => e._id === id);
    return r.length > 0 ? r[0] : null;
}
window.mysql = {
    query: function (sql, callback, specificPoolId) {
        createPools();
        if (pools.length === 0) {
            return
        }
        let selectPools = pools;
        if(specificPoolId){
            selectPools = [window.getPoolFromId(specificPoolId)];
        }
        Promise.all(selectPools.map((pool) => {
            return new Promise((resolve, reject) => {
                pool.pool.getConnection(function (err, connection) {
                    if (err) {
                        reject(err);
                    }
                    connection.connect(function (err) {
                        if (err) {
                            reject(err);
                            return
                        }
                        connection.query(sql, null, function (err, results, fields) {
                            console.log('query sql:', err, sql, pool.conf, results,fields)
                            resolve({
                                error: err,
                                results: results,
                                fields: fields,
                                poolId: pool._id
                            });
                            connection.release()
                        })
                    })
                });
            })
        })).then((results) => {
            callback(results.length > 0 ? results[0].error : null, results.flatMap(e => {
                let results1 = e.results;
                if(results1) {
                    results1.forEach(ee => {
                        ee._poolId = e.poolId;
                    })
                }
                return results1;
            }), results.flatMap(e => e.fields));
        }).catch((err) => {
            console.log('数据库链接问题:', err)
            callback(err)
        });
    },
}
