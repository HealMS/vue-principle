export function eventsMixin(Vue) {
    /**
     * 监听当前实例上的 自定义 事件, 事件可由vm.$emit触发
     * 参数:
     * {string | Array<string>} event
     * {Function} fn
     */
    Vue.prototype.$on = function(event, fn) {
        const vm = this;
        if (Array.isArray(event)) {
            for (let i=0; i<event.length; i++) {
                this.$on(event[i]);  //递归事件数组中所有自定义事件
            }
        } else {  //递归走到这里
            //vm._events是vm._init()是创建的属性, 用于存储事件触发函数数组, vm._events = Object.create(null);
            (vm._events[event] || (vm._evnets[event] = [])).push(fn);
        }
        return vm;
    }
    /**
     * 移除监听器上的事件
     * 参数:
     * {string | Array<string>} event
     * {Function} fn  这里的函数是指移除出发函数与传入函数参数匹配的事件
     */
    Vue.prototype.$off = function(event, fn) {
        const vm = this;
        if (Array.isArray(event)) {
            for (let i=0; i<event.length; i++) {
                vm.$off(event[i], fn);  //递归事件数组移除多个自定义事件
            }
        }
        const cbs = vm._events[event];
        if (!cbs) {  //自定义事件不存在
            return vm;
        } 
        if (arguments.length === 1) {  //只传入事件, 移除该事件上所有触发函数
            vm._events[event] = null;
            return vm;
        }
        if (fn) {  //移除指定事件的指定函数
            const cbs = vm._events[event];
            let cb;
            let i = cbs.length;
            while(i--) {  //这里需要注意一下是从后往前遍历, 如果是从前往后, 那么删除一个元素后, 后面的元素往前进了一位, i会少遍历一个元素
                cb = cbs[i];
                if (cb === fn || cb.fn === fn) {
                    cbs.splice(i, 1); 
                    break;
                }
            }
        }
        return vm;
    }
    /**
     * 监听自定义事件, 只触发一次, 再第一次触发之后移除监听器
     */
    Vue.prototype.$once = function (event, fn) {
        const vm = this;
        function on () {
            vm.$off(event, fn);
            fn.apply(vm, arguments);
        }
        on.fn = fn;  //与之前的cb.fn === fn对应上
        vm.$on(event, on);  //触发后移除函数并执行
    }
    /**
     * 触发事件
     * 因为vm上绑定了_events数组属性获取所有自定义事件的触发函数
     * 所以$emit只需要提取出参数事件对应的函数并执行即可
     * 参数:
     * {string} event
     * [...args]
     */
    Vue.prototype.$emit = function (event) {  //剩余参数从arguments获取
        const vm = this;
        const cbs = vm._events[event];
        if (cbs) {
            const args = toArray(argument, 1);  //将类数组转换为真数组, 大概是跟[].slice(argument, 1)一样
            for (let i=0, l=cbs.length; i<l; i++) {
                try {
                    cbs[i].apply(vm, args);
                } catch (error) {
                    handleError(e, vm, `event handler for ${event}`);
                }
            }
        }
        return vm;
    }
}