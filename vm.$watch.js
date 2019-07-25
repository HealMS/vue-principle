//在vue中使用vm.$watch
const unwatch = vm.$watch('a', callback, {
    deep: boolean,  //监听对象时，若监听对象内部的值则设为true
    immediate: boolean  //立即以表达式的当前值触发回调
}); //返回一个unwatch函数, 用于取消监听
unwatch();
//vm.$watch的第一个参数可以是函数, 此时watcher会监听函数中涉及的所有vue属性
vm.$watch(function () {
    return this.name + this.age;
}, callback);  //此时watcher就会订阅name和age的Dep

//底层实现
Vue.prototype.$watch = function (expOrFn, cb, options) {
    const vm = this; //vue实例
    options = options || {};
    const watcher = new Watcher(vm, expOrFn, cb, options);
    if (options.immediate) {
        cb.call(cb, watcher.value);
    }
    return function unwatchFn () {
        watcher.teardown();
    };
};
//订阅者.js
export default class Watcher {
    constructor(vm, expOrFn, cb, options) {
        this.vm = vm;
        //监听对象内部所有属性
        if (options) {
            this.deep = !!options.deep;
        } else {
            this.deep = false;
        }

        this.deps = [];  //watcher订阅的dep
        this.depIds = new Set();
        if (typeof expOrFn === "function") {
            this.getter = expOrFn
        } else {
            this.getter = parsePath(expOrFn);
        }
        this.cb = cb;
        this.value = this.get();  //get()会执行this.getter()方法
    }
    /* 原有代码 */
    get() {
        window.target = this;
        let value = this.getter.call(vm, vm);
        if (this.deep) {  //必须在window.target销毁之前递归，原因见函数内部








            
            traverse(this.value);
        }
        window.target = undefined;
    }

    addDep(dep) {  //收集订阅的dep, unwatch时watcher订阅的dep清楚该watcher
        const id = dep.id;
        if (!this.depIds.has(id)) {
            this.depIds.add(id);
            this.deps.push(dep);  //watcher订阅dep
            dep.addSub(this);  //dep手机watcher
        }
    }
    /**
     * 从所有依赖项的Dep列表中移除自己
     */
    teardown() {
        let i = this.deps.length;
        while (i--) {
            this.deps[i].removeSub(this);
        }
    }
}

const seenObjects = new Set();
function traverse(val) {
    _traverse(val, seenObjects);
    seenObjects.clear();
}
function _traverse(val, seen) {
    let i, keys;
    const isA = Array.isArray(val);
    if ((!isA && !isObject(val)) || Object.isFrozen(val)) {
        return ;
    }
    if (val.__ob__) {  //val.__ob__ === Observer实例
        const depId = val.__ob__.dep.id;  //专门为数组监听设置的dep
        if (seen.has(depId)) {  //避免重复监听
            return;
        }
        seen.add(depId);
    }
    if (isA) {  //数组
        i = val.length;
        while (i--) 
            _traverse(val[i], seen);
    } else {  //对象
        keys = Object.keys(val);
        i = keys.length;
        while (i--) {
            _traverse(val[key[i]], seen);  //val[key[i]]会访问变量的值，触发depend()方法，此时就需要判断window.target不是undefined，然后触发订阅者和收集器的绑定
        }
    }
}
//收集类.js
let uid = 0;
export default class Dep {
    constructor() {
        this.id = uid++;
        this.subs = [];
    }
    /* 原有代码 */
    depend() {
        if (window.target) {
            window.target.addDep(this);
        }
    }
    removeSub(sub) {
        const index = this.subs.indexOf(sub);
        if (index > -1) {
            return this.subs.splice(index, 1);
        }
    }
}