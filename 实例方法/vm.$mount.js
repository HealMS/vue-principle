/**
 * 不管创建Vue实例时是否提供el属性, 要让Vue实例关联到DOM节点上, 一定会使用vm.$mount()
 * 对于完整版和只含运行时的Vue.js, 差别在于完整版具有编译器, 所以选项中可以使用template属性
 * 但但其实vm.$mount()核心功能是定义在只包含运行时的, 所以完整版是只含运行时的超集
 * 只在第一次加载时调用
 */
//完整版
const mount = Vue.prototype.$mount;
Vue.prototype.$mount = function (el) {
    el = el && query(el);  //确保el是DOM节点
    //Vue在实例化时会在实例上添加一些属性和方法, $options就是用户new Vue(options)传入的选项
    const options = this.$options;
    //如果存在render方法就不管template模板了
    if (!options.render) {
        let template = options.template;
        if (template) {
            //解析模板逻辑, template可以是字符串/选择符/DOM节点
            if (typeof template === "string") {
                if (template.charAt(0) === "#") {
                    template = idToTemplate(template);
                } else if (template.nodeType) {  //DOM对象才有nodeType属性
                    template = template.innerHTML;
                }
            }
        } else if (el) {  //如果模板不存在就使用挂载元素的html
            template = goOuterHTML(el);
        } else {
            if (process.env.NODE_ENV !== "production") {
                warn('invalid template option:' + template, this);
            }
        }

        if (template) {
            //将template字符串编译成代码字符串`with(this){return _c()}`然后再转换成对应函数
            const { render } = compileToFunction(
                template, 
                {},
                this
            );
        }
    }
    return mount.call(this, el);  //核心功能, 可以看到完整版是在运行时版本的扩展
}

function query(el) {
    if (typeof el === "string") {
        const selected = document.querySelector(el);
        if (!selected) {
            return document.createElement("div");  //不存在该标签就返回div标签
        }
        return selected;
    } else {  //原本就是节点
        return el;
    }
}
//提取DOM节点的html内容
function goOuterHTML(el) {
    if (el.outerHTML) {
        return el.outerHTML;
    } else {
        const container = document.createElement("div");
        container.appendChild(el.cloneNode(true));
        return container.innerHTML;
    }
}
//提取选择符对应节点的html内容
function idToTemplate(id) {
    const el = query(id);
    return el && el.innerHTML;
}
//html字符串 -> 代码字符串 -> 函数
// delimiter 分隔符  compile 编译
function compileToFunction(template, options, vm) {
    options = extend({}, options);  //使options变为可选选项
    //检查缓存
    const key = options.dilimiter ?
        String(options.delimiters) + template :
        template;
    if (cache[key]) {
        return cache[key];
    }
    //编译 compile函数见 模板编译, 编译后的代码字符串存在compiled.render中
    const compiled = compile(template);
    //将代码字符串转换为函数
    const res = {};
    res.render = createFunction(compiled.render);

    return (cache[key] = res);
}
function createFunction(code) {
    return new Function(code);
}

//只包含运行时
Vue.prototype.$mount = function (el) {
    el = el && inBrowser ? query(el) : undefined;
    return mountComponent(this, el);
}
export function mountComponent(vm, el) {
    if (!vm.$options.render) {
        vm.$options.render = createElementVNode;  //注释节点
        if (process.env.NODE_ENV !== "production") {
            //开发环境发出警告
        }
    }
    //触发生命周期钩子
    callHook(vm, "beforeMount");
    /**
     * 挂载, 这一步非常重要
     * vm._render()是渲染函数, 将代码字符串函数转化未VNode节点树
     * vm._update()是diff比较函数, 比较逻辑见patch&diff.js 首次渲染不比较, 直接更新DOM树
     * Watcher第二个参数传入函数时, 函数赋给Watcher的getter, getter执行时会获取函数中涉及的所有状态
     * 状态对应的dep依赖收集器会将Watcher加入收集器, 一旦状态发生变化, 便会通知Watcher执行update方法
     * 便会往复执行比对渲染函数, 这样状态和视图的双向绑定就建立起来了
     * 直到销毁vm._watcher
     */
    vm._watcher = new Watcher(vm, () => {
        vm._update(vm._render());
    }, noop);
    //触发生命周期钩子, 挂载完成
    callHook(vm, "mounted");
    return vm;
}