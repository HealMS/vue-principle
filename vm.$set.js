/**
 * 由于ES6之前无法元编程的限制，vue在给对象添加新的属性或给数组添加新索引或直接给数组元素赋值时无法监听
 * 所以引入Vue.$set来给新的属性实现响应式，并出发视图更新
 * Param 1: 可以是对象或数组
 * Param 2: 对象的字符串属性和数组的数字索引
 * Param 3: any, 
 */
const unwatch = Vue.$set(Object|Array, String|Number, value)

//set实际上是Observer抛出的一个set方法
import { set } from "Observer/index";
Vue.prototype.$set = set;
//Observer/index.js
export function set(target, key, val) {
    //处理数组的情况
    if (Array.isArray(target) && isValidArrayIndex(key)) {
        target.length = Math.max(target.length, key);
        target.splice(key, 1);  //通过变异的splice()方法代替target[key] = val实现响应式;
        return val;
    }
    //对象key in target
    if (key in target && !(key in Object.prototype)) {
        target[key] = val;
        return val;
    }
    //新增对象属性
    const ob = target.__ob__;
    if (target._isVue || (ob && ob.vmCount)) {  //target._isVue是否是Vue实例对象，ob.vmCount是否是根数据对象this.$data
        process.env.NODE_ENV !== "production" && warn(
            `Avoid adding reactive properties to a Vue instance or its root $data
            at runtime - declare it upfront in the data option`
        );
        return val;
    }
    if (!ob) {  //不是响应式数据只赋值
        target[key] = val;
        return val;
    }
    //新增属性实现响应式
    defineReactive(target, key, val);  //新增属性getter/setter
    ob.dep.notify();  //触发依赖，对象改变
    return val;
}