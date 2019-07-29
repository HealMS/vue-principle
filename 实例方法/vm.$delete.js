/**
 * vm.$delete与vm.$set类似, 同样的，由于直接删除delete target[key]无法触发监听, 所以vue定义了vm.$delete触发监听，更新视图
 * Param 1: Object | Array
 * Param 2: String | Number
 */
vm.$delete(target, key);
//简单粗暴的方法, 不推荐
delete this.obj.name;
this.obj.__ob__.dep.notify();

//delete是Observer抛出的一个方法
import { del } from "../Observer/index";
Vue.prototype.$delete = del;
//Observer/index.js
export function del(target, key) {
    //处理数组
    if (Array.isArray(target) && isValidArrayIndex(key)) {
        target.splice(key, 1);
    }
    //处理数组
    const ob = target.__ob__;
    if (target._isVue || (ob && ob.vmCount)) {
        process.env.NODE_ENV !== "production" && warn(
            `Avoid deleting properties on a Vue instance or it root $data
            - just set it to null`
        );
    }
    if (!hasOwn(target, key)) {
        return;
    }
    delete target[key];
    if (!ob) {  //非响应式数据不notify()
        return;
    }
    ob.dep.notify();
}