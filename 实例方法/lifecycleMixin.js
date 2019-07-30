export function lifecycleMixin(Vue) {
    /**
     * 迫使Vue实例重新渲染
     * 而执行实例watcher的update方法就可以让实例重新渲染
     */
    Vue.prototype.$forceUpdate = function () {
        const vm = this;
        if (vm._watcher) {  //vm._watcher是vm实例的watcher
            vm._watcher.update();
        }
    }
    /**
     * 完全销毁一个实例
     * 需要做到以下几点:
     * 1 清除该实例与其他实例的连接
     * 2 解绑实例上所有监听器(事件监听, 数据监听等...)和指令
     * 3 触发beforeDestroy()和destroyed()生命周期钩子
     */
    Vue.prototype.$destroyed = function () {
        const vm = this;
        if (vm._isBeingDestroyed) {  //禁止重复销毁
            return;
        }
        callHook(vm, "beforeDestroy");  //触发钩子
        vm._isBeingDestroyed = true;  //正在被销毁
        const parent = vm.$parent;
        if (parent && !parent._isBeingDestroyed && !vm.$options.abstract) {
            remove(parent.$children, vm);  //从父组件中移除, 1
        }
        if (vm._watcher) {
            vm._watcher.teardown();  //Watcher函数的teardown(), 将与vm实例的watcher关联的所有依赖收集器dep去除vm._watcher
        }
        /**
         * 除了vm实例固定绑定的wathcer, vm.$watch也能够生成新的watcher, 所以后者生成的watcher也需要被删除
         * Vue中通过设置vm._watchers = [], 将所有$watch生成的watcher push到vm._watchers中
         */
        let i = vm._watchers.length;
        while (i--) {
            vm._watchers[i].teardown();
        }
        vm._isDestroyed = true;
        vm.__patch__(vm._vnode, null);  //将虚拟DOM中的当前实例对应的vnode字段删除, 页面中DOM节点还存在
        callHook(vm, "destroyed");
        vm.$off();  //移除所有绑定事件
    }
}