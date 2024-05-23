export function debounce2(func, delay) {
    let timer = null
    // 借助闭包，使得变量timer不被回收
    return function() {
        // 保存当前环境下的实例对象，this即为引入该方法的那个组件实例对象
        const th = this
        // 保存传入参数
        const args = arguments
        // 第一次timer为null，跳过该判断，执行setTimeout()
        if (timer) {
            // 之后如果timer存在，则把上一次的销毁，也就是setTimeout()，则里面的函数执行也会抛弃
            clearTimeout(timer)
        }
        timer = setTimeout(() => {
            // apply()，改变this指向，指向正在操作的组件实例，传入参数
            func.apply(th, args)
            timer = null
        }, delay)
    }
}
