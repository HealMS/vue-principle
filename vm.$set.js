/**
 * 由于无法元编程的限制，vue在给对象添加新的属性或给数组添加新索引或直接给数组元素赋值时无法监听
 * 所以引入Vue.$set来给新的属性实现响应式，并出发视图更新
 * Param 1: 可以是对象或数组
 * Param 2: 对象的字符串属性和数组的数字索引
 * Param 3: any, 
 */
const unwatch = Vue.$set(Object|Array, String|Number, value)

//set实际上是Observer抛出的一个set方法
import { set } from "Observer/index";
Vue.prototype.$set = set;
