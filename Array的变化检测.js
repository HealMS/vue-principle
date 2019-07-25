/**
 * 数组执行能改变自身内容的方法如push时不会出发getter/setter，所以需要对这些方法进行处理
**/ 
//变异方法.js
const arrayProto = Array.prototype;
export const arrayMethods = Object.create(arrayProto); //将拦截器导出

["push", "pop", "shift", "unshift", "splice", "reverse"].forEach(function (method) {
    const original = arrayProto[method];
    def(arrayMethods, method, function mutator(...args) {
        const result = ariginal.apply(this, args);
        const ob = this.__ob__;
        let inserted;
        switch (method) {
            case "push":
            case "unshift":
                inserted = args;  //一个元素
                break;
            case "splice":
                inserted = args.splice(2);  //splice第一个参数的要插入的index，第二个参数的index后删除的个数，第三个参数开始是插入元素
                break;
        }
        if (inserted) ob.observeArray(inserted); //新增元素监听 
        ob.dep.notify();  //拦截器通知依赖数据发生改变
        return ;
    });
});

//使用拦截器覆盖Array原型.js
import { arrayMethods } from './变异方法.js'
const hasProto = '__proto__' in {}; //Object是否存在__proto__属性
const arrayKeys = Object.getOwnPropertyNames(arrayMethods);  //自身的属性,非原型链

export class Observer {  //将data中所有属性都变为getter/setter
    constructor(value) {
        this.value = value;
        this.dep = new Dep(); //数组的依赖收集器需要放在getter和拦截器都能够访问到的位置，所以放在Observer中
        def(value, '__ob__', this);  //value.__ob__ = new Observer(value), 1.使数组能够使用childOb收集依赖 2.判断数据是否是响应式

        if (Array.isArray(value)) {
            const augment = hasProto ? protoAugment : copyAugment;  //根据浏览器是否支持__proto__使用原型覆盖还是拷贝
            augment(value, arrayMethods, arrayKeys);
            this.observeArray(value);
        } else {
            this.walk(value);
        }
    }
    walk(obj) {  //作用于对象plainObject
        const keys = Object.keys(obj);
        for (let i=0; i<keys.length; i++) {
            defineReactive(obj, keys[i], obj[keys[i]]);
        }
    }
    observeArray(items) {  //作用于数组，监听已有元素
        for (let i=0; i<items.length; i++) {
            //这里不太清楚，数组元素是基本类型，那么isObject肯定是false，直接return undefined, 如何监听数组已有属性？？
            // 对上面问题的回答: vue中确实无法监听数组元素的改变如this.list[0] = 2; this.list.length = 0, 
            // 在判断isObject时就直接返回了，不会有下面的__ob__判断, 详情参考https://juejin.im/post/5bd181036fb9a05cdb107b0d
            observe(items[i]);
        }
    }
}

function protoAugment(target, src, keys) { //存在__proto__,直接拦截
    target.__proto__ = src;
}
function copyAugment(target, src, keys) { //不存在__proto__, 拷贝
    for(let i=0; i<keys.length; i++) {
        const key = keys[i];
        def(target, key, src[key]);
    }
}
function def(obj, key, val, enumerable) {
    Object.defineProperties(obj, key, {
        value: val,
        enumerable: !!enumerable,
        writable: true,
        configurable: true
    });
}
function defineReactive(data, key, val) {
    if (typeof val === "object") {
        new Observer(val);
    }
    let childOb = observe(val);
    let dep = new Dep();
    Object.defineProperty(data, key, {
        enumerable: true,
        configurable: true,
        get: function () {
            dep.depend();
            if (childOb) {
                childOb.dep.depend(); //数组getter收集依赖
            }
        },
        set: function (newVal) {
            if (val == newVal) {
                return;
            }
            dep.notify();
            val = newVal;
        }
    });
};
export function observe(value, asRootData) {
    if (!isObject(value)) { //对于数组元素如果不是对象，那么childOb为undefine，只在dep中收集依赖
        return;
    }
    let ob;
    if (hasOwn(value, "__ob__") && value.__ob__ instanceof Observer) {  //对于数组而言，childOb为Observer, 用于拦截器的触发
        ob = value.__ob__;
    } else {
        ob = new Observer(value);
    }
    return ob;
}