/**
 * 依赖收集器
 *
 * @author denislin
 * @date 2019-07-22
 * @class Dep
 */
class Dep {
    constructor() {
        this.subs = [];  //this.subs就是所有监听了同一个属性的所有watcher的数组
    }
    addSub(sub) {
        this.subs.push(sub);
    }
    removeSub(sub) {
        remove(this.subs, sub);
    }
    depend() {
        if (window.target) {
            this.addSub(window.target);
        }
    }
    notify() {
        const subs = this.subs.slice();
        for (let i=0; i<subs.length; i++) {
            subs[i].update();  //执行watcher中update()重新设置依赖
        }
    }
}

function remove(arr, item) {
    if (arr.length) {
        const index = arr.indexOf(item);
        if (index > -1) {
            return arr.splice(index, 1);
        }
    }
}

class Watcher {
    constructor(vm, expOrFn, cb) {
        this.vm = vm;
        this.getter = parsePath(expOrFn);  //访问属性触发属性标识符getter的封装函数
        this.cb = cb;
          //data的每一个属性都会存在一个watcher, 且将其实例化, 此时构造函数中的get()方法将执行,
          //get()将执行getter()方法, 触发属性标识符getter中的depend()，watcher就被收集到依赖数组中
        this.value = this.get();
    }
    get() {
        window.target = this;  //将watcher实例赋给window.target
        let value = this.getter.call(this.vm, this.vm);
        window.target = undefined; //GC window.target全局变量，等待下次依赖
        return value;  //返回当前的值
    }
    update() {
        const oldValue = this.value;
        this.value = this.get();  //重新触发属性标识符getter 设置依赖
        this.cb.call(this.vm, this.value, oldValue)
    }
}


const bailRE = /[^\w.$]/;
function parsePath(path) {
    if (bailRE.test(path)) {
        return;
    }
    const segment = path.split(".");
    return function (obj) {
        for (let i=0; i<segment.length; i++) {
            obj = obj[i];  //触发属性标识符getter
        }
        return obj;
    }
}