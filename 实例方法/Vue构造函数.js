/**
 * Vue构造函数
 */
import { initMixin } from "./init"
import { stateMixin } from "./state"
import { renderMixin } from "./render"
import { eventsMixin } from "./events"
import { lifecycleMixin } from "./lifecycle"

function Vue(options) {
    if (process.env.NODE_ENV !== 'production' && !(this instanceof Vue)) {
        warn("Vue is a constructor and should be called with the `new` keyword");
    }
    this._init(options);
}
//五个方法都是向Vue原型挂载方法
initMixin(Vue);  //_init方法
stateMixin(Vue);  //数据相关的实例方法, vm.$watch, vm.$set, $delete, 之前实现过了
renderMixin(Vue);
eventsMixin(Vue);  //事件相关的实例方法
lifecycleMixin(Vue);