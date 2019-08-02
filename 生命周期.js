function Vue(options) {
    if (process.env.NODE_ENV !== 'production' && !(this instanceof Vue)) {
        warn("Vue is a constructor and should be called with the `new` keyword");
    }
    this._init(options);
}
/** 
 * initMixin中Vue会将options上所有的钩子函数merge到vm.$options上
 * 所以可以通过访问vm.$options.created来访问created钩子函数
 * 并且每个vm.$options中的钩子函数名是一个数组
 * 因为vm实例化选项可以设置钩子函数，vm.mixin也可以设置钩子函数，这两个函数需要都触发，所以要设置成数组
 */
//initMixin.js
export function initMixin(Vue) {
    Vue.prototype._init = function (options) {
        /** 将vm所有父类的options都添加到vm.$options */
        vm.$options = mergeOptions(
            resolveConstructorOptions(vm.constructor),
            options || {},
            vm
        );
        /** end */
        /** 初始化事件和属性 */
        initLifecycle(vm);
        initEvents(vm);
        initRender(vm);
        /** end */
        callHook(vm, 'beforeCreate');
        /** 初始化provide/inject, 具体看文档, 和状态, 状态指props,methods,data,computed,watch */
        initInjections(vm);
        initState(vm);  //初始化状态
        initProvide(vm);
        callHook(vm, 'created');

        if (vm.$options.el) {
            vm.$mount(vm.$options.el);
        }
    };
}
export function initLifecycle(vm) {
    const options = vm.$options;
    //获取实例非抽象父组件实例，抽象组件就是<transition> <keep-alive>这样的内置组件
    const parent = options.parent;
    while (parent && !options.abstract) {  //存在父组件且自身不是抽象组件
        while (parent.$options.abstract && parent.$parent) {
            parent = parent.$parent;  //向上回溯直到找到非抽象父类
        }
        parent.$children.push(vm);  //将子组件添加到父组件children数组中
    }
    //初始化实例向外暴露的属性
    vm.$parent = parent;
    vm.$root = parent ? parent.$root : vm;  //根实例
    vm.$children = [];
    vm.$refs = {};
    vm._watcher = null;
    vm._isDestroyed = false;
    vm._isBeingDestroyed = false;
    //...还有其他的属性这里不一一写出
}
/** 
 * 在模板编译父组件时如果发现存在子组件，会实例化子组件并给它传递一些参数
 * 如果v-on绑定的是自定义事件，会将事件和回调函数全部加入vm._events中(vm.$on/off中调用), 如果绑定的是平台标签，则把事件绑定到浏览器事件中
 */
//initEvents.js
export function initEvents(vm) {
    vm._events = Object.create(null);
    //因为是父组件编译时创建子组件实例，所以listener是绑定在父组件上的，所以要通过_parentListeners获取事件名
    const listeners = vm.$options._parentListeners;
    if (listeners) {
        updateComponentListeners(vm, listeners);
    }
};
let target;
function add (event, fn, once) {
    if (once) {
        target.$once(event, fn);
    } else {
        target.$on(event, fn);
    }
}
function remove (event, fn) {
    target.$off(event, fn);
}
export function updateComponentListeners(vm, listeners, oldListeners) {
    target = vm;
    updateListeners(listeners, oldListeners || {}, add, remove, vm);  //将事件和回调作为key/value加入vm._events
}
export function updateListeners(on, oldOn, add, remove, vm) {
    let name, cur, old, event;
    for (let name in on) {  //这里的name可能是带符号的 ~xx &xx
        cur = on[name];  //回调函数
        old = oldOn[name];
        event = normalizeEvent(name);  //编译时会把带事件修饰符的事件转化成带符号的事件, 函数将带符号的事件转化成对象event
        if (isUndef(cur)) {  //listeners不存在，报错
            process.env.NODE_ENV !== "production" && warn(
                `Invalid handler for event "${event.name}": got` + String(cur), vm);
        } else if (isUndef(old)) {  //oldListener中不存在，添加
            if (isUndef(cur.fns)) {
                cur = on[name] = createFnInvoker(cur);
            }
            add(event.name, cur, event.once, event.capture, event.passive);
        } else if (cur !== old) {
            old.fns = cur;
            on[name] = old;
        }
    }
    for (name in oldOn) {
        if (isUndef(on[name])) {  //oldOn中的事件在on中不存在了，卸载
            event = normalizeEvent(name);
            remove(event, oldOn[name], event.capture);
        }
    }
}
const normalizeEvent = name => {
    //编译时对事件标识符的处理是有顺序的
    const passive = name.charAt(0) === '&';
    name = passive ? name.slice(1) : name;
    const once = name.charAt(0) === '~';
    name = once ? name.slice(1) : name;
    const capture = name.charAt(0) === '!';
    name = capture ? name.slice(1) : name;
    return {
        name,
        once,
        capture,
        passive,
        //...还有其他事件修饰符
    };
}
/**
 * provide/inject是打通父子组件的数据, 详情可以参考文档
 * 父组件提供provide, 子组件提供inject
 */
export function initInjections(vm) {
    const result = resolveInject(vm.$options.inject, vm);  //获取provide中所有的数据
    if (result) {
        observerState.shouldConvert = false;  //不设置响应式数据
        Object.keys(result).forEach(key => {  //将provide/inject绑定到实例属性上
            defineReactive(vm, key, result[key]);  //中间会判断shouldConvert
        });
        observerState.shouldConvert = true;
    }
};
export function resolveInject(inject, vm) {
    if (inject) {
        const result = Object.create(null);
        /**
         * 这里判断是否支持原生Symbol
         * Reflect.ownKeys能获取对象所有的属性，包括不可枚举的，所以需要filter过滤掉不可枚举的属性
         * Object.keys和Object.getOwnPropertyNames不能获取Symbol类型的属性
         * Object.getOwnPropertySymbols只能获取Symbol类型的属性
         */
        const keys = hasSymbol ? Reflect.ownKeys(inject).filter(key => {
            return Object.getOwnPropertyDescriptor(inject, key).enumerable;
        }) : Object.keys(inject);
        
        for (let i=0; i<keys.length; i++) {
            const key = keys[i]; //获取inject中的别名
            const provideKey = inject[key].from; //获取别名在provide中对应的真正名字
            let source = vm;
            while (source) {  //向上回溯查找父组件provide中对应的key/value
                if (source._provide && provideKey in source._provide) {
                    result[key] = source._provide[provideKey];
                    break;
                }
                source = source.$parent;
            }
            if (!source) {  //没找着
                if ('default' in inject[key]) {  //设置默认值
                    const provideDefault = inject[key].default;
                    //这里对象和数组都需要调用函数生成新实例否则引用的都是同一个对象/数组
                    result[key] = typeof provideDefault === "function" ?
                                provideDefault.call(vm) : provideDefault;
                } else if (process.env.NODE_ENV !== "production") {
                    warn(`Injection "${key}" not found`, vm);
                }
            }
        }
        return result;
    }
}