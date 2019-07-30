/**
 * 实例方法vm.$nextTick或者全局方法Vue.nextTick
 * 是为了解决更新了数据后想要操作DOM但获取不到最新的DOM结构, 因为还没重新渲染
 * 明确以下几点:
 * Vue也是遵循事件循环机制的
 * 
 * Vue使用异步队列的原因是当状态在一次事件循环中改变了两次, watcher会收到两个通知，从而进行两次渲染，
 * 但是事实上Vue会将watcher添加到队列中缓存起来，然后在下一次事件循环中让watcher触发渲染流程并清空队列，就可以保证只进行一次渲染
 * 
 * 异步任务分为微任务(microtask)和宏任务(macrotask)
 * 微任务包括不限于: Promise.then, MutationObserver, Object.observe(已废弃), process.nextTick
 * 宏任务包括不限于: setTimeout, setInterval, setImmediate, MessageChannel, requestAnimationFrame, I/O, UI交互事件 
 * 先执行微任务再执行宏任务反复循环
 */

//下面两个对比可以看出同样是微任务, 先加入队列则先执行
new Vue({
    methods: {
        example () {
            this.message = "changed";  //产生更新DOM的回调, 事实上更新DOM的回调也是使用vm.$nextTick加入队列的
            this.$nextTick(function () {
                //DOM更新，可以进行DOM操作
            })
        }
    }
})
new Vue({
    methods: {
        example () {
            this.$nextTick(function () {
                //DOM未更新，不能进行DOM操作
            })
            this.message = "changed";  //产生更新DOM的回调, 事实上更新DOM的回调也是使用vm.$nextTick加入队列的
        }
    }
})
//由于是先执行微任务再执行宏任务(都能够执行的情况下), 所以同一事件循环中宏任务可以写在微任务
new Vue({
    methods: {
        example () {
            setTimeout(() => {
                //DOM更新, 可以进行DOM操作
            }, 0);
            this.message = "changed";  //产生更新DOM的回调, 事实上更新DOM的回调也是使用vm.$nextTick加入队列的
        }
    }
})
//vm.$nextTick方法使用了Promise.then加入微任务
import { nextTick } from "../util/index"
Vue.prototype.$nextTick = function (cb) {
    return nextTick(cb, this);
};
//util/index.js
const callbacks = [];
let pending = false;

function flushCallbacks() {
    pending = false;
    const copies = callbacks.slice(0);
    callbacks.length = 0;  //清空本轮事件循环回调
    for (let i=0; i<copies.length; i++) {
        copies[i]();
    }
}
let microTimerFunc;
let macroTimerFunc;  //宏任务, 用于强制使用宏任务的选项或者浏览器不支持原生Promise
let useMacroTask = false;
//macroTimerFunc所使用宏任务类型, 主要是浏览器兼容性问题向下兼容
if (typeof setImmediate !== "undefined" && isNative(setTimeout)) {  //setImmediate
    macroTimerFunc = () => {
        setImmediate(flushCallbacks);
    }
} else if (typeof MessageChannel !== "undefined" && (isNative(MessageChannel) || 
            MessageChannel.toString() === "[object MessageChannelConstructor]")) {  //messageChannel
    const channel = new MessageChannel();
    const port = channel.port2;
    channel.port1.onmessage = flushCallbacks;
    macroTimerFunc = () => {
        port.postMessage(1);
    }
} else {  //setTimeout
    macroTimerFunc = () => {
        setTimeout(flushCallbacks, 0);
    }
}
if (typeof Promise !== "undefined" && isNative(Promise)) {
    const p = Promise.resolve();
    microTimerFunc = () => {
        p.then(flushCallbacks);  //创建微任务
    };
} else {  
//浏览器不支持Promise, 被迫使用宏任务
    microTimerFunc = macroTimerFunc;
}
//对回调进行封装使之使用宏任务, 一般用不上
export function withMacroTask(fn) {
    return (fn._withTask || (fn._withTask = function () {
        useMacroTask = true;  //置为true使用宏任务
        const res = fn.apply(null, arguments);  //回调中更新数据会使用vm.$nextTick, 此时的useMacroTask === true, 所以会使用宏任务
        useMacroTask = false;  //继续使用微任务
        return res;
    }));
}

export function nextTick(cb, ctx) {
    let _resolve;
    callbacks.push(() => {  
        if (cb) {
            cb.call(ctx);
        } else {
            _resolve(ctx);  //??????这里不清楚
        }
    });
    if (!pending) {  //是否是第一个回调, 只需创建一次微任务即可, 微任务会执行本轮事件循环所有回调
        pending = true;  //关门
        if (useMacroTask) {  //判断宏任务
            macroTimerFunc();
        } else {
            microTimerFunc();
        }
    }
    //不传入回调是vm.$nextTick的另一种写法, vm.$nextTick().then(); vm.$nextTick()返回一个Promise
    if (!cb && typeof Promise !== "undefined") {
        return new Promise(resolve => {
            _resolve = resolve;
        });
    }
}